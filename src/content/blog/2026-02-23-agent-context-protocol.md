---
title: "ACP: The Missing Protocol for AI Agents"
pubDate: "2026-02-23"
description: "MCP connects agents to tools. But what connects agents to agents? Introducing the Agent Context Protocol — a lightweight standard for sharing state, memory, and intent between autonomous systems."
category: "code"
tags: ["AI", "Agents", "Protocol", "SDK", "Architecture"]
heroImage: ""
keyword: "agent context protocol ACP"
draft: true
---

Every AI agent today is an island.

MCP gave us a standard way to plug agents into tools — databases, APIs, file systems. That's huge. But once your agent starts *talking to another agent*, you're back to winging it. JSON blobs over HTTP? Custom headers? Hope the other side parses it right?

We need a protocol for agent-to-agent context passing. Something lightweight, extensible, and purpose-built for autonomous systems that need to hand off state without losing intent.

That's ACP — the **Agent Context Protocol**.

## The Problem: Context Dies at the Boundary

Here's what happens today:

1. Agent A researches a topic, builds up rich context (sources, confidence scores, dead ends)
2. Agent A calls Agent B to do something with that research
3. Agent B receives... a string. Maybe some metadata if you're lucky.
4. Agent B starts from zero, repeats work, makes different assumptions

The context — the * accumulated reasoning* — dies at the handoff. You're not orchestrating agents; you're throwing messages into a void and hoping.

## What ACP Defines

Agent Context Protocol is a minimal specification for how agents exchange four things:

| Field | Purpose |
|-------|---------|
| **Identity** | Who is this agent? What version? What capabilities? |
| **State** | Session-scoped data the agent has accumulated |
| **Memory** | Long-term facts, preferences, retrieved context |
| **Intent** | What the caller wants done, in structured form |

```json
{
  "acp_version": "0.1.0",
  "identity": {
    "agent_id": "research-assistant-v2",
    "vendor": "mycompany",
    "capabilities": ["web_search", "summarize", "citation"]
  },
  "state": {
    "session_id": "sess_abc123",
    "turn_count": 7,
    "current_task": "compile_report"
  },
  "memory": {
    "retrieved": [
      {"key": "user_pref_citation_style", "value": "apa", "ttl": 3600}
    ]
  },
  "intent": {
    "action": "summarize",
    "target": "quantum_computing_primer",
    "constraints": {"max_length": 500, "audience": "executive"}
  }
}
```

## Why Not Just Use MCP?

MCP is for *tools*. ACP is for *agents*.

MCP says: "Here's how to call a function."  
ACP says: "Here's what I know, what I want, and how to reach me back."

They're complementary. An MCP server might expose a tool that speaks ACP. An ACP-compliant agent might use MCP tools to fulfill its intent.

## The SDK Angle

I'm building an agent SDK. ACP is the wire format I'm standardizing on for:

- **Agent-to-agent delegation** — pass full context, not just text
- **Resume interrupted sessions** — serialize state, resume elsewhere
- **Observable pipelines** — trace intent through a chain of agents
- **Interoperability** — your agent can call my agent without custom integration

The SDK handles the boring stuff: serialization, validation, retries, context window management. You define your agent's capabilities. ACP handles the rest.

## Design Principles

1. **Minimal but extensible** — Core fields are required. Everything else is namespaced.
2. **Transport agnostic** — Works over HTTP, WebSocket, gRPC, or message queues.
3. **Human debuggable** — JSON-native. You can read it in a log file.
4. **Security conscious** — Signed attestations for identity, encrypted memory fields.
5. **Version tolerant** — Unknown fields don't break parsers.

## Current Status

ACP is a working draft. I'm implementing it in the SDK now, dogfooding it across a few internal projects. The spec lives in a public repo (coming soon) — want to shape it while it's still malleable, the time is now.

The goal isn't to own this. It's to *start the conversation*. If enough agent builders agree on a standard way to share context, we all win.

## What's Next

- Reference implementation in TypeScript (the SDK)
- Python port for the ML folks
- Formal spec + JSON Schema
- Test vectors for compliance

If you're building agents that talk to other agents, you feel this pain. Let's fix it together.

---

*Building an agent SDK? Wrestling with agent-to-agent context passing? [Hit me up](https://x.com/mager).*
