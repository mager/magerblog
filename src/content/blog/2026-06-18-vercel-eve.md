---
title: "Eve: define your agent, deploy it, use it from anywhere"
description: "With Eve you define your agent in a directory, deploy it to Vercel's cloud with one command, and access it from anywhere. Here's the mental model that finally clicked — and my agent, live at magerbot-eve.vercel.app, driven remotely from the eve TUI."
pubDate: 2026-06-18
updatedDate: 2026-08-23
category: tech
keyword: "Eve"
draft: false
tags: ["tech", "ai", "vercel", "agents", "typescript"]
---

It finally clicks: with [Eve](https://github.com/vercel/eve) you define your own agent, deploy it to Vercel's cloud, and access that agent from anywhere.

Three verbs, and that's the whole framework. **Define** — the agent is a directory in a repo; the filesystem is the config. **Deploy** — `vercel deploy`, same as any Vercel project, and the agent gets a production URL. **Access** — that URL is an agent you can talk to: from the eve TUI over HTTPS, from a web chat, from any client that can speak HTTP.

I've been skeptical of the "Next.js for agents" framing since Vercel shipped Eve at Ship London in June — most of those end up being thin wrappers that add opinions without removing decisions. But once I'd built an agent and actually deployed it, the shape of the thing became obvious. This is the model. Everything else is detail.

## The real thing: my agent, deployed

I built magerbot — an Eve agent in its own repo ([github.com/mager/magerbot](https://github.com/mager/magerbot)). `agent.ts` picks the model, `instructions.md` is its identity, and there are tools, MCP connections, and a web chat channel. The model is `zai/glm-5.2`:

```typescript
import { defineAgent } from "eve";

export default defineAgent({
  model: "zai/glm-5.2",
});
```

The deploy is one command, same as any Vercel project:

```bash
vercel deploy --prod
→ Production aliased https://magerbot-eve.vercel.app
```

And here's the part that made it click. From anywhere with the eve CLI and a Vercel session:

```bash
npx eve dev https://magerbot-eve.vercel.app
→ remote mode targeting magerbot-eve.vercel.app
→ eve magerbot-eve.vercel.app, model zai/glm-5.2
```

`eve dev <url>` doesn't boot a local server — it connects the TUI to the agent already running in Vercel's cloud, over HTTPS. The agent I defined in a directory is the same agent answering from `magerbot-eve.vercel.app`. No local process, no tunnel, no "it works on my machine." Define, deploy, access — all three verbs, in that order, and every step worked.

One honest note: production browser auth is still the scaffold's placeholder. The deployed agent authenticates through Vercel OIDC — which is how `eve dev` reaches it from my session — but it's not open to arbitrary browsers yet. That's the next item on the list, not a gap in the model — the agent lives in the cloud, and I drive it from anywhere.

## The filesystem is the config

The central design choice behind "define" is that an agent is a directory. Eve discovers everything by convention — no registration, no YAML, no call to `registerAgent()`.

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

The rest of the structure scales in as you need it. Want the agent to query your database? Drop a file in `tools/`. Want it to post to Slack every Monday? Drop a file in `schedules/`. The framework infers intent from the file's location and wires it up automatically. This is the whole "define" half of the model: you're writing a directory, not configuring a platform.

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

## Durable execution by default

Agents crash. Deploys interrupt running sessions. The normal response is to either accept the loss or build your own checkpointing. Eve handles it at the framework level: sessions checkpoint after each step and resume from where they left off.

This is one of those features that's hard to appreciate until you've debugged a long-running agent that failed halfway through and you have no idea which steps completed. With durable execution, you get replay. Without it, you get a process that's somewhere between "done" and "not started." And once your agent is deployed — running in the cloud instead of a terminal you're watching — this stops being a nicety and becomes the difference between an agent you trust unattended and one you don't.

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

Drop this file in `schedules/` and the cron is registered. The agent wakes up at 9am Monday, sends the message, and waits for the response. You didn't configure any cron infrastructure — the schedule deploys with the agent and runs against the deployed process.

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

## Multi-channel out of the box

Add a file to `channels/` to connect the same agent to a new surface — Slack, Discord, Teams, Telegram, Twilio, GitHub, Linear. The agent logic doesn't change. The channel file handles the connector.

This is worth naming: most agent projects end up with channel-specific code scattered through the business logic because "handle this from Slack" and "handle this from Discord" felt similar but weren't quite the same. Eve separates that concern explicitly.

## Getting started: the three verbs

```bash
npx eve@latest init my-agent            # define — a directory in a repo
cd my-agent
vercel deploy --prod                     # deploy — production URL
npx eve dev https://my-agent.vercel.app  # access — from anywhere
```

Before you deploy, `npm run dev` opens a local TUI that shows agent actions in real time as you interact with it — tool calls, model responses, and approval prompts as they happen. It's a better feedback loop than reading logs. Once you deploy, `npx eve dev <url>` connects that same TUI to the remote agent instead of booting a local server.

Deploy is the same as any Vercel project. Agents deploy as standard Vercel projects — preview deployments per PR, instant rollback, OpenTelemetry traces in the platform.

## The demo repo

I put together a minimal research assistant agent at [github.com/mager/eve-demo](https://github.com/mager/eve-demo) to get hands-on with the framework before the real one. It's a single tool — `fetch_url.ts` — that fetches a URL, strips the HTML, and returns the first 4000 characters of text:

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

## What Vercel actually built on top of this

The framework is new, but the production data is real. Vercel runs 100+ agents on Eve internally:

- **d0** — data analyst in Slack, answering 30,000+ questions per month
- **Lead Agent** — autonomous SDR running at 32x ROI ($5k/year cost against $160k return)
- **Athena** — a RevOps tool built by non-engineers in six weeks
- **Vertex** — support agent that resolves 92% of tickets independently

The Athena point is the one I'd flag for anyone skeptical about the skills pattern. Non-engineers built a production RevOps tool in six weeks by encoding their business logic in markdown files. The TypeScript stayed with engineers; the domain knowledge went to the people who hold it. That's a real division of labor, not a marketing claim.

Agent-triggered deployments on Vercel went from 3% to 29% of all deployments in a year. Eve is the bet that the rest of the industry follows the same curve.

## Where the model leads

Define, deploy, access. I've now run the whole loop end to end with a real agent: defined magerbot in a directory, deployed it with one command, and driven it over HTTPS from the eve TUI targeting `magerbot-eve.vercel.app`. The framework's design choices all serve that loop — the filesystem makes defining cheap, standard Vercel deploys make shipping boring, and the HTTP-facing agent makes access a URL instead of a process on my machine.

The docs are at [eve.dev/docs](https://eve.dev/docs) and the source is at [github.com/vercel/eve](https://github.com/vercel/eve). Worth watching — the filesystem-first approach is the right call, and now I've seen it hold up on a deployment I actually run.