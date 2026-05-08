---
title: "I was building my own OpenClaw with Claude. Then Anthropic shipped one."
description: "I'd drafted a post about building your own agent harness with the new advisor tool plus channels — the principal-agent pattern as an afternoon project. Then Code w/ Claude happened on May 6 and Anthropic shipped Claude Managed Agents, Multi-agent Orchestration, Dreams, Routines, and Remote Agents — most of OpenClaw, official, in one keynote. Here's the post, rewritten."
pubDate: 2026-05-08
category: tech
draft: true
tags: [claude, anthropic, agents, advisor-tool, channels, openclaw, conseiller, claude-managed-agents, opus, sonnet, harness]
---

I had this post mostly drafted.

The original argument was that Anthropic doesn't ship an OpenClaw — no always-on agent daemon with persistent memory and multi-agent routing — but they had just shipped two of the primitives I'd been hand-rolling: the advisor tool (`advisor-tool-2026-03-01`) and Claude Code channels. Stack those together, I was going to argue, and you have most of OpenClaw in an afternoon.

Then on May 6, Code w/ Claude happened, and Anthropic shipped most of the rest of OpenClaw in one keynote.

I'm going to keep writing the post anyway. Not because the argument is wrong — the assembled stack is real and the advisor tool genuinely is the missing tiering primitive — but because the news changes who should care about which part. So this is the rewritten version, with the announcements folded in honestly. I built a tiny harness called **conseiller** ([github.com/mager/conseiller](https://github.com/mager/conseiller)) — French for *advisor* — before the keynote landed; that's still the worked example. But the picture around it changed.

## Why I was writing this in the first place

I spent the last month on GPT Pro.

It wasn't bad. I want to say that clearly before anything else, because I don't think the model was the problem. The problem was that I'm a Claude user at heart, and a month was long enough to be sure of it. The way I think about agent design, memory, and tooling is shaped by Claude. Working around that gap was constant low-grade friction.

So I'm coming back. But not to the same setup I left.

Two things had been bothering me about my own harness, OpenClaw — the always-on agent daemon I built because nobody was shipping the assembled product. The first was that I had no clean primitive for tiered intelligence. I either paid top-tier rates for everything or accepted second-tier reasoning everywhere. The second was that mobile reachability through Telegram and Discord worked, but I was the one maintaining the bot infrastructure.

Both gaps had been closing.

OpenClaw, for the new readers, is the always-on harness I've been writing in — runs on a [Mac mini under Tailscale](https://mager.co/blog/2026-02-22-openclaw-mac-mini-tailscale) so I can reach it from my laptop or phone anywhere, manages multiple specialized agents, persists memory in files, and treats the model as a pluggable dependency. The model has been Claude, then Codex, then most recently GPT Pro.

## Piece one: the advisor tool

The advisor tool, in beta as `advisor-tool-2026-03-01`, lets a fast executor model consult a stronger advisor model mid-generation. The mechanic is unusually clean.

You declare the advisor as a tool on a normal Messages request. The executor — the one in the top-level `model` field — decides when to call it. When it does, the server runs a separate inference on the advisor model with the full transcript, drops the advisor's thinking, and returns just the advice as a tool result. The executor keeps generating, now informed.

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

The cost shape is the point. Advisor calls are billed at the advisor model's rates; executor calls at the executor's. Anthropic estimates the advisor produces about 400 to 700 text tokens per call. That's the only place you pay Opus rates. Everything the executor generates — the bulk of the tokens on a coding task — is at Sonnet or Haiku rates.

In conseiller I made the cost split visible on every run, because that's the whole point of the pattern:

```
─── usage ────────────────────────────────────────────
executor  in=412  out=1230  cache_read=0
advisor   in=823  out=531   cache_read=0
──────────────────────────────────────────────────────
```

You get the planning quality of Opus on the parts where planning matters, and the throughput cost of Sonnet on the parts where it doesn't.

## Conseiller in 100 lines

Three files: a system prompt module with the timing/trust/conciseness blocks, a `Conseiller` class that owns the message history and API call, and a CLI.

The prompts are the part that matters. Anthropic's own guidance on *when* to call the advisor is more thoughtful than I expected, baked into the system prompt:

- **Call before substantive work.** Orientation isn't substantive; writing and answering are.
- **Call again when stuck.** Recurring errors, an approach that isn't converging.
- **Call once before declaring done.** After the durable artifact is written — if the session dies during the call, a saved file persists and an unwritten one doesn't.

One piece I think is undersold: don't silently switch when your own evidence contradicts the advisor. Surface the conflict in one more advisor call instead.

The harness itself is about thirty lines. The trick on the way back is walking `usage.iterations[]` and bucketing by type — top-level `usage.input_tokens` only reflects executor totals, so to see what Opus cost you, walk the iterations.

