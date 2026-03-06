---
title: "ACP: Build Your Own Agent Team"
pubDate: "2026-03-06"
description: "I run two AI agents — magerbot handles code and ops, genny runs my life. Here's how I got them to actually talk to each other, and how you can build your own agent team using nothing but Claude."
category: "code"
tags: ["AI", "Agents", "ACP", "SDK", "Claude", "Tutorial"]
heroImage: ""
keyword: "agent context protocol SDK tutorial"
draft: true
---

I run two AI agents.

**magerbot** handles everything technical — code reviews, deploys, infra, debugging at 2 AM. **genny** manages my life — exercise, nutrition, travel planning, long-term goals. They're both running 24/7 on OpenClaw, my personal agent infrastructure.

The problem: they didn't talk to each other. When I asked magerbot to prep for my Japan trip, it knew I had flights booked. But genny owns the health protocol and itinerary logic. The handoff was me, manually copy-pasting context between two chat windows like it's 2019.

That's not an agent team. That's two isolated chatbots with a human glue layer.

So I built ACP — the **Agent Context Protocol** — and an SDK to go with it. Here's how it works, and how you can build your own agent team using nothing but the Claude API.

## The Problem: Context Dies at the Boundary

When agents hand off to each other today, they pass strings. Maybe some JSON if you're organized. But all the *accumulated reasoning* — the session state, the retrieved memory, the dead ends already explored — gets dropped.

Agent B starts from zero. Repeats work. Makes different assumptions. You get compounding drift across a pipeline.

ACP fixes this by defining a standard envelope for four things an agent needs to hand off:

| Field | What it carries |
|-------|----------------|
| **Identity** | Who is this agent? What can it do? |
| **State** | Session-scoped data accumulated so far |
| **Memory** | Long-term facts and preferences |
| **Intent** | What the caller actually wants done |

## Install the SDK

```bash
npm install acp-sdk
```

## Build Your First Agent Team (Plain Claude, No Infra)

No OpenClaw. No special setup. Just your Anthropic API key and two agents that can actually collaborate.

```ts
import Anthropic from "@anthropic-ai/sdk";
import { ACPAgent } from "acp-sdk";

const claude = new Anthropic();

// --- Agent A: Researcher ---
const researcher = new ACPAgent({
  id: "researcher",
  capabilities: ["web_search", "summarize"],
});

async function researchAgent(topic: string): Promise<string> {
  // Do some work, build up state
  const findings = `Key facts about ${topic}: [mock research results]`;

  // Build an ACP context to hand off to the writer
  const ctx = researcher.createContext(
    {
      action: "write_summary",
      target: topic,
      constraints: { audience: "technical", max_length: 300 },
      payload: { findings },
    },
    {
      current_task: "research_complete",
      metadata: { sources_checked: 5, confidence: 0.85 },
    }
  );

  // Delegate to the writer agent with full context
  return researcher.delegate(writerAgent, ctx.intent, ctx.state);
}

// --- Agent B: Writer ---
const writer = new ACPAgent({
  id: "writer",
  capabilities: ["write", "edit", "format"],
});

async function writerAgent(ctx: ACPMessage): Promise<string> {
  // Writer receives the FULL context — not just a string
  const { intent, state, memory, identity } = ctx;

  const prompt = `
You are a technical writer. The researcher (${identity.agent_id}) has handed you context:

Task: ${intent.action} about "${intent.target}"
Audience: ${intent.constraints?.audience}
Max length: ${intent.constraints?.max_length} words
Research findings: ${JSON.stringify(intent.payload)}
Research confidence: ${state.metadata?.confidence}

Write the summary now.
  `.trim();

  const response = await claude.messages.create({
    model: "claude-opus-4-5",
    max_tokens: 500,
    messages: [{ role: "user", content: prompt }],
  });

  return response.content[0].type === "text" ? response.content[0].text : "";
}

// Run it
const result = await researchAgent("the Agent Context Protocol");
console.log(result);
```

That's it. Two agents. One protocol. No context lost at the handoff.

## The magerbot → genny Pattern

Here's the real-world version from my stack. When I ask magerbot to help plan my Japan trip:

```ts
// magerbot knows: flights booked, dates set, budget rough estimate
const magebotCtx = magerbot.createContext(
  {
    action: "plan_trip_health_protocol",
    target: "japan_trip",
    constraints: { duration_days: 14, departure: "2026-04-20" },
    payload: {
      flights_booked: true,
      cities: ["Tokyo", "Kyoto", "Osaka"],
      budget_usd: 4000,
    },
  },
  {
    current_task: "trip_prep",
    metadata: { user: "mager", context_source: "booking_confirmed" },
  }
);

// Hands off to genny with FULL context
// genny picks up knowing: who asked, what's booked, what's needed
const gennyResponse = await magerbot.delegate(
  gennyAgent,
  magebotCtx.intent,
  magebotCtx.state
);
```

genny receives the session, knows the flights are booked, knows the dates, and builds a health protocol without magerbot having to re-explain any of it. Zero human glue.

## Why Not Just Use MCP?

MCP is for *tools*. ACP is for *agents*.

- **MCP** says: "Here's how to call a function"
- **ACP** says: "Here's what I know, what I want, and who I am"
- They're complementary — an MCP server can expose a tool that speaks ACP

## Build Your Own Agent Team

You don't need OpenClaw. You don't need any special infra. Here's the minimum to replicate what I built:

1. **Pick your domains** — code, life, health, finance, whatever. One agent per domain.
2. **Define capabilities** — be specific. `["write_code", "run_tests", "deploy"]` not just `["code"]`.
3. **Map your handoffs** — which agents need to talk? What context do they need?
4. **Wrap with ACP** — let the SDK handle serialization, session IDs, turn tracking.

The hard part isn't the protocol. It's deciding what your agents are actually responsible for. Get that right and the handoffs fall into place.

## SDK Roadmap

- [x] TypeScript core (types, ACPAgent, context builder/validator)
- [x] Plain Claude examples
- [ ] Python port
- [ ] Formal JSON Schema spec
- [ ] OpenClaw native integration
- [ ] Agent registry (discover agents by capability)

The repo is at [github.com/mager/acp](https://github.com/mager/acp). It's early. Come shape it.

---

*Running your own agent team? Wrestling with agent-to-agent handoffs? [Hit me up](https://x.com/mager).*
