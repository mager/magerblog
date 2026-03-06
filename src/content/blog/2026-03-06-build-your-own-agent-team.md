---
title: "ACP: Build Your Own Agent Team"
pubDate: "2026-03-06"
description: "I run two AI agents — magerbot handles code and ops, genny runs my life. Here's how I got them to actually talk to each other, and how you can build your own agent team with nothing but Claude."
category: "code"
tags: ["AI", "Agents", "ACP", "SDK", "Claude", "Tutorial"]
heroImage: ""
keyword: "agent context protocol SDK tutorial"
draft: false
---

I run two AI agents.

**magerbot** handles everything technical — code reviews, deploys, infra, debugging at 2 AM. **genny** manages my life — exercise, nutrition, travel planning, long-term goals. They're both running 24/7.

The problem: they didn't talk to each other. When I asked magerbot to prep for my Japan trip, it knew the flights were booked. But genny owns the health protocol and itinerary logic. The handoff was me, manually copy-pasting context between two chat windows.

That's not an agent team. That's two isolated chatbots with a human glue layer.

So I built [ACP](https://github.com/mager/acp) — the **Agent Context Protocol** — a lightweight SDK for wiring agents together. Here's how it works, and how you can build your own team with nothing but the Claude API.

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

## Why Not MCP?

MCP is for connecting agents to *tools*. ACP is for connecting agents to *agents*.

- **MCP:** "Here's how to call a database"
- **ACP:** "Here's what I know, what I've done, and what I need from you"

They're complementary. Use both.

## What's Next

The spec is early. The SDK works. What I want to add:

- HTTP transport helpers so agents can live in separate services
- Python port for the ML crowd
- Agent registry — discover agents by capability, not by hardcoded imports

Repo: [github.com/mager/acp](https://github.com/mager/acp)  
Package: `npm install @mager/acp`

If you build something with it, [let me know](https://x.com/mager).
