---
title: "Build Your Own Agent Team with ACP"
pubDate: "2026-03-06"
updatedAt: "2026-03-12"
description: "I run two AI agents — magerbot handles code and ops, genny runs my life. Inspired by the Agent Communication Protocol, here's how I got them to actually talk to each other. Now with a full TUI built on the Claude Agent SDK."
category: tech
tags: ["AI", "Agents", "ACP", "SDK", "Claude", "Tutorial", "TUI"]
heroImage: ""
keyword: "agent context protocol SDK tutorial TUI"
draft: false
---

I run two AI agents.

**magerbot** handles everything technical — code reviews, deploys, infra, debugging at 2 AM. **genny** manages my life — exercise, nutrition, travel planning, long-term goals. They're both running 24/7.

The problem: they didn't talk to each other. When I asked magerbot to prep for my Japan trip, it knew the flights were booked. But genny owns the health protocol and itinerary logic. The handoff was me, manually copy-pasting context between two chat windows.

That's not an agent team. That's two isolated chatbots with a human glue layer.

Inspired by [ACP](https://agentcommunicationprotocol.dev) — the **Agent Communication Protocol**, an open spec under the Linux Foundation — I built my own lightweight SDK for wiring agents together. Same idea, simpler surface area: a standard envelope for passing context between agents without dropping state at the boundary. Here's how it works, and how you can build your own team with nothing but the Claude API.

## The Problem: Context Dies at the Boundary

When agents hand off to each other today, they pass strings. All the *accumulated reasoning* — session state, retrieved memory, dead ends already explored — gets dropped.

Agent B starts from zero. Repeats work. Makes different assumptions.

ACP fixes this with a standard envelope for four things:

| Field | What it carries |
|-------|----------------|
| **identity** | Who is this agent? What can it do? |
| **state** | Session-scoped data accumulated so far |
| **memory** | Long-term facts and preferences |
| **intent** | What the caller actually wants done |

## Install

```bash
npm install @mager/acp
```

## Build Your First Agent

Extend `ACPAgent`. Override `handle()`. Done.

```ts
import { ACPAgent, ACPMessage } from "@mager/acp";
import Anthropic from "@anthropic-ai/sdk";

const claude = new Anthropic();

class ResearchAgent extends ACPAgent {
  constructor() {
    super({
      id: "researcher",
      capabilities: ["search", "analyze", "summarize"],
      systemPrompt: "You are a research agent. Be thorough.",
    });
  }

  async handle(ctx: ACPMessage): Promise<string> {
    const { intent, state, identity } = ctx;
    // ctx has everything: who sent it, what they want, session state, memory
    const response = await claude.messages.create({
      model: "claude-opus-4-5",
      max_tokens: 500,
      system: this.systemPrompt,
      messages: [{ role: "user", content: `Research: ${intent.target}` }],
    });
    return response.content[0].type === "text" ? response.content[0].text : "";
  }
}
```

## Wire Two Agents Together

The magic is in `delegate()` — pass an `ACPAgent` instance and it handles the context automatically.

```ts
class WriterAgent extends ACPAgent {
  constructor() {
    super({ id: "writer", capabilities: ["write", "edit"] });
  }

  async handle(ctx: ACPMessage): Promise<string> {
    const { intent, state, identity } = ctx;
    // Writer gets the FULL context from researcher — nothing lost at the handoff
    const response = await claude.messages.create({
      model: "claude-opus-4-5",
      max_tokens: 400,
      messages: [{
        role: "user",
        content: `Write a summary about "${intent.target}".
Research: ${JSON.stringify(intent.payload)}
Confidence: ${state.metadata?.confidence}
Handed off by: ${identity.agent_id}`,
      }],
    });
    return response.content[0].type === "text" ? response.content[0].text : "";
  }
}

const writer = new WriterAgent();
const researcher = new ResearchAgent();

// Researcher delegates to writer — passes the ACPAgent instance directly
const result = await researcher.delegate(writer, {
  action: "write_summary",
  target: "the Agent Context Protocol",
  payload: { key_finding: "context dies at the boundary without ACP" },
}, {
  current_task: "research_complete",
  metadata: { confidence: 0.92, sources_checked: 8 },
});
```

That's the whole pattern. Two agents, one protocol, zero context lost.

## The Real Thing: magerbot + genny

Here's how my actual stack works. I ask magerbot to help prep for my Japan trip:

```ts
import { Genny } from "./genny";
import { Magerbot } from "./magerbot";

const genny = new Genny();
const magerbot = new Magerbot(genny); // magerbot knows about genny

// One entry point — magerbot routes internally
const result = await magerbot.handle({
  acp_version: "0.1.0",
  identity: { agent_id: "user", capabilities: ["request"] },
  state: { session_id: "sess_001", turn_count: 1 },
  memory: { retrieved: [] },
  intent: {
    action: "prepare_for_japan_trip",
    target: "japan_2026",
    payload: {
      departure: "April 20, 2026",
      cities: ["Tokyo", "Kyoto", "Osaka"],
      flights_booked: true,
      current_fitness: "gym 3x/week",
    },
  },
});
```

Magerbot handles the ops side (logistics checklist, SIM card, offline maps), detects that health planning is needed, then **delegates to genny via ACP** with everything it already gathered. Genny receives the full context — she knows the dates, the cities, the fitness baseline — and builds the health protocol without magerbot having to re-explain any of it.

The ACP message genny receives looks like this:

```json
{
  "acp_version": "0.1.0",
  "identity": { "agent_id": "magerbot", "capabilities": ["code", "ops", "planning"] },
  "state": {
    "session_id": "sess_m1k2_abc",
    "turn_count": 2,
    "current_task": "prepare_for_japan_trip",
    "metadata": { "delegated_by": "magerbot", "confidence": 0.95 }
  },
  "memory": { "retrieved": [] },
  "intent": {
    "action": "build_trip_health_protocol",
    "target": "japan_2026",
    "payload": {
      "departure": "April 20, 2026",
      "cities": ["Tokyo", "Kyoto", "Osaka"],
      "magerbot_handled": "Logistics checklist complete. SIM card ordered..."
    }
  }
}
```

Genny picks up mid-stride. No re-briefing. Zero human glue.

## Build Your Own Team

You don't need my infra. You don't need OpenClaw. Just:

1. **Pick domains** — one agent per area of expertise
2. **Define capabilities** — be specific (`["write_code", "run_tests"]` not `["code"]`)
3. **Map your handoffs** — which agents talk? what context do they need?
4. **Extend ACPAgent** — override `handle()`, use `delegate()` to pass control

The full magerbot + genny example is in the repo. Clone it, rename the agents, make it yours.

```bash
git clone https://github.com/mager/acp
cd acp && npm install
ANTHROPIC_API_KEY=your_key npx ts-node examples/magerbot-genny/index.ts
```

## Why Not MCP? Why Not the Real ACP?

Quick clarifications on where `@mager/acp` fits:

**MCP** is for connecting agents to *tools* — databases, APIs, file systems. Not what we're solving here.

**The real ACP** ([agentcommunicationprotocol.dev](https://agentcommunicationprotocol.dev)) is the Linux Foundation's open spec for agent interoperability — REST-based, framework-agnostic, production-grade. That's what inspired this. If you're building at scale across teams or organizations, go use that.

**`@mager/acp`** is my lightweight take on the same idea: a simple TypeScript envelope for passing context between agents in the same codebase. No REST servers required, no infra overhead. Good for small teams running a handful of agents together.

Use the real ACP for the big stuff. Use this for moving fast.

## Update: The TUI Refactor (v0.2.0)

*Updated March 12, 2026*

I rewrote the SDK. Not the core — the context envelope and delegation pattern are solid. But the developer experience needed to evolve.

The original ACP was a library you imported. You wrote scripts, ran them, saw text output. It worked, but it didn't *feel* like an agent team. The handoffs were invisible. You'd run a script and get a result, but you couldn't *see* magerbot thinking, then the context passing to genny, then her picking up the thread.

So I rebuilt it as a **TUI** — a terminal user interface — using [Ink](https://github.com/vadimdemedes/ink) (React for terminals) and the Claude Agent SDK's streaming API.

### What Changed

**From this:**
```bash
npx ts-node examples/magerbot-genny/index.ts
# ...waits...
# ...output appears...
```

**To this:**
```bash
npx acp
```

You get a live interface. Three panels:

1. **Agent Team** — Live status indicators showing who's thinking, who's idle, who's handing off
2. **Message History** — Scrollable conversation with visual handoff markers
3. **ACP Context Panel** (toggle with `H`) — Inspect the full context envelope at any handoff

### Why Ink + React?

I wanted real-time streaming without the complexity of a web app. Ink gives you React's component model in the terminal. I can update agent status indicators, append streaming tokens to the message log, and handle keyboard input — all with the same mental model as a web app.

The streaming integration with Claude's Agent SDK means you *see* the agent thinking in real-time. Not just a spinner. The actual tokens appearing. When magerbot decides to hand off to genny, you see the "↳ Handoff" message with the ACP context payload.

### The New Architecture

The SDK now has two layers:

```
┌─────────────────────────────────────────┐
│           TUI Layer (Ink/React)         │
│  ┌─────────┐ ┌──────────┐ ┌──────────┐ │
│  │ Agent   │ │ Message  │ │ Context  │ │
│  │ Team    │ │ List     │ │ Panel    │ │
│  └────┬────┘ └────┬─────┘ └────┬─────┘ │
└───────┼──────────┼────────────┼───────┘
        └──────────┼────────────┘
                   ▼
┌─────────────────────────────────────────┐
│        ACPAgentRunner (Orchestrator)    │
│  - Claude streaming API integration     │
│  - Handoff detection (DELEGATE_TO:)     │
│  - Real-time callbacks to TUI           │
└─────────────────────────────────────────┘
                   │
        ┌──────────┴──────────┐
        ▼                     ▼
┌──────────────┐      ┌──────────────┐
│  magerbot ⚡  │←────→│   genny 🌿   │
│  ACPAgent    │  ACP  │  ACPAgent    │
└──────────────┘       └──────────────┘
```

The `ACPAgentRunner` is new. It manages the agent lifecycle, handles streaming responses from Claude, detects when an agent wants to hand off (via a `DELEGATE_TO:` marker in the response), and fires callbacks that the TUI uses to update the interface.

### Try It

```bash
npm install -g @mager/acp
ANTHROPIC_API_KEY=your_key npx acp --agents=magerbot,genny
```

Type a request that spans both domains — like "I'm going to Japan for two weeks, help me prepare." You'll see magerbot handle the logistics, then hand off to genny for the health protocol, all in one continuous flow.

Press `H` to inspect the ACP context at any handoff. You'll see the exact payload genny receives — session ID, turn count, everything magerbot already gathered.

### What I Learned

1. **Streaming changes everything.** When you can see the agent thinking token-by-token, you trust it more. You know it's working, not stuck.

2. **Visibility matters.** The handoff used to be invisible — just a function call. Now it's a first-class UI event. You *see* context passing between agents. That visibility makes the abstraction real.

3. **Ink is underrated.** For developer tools, a TUI hits a sweet spot. Richer than CLI scripts, lighter than web apps. No browser, no server, just the terminal.

The core SDK is still there — you can use `ACPAgent` and `delegate()` programmatically without the TUI. But the TUI is now the primary interface. It's how I run my agent team every day.

## What's Next

The spec is early. The SDK works. What I want to add:

- HTTP transport helpers so agents can live in separate services
- Python port for the ML crowd
- Agent registry — discover agents by capability, not by hardcoded imports

Repo: [github.com/mager/acp](https://github.com/mager/acp)  
Package: `npm install @mager/acp`

If you build something with it, [let me know](https://x.com/mager).