Repo: [github.com/mager/conseiller](https://github.com/mager/conseiller). MIT, fewer than 200 lines of TypeScript.

## And then Code w/ Claude happened

Two days ago Anthropic ran [Code w/ Claude 2026](https://simonwillison.net/2026/May/6/code-w-claude-2026/) and shipped, in one keynote, most of the rest of OpenClaw.

Walking down Simon Willison's live notes, the announcements that overlap with what I'd been hand-rolling:

- **Claude Managed Agents** — a platform service for deploying agents that, in their words, bundles best practices and memory out of the box. This is the daemon and platform layer I'd been running on a Mac mini under tmux. Request access only for now.
- **Multi-agent Orchestration**, public beta — explicitly described as creating "fleets of agents to solve complex tasks." The keynote demo had a Commander, a Detector, and a Navigator coordinating on a moon-landing drone scenario. That is, almost word-for-word, the principal-agent pattern this post was about.
- **Dreams**, research preview — Claude inspects previous sessions overnight, identifies what it missed, and generates new memory artifacts. The example was a `descent-playbook.md` file written from analysis of past work. This is the cross-session memory layer I'd been building with daily `memory/YYYY-MM-DD.md` files.
- **Claude Code Routines** — async automations described as "higher-order prompts" where you "wake up to PRs that are ready to merge." This is cron, with model-aware scheduling. Docs at `code.claude.com/docs/en/routines`.
- **Remote Agents** — control your laptop from your phone. This is the missing piece beyond channels: not just messaging a session, but actually driving it remotely.

Plus channels, which already existed. So the official stack as of this week:

| OpenClaw piece | Anthropic equivalent (May 2026) |
| --- | --- |
| Always-on daemon | Claude Managed Agents |
| Multiple specialist agents | Multi-agent Orchestration |
| Tiered intelligence | Advisor tool |
| Cron / scheduled jobs | Claude Code Routines |
| Persistent memory | Dreams + Claude Managed Agents memory |
| Mobile reachability | Channels + Remote Agents |
| Reusable behavior | Skills (already shipped) |
| Tool extensibility | MCP (already shipped) |

That's the whole map. Every row I had been writing code for is now an Anthropic product or feature. Some are research preview, some are public beta, some require requesting access — but they're shipped, they're documented, and they're going to keep getting better.

## Wait — is Managed Agents the same as the advisor tool?

Worth answering directly because they're easy to confuse.

**The advisor tool is a model-pairing primitive.** It lives inside one agent's brain and shapes how that agent thinks — fast executor calls a stronger advisor at planning moments. Tactical. API-level.

**Claude Managed Agents is a platform.** It hosts agents, gives them memory, manages their lifecycle. Strategic. Infrastructure-level.

They're orthogonal. You'd use the advisor tool *inside* an agent that runs *on* Managed Agents. The advisor is about model intelligence; Managed Agents is about everything around the model — where it runs, what it remembers, how it gets reached. Different layers of the same stack.

The principal-agent pattern shows up at both layers, which is the only reason they sound similar. Multi-agent Orchestration is the principal-agent pattern at the *agent* level (Commander coordinates Detector and Navigator). The advisor tool is the same pattern at the *model* level (Sonnet coordinates Opus). Same shape, different scope.

## So is conseiller obsolete?

No, but the answer matters less than you'd think.

The advisor tool is orthogonal to the rest of the stack — it works inside Managed Agents, inside Multi-agent Orchestration, inside a vanilla Messages call at three in the morning. Conseiller is a worked example of the pattern at the smallest interesting scale. It doesn't replace the platform layer, and never tried to.

## Wait — does this run on my Pro subscription?

This is the question I keep coming back to.

**The advisor tool is API only.** It's a feature of `client.beta.messages.create`, billed per token. Pro and Max credits are for the apps — claude.ai, the desktop app, Claude Code via OAuth — and don't apply to direct API calls.

So the tradeoff today: if you want the OpenClaw shape on a Mac mini on **subscription credits**, the path is Claude Code in tmux + channels for mobile + Routines for cron + Tailscale for reach. Always-on, no per-token metering, but no advisor tool — Claude Code doesn't surface it as a primitive yet. If you want **tiered intelligence**, you're on the API. That's where conseiller lives.

The bridge I'm sketching: Claude Code stays on the subscription, conseiller gets called as a tool from inside it only at planning moments. You pay API rates for the advisor calls and only those. Done right, the bill is small.

The honest gap: I want Pro credits that cover everything, including advisor calls. Maybe Managed Agents will close it. If you're at Anthropic — surfacing advisor as a primitive inside Claude Code, billed against subscription, is the change that turns this stack into something I'd recommend without caveats.

## What I'm doing next

Keeping conseiller for solo experiments — a 100-line script I can modify is the right size for the advisor tool. Requesting access to Managed Agents and Dreams. Wiring Routines into magerblog and beatbrain first, where "wake up to PRs ready to merge" is exactly what I want. The OpenClaw repo isn't going anywhere, but the parts that match what Anthropic just shipped are scaffolding now, not infrastructure.

## The real argument

The obvious viral take is "Anthropic ate my project," and that isn't honest. OpenClaw was scaffolding for the answer Anthropic was always going to ship. The whole point of scaffolding is that you build it because the thing you need doesn't exist yet, use it while you wait, and migrate when the proper answer arrives.

Here are the notes I'm carrying forward. Model is a pluggable dependency. Memory belongs in files. Skills survive provider churn. Mobile reachability is the difference between an agent you actually use and one that lives in your terminal. And the principal-agent pattern — one principal stays in charge, specialists return text not control — is the architecture that holds at every layer, whether you're hand-rolling it or running on Managed Agents.

The advisor tool is the cleanest expression of that last principle I've seen, and it's why conseiller is on GitHub even though Anthropic just shipped a much bigger version of the surrounding stack. The pattern is older than any of these tools. The tool just makes it cheap, fast, and clean enough to be the default.

That's the part worth coming back for.

Conseiller is at [github.com/mager/conseiller](https://github.com/mager/conseiller). Managed Agents access form is at [claude.com/form/claude-managed-agents](https://claude.com/form/claude-managed-agents); I'm in the queue.
