---
title: "The advisor strategy: one principal agent, a stronger consultant"
description: "Anthropic shipped an advisor tool that lets a fast executor model consult a stronger model mid-generation. I built a small harness called conseiller to play with the pattern, and I think it's the missing primitive for the agent stack I've been trying to build."
pubDate: 2026-05-08
category: tech
draft: false
tags: [claude, anthropic, agents, advisor-tool, opus, sonnet, harness, openclaw, conseiller]
---

I spent the last month on GPT Pro.

It wasn't bad. I want to say that clearly before anything else, because I don't think the model was the problem. The problem was that I'm a Claude user at heart, and a month was long enough to be sure of it. The way I think about agent design, memory, and tooling is shaped by Claude. Working around that gap was constant low-grade friction.

So I'm coming back. But not to the same setup I left.

The thing that pulled me back is the advisor tool Anthropic shipped in beta — the `advisor-tool-2026-03-01` header. On its surface it's a small feature: a fast executor model can call out to a stronger advisor model mid-generation, get a plan, and continue. But the shape of it is exactly the architecture I've been trying to build toward in OpenClaw. One principal agent that does the work, and a stronger model it consults at the right moments.

To get a feel for it, I built a tiny harness called **conseiller** ([github.com/mager/conseiller](https://github.com/mager/conseiller)) — French for advisor. This post is what I learned wiring it up.

## What the advisor tool actually does

The mechanic is unusually clean.

You declare the advisor as a tool on a normal Messages request. The executor model — the one in the top-level `model` field — decides when to call it. When it does, the server runs a separate inference on the advisor model with the full transcript, drops the advisor's thinking, and returns just the advice as a tool result. The executor keeps generating, now informed.

```ts
const response = await client.beta.messages.create({
  model: "claude-sonnet-4-6",
  max_tokens: 4096,
  betas: ["advisor-tool-2026-03-01"],
  tools: [
    {
      type: "advisor_20260301",
      name: "advisor",
      model: "claude-opus-4-7",
      caching: { type: "ephemeral", ttl: "5m" },
    },
  ],
  messages: [{ role: "user", content: task }],
});
```

A few things worth highlighting:

- The executor and advisor must form a valid pair. Today that's Haiku 4.5, Sonnet 4.6, Opus 4.6, or Opus 4.7 as the executor, with Opus 4.7 as the advisor.
- The `input` on the resulting `server_tool_use` block is always empty. The executor only signals **timing**. The server constructs the advisor's view from the full transcript automatically.
- All of this happens in a single `/v1/messages` request. No orchestration layer to maintain.

The billing model is the part that makes this economically interesting.

## The cost shape is the point

Advisor calls are billed at the advisor model's rates. Executor calls at the executor's. They show up separately in `usage.iterations[]`.

Anthropic estimates the advisor produces about 400 to 700 text tokens per call (1,400 to 1,800 with thinking). That's the only place you pay Opus rates. Everything the executor generates — which on a coding task is the bulk of the tokens — is at Sonnet or Haiku rates.

In conseiller I made the cost split visible on every run, because that's the whole point of the pattern:

```
─── usage ────────────────────────────────────────────
executor  in=412  out=1230  cache_read=0
advisor   in=823  out=531   cache_read=0
──────────────────────────────────────────────────────
```

So you get the planning quality of Opus on the parts where planning matters, and the throughput cost of Sonnet on the parts where it doesn't.

That's the lever. Most of an agent loop is mechanical. Reading files, running tests, parsing output, applying edits. A fraction of it is the part that decides whether the whole thing succeeds: the initial plan, the moment you realize the approach is wrong, the final check before declaring done. The advisor strategy maps the cost curve onto the value curve.

You can already approximate this by hand — call Opus from inside a Sonnet agent loop yourself. People have been doing it. The tool collapses that pattern into a single request, with a stable cache prefix on the advisor side and one server-side decision boundary instead of an orchestration layer you have to maintain.

## Building conseiller

I wanted the smallest interesting wrapper around the pattern, not a framework. Three files:

- `src/prompts.ts` — the recommended advisor system prompt blocks (timing, trust, conciseness)
- `src/conseiller.ts` — a `Conseiller` class that owns the message history and the `beta.messages.create` call
- `src/index.ts` — a CLI you can point at any task

The most important file is the prompts. Anthropic's own guidance on when to call the advisor is more thoughtful than I expected, and it's the part that's tempting to skip. The short version, which I've baked into the system prompt:

- **Call before substantive work.** Orientation isn't substantive. Writing, editing, and answering are.
- **Call again when stuck.** Recurring errors, an approach that isn't converging.
- **Call once before declaring done.** After the durable artifact is written, not before — if the session dies during the call, a saved file persists and an unwritten one doesn't.

That last rule is the one I want to push hardest in my own setup. The default failure mode of any agent loop is declaring success too early on the strength of a self-test that doesn't check the right thing. A pre-commit advisor call, after the file is written and the test has run, is exactly the place where a stronger model earns its rate.

There's also a piece of the recommended prompt about how the executor should treat the advice that I think is undersold: don't silently switch when your own evidence contradicts the advisor. Surface the conflict in one more advisor call instead. That's a smarter loop than either "always defer" or "ignore on disagreement," and it's hard to bolt on later if you don't bake it in from the start.

## The harness shape

The `Conseiller` class is about thirty lines of real logic. It maintains a `history` array of message params, builds the advisor tool definition (with caching on by default), and calls `beta.messages.create` with the beta header.

The interesting work is on the way back. The response contains a mix of `text`, `server_tool_use`, and `advisor_tool_result` blocks. To display anything useful, I split them out, and to display anything meaningful about cost, I walk `usage.iterations[]` and bucket entries by type:

```ts
for (const it of iterations) {
  if (it.type === "advisor_message") {
    out.advisorInputTokens += it.input_tokens;
    out.advisorOutputTokens += it.output_tokens;
  } else if (it.type === "message") {
    out.executorInputTokens += it.input_tokens;
    out.executorOutputTokens += it.output_tokens;
  }
}
```

Top-level `usage.input_tokens` and `output_tokens` only reflect executor totals. To see what Opus actually cost you, you have to walk the iterations. That's a footgun if you're plumbing this into an existing cost-tracking layer; iterations is the source of truth, top-level is the executor view.

## Why I want this in my harness

I've been writing about a harness, OpenClaw, that treats the model as a pluggable dependency. Memory in files. Skills as behavior modules. Cron for background work. Channels for interface. The model is whichever one I'm running today.

That design held up across a provider switch. It's why moving from Claude to Codex, and then living on GPT Pro for a month, was annoying instead of catastrophic.

But the design has a gap. When the model is treated as one thing, you make one tradeoff. Either you pay top-tier rates for everything, or you accept second-tier reasoning everywhere. There's no shape to the spend.

What I actually want is tiers. A principal agent that's fast and cheap enough to run continuously, with a stronger model it can reach for when the next decision is load-bearing.

The advisor tool is that, expressed as an API primitive instead of a harness feature I have to build.

## Principal agent, specialist consultants

The general pattern — and the thing I think is more important than any specific tool — is what I've started calling **the advisor strategy**: one principal agent owns the conversation, and it knows how to consult specialists.

The advisor tool is one instance of it. Claude Code's subagent dispatching is another: a main agent uses the Task tool to launch a focused subagent for a search or a verification, gets a summary back, and continues. Same shape, different boundary. The API version runs as one request and is invisible to your client. The Claude Code version runs as separate sessions and gives you isolation across context windows.

Both share a single principle: **the principal stays in charge, and the specialists return text, not control.**

That principle is what I had been losing in the GPT-Pro-as-everything setup. Without a clear principal, the same model handles routing, planning, execution, and review. It works, but the cost is uniform and the failure modes blur into each other. With a principal agent, the harness has a single point of accountability — and a clear seam where I can introduce a stronger consultant without rewriting the loop.

## Caching and the long loop

The advisor's transcript is mostly stable across calls within a conversation — each call appends one more segment to the same prefix. Anthropic exposes that as a `caching` setting on the tool definition:

```ts
{
  type: "advisor_20260301",
  name: "advisor",
  model: "claude-opus-4-7",
  caching: { type: "ephemeral", ttl: "5m" },
}
```

The breakeven is around three advisor calls per conversation. Below that, the cache writes cost more than the reads save. Above that, you're compounding savings.

For my use case — long-horizon agent sessions with two to three planning moments per task — this is firmly worth turning on, so conseiller has it on by default. For single-turn assistant calls it isn't.

One footgun: `clear_thinking` with anything other than `keep: "all"` will shift the advisor's quoted transcript each turn and cause cache misses. On Opus 4.5+ and Sonnet 4.6+ the default is to keep all turns, but on older models and on Haiku the default is `keep: { type: "thinking_turns", value: 1 }`, which silently degrades the cache. Worth pinning explicitly if you care about the cost curve.

## How this folds into OpenClaw

Conseiller isn't the harness. It's the test bed. The harness is OpenClaw, and the plan there is straightforward.

The principal agent in OpenClaw becomes a Sonnet 4.6 executor at medium effort, with Opus 4.7 declared as the advisor on every Messages call. Memory, skills, cron, and channels stay where they are. What changes is that the agent now has a built-in escalation path that doesn't require me to write a router.

The model config moves from one line:

```txt
model=anthropic/claude-sonnet-4-6
```

to a pair:

```txt
executor=anthropic/claude-sonnet-4-6
advisor=anthropic/claude-opus-4-7
```

That's the whole architectural delta at the harness level. Everything else is prompt work — the timing block in the executor's system prompt, the conciseness instruction to keep advisor output under 100 words on routine calls, and a per-conversation cap counted client-side so a runaway loop can't quietly burn Opus tokens.

The thing this replaces is the part of OpenClaw where I was reaching for a stronger model manually. That was working but it was also exactly the kind of decision I should not be making turn by turn. The advisor tool moves it inside the agent.

## What I'm giving up by leaving GPT Pro

Honestly, not that much. The model is fine. The reasoning is real. I want to be specific about that because I don't think the answer here is that one provider is good and the other is bad.

What I'm giving up is the uniform-cost shape and the lack of a clean tiering primitive. GPT Pro's pricing model nudges you toward using the same model for everything. Claude's advisor tool nudges you toward using the right model at the right moment. For an agent harness, that nudge matters more to me than any individual benchmark.

The other thing I'm giving up, and this is more taste than argument, is the feeling of working against a system that doesn't share my mental model of how agents should be built. A month was enough to know the difference.

## The shape I want

Model as a pluggable dependency. Memory in files I control. Skills that survive provider churn. And now, a principal agent with a stronger consultant it knows when to call.

That's the harness I'm building back to.

The advisor tool didn't invent the pattern. The pattern is older than the tool — every good editor has a junior who does the work and a senior who reviews the plan. What the tool does is make the pattern cheap enough, fast enough, and clean enough to be the default.

That's the part worth coming back for.

Conseiller is on GitHub at [github.com/mager/conseiller](https://github.com/mager/conseiller) if you want to play with it.
