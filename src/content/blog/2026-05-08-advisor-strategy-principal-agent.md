---
title: "Build your own OpenClaw with Claude"
description: "Anthropic shipped the two primitives I'd been hand-rolling in OpenClaw — the advisor tool for tiered intelligence and Claude Code channels for mobile reachability. Together they're an afternoon project: a principal agent backed by a stronger consultant, reachable from your phone. Here's the harness, called conseiller, and how I'd assemble the rest."
pubDate: 2026-05-08
category: tech
draft: true
tags: [claude, anthropic, agents, advisor-tool, channels, openclaw, conseiller, opus, sonnet, harness]
---

I spent the last month on GPT Pro.

It wasn't bad. I want to say that clearly before anything else, because I don't think the model was the problem. The problem was that I'm a Claude user at heart, and a month was long enough to be sure of it. The way I think about agent design, memory, and tooling is shaped by Claude. Working around that gap was constant low-grade friction.

So I'm coming back. But not to the same setup I left.

Here's what I noticed coming back: Anthropic still doesn't ship an OpenClaw. There's no always-on agent daemon with persistent memory and multi-platform routing in their product lineup. What they have is Claude Code (a session-scoped CLI), the Agent SDK (for building), MCP (for plugins), and skills, hooks, and subagents (for behavior). All the **pieces** are there. The assembled product isn't.

But two of those pieces shipped recently and they're the two I had been hand-rolling.

- **The advisor tool**, in beta as `advisor-tool-2026-03-01`. A fast executor model can consult a stronger advisor model mid-generation, get a plan, and continue. Tiered intelligence as a primitive.
- **Claude Code channels**, in research preview. Telegram and Discord push messages into a running Claude Code session. Mobile reachability as a primitive.

