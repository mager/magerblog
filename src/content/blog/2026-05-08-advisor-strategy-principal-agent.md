---
title: "Claude: Anthropic just shipped most of OpenClaw"
description: "I built a 200-line harness called conseiller to test Anthropic's new advisor tool — a fast executor model that consults a stronger model mid-generation. Two days later Anthropic shipped Claude Managed Agents, Multi-agent Orchestration, Dreams, Routines, and Remote Agents. Here's both halves: what I built and what they shipped, and how the pieces fit together into something a lot like OpenClaw."
pubDate: 2026-05-08
category: tech
keyword: "advisor tool"
draft: false
tags: [claude, anthropic, agents, advisor-tool, channels, openclaw, conseiller, claude-managed-agents, opus, sonnet]
---

I spent the last month on GPT Pro. It wasn't bad. The problem was that I'm a Claude user at heart, and a month was long enough to be sure of it. So I'm coming back, but not to the same setup I left.

Two things happened in the same week that pulled me in. First, Anthropic shipped the advisor tool in beta — a way to pair a fast executor model with a stronger advisor that gets consulted mid-generation. I built a small harness around it called **conseiller** ([github.com/mager/conseiller](https://github.com/mager/conseiller)) — French for *advisor* — to feel out the pattern. Then on May 6, at Code w/ Claude, Anthropic shipped most of the rest of OpenClaw — [the always-on agent harness I run on a Mac mini under Tailscale](https://mager.co/blog/2026-02-22-openclaw-mac-mini-tailscale) — as official products.

This post is both halves. What I built, and what they shipped.

## What I built: conseiller

The advisor tool is the smallest interesting feature Anthropic has shipped in a while. The mechanic:

You declare an advisor as a tool on a normal Messages request. The executor — the model in the top-level `model` field — decides when to call it. When it does, the server runs a separate inference on the advisor model with the full transcript, drops the advisor's thinking, and returns just the advice as a tool result. The executor keeps generating, now informed.

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

The executor and advisor must form a valid pair: Haiku 4.5, Sonnet 4.6, Opus 4.6, or Opus 4.7 as executor, with Opus 4.7 as advisor. The `input` on the resulting `server_tool_use` block is always empty — the executor only signals timing; the server constructs the advisor's view from the full transcript automatically. All of it happens in one `/v1/messages` request.

The cost shape is the point. Advisor calls are billed at the advisor model's rates; executor calls at the executor's. Anthropic estimates the advisor produces about 400 to 700 text tokens per call. That's the only place you pay Opus rates. Everything the executor generates — the bulk of the tokens — stays at Sonnet or Haiku rates. You get the planning quality of Opus on the parts where planning matters, and the throughput cost of Sonnet on the parts where it doesn't.

In conseiller I made the cost split visible on every run, because that's the whole point:

```
─── usage ────────────────────────────────────────────
executor  in=412  out=1230  cache_read=0
advisor   in=823  out=531   cache_read=0
──────────────────────────────────────────────────────
```

To see what Opus actually cost you, you have to walk `usage.iterations[]` and bucket by type. Top-level `usage.input_tokens` only reflects executor totals. That's a footgun if you're plumbing this into a cost-tracking layer.

The harness is three files: a system prompt module, a `Conseiller` class that owns the message history and API call, and a CLI. The prompts are the most important part. Anthropic's own guidance on *when* to call the advisor is more thoughtful than I expected:

- **Call before substantive work.** Orientation isn't substantive; writing and answering are.
- **Call again when stuck.** Recurring errors, an approach that isn't converging.
- **Call once before declaring done.** After the durable artifact is written — if the session dies during the call, a saved file persists and an unwritten one doesn't.

One piece that's undersold: don't silently switch when your own evidence contradicts the advisor. Surface the conflict in one more advisor call instead. That's a smarter loop than either "always defer" or "ignore on disagreement."

The whole thing is under 200 lines of TypeScript. Repo at [github.com/mager/conseiller](https://github.com/mager/conseiller).

## What Anthropic shipped at Code w/ Claude

Two days after I pushed conseiller, Anthropic ran [Code w/ Claude 2026](https://simonwillison.net/2026/May/6/code-w-claude-2026/) and shipped, in one keynote, most of what I'd been building OpenClaw to do. Here's each piece, what it does, and how you actually use it.

### Claude Managed Agents

A platform service for running agents. Bundles best practices and memory out of the box, hosts the runtime, manages lifecycle. This is the daemon layer — the thing I had been keeping alive on a Mac mini under tmux.

How to use it: it's request-access only right now, via the form at [claude.com/form/claude-managed-agents](https://claude.com/form/claude-managed-agents). Pricing isn't public yet. If you've been hand-rolling the always-on layer of an agent harness, this is the row to watch.

### Multi-agent Orchestration

Public beta. Lets you build "fleets of agents to solve complex tasks." The keynote demo had a Commander, a Detector, and a Navigator coordinating on a moon-landing drone scenario.

This is, almost word-for-word, the principal-agent pattern. One agent is in charge; specialized agents handle sub-problems and return their answers; the principal stays in control of the overall task. It's the same shape conseiller uses at the model level, just promoted up to the agent level.

How to use it: public beta means you can try it now through the standard Claude API surface. The decomposition you choose — what each agent does and how they call each other — is your design call. The pattern itself is the same one to reach for: keep one agent in charge, give specialists narrow jobs, have them return text not control.

### Dreams

Research preview. Claude inspects previous sessions overnight, identifies what it missed, and generates new memory artifacts. The keynote example was a `descent-playbook.md` file written from analysis of past work.

This is the cross-session memory layer I'd been building with daily `memory/YYYY-MM-DD.md` files. The interesting bit isn't that it remembers — Claude has done that — it's that it *generates new artifacts* by reflecting on past sessions. Memory that writes itself.

How to use it: research preview, request access at the same form. Worth treating as experimental until you've seen the artifacts it produces and decided whether they're load-bearing or just notes-shaped tokens.

### Claude Code Routines

"Higher-order prompts" for async automations — described as letting you "set up async automations and wake up to PRs that are ready to merge." Documentation at [code.claude.com/docs/en/routines](https://code.claude.com/docs/en/routines).

This is the cron piece. Less ambient than Dreams, more about scheduled work. You write a routine, it runs on a schedule, and you check the result later.

How to use it: through the Claude Code platform — CLI, IDE, or Desktop. Wire one to your repo, point it at a recurring task ("review yesterday's PRs," "draft a post on this week's commits," "check source health on the scrapers"), let it run while you sleep.

### Remote Agents

Control your laptop from your phone. Direct mobile control of a session, beyond what channels do — channels message a session, Remote Agents drive one.

How to use it: details thin from the keynote. But pair this with Routines and a Mac mini you keep awake, and the "always reachable, always working" experience is no longer something you have to assemble.

### Channels (already shipped)

[I wrote about channels in March](https://mager.co/blog/2026-03-20-claude-code-channels). MCP-based push from Telegram or Discord into a running Claude Code session. Setup is four commands. Mobile reachability for any session you start.

## How the layers fit together

Mapped against the OpenClaw shape:

| OpenClaw piece | Anthropic equivalent |
| --- | --- |
| Always-on daemon | Claude Managed Agents |
| Multiple specialist agents | Multi-agent Orchestration |
| Tiered intelligence | Advisor tool |
| Cron / scheduled jobs | Claude Code Routines |
| Persistent memory | Dreams + Managed Agents memory |
| Mobile reachability | Channels + Remote Agents |
| Reusable behavior | Skills |
| Tool extensibility | MCP |

Every row is now an Anthropic product or feature. Some are research preview, some public beta, some require a form. But they're shipped.

The thing I want to be clear about: **Managed Agents and the advisor tool are not the same thing.** Easy to confuse from the names. Managed Agents is a platform — where agents run, what they remember, how they're managed. The advisor tool is a model-pairing primitive — how a single agent thinks. You use the advisor tool *inside* an agent that runs *on* Managed Agents. Different layers of the same stack.

The principal-agent pattern shows up at both layers, which is the only reason they sound related. Multi-agent Orchestration applies it at the agent level (Commander coordinates Detector + Navigator). The advisor tool applies it at the model level (Sonnet coordinates Opus). Same shape, different scope.

## The Pro vs API question

Worth answering directly because it changes which path you pick.

**The advisor tool is API only.** It's a feature of `client.beta.messages.create`, billed per token. Pro and Max credits don't apply.

If you want the OpenClaw shape on **subscription credits**, the path is Claude Code in tmux + channels + Routines + Tailscale. Always-on, mobile-reachable, scheduled, no per-token metering. What you don't get is the advisor tool — Claude Code doesn't surface it as a primitive yet. If you want **tiered intelligence specifically**, you're on the API. That's where conseiller lives.

The bridge: keep the always-on session on the subscription, call conseiller as a tool from inside it only at planning moments. You pay API rates only for the advisor calls. Done right, the bill is small.

## What I'm doing

Keeping conseiller for solo experiments — a small script I can modify is the right size for the advisor tool. Requesting access to Managed Agents and Dreams. Wiring Routines into magerblog and beatbrain first, where "wake up to PRs ready to merge" is exactly what I want.

OpenClaw isn't going anywhere — the parts that don't match the shipped products (my personality layer, the way I've wired identity across magerbot and genny, the brainpack portability story) still belong to me. But the scaffolding parts are scaffolding now, not infrastructure. That's a healthy outcome.

The principal-agent pattern is the architecture that holds whether you're using my hand-rolled harness or Anthropic's managed one. Conseiller is the worked example at the smallest interesting scale. Copy whatever's useful: [github.com/mager/conseiller](https://github.com/mager/conseiller).
