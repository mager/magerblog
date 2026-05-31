---
title: "Build your own AI harness: plexus, gbrain, and retiring OpenClaw"
description: "I stopped running someone else's agent harness and built my own in about 250 lines of TypeScript — plexus — then plugged it into gbrain for memory. Here's the whole setup and how it fits together."
pubDate: 2026-05-30
category: tech
draft: false
keyword: "AI harness"
tags: ["ai", "claude", "plexus", "gbrain", "harness", "mcp", "agents", "openclaw"]
---

For the last couple of months I've been talking to Claude through other people's harnesses — [OpenClaw](/blog/2026-05-13-killing-openclaw), [hermes](/blog/2026-04-28-hermes-agent-explainer), the usual suspects. They work well. But they own the chat surface, they make routing decisions I can't see, and they carry a lot of machinery I don't use. Earlier this month I argued that [Anthropic had shipped most of OpenClaw](/blog/2026-05-08-advisor-strategy-principal-agent), and that the parts worth keeping were never the infrastructure — they were the patterns: tiered intelligence, principal-agent, a cheap executor that escalates to an expensive one only when it has to.

So I kept the patterns and dropped the scaffolding. My personal-AI setup is now two small pieces I own end to end:

- **[plexus](https://github.com/mager/plexus)** — a roughly 250-line harness that wires my chat channels (Telegram, CLI, soon iMessage) to Claude with per-message model routing.
- **[gbrain](https://github.com/garrytan/gbrain)** — Garry Tan's open-source memory system, which plexus uses as its brain over MCP.

This post walks through the whole thing. Tonight I shut down the OpenClaw gateway on my Mac mini and brought plexus up in its place; it took one evening, and the moving parts are simple enough to explain in full.

---

## The problem: a harness I don't control, and a brain that doesn't scale

Two things had been bothering me.

**The harness wasn't mine.** Living inside someone else's harness means inheriting their choices — which model runs, how context resumes, what counts as a "channel." I wanted Telegram on my phone, a CLI on my laptop, eventually iMessage, all talking to the same assistant, and I wanted to be the one deciding when a message is worth Opus money and when Sonnet is plenty.

**My memory was flat files.** My brain lived in `~/Code/brain/` as markdown — SOUL.md, USER.md, MEMORY.md, and a growing stack of `memory/YYYY-MM-DD.md` daily logs, `@`-included into CLAUDE.md at session start. That works, but it's manual, flat, and unsearchable, and the agent can't write back to it without me editing files by hand. The structural problem is that the agent can only reason over what fits in context. As the brain grows you either truncate it or bloat the system prompt, and neither is a good answer.

Both problems have the same fix: keep the harness small and unopinionated, and treat the brain as a separate service you connect to it.

---

## Part 1: plexus, the harness

plexus wires chat channels to Claude. That's the entire scope. The design goal is *many channels in, one brain out* — the core doesn't know which platform a message came from, and channels are interchangeable adapters.

The flow is a straight line:

```
channel(s) ── IncomingMessage ──► handler ──► router (picks model)
                                       │                │
                                       │                ▼
                                       └─────────► agent (Agent SDK query)
                                                        │
                                                        ▼
                                                IncomingMessage.reply()
```

It's seven small files:

| File | Job |
| --- | --- |
| `src/index.ts` | Loads channels from `PLEXUS_CHANNELS`, handles slash commands, owns the message loop |
| `src/channels/types.ts` | The `Channel` + `IncomingMessage` interfaces — the only contract a new channel must satisfy |
| `src/channels/telegram.ts` | Grammy-based Telegram adapter |
| `src/channels/cli.ts` | Local terminal — my primary smoke test |
| `src/router.ts` | Picks the model |
| `src/agent.ts` | Thin wrapper around `query()` from the Claude Agent SDK |
| `src/state.ts` | Per-conversation `{ modelOverride, sessionId, lastSeen }` in `state.json` |

Keeping it this small is deliberate — no plugin system, no dependency injection, no registry. Adding a channel is one file that exports a `() => Channel` factory and implements `start(handler)`: when a message arrives, build an `IncomingMessage` and call `handler(msg)`. The fastest way to work on it is the terminal channel, which exercises every routing and state path with real agent calls and no bot setup:

```sh
PLEXUS_CHANNELS=cli bun start
```

### Routing

The router is the part I spent the most thought on, because it's where the cost lives. It's the [advisor / principal-agent pattern](/blog/2026-05-08-advisor-strategy-principal-agent) at the model level: a cheap default, escalated only when the message warrants it. Two tiers plus a manual override:

- **Default: Sonnet 4.6**, for most messages.
- **Opus 4.7** for anything classified as `code` or `research`.
- A **Haiku classifier** (`max_tokens: 8`) handles the ambiguous cases — but only after cheap regex heuristics short-circuit the obvious ones, so a message like "ty" never pays for a classifier round-trip.

The decision shows up in the logs:

```
[telegram] Mager: ty                          → sonnet (trivial)
[telegram] Mager: reverse a linked list in py → opus   (heuristic:code)
[telegram] Mager: fun things to do in tokyo   → sonnet (classifier:chat)
```

The bias is toward the cheaper model on purpose. A wrong call down to Sonnet costs me a re-ask; a wrong call up to Opus costs real money on every message that follows the same pattern. When the router gets it wrong I correct it with `/model opus`, `/model auto`, or `/reset`. Two tiers plus a manual override is the whole feature set, and keeping it there is what keeps the codebase readable.

Context resumes through the Agent SDK's `sessionId`, so there's no transcript management and no homegrown memory. Which leaves an obvious gap: if plexus has no memory of its own, where does the assistant's knowledge come from?

---

## Part 2: gbrain, the memory layer

plexus's design notes say, explicitly, "no vector RAG in the core." That's intentional. The harness stays small; the brain is a separate service you connect. That service is gbrain.

> If you're new here: **RAG** (retrieval-augmented generation) is the standard way to give a language model knowledge it wasn't trained on. You keep your documents in a searchable store, fetch the few most relevant ones for a given question, and paste them into the prompt so the model can answer from them. The model doesn't "remember" anything between calls — you re-retrieve the right context each time.

gbrain is a TypeScript CLI and MCP server by Garry Tan, open-sourced in April 2026. It's what my flat files should have grown into. Three layers:

- **Brain repo.** Plain markdown in a git repo. Each page is "compiled truth plus timeline" — current understanding at the top, append-only dated entries below. Diffable and human-readable.
- **Retrieval.** Postgres with pgvector (or local PGLite, zero-config) doing hybrid search: vector similarity merged with keyword search via reciprocal rank fusion, with backlink boosting for connected pages. On LongMemEval it lands the right answer in the top 5 results 97.6% of the time, with no LLM call at retrieval time.
- **Skills.** Bundled markdown workflows that tell the agent when to read from the brain and what quality bar to write back at.

What separates it from generic RAG is that gbrain builds its knowledge graph from wikilinks (`[[person]]`, `[[company]]`) with zero LLM calls — the graph comes from structure that's already in the documents, not from a per-page extraction pass. I wrote up the [full migration off flat files separately](/blog/2026-05-18-gbrain-garry-tan-ai-memory); the short version is `init --pglite`, then `import ~/Code/brain/`.

---

## Part 3: connecting the brain to the harness

This is where the two projects fit together cleanly.

plexus's agent is a thin wrapper around `query()` from the Claude Agent SDK, and the Agent SDK speaks MCP. gbrain ships an MCP server (`gbrain serve`). So plexus doesn't need a memory subsystem of its own; it hands the SDK one more server to talk to. In `src/agent.ts`, registering memory is a few lines:

```ts
import { query, type McpServerConfig } from "@anthropic-ai/claude-agent-sdk";

// passed straight into query({ ...options, mcpServers })
const mcpServers = {
  gbrain: { type: "stdio", command: "gbrain", args: ["serve"] },
};
```

It's gated behind an environment flag so the harness stays unopinionated: set `PLEXUS_GBRAIN=1` and the brain is available; leave it off and plexus is a pure router. The same server I'd register in plain Claude Code with `claude mcp add gbrain "gbrain serve"` is now reachable one layer down, through the SDK.

On top of that, plexus's system prompt tells the assistant to search gbrain before answering anything about me or my projects, and to write durable facts and corrections back to it. So the brain is both readable and slowly self-updating, and the harness coordinates none of it — it exposes the tools and stays out of the way.

### Proving it's actually used

It's easy to claim an integration works. Here's the receipt. I added a one-line log to `src/agent.ts` that prints every tool the agent calls, then asked a cold question (after `/reset`, so nothing was cached in the session):

```
> Search your memory: which sports app am I building and what stack does it use?
[cli] local: ... → sonnet (classifier:chat)
  [tool] ToolSearch
  [tool] mcp__gbrain__search
prxps — sports predictions app.
Stack: SvelteKit 5, TypeScript, Neon Postgres + Drizzle ORM, Firebase/Firestore, deployed on Vercel.
```

The agent found the gbrain tool (`ToolSearch`), called `mcp__gbrain__search`, and answered from the brain. That stack detail isn't in plexus's prompt anywhere — it came out of a markdown page in `~/Code/brain/`.

---

## Adding a plugin: compound engineering

Because plexus's agent *is* the Claude Agent SDK — the same runtime as Claude Code — anything I install at the user scope is available to it. That makes the Claude Code plugin ecosystem free leverage for the harness.

To try it, I added [Every's compound-engineering plugin](https://github.com/EveryInc/compound-engineering-plugin) on the mini:

```sh
claude plugin marketplace add EveryInc/compound-engineering-plugin
claude plugin install compound-engineering
# ✔ Successfully installed plugin: compound-engineering@compound-engineering-plugin (scope: user)
```

```sh
claude plugin list
#  ❯ compound-engineering@compound-engineering-plugin
#    Version: 3.9.3   Scope: user   Status: ✔ enabled
```

Compound engineering is Every's name for a simple idea: each unit of engineering work should make the next one *easier*, not harder. In practice that means spending most of your effort on planning and on writing down what you learned, so the next task starts from a better place than the last. The plugin packages that as a set of slash commands — `/ce-plan`, `/ce-work`, `/ce-code-review`, `/ce-compound` (the one that records learnings) — plus a pile of agents.

The point for this post isn't the specific plugin. It's that "add a plugin" is a real, one-line operation against my own harness, because I didn't reinvent the runtime — I'm standing on the Agent SDK and inheriting everything that already plugs into it.

---

## Retiring OpenClaw (for real this time)

I [wrote a couple weeks ago about killing OpenClaw](/blog/2026-05-13-killing-openclaw), and I believed it. But it wasn't fully off. On the Mac mini, my Telegram assistant was still Claude Code running *behind* an OpenClaw gateway — a `launchd` agent (`ai.openclaw.gateway`) keeping a `screen` session alive that relaunched `claude --channels plugin:telegram`. The brain had moved on; the plumbing hadn't. So tonight I finished the job:

```sh
launchctl bootout gui/$(id -u)/ai.openclaw.gateway
mv ~/Library/LaunchAgents/ai.openclaw.gateway.plist{,.disabled}
screen -S tgbot -X quit
```

That stops the gateway, disables the plist so it won't respawn on reboot, and ends the supervisor screen. Then I pointed plexus at the same Telegram bot token, restricted it to my own Telegram user ID — it's wired to my API key and my brain, so it should answer me and no one else — turned on `PLEXUS_GBRAIN`, and started it under `screen`:

```sh
screen -dmS plexus bash -lc "cd ~/Code/plexus && bun src/index.ts"
# [telegram] up
```

A note on `screen`: I'm using it rather than tmux for a boring reason — it ships with macOS and tmux doesn't, and all I need here is detach-and-forget. It's a placeholder. The right answer for an always-on service is a `launchd` plist, which is where this is headed; `screen` is just what got me running tonight.

A few seconds later I messaged the bot from my phone and watched the routing decision scroll past in the log:

```
[telegram] Mager: Cool I wanna make sure plexus repo is up to date → sonnet (trivial)
```

(That one's a routing miss, incidentally — the trivial-message heuristic matched on the leading "Cool" and skipped the classifier. Cheap to fix, and a fair example of where a two-tier heuristic has rough edges.)

---

## What it adds up to

The whole setup is a harness I can read top to bottom, two tiers of routing that keep the bill in check, and an open-source brain attached over MCP. It's personal-assistant scale, which is the point — none of it is trying to be more than that.

If you want to build the same shape, it's small. The contract a channel has to satisfy is one type:

```ts
export type IncomingMessage = {
  channel: string;
  conversationId: string;       // stable per chat/thread — the key for routing + state
  userId: string;
  userName?: string;
  text: string;
  reply: (text: string) => Promise<void>;
  typing?: () => Promise<void>;
};
```

Everything else follows from there:

1. Define that `IncomingMessage` interface and don't let platform details like `chat_id`s or reactions leak into it.
2. Write one channel that builds an `IncomingMessage` and calls a handler. Start with the CLI — it doubles as your integration test.
3. Write a router that defaults to the cheap model and escalates on a heuristic before paying for a classifier.
4. Wrap the Agent SDK's `query()` and pass it the routed model and your MCP servers.
5. Persist `{ sessionId, modelOverride }` per conversation to a JSON file.

What I like about this is that it's small enough to hold in my head. When a message routes to the wrong model or a channel misbehaves, I can read the entire path — channel to router to agent to reply — in a couple of minutes and fix it. That's the trade you get for building it yourself instead of running someone else's platform: less power out of the box, total understanding of what you have.

Next steps: moving plexus off `screen` onto a proper `launchd` plist so it runs full-time, finishing the iMessage channel, and letting gbrain's nightly cycle improve the brain on its own. The end state I'm after is unremarkable in the best way — a small harness running on a mini in the closet, my brain connected to it, reachable from my phone.

---

## Links

- plexus: [github.com/mager/plexus](https://github.com/mager/plexus)
- gbrain: [github.com/garrytan/gbrain](https://github.com/garrytan/gbrain)
- compound-engineering plugin: [github.com/EveryInc/compound-engineering-plugin](https://github.com/EveryInc/compound-engineering-plugin)
- The migration to gbrain: [my writeup from earlier this month](/blog/2026-05-18-gbrain-garry-tan-ai-memory)
- Why I stayed with Claude: [Anthropic shipped most of OpenClaw](/blog/2026-05-08-advisor-strategy-principal-agent)