Stack those two together and you have most of what OpenClaw does, in an afternoon, with no daemon to maintain. So I built the harness piece — a tiny experiment called **conseiller** ([github.com/mager/conseiller](https://github.com/mager/conseiller)) — and I want to show what the assembled stack looks like.

This is the post about building your own OpenClaw with Claude.

## What OpenClaw is, briefly

For the new readers: OpenClaw is the harness I've been writing in. It runs as a daemon, manages multiple specialized agents (magerbot for code, genny for life stuff), persists memory in files, runs cron jobs, and routes messages between Telegram, Discord, and the terminal. The model is a pluggable dependency — I've run it on Claude, on Codex, and most recently on GPT Pro.

I built it because the things I wanted from an agent — always-on, reachable from my phone, multiple personalities for different concerns, persistent memory — didn't exist as a single product. They still don't, exactly. But the gap is closing fast.

Two pieces of OpenClaw matter most for this post:

1. **Tiered intelligence.** I want a fast model handling the bulk of the work and a stronger model deciding the load-bearing moments.
2. **Mobile reachability.** I want to fire instructions from my phone and check on the agent later.

Both are now shipped Anthropic primitives.

## Piece one: the advisor tool

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

The billing model is the part that makes this economically interesting. Advisor calls are billed at the advisor model's rates. Executor calls at the executor's. They show up separately in `usage.iterations[]`. Anthropic estimates the advisor produces about 400 to 700 text tokens per call. That's the only place you pay Opus rates. Everything the executor generates — which on a coding task is the bulk of the tokens — is at Sonnet or Haiku rates.

In conseiller I made the cost split visible on every run, because that's the whole point of the pattern:

```
─── usage ────────────────────────────────────────────
executor  in=412  out=1230  cache_read=0
advisor   in=823  out=531   cache_read=0
──────────────────────────────────────────────────────
```

You get the planning quality of Opus on the parts where planning matters, and the throughput cost of Sonnet on the parts where it doesn't.

That's the lever. Most of an agent loop is mechanical. Reading files, running tests, parsing output, applying edits. A fraction of it is the part that decides whether the whole thing succeeds: the initial plan, the moment you realize the approach is wrong, the final check before declaring done. The advisor strategy maps the cost curve onto the value curve.

## Conseiller: the harness in 100 lines

I wanted the smallest interesting wrapper around the pattern, not a framework. Three files:

- `src/prompts.ts` — the recommended advisor system prompt blocks (timing, trust, conciseness)
- `src/conseiller.ts` — a `Conseiller` class that owns the message history and the `beta.messages.create` call
- `src/index.ts` — a CLI you can point at any task

The most important file is the prompts. Anthropic's own guidance on when to call the advisor is more thoughtful than I expected, and it's the part that's tempting to skip. The short version, which I've baked into the system prompt:

- **Call before substantive work.** Orientation isn't substantive. Writing, editing, and answering are.
- **Call again when stuck.** Recurring errors, an approach that isn't converging.
- **Call once before declaring done.** After the durable artifact is written, not before — if the session dies during the call, a saved file persists and an unwritten one doesn't.

That last rule is the one I want to push hardest. The default failure mode of any agent loop is declaring success too early on the strength of a self-test that doesn't check the right thing. A pre-commit advisor call, after the file is written and the test has run, is exactly the place where a stronger model earns its rate.

The other piece of the prompt that I think is undersold: don't silently switch when your own evidence contradicts the advisor. Surface the conflict in one more advisor call instead. That's a smarter loop than either "always defer" or "ignore on disagreement," and it's hard to bolt on later if you don't bake it in from the start.

The harness itself is about thirty lines of real logic. The interesting work is on the way back: the response contains a mix of `text`, `server_tool_use`, and `advisor_tool_result` blocks, and to display anything meaningful about cost you have to walk `usage.iterations[]` and bucket by type:

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

Repo: [github.com/mager/conseiller](https://github.com/mager/conseiller). MIT licensed, fewer than 200 lines of TypeScript, runs with `npm start -- "your task here"`. It's the principal-agent half of OpenClaw, isolated.

## Piece two: Claude Code channels

[I wrote about channels back in March](https://mager.co/blog/2026-03-20-claude-code-channels) when Anthropic shipped them. Short version: a channel is an MCP server that pushes events into a running Claude Code session. Telegram and Discord today, more later. You install the plugin, configure your bot token, restart Claude Code with `--channels plugin:telegram@claude-plugins-official`, and pair from your phone.

Setup is four commands:

```bash
/plugin install telegram@claude-plugins-official
/telegram:configure YOUR_BOT_TOKEN
claude --channels plugin:telegram@claude-plugins-official
/telegram:access pair <code>
```

That's the mobile reachability piece, shipped, free with a claude.ai login.

In the original channels post I argued they don't fully replace OpenClaw because they're session-scoped — start a session, channel works; end it, channel stops. No daemon. That's still true. But it's a smaller gap than I was treating it as.

## Wiring them together

Here's the assembled stack.

**A principal agent on the API**, running with the advisor tool. This is conseiller's job. Sonnet 4.6 as the executor, Opus 4.7 as the advisor, ephemeral cache on. The system prompt has the timing and trust blocks baked in. Most turns cost Sonnet rates; planning moments cost Opus rates; the cost shape matches the work shape.

**Claude Code as the interactive surface**, running with channels enabled. This is where you actually sit and work. Channels route messages from Telegram into the session, and the session has filesystem access, git, your repo's context — everything Claude Code already does well.

**A bridge between the two**, which is the part you have to write. There are two clean shapes:

- **Conseiller-as-tool.** Expose conseiller as a tool that Claude Code can call from inside a session. When the principal agent (Claude Code) hits a planning moment, it calls conseiller, which itself runs Sonnet+Opus and returns the plan. You get tiered intelligence without leaving the session.
- **Conseiller-as-daemon.** Run conseiller as a long-lived process with its own Telegram bot. Claude Code is one client; your phone is another; they share memory through a file. This is closer to what OpenClaw actually does, and it's a few hundred more lines.

I'd start with the first. It's the smallest version that gets you something meaningfully better than vanilla Claude Code, and you keep using the channels you've already configured.

The mental model: Claude Code is your hands, conseiller is your strategist, channels are your phone. The agent runs where it's best at running, the strategist gets called when it matters, and you can poke the whole thing from the grocery store.

## What's still missing

I want to be honest about what this stack doesn't replace.

- **Persistent memory across sessions.** Claude Code has compaction and project files, but it doesn't have OpenClaw's daily memory file convention. You'd build that on top — a skill that writes `memory/YYYY-MM-DD.md` at session end and reads on session start.
- **Multi-agent routing.** OpenClaw runs magerbot and genny side by side with different personalities. Claude Code is one session per terminal. You can run multiple sessions, but there's no shared identity layer.
- **Cron.** Channels are reactive; they wait for messages. OpenClaw also runs scheduled jobs. The closest thing in the official stack is the scheduled-agents primitive in Claude Code, which is workable for some cases but lighter than a real cron daemon.
- **Persistent process.** Channels die with the session. OpenClaw is always on. For now, you'd run Claude Code in a tmux session on a machine that stays awake — a Mac mini works fine.

These are all things you can build on top, and the building blocks are designed to compose. The point of this post isn't that the official stack is feature-complete. The point is that the gap is now small enough that an afternoon of glue code closes it.

## Should I open-source conseiller?

It's already on GitHub. The bigger question is whether it should be a real project — packaged, documented, with a name and a logo — or just a reference repo that happens to work.

I think the latter. The whole argument is that this pattern is small enough that you should build your own. Conseiller is more useful as a worked example than as a dependency. The interesting parts are the system prompt blocks (taken straight from Anthropic's docs) and the iterations-array bucketing. Those are forty lines you can copy.

If anything in conseiller turns out to be load-bearing — a really good prompt variant, a clean way to handle multi-turn, a sane streaming wrapper — I'll factor it out. Until then it's a study, not a library.

## Why this matters

Anthropic might ship OpenClaw eventually. Honestly, given the trajectory — channels, the advisor tool, scheduled agents, Claude Agent SDK — they're heading toward something that could replace OpenClaw entirely. That's good. I'm rooting for it. The whole reason I built OpenClaw is because nobody was shipping the assembled product, and the closer the official stack gets to that, the less harness code I have to maintain.

What changed in the last few months is that you don't need to wait for them to ship the assembled version. The pieces are sufficient. The advisor tool gives you tiered intelligence. Channels give you mobile reachability. Skills give you reusable behavior. Hooks give you automation. MCP gives you tool extensibility. None of these are the daemon. All of them, glued together, are most of one.

Two years ago, building your own agent harness meant rewriting most of LangChain. A year ago it meant living inside someone else's framework. Today it means writing under 200 lines of TypeScript and configuring a Telegram bot.

That's the part worth coming back for.

Conseiller is on GitHub at [github.com/mager/conseiller](https://github.com/mager/conseiller). Copy whatever's useful.
