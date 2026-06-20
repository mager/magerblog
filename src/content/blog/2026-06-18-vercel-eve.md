---
title: "Eve: Vercel's framework for agents that actually ship"
description: "Vercel launched an open-source agent framework at Ship London. The filesystem is the config, durable execution is built in, and deploy is just vercel deploy."
pubDate: 2026-06-18
category: tech
draft: false
tags: ["tech", "ai", "vercel", "agents", "typescript"]
---

Vercel shipped an open-source agent framework at their Ship conference in London yesterday. It's called [Eve](https://github.com/vercel/eve), and the pitch is: if Next.js solved the boilerplate problem for web apps, Eve does the same for agents.

I've been following the space long enough to be skeptical of that framing. Most "Next.js for X" things end up being a thin wrapper that adds opinions without removing decisions. Eve is more considered than that.

---

## The filesystem is the config

The central design choice is that an agent is a directory. Eve discovers everything by convention — no registration, no YAML, no call to `registerAgent()`.

```
agent/
  agent.ts          # Model config
  instructions.md   # System prompt
  tools/            # Typed functions the model can call
  skills/           # Markdown knowledge files loaded on demand
  subagents/        # Delegated agents
  channels/         # Slack, Discord, Telegram, GitHub, etc.
  schedules/        # Cron jobs
```

The smallest runnable agent is two files. `agent.ts` picks the model:

```typescript
import { defineAgent } from "eve";
export default defineAgent({
  model: "anthropic/claude-opus-4-8",
});
```

And `instructions.md` is the system prompt in plain markdown. That's it. You can hand that to a non-engineer and they can understand and edit the agent's behavior without touching TypeScript.

The rest of the structure scales in as you need it. Want the agent to query your database? Drop a file in `tools/`. Want it to post to Slack every Monday? Drop a file in `schedules/`. The framework infers intent from the file's location and wires it up automatically.

---

## Tools with typed inputs and conditional approval

Tool definitions use Zod for input schemas, which means you get type safety and runtime validation in the same declaration:

```typescript
import { defineTool } from "eve/tools";
import { z } from "zod";

export default defineTool({
  description: "Run read-only SQL queries",
  inputSchema: z.object({
    sql: z.string().describe("SELECT statement"),
  }),
  needsApproval: ({ toolInput }) => estimateScanGb(toolInput.sql) > 50,
  async execute({ sql }) {
    const { columns, rows } = await runReadOnlySql(sql);
    return { columns, rows: rows.slice(0, 500), truncated: rows.length > 500 };
  },
});
```

The `needsApproval` field is the part worth pausing on. You define the condition — in this case, a query that would scan more than 50 GB — and Eve handles pausing the agent, routing the approval request to wherever humans are, and resuming after the answer. The agent doesn't consume compute while it waits. You're not implementing any of that coordination yourself.

---

## Durable execution by default

Agents crash. Deploys interrupt running sessions. The normal response is to either accept the loss or build your own checkpointing. Eve handles it at the framework level: sessions checkpoint after each step and resume from where they left off.

This is one of those features that's hard to appreciate until you've debugged a long-running agent that failed halfway through and you have no idea which steps completed. With durable execution, you get replay. Without it, you get a process that's somewhere between "done" and "not started."

---

## Schedules are just files

A weekly report that runs in Slack:

```typescript
import { defineSchedule } from "eve/schedules";

export default defineSchedule({
  cron: "0 9 * * 1",
  async run({ receive, waitUntil, appAuth }) {
    waitUntil(
      receive(slack, {
        message: "Summarize last week's revenue",
        target: { channelId: "C0123ABC" },
        auth: appAuth,
      }),
    );
  },
});
```

Drop this file in `schedules/` and the cron is registered. The agent wakes up at 9am Monday, sends the message, and waits for the response. You didn't configure any cron infrastructure.

---

## Skills: business logic in markdown

The skills directory holds markdown files that the model loads on demand. Each file is a chunk of context — domain knowledge, business rules, conventions — that becomes available to the agent when it's relevant.

```markdown
---
description: How this team defines revenue.
---
Revenue is recognized net of refunds, over the subscription term.
Weeks are Monday-anchored, in UTC.
```

The practical value here is that a non-engineer can encode something the agent needs to know without touching code. A finance analyst can write the revenue definition. A product manager can write the support escalation policy. The code stays in tools; the knowledge lives in files that humans can read and edit.

---

## Multi-channel out of the box

Add a file to `channels/` to connect the same agent to a new surface — Slack, Discord, Teams, Telegram, Twilio, GitHub, Linear. The agent logic doesn't change. The channel file handles the connector.

This is worth naming: most agent projects end up with channel-specific code scattered through the business logic because "handle this from Slack" and "handle this from Discord" felt similar but weren't quite the same. Eve separates that concern explicitly.

---

## Getting started

```bash
npx eve@latest init my-agent
cd my-agent
npm run dev
```

`npm run dev` opens a TUI that shows agent actions in real time as you interact with it. You can see tool calls, model responses, and approval prompts as they happen. It's a better feedback loop than reading logs.

Deploy is the same as any Vercel project:

```bash
vercel deploy
```

Agents deploy as standard Vercel projects. You get preview deployments per PR, instant rollback, and OpenTelemetry traces in the platform.

---

## The demo repo

I put together a minimal research assistant agent at [github.com/mager/eve-demo](https://github.com/mager/eve-demo) to get hands-on with the framework. It's a single tool — `fetch_url.ts` — that fetches a URL, strips the HTML, and returns the first 4000 characters of text:

```typescript
import { defineTool } from "eve/tools";
import { z } from "zod";

export default defineTool({
  description: "Fetch the text content of a URL for research.",
  inputSchema: z.object({
    url: z.string().url().describe("The URL to fetch"),
  }),
  async execute({ url }) {
    const res = await fetch(url, { headers: { "User-Agent": "eve-demo/1.0" } });
    if (!res.ok) return { error: `HTTP ${res.status}` };
    const html = await res.text();
    const text = html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
    return { content: text.slice(0, 4000) };
  },
});
```

That's the whole tool. The agent's `instructions.md` tells it to be a concise research assistant. Two files, a model config, and it works.

Setup:

```bash
git clone https://github.com/mager/eve-demo
cd eve-demo
npm install
cp .env.example .env
# add ANTHROPIC_API_KEY
npm run dev
```

---

## What Vercel actually built on top of this

The framework is new, but the production data is real. Vercel runs 100+ agents on Eve internally:

- **d0** — data analyst in Slack, answering 30,000+ questions per month
- **Lead Agent** — autonomous SDR running at 32x ROI ($5k/year cost against $160k return)
- **Athena** — a RevOps tool built by non-engineers in six weeks
- **Vertex** — support agent that resolves 92% of tickets independently

The Athena point is the one I'd flag for anyone skeptical about the skills pattern. Non-engineers built a production RevOps tool in six weeks by encoding their business logic in markdown files. The TypeScript stayed with engineers; the domain knowledge went to the people who hold it. That's a real division of labor, not a marketing claim.

Agent-triggered deployments on Vercel went from 3% to 29% of all deployments in a year. Eve is the bet that the rest of the industry follows the same curve.

---

Eve is a public preview as of yesterday. The docs are at [eve.dev/docs](https://eve.dev/docs) and the source is at [github.com/vercel/eve](https://github.com/vercel/eve). Worth watching — the filesystem-first approach is the right call, and the production track record gives it more weight than most framework launches get on day one.
