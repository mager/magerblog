---
title: "Eve: define your agent, deploy it, use it from anywhere"
description: "Define your agent in a directory, deploy it to Vercel's cloud with one command, and access it from anywhere. Months in, Eve has grown a platform around that model — capability registry, sandbox, subagents, agent-to-agent calls, MCP, evals — and my agent is still live, driven remotely from the eve TUI."
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

That was the June version of this post. Two months later the shape still holds, and the framework has grown a platform around it: a capability registry, an isolated sandbox, subagents, agent-to-agent calls, an MCP surface, and evals. This refresh is the delta.

## The real thing: my agent, deployed

I built magerbot — an Eve agent in its own repo ([github.com/mager/magerbot](https://github.com/mager/magerbot)). `agent.ts` picks the model, `instructions.md` is its identity, and there are tools, MCP connections, and a web chat channel. The model is `zai/glm-5.2` — which is also what `eve init` scaffolds by default now, a sign of where the defaults landed:

```typescript
import { defineAgent } from "eve";

export default defineAgent({
  model: "zai/glm-5.2",
});
```

The deploy is one command, same as any Vercel project (the eve CLI now also has `eve deploy`, which links the project first if needed):

```bash
vercel deploy --prod
→ Production aliased https://my-agent.vercel.app
```

And here's the part that made it click. From anywhere with the eve CLI and a Vercel session:

```bash
npx eve dev https://my-agent.vercel.app
→ remote mode targeting my-agent.vercel.app
→ eve my-agent.vercel.app, model zai/glm-5.2
```

`eve dev <url>` doesn't boot a local server — it connects the TUI to the agent already running in Vercel's cloud, over HTTPS. The agent I defined in a directory is the same agent answering from the production URL. No local process, no tunnel, no "it works on my machine." Define, deploy, access — all three verbs, in that order, and every step worked.

One honest note: production browser auth is still the scaffold's placeholder. The deployed agent authenticates through Vercel OIDC — which is how `eve dev` reaches it from my session — but it's not open to arbitrary browsers yet. That's the next item on the list, not a gap in the model — the agent lives in the cloud, and I drive it from anywhere.

## The filesystem is the config

The central design choice behind "define" is that an agent is a directory. Eve discovers everything by convention — no registration, no YAML, no call to `registerAgent()`.

```
agent/
  agent.ts           # Model config
  instructions.md    # System prompt
  tools/             # Typed functions the model can call
  skills/            # Markdown knowledge files loaded on demand
  subagents/         # Delegated specialist agents
  connections/       # MCP / OpenAPI services the agent calls
  channels/          # Slack, Discord, Telegram, GitHub, etc.
  schedules/         # Cron jobs
  sandbox/           # Isolated bash workspace, seeded files
  hooks/             # Lifecycle event subscribers
  instrumentation.ts # OpenTelemetry config
evals/               # Scored checks, run with `eve eval`
```

The smallest runnable agent is two files. `agent.ts` picks the model:

```typescript
import { defineAgent } from "eve";
export default defineAgent({
  model: "anthropic/claude-opus-4.8",
});
```

And `instructions.md` is the system prompt in plain markdown. That's it. You can hand that to a non-engineer and they can understand and edit the agent's behavior without touching TypeScript.

The rest of the structure scales in as you need it. Want the agent to query your database? Drop a file in `tools/`. Want it to post to Slack every Monday? Drop a file in `schedules/`. The framework infers intent from the file's location and wires it up automatically. This is the whole "define" half of the model: you're writing a directory, not configuring a platform.

Since June the directory has grown the slots a real product needs — `connections/` for the services the agent calls, `sandbox/` for a walled-off workspace, `hooks/` and `instrumentation.ts` for lifecycle and telemetry, `evals/` for tests. Each one is still just a path with a convention attached.

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

Add a file to `channels/` to connect the same agent to a new surface — Slack, Discord, Teams, Telegram, Twilio, GitHub, Linear, and more. The agent logic doesn't change. The channel file handles the connector.

This is worth naming: most agent projects end up with channel-specific code scattered through the business logic because "handle this from Slack" and "handle this from Discord" felt similar but weren't quite the same. Eve separates that concern explicitly. And as of the last couple of releases, you usually don't hand-write the channel file at all — that's what the registry is for.

## The registry: install capabilities like npm packages

The biggest practical change since June is an integration registry. `eve add` installs capabilities the way you install packages — the framework writes the files into the right directories and installs the SDKs for you.

```bash
eve registry search browser                    # search the catalog
eve registry view extension/agent-browser      # inspect before installing
eve add channel/slack                          # install a Slack channel
eve add linear                                 # Linear Channel, Linear MCP, or both
eve add @skills/vercel-labs/agent-skills/vercel-react-best-practices  # from skills.sh
```

Third-party registries plug in the same way — `eve registry add @acme=https://registry.acme.com/r/{name}.json` — and the whole thing speaks the standard shadcn registry format, so hosting your own is publishing static JSON over HTTP.

The part I like: this doesn't change the "filesystem is the config" model, it completes it. The registry is a delivery mechanism for files. `eve add channel/slack` drops a `channels/slack.ts` in the right place; `eve add connection/linear` writes `connections/linear.ts` and installs the SDK it needs. The agent still is its directory — it just got a package manager.

There's a `--non-interactive` mode built for coding agents (`eve add channel/slack --non-interactive --yes`), so an agent can install its own capabilities without a human at a prompt. The two MCP connections in magerbot — GitHub and gbrain — are exactly the kind of thing that's now installable rather than hand-authored.

## Subagents: the directory is a delegation tool

A declared subagent is a directory under `agent/subagents/` with the same shape as the root, but scoped to one job:

```typescript
// agent/subagents/researcher/agent.ts
import { defineAgent } from "eve";

export default defineAgent({
  description: "Investigate ambiguous questions before the parent agent responds.",
  model: "anthropic/claude-opus-4.8",
});
```

The parent agent sees it as a tool named `researcher`. It inherits nothing from the root — its tools, connections, skills, sandbox, and nested subagents are all its own, authored under its directory. That isolation is the point: the specialist gets a narrower tool surface and its own context, so delegation is also a safety boundary.

The root's built-in `agent` tool delegates to a fresh copy of the root agent, and parallel calls in one response run concurrently. For anything bigger than "ask one specialist," the experimental Workflow tool lets the model orchestrate its own fan-out in JavaScript — call `tools.analyst(...)` per metric in parallel, merge the results, all as one durable step.

## The sandbox: every agent gets a walled-off bash

Every Eve agent has exactly one sandbox: an isolated filesystem rooted at `/workspace` where it can run shell commands and read and write files without ever touching the app runtime. The built-in `bash`, `read_file`, `write_file`, `glob`, and `grep` tools all target it, and authored tools get a handle through `ctx.getSandbox()`:

```typescript
import { defineTool } from "eve/tools";
import { z } from "zod";

export default defineTool({
  description: "Run a Python analysis script and return its output.",
  inputSchema: z.object({ script: z.string() }),
  async execute({ script }, ctx) {
    const sandbox = await ctx.getSandbox();
    await sandbox.writeTextFile({ path: "analysis/run.py", content: script });
    const result = await sandbox.run({ command: "python analysis/run.py" });
    return { stdout: result.stdout };
  },
});
```

Backends swap between local and Vercel's hosted sandbox depending on where the agent runs, and `agent/sandbox/workspace/` seeds files into `/workspace` at session start. This is the security story the framework needed: an agent that can execute code is an agent with a blast radius, and `/workspace` is where that radius is contained. (My magerbot `instructions.md` mentions "the sandbox" as a capability — it's a real thing now, not a turn of phrase.)

## Your agent is an MCP server

Connections let your agent call MCP servers. The MCP channel is the inversion: it publishes your agent as an MCP server, so any MCP client — Claude Code, another eve agent, anything that speaks MCP — can delegate durable work to it.

```typescript
// agent/channels/mcp.ts
import { localDev, vercelOidc } from "eve/channels/auth";
import { mcpChannel } from "eve/channels/mcp";

export default mcpChannel({
  auth: [vercelOidc(), localDev()],
});
```

The default route is `/eve/v1/mcp`, and clients get four tools: `agent_start` (start durable work, get an invocation ID back immediately), `agent_get` (poll its state), `agent_update` (answer pending human-input requests), and `agent_cancel`. The state machine underneath is the same durable sessions — `working`, `input_required`, `authorization_required`, `completed`, `failed`, `cancelled` — so a client that calls `agent_start` can walk away and come back later.

This is the programmable-boundary idea from [the AI Gateway post](/blog/2026-08-16-ai-gateway-eve-stack/), now with a standard protocol on it. Your deployed agent is a service that other agents and agent tools can call.

## Remote agents: deployed agents call deployed agents

The same "define → deploy → access" loop now applies to agents calling agents. A `defineRemoteAgent` under `subagents/` calls a separately deployed eve agent as if it were a local subagent:

```typescript
// agent/subagents/site-ops.ts
import { defineRemoteAgent } from "eve";
import { vercelOidc } from "eve/agents/auth";

export default defineRemoteAgent({
  url: "https://site-ops.example.com",
  description: "Executes site operations.",
  auth: vercelOidc(),       // deployment-to-deployment trust
  forwardPrincipal: true,   // carry the calling user's identity
});
```

The parent starts a task-mode session on the remote's `/eve/v1/session`, parks durably, and resumes when the remote posts a terminal callback. Outbound auth is `vercelOidc()` — deployment-to-deployment trust without shared secrets — and `forwardPrincipal` carries the end user's identity across the hop so the remote can mint its own per-user credentials.

Agents are no longer leaf nodes. A deployed agent can have its own deployed specialists, and calling one is the same tool call as a local subagent.

## Evals: your agent is now testable

The missing piece for treating agents as software: repeatable scored checks.

```typescript
// evals/weather/brooklyn-forecast.eval.ts
import { defineEval } from "eve/evals";
import { includes } from "eve/evals/expect";

export default defineEval({
  description: "Basic message and tool-usage coverage for the weather agent.",
  async test(t) {
    await t.send("What is the weather in Brooklyn?");
    t.succeeded();
    t.calledTool("get_weather");
    t.check(t.reply, includes("Sunny"));
  },
});
```

`eve eval` boots — or targets — a real agent server, drives sessions through the same HTTP surface users hit, and grades the result: assert that the right tool ran, that the reply contains the right text, or hand the transcript to a judge model. An eval that passes means the agent booted, accepted a request, and behaved. Change a prompt and you can see the regression instead of feeling it later.

## ACP: drive a deployed agent from an ACP client

One more seam that matters to me specifically. `eve acp <url>` serves a local or deployed eve agent as a stable ACP v1 agent over stdio:

```bash
eve acp https://my-agent.vercel.app
```

My phone harness lives in the ACP world — buzz-acp drives OpenCode over the Agent Client Protocol ([write-up](/blog/2026-08-08-opencode-go-buzz-harness/)). This is the same protocol family, and it means a deployed eve agent is drivable from any ACP client without a custom bridge. I'm not claiming it's a drop-in replacement for the Buzz path — different protocol, different plumbing — but the seam exists, and it's the kind of thing that turns "one agent, many clients" into a protocol question instead of a rewrite.

## Getting started: the three verbs

```bash
npx eve@latest init my-agent              # define — a directory in a repo
eve add channel/slack                     # install capabilities from the registry
eve set --model openai/gpt-5.6-sol        # swap models from the CLI
vercel deploy --prod                       # deploy — production URL
npx eve dev https://my-agent.vercel.app    # access — from anywhere
```

Before you deploy, `npm run dev` opens a local TUI that shows agent actions in real time as you interact with it — tool calls, model responses, and approval prompts as they happen. It's a better feedback loop than reading logs. Once you deploy, `npx eve dev <url>` connects that same TUI to the remote agent instead of booting a local server.

`eve set --model` is a small thing that matters: changing an agent's model is a CLI flag instead of a source edit, so testing a different model on a live agent is cheap.

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

Define, deploy, access. I've now run the whole loop end to end with a real agent: defined magerbot in a directory, deployed it with one command, and driven it over HTTPS from the eve TUI targeting the production URL. The framework's design choices all serve that loop — the filesystem makes defining cheap, standard Vercel deploys make shipping boring, and the HTTP-facing agent makes access a URL instead of a process on my machine.

What the last two months added is the platform around the loop: a registry so capabilities install like packages, a sandbox so execution is contained, subagents and remote agents so work decomposes, MCP so the agent is programmable by anything that speaks it, and evals so it's testable. None of that changed the model — it all hangs off the same directory convention. That's the tell: the filesystem-first bet held up, and the growth happened inside it.

The docs are at [eve.dev/docs](https://eve.dev/docs) and the source is at [github.com/vercel/eve](https://github.com/vercel/eve). Worth watching — and now I've seen it hold up on a deployment I actually run, across two months of the framework growing underneath it.