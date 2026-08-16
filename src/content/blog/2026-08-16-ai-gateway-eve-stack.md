---
title: "AI Gateway: the end of the single-provider AI subscription"
description: "I'm moving off single-provider AI subscriptions toward a stack of parts — Eve for agents, Vercel AI Gateway for routing, spend control, and no-markup provider pricing, OpenCode Go for the cheap default — and the enterprise version of that stack is the real product."
pubDate: 2026-08-16
category: tech
keyword: "AI Gateway"
draft: true
tags: [ai, vercel, eve, aigateway, opencode, agents, enterprise, tooling]
---

I've run my AI life on subscriptions for a while now. One vendor, one model family, one bill, and — the part that starts to matter — one opinion about what an agent is and how it should behave. The [OpenCode Go + Buzz migration](/blog/2026-08-08-opencode-go-buzz-harness/) was the first crack in that: the harness stopped caring which model it wore, and the $10/month flat plan turned the always-on agent from a line item into a rounding error.

The second crack is the cost story on the hosting side. I've been on Vercel's free tier for years — it's how mager.co and a few side projects have run since the beginning. That arrangement is starting to bend. Free limits get hit, and I've already made one round of cuts: I shut down two side projects I was fond of — BeatBrain, the music-discovery app, and [Kotsu](/blog/2026-03-21-kotsu-the-knack-for-japanese/), the Japanese-learning site — to keep mager.co inside the tier. So I'm now at the point where I either start paying Vercel or keep trimming — and if I'm going to pay, I want to know precisely what the money buys.

The answer I've converged on is not "a bigger subscription." It's a stack: [Eve](/blog/2026-06-18-vercel-eve/) for the agents themselves, Vercel [AI Gateway](https://vercel.com/docs/ai-gateway) as the routing and spend-control plane, and OpenCode Go staying on as the cheap default brain for the always-on harness. Three pieces that each do one job, none of them locked to a single model family.

---

## Why the subscription stops scaling

Subscriptions buy convenience, and that's a real product. One login, one model that's always good enough, one dashboard. The cost is the part you don't see until you have a few of them: every subscription is a bet that one vendor's roadmap is your roadmap. Their agent conventions become your agent conventions. Their pricing becomes your pricing. Their deprecation calendar becomes your calendar.

For a personal setup that's tolerable. For a team it's the thing that should keep you up at night, and I'll get to that.

The other thing subscriptions hide is the unit economics. A flat monthly fee decouples cost from usage until the day it doesn't: you either pay for capacity you don't use, or you blow past the included quota and the real pricing shows up anyway. What I want instead is metered, per-token cost with a control plane on top — the same way I'd rather pay a storage bill than a hosting subscription that claims to be unlimited.

---

## The stack

Three pieces, each owned by a different project, each doing one job:

**Eve** — Vercel's open-source agent framework ([previous post](/blog/2026-06-18-vercel-eve/)). The agent is a directory; the filesystem is the config; sessions checkpoint so long-running work survives crashes; deploy is `vercel deploy`. Eve is what I'd reach for when an agent is a real product — something that lives in a repo, has a schedule, a channel, an approval flow — rather than an interactive session in a terminal.

**AI Gateway** — the control plane. One key, hundreds of models across Anthropic, OpenAI, Google, xAI and others, behind a unified API (OpenAI Chat Completions, the Responses API, Anthropic Messages, or the AI SDK). You route per request, get per-request cost and latency in the dashboard, set fallbacks, bring your own keys, and — the pricing fact that matters — **there is no markup on tokens**. You pay the provider's list price, pay-as-you-go, funded by AI Gateway credits. It is not unlimited AI. It is metered access to other people's models at their list prices, with a billing and routing layer in front.

**OpenCode Go** — the $10/month flat plan for open models that runs my always-on harness ([migration post](/blog/2026-08-08-opencode-go-buzz-harness/)). It stays. It's a distinct and genuinely good option: predictable cost, capable models, no per-token anxiety for an agent that answers random questions from my phone at six-second round trips. The stack isn't "one gateway to rule them all" — it's "use the right tool per job," and for the chatty always-on default, OpenCode Go is the right tool.

---

## The honest constraints

Before the enterprise section, the things that keep this honest:

- **AI Gateway is not free AI, and it's not a subscription in disguise.** It's pay-as-you-go at provider list prices with zero markup. The free tier exists but covers a subset of models with rate limits — exceed them and you get `429`s, and buying credits moves you to the paid tier. If your mental model is "Vercel now bundles AI into my plan," correct that now.

- **Eve and Buzz are not a drop-in pair.** I'd love to point my phone harness at an Eve agent directly. That doesn't work today — ACP compatibility constraints mean the bridge can't drive an Eve agent the way it drives OpenCode. The path that *does* work is the one I already run: **Buzz → OpenCode → AI Gateway** ([Buzz explainer](/blog/2026-07-24-buzz-explainer/)), and it's a documented one. `vercel ai-gateway coding-agents setup --agent opencode` provisions a gateway key and adds the `vercel` provider to `~/.config/opencode/opencode.json`, keeping the key in the macOS Keychain instead of plaintext config. Then `/connect` inside OpenCode, pick models with `/models`, and requests route through the gateway. The current state of that integration — what lines up and what doesn't — gets its own section below.

- **BYOK costs a little context.** Bring-your-own-key is supported with no markup, but it's a paid-tier feature: you need credits on the account. And when your own credentials fail, the gateway retries with its own credentials and charges that fallback usage to your credit balance. Reasonable, but worth knowing before you wire an enterprise contract into it.

---

## How it fits together for me

The always-on harness on the Mac mini doesn't change much. OpenCode Go stays the default — it's the right economics for an agent that's idle most of the time. AI Gateway enters at the edges: when a job genuinely wants a specific model (a Claude for a hard reasoning task, a Gemini for a multimodal one), when I want fallback so a single provider outage doesn't stall work, and when I want the dashboard's per-request cost numbers instead of a monthly guess.

Eve is the layer for agents that deserve to be products — scheduled, channel-connected, deployable. Those get their own repos, their own Vercel projects, and the gateway in front of their model calls.

```
[Buzz on phone] → [Buzz relay] → [buzz-acp]
                                       │  ACP
                                       ▼
                              [OpenCode]  ← OpenCode Go default
                                       │
                    AI Gateway when the job calls for it
                                       ▼
                     [Anthropic / OpenAI / Google / xAI / ...]

[Eve agent repo] → vercel deploy → [Eve agent on Vercel] → AI Gateway → models
```

The config that makes routing concrete, straight from the gateway's OpenCode integration — this goes in `opencode.json`:

```json
{
  "$schema": "https://opencode.ai/config.json",
  "provider": {
    "vercel": {
      "models": {
        "anthropic/claude-sonnet-5": {
          "options": {
            "order": ["anthropic", "vertex"]
          }
        }
      }
    }
  }
}
```

Try Anthropic first; fall back to the same model via Vertex if Anthropic is slow or down. That's the whole routing story at the coding-agent level: a preference order, per model, and the gateway handles the rest — including retries, timeouts, and billing.

---

## The programmable boundary: Eve's streaming HTTP API

This is the piece I hadn't built anything against when I started this post — then I went and built exactly that, and the shape held up. Details in the next section. First, the pattern, written for people who haven't seen it before, because I hadn't.

Eve exposes every running agent as one ID-addressed HTTP contract, documented as [Sessions, Runs & Streaming](https://eve.dev/docs/concepts/sessions-runs-and-streaming). Three routes cover almost everything:

1. **Start a session** — `POST /eve/v1/session` with your first message. You get back a durable `sessionId`, in the JSON body and the `x-eve-session-id` header.
2. **Subscribe to the stream** — `GET /eve/v1/session/<sessionId>/stream`. An open HTTP connection that pushes newline-delimited JSON (NDJSON), one event per line, as the agent works.
3. **Send follow-ups** — `POST /eve/v1/session/<sessionId>` with `{"message": "..."}`. The session keeps its history and state; you're talking to the same agent, not spinning up a fresh one.

In curl, straight from the docs:

```bash
# 1. create a session
curl -X POST http://127.0.0.1:2000/eve/v1/session \
  -H 'content-type: application/json' \
  -d '{"message":"Summarize the latest forecast."}'
# → { "sessionId": "<sessionId>" }

# 2. stream events as they happen
curl http://127.0.0.1:2000/eve/v1/session/<sessionId>/stream

# 3. follow up once the session is waiting
curl -X POST http://127.0.0.1:2000/eve/v1/session/<sessionId> \
  -H 'content-type: application/json' \
  -d '{"message":"Now send the short version."}'
```

**Why this is different from a one-shot JSON request.** The LLM API pattern I know is: send a prompt, wait, get a complete response. An agent doesn't work that way — it reasons, calls tools, waits for approvals, and produces output over minutes, not milliseconds. The stream is how you see all of it live. The event types in the docs are the agent's internal life, surfaced: `reasoning.appended` as the model thinks, `message.appended` as assistant text arrives, `actions.requested` when a tool call is proposed, `input.requested` when the run pauses for human approval, `turn.completed` when a turn finishes, `session.waiting` when it parks for the next message. Every event is `{ type, data, meta }`, and `meta.id` is a stable identifier you can key on — which matters the moment you reconnect, because the stream is durable and replayable from a `startIndex` cursor.

**Why this matters for products.** Once the agent is reachable over HTTP, the frontend becomes your problem — in the good sense. A web UI can render text deltas as they stream in. A mobile client can show "thinking / calling a tool / waiting for your approval" instead of a spinner. An enterprise portal or support console can embed an agent pane without caring what the agent is built on, because the boundary is just HTTP. Sessions themselves are durable — 30 days by default, configurable in `agent.ts` — so a long-running piece of work can outlive any single connection. And when the agent needs a human, `input.requested` carries the approval prompt; you answer with structured responses keyed by request ID, which is how a portal implements a review step rather than a free-for-all.

**The part that is not magic.** This is a transport, not a security boundary. The same HTTP contract that makes an agent embeddable makes it reachable, so production still needs the full API checklist: authentication and authorization (Eve's default auth chain is Vercel OIDC plus a local-development bypass, and a deployed target requires a valid OIDC bearer — see [auth & route protection](https://eve.dev/docs/guides/auth-and-route-protection)), rate limits, tenant isolation so one customer's session can't touch another's, audit logs of who sent what and when, and real scrutiny of the tools the agent can call — a streaming agent with tool access is a bigger attack surface than a chatbot without it. The stream makes the agent programmable; the security work stays yours.

**Where this sits in the stack.** The thesis of this post, made concrete:

- **AI Gateway** handles model flexibility and billing — swap models, control spend, no markup.
- **Eve** exposes the agent — durable sessions, tools, approvals, deployed as a normal Vercel project.
- **Streaming HTTP** is the programmable UI and channel boundary — any frontend, portal, or console that can speak HTTP can host the agent.
- **Buzz stays a separate channel layer** — the phone-to-harness path runs over my own Nostr relay and ACP ([Buzz explainer](/blog/2026-07-24-buzz-explainer/)), not through this API.

None of those layers cares what the others are made of. That's the point.

---

## What I actually built: the magerbot Eve agent

The section above was written from the docs. Then I built against it for real, and it works.

The agent lives at `~/magerbot`, scaffolded from `eve init` and packaged as `magerbot`. It's my always-on assistant: it knows the web properties — magerblog, beatbrain, prxps, loooom, kotsu — their domains and repos, and it does research. The build is functionally complete and verified end-to-end through exactly the HTTP flow from the last section: create a session, stream the NDJSON lifecycle, watch it call a tool, follow up. Typecheck passes.

The pieces that are actually in there:

- **`instructions.md`** — the agent's identity, replacing the scaffold placeholder.
- **`web_properties.ts`** — the first typed tool; resolves the five properties to id, name, domain, and repo.
- **Two MCP connections** — GitHub through a remote MCP server (`api.githubcopilot.com/mcp`) and gbrain through a local HTTP MCP (`localhost:3131/mcp`). Secrets live in a gitignored `.env`; nothing credential-shaped touches the repo.
- **The Web Chat scaffold** — a Next.js channel (`app/`, `components/`, wired through `withEve` in `next.config.ts`), so there's a browser UI to point at the agent.

Two details cost real time, so I'll name them.

**gbrain runs over HTTP MCP because Eve doesn't use the stdio transport here.** Eve's [connections](https://eve.dev/docs/connections) support HTTP/SSE transport; the stdio `gbrain serve` isn't usable by the agent. So gbrain serves over HTTP on port 3131, and the connection's `getToken` mints an OAuth `client_credentials` token per call, so the secret is never at rest in agent code. There's flakiness — the PGLite WASM init on this machine occasionally fails on first launch — but retrying works, and the health endpoint reports `200` when it's up.

**The model is `zai/glm-5.2` routed through AI Gateway.** The gateway key comes from the environment (`/eve/v1/info` reports `connected: true` only when it's present). OpenCode Go stays exactly where it was — the distinct, cheap default for the always-on harness and everything else. Eve gets its own model; the stack doesn't demand that they agree.

The verification run, concretely: `POST /eve/v1/session` returned a session id; `GET /eve/v1/session/:id/stream` produced the full documented lifecycle — `session.started`, `turn.started`, reasoning, `actions.requested` with the `web_properties` tool call, `action.result`, `message.appended` / `message.completed`, `turn.completed`, `session.waiting` — and the follow-up POST streamed a correct reply. That's the whole loop from the docs, working on the first real agent.

One number worth writing down. The setup work itself ran on DeepSeek V4 Flash through OpenCode Go — the flat-plan default, so the chatty part of the build never touched a per-token meter. The total AI Gateway usage for setting the whole thing up came to about $0.07. To be clear about what that is: observed setup spend, not a promise that all future agent usage costs seven cents — a busier agent will burn more. The point is that both meters are legible. The flat plan carries the heavy interactive work; the gateway bills per token at provider list price, no markup. OpenCode Go stays the preferred default for the always-on harness, and the gateway is there for the calls that deserve a meter.

---

## Buzz stays the channel layer

Buzz stays the communication layer, because I like it: my own Nostr relay, my keys, my logs ([Buzz explainer](/blog/2026-07-24-buzz-explainer/)), and it's what the always-on harness answers through. None of that changes.

What's honest about the integration status: the current path — **Buzz → buzz-acp → OpenCode → AI Gateway** — remains viable and is what runs today. Direct **Buzz → Eve** is not drop-in, and I don't want to imply otherwise. Two concrete reasons: the ACP behavior and protocol the current Buzz bridge speaks, and Eve's [ACP](https://eve.dev/docs/protocols/acp) limitations, don't line up; and Eve doesn't accept client-injected MCP servers, which is how the harness attaches gbrain to OpenCode today. So the near-term setup is deliberate, not accidental:

- **Buzz stays on OpenCode Go / AI Gateway** — the phone-to-harness path keeps working exactly as it does now.
- **Eve runs as the programmable HTTP / Web Chat agent** — reachable over the streaming API and the Web Chat scaffold, not over Buzz.
- **If I want one unified Buzz-driven Eve agent**, that's a project: a deliberate adapter, or a [custom Eve channel](https://eve.dev/docs/channels/custom) that speaks the bridge's protocol. An explicit seam, not a hack.

---

## What remains

Honest checklist, because "functionally complete" and "done" are different words:

- **The agent repo is committed and pushed.** The magerbot project lives in the `hearth` repo on GitHub, the working tree is clean, and `.env` stays out (gitignored). What hasn't happened is any kind of release — the rest of this list is the release checklist.
- **Replace the placeholder production auth before any public deployment.** `agent/channels/eve.ts` still ships the scaffold's `placeholderAuth()`, which returns a structured 401 in production. A real `AuthFn` — [auth & route protection](https://eve.dev/docs/guides/auth-and-route-protection) — has to go in first.
- **Decide model routing.** `zai/glm-5.2` is Eve's default through the gateway; OpenCode Go stays the default for the harness. Whether Eve's heavier jobs deserve a different default is an open question, and it's the kind of question the gateway makes cheap to answer.
- **Keep the gbrain HTTP service supervised.** Right now it's `nohup` — fine for a verification afternoon, not for production. It needs the same watchdog treatment the harness got.
- **Configure AI Gateway budgets.** The spend-control layer only pays off if the caps are actually set.
- **Choose whether Buzz needs an adapter or stays on OpenCode.** The near-term split above works; "one agent for everything" is a decision, not a default.

Every item on that list is the same item a team would close out before an agent reaches production. Which is the point of the next section.

---

## The enterprise section: the real product

Everything above is me being a small operator. The reason I think this pattern is the right answer — and the reason I'd argue for it inside a company — is that every feature I want for myself is the same feature a platform team wants for a hundred engineers, just with the dials turned up. AI Gateway was clearly built with that in mind, and it shows in the feature list:

**Centralized routing.** One endpoint, one key, hundreds of models. Per-request provider options control which providers handle a call and in what order — `order: ['bedrock', 'anthropic']`, `only: ['bedrock', 'anthropic']`, or `sort: 'cost'` / `'ttft'` / `'tps'` to rank providers by the metric you care about. You stop distributing provider credentials to every engineer and every CI runner; you hand out one key and express policy in the gateway.

**Spend controls and budgets.** This is the one that makes finance happy. AI Gateway runs on a credit balance with auto top-up; the Generations view shows every request with cost, latency, and token usage; and Custom Reporting lets you attach user IDs and quota entity IDs to requests, then query spend grouped by user, model, tag, or provider. That's per-user budgets and quotas without building the metering yourself.

**Observability.** Per-request cost and latency in the dashboard, searchable and exportable logs, and Trace Drains that forward OpenTelemetry traces of every gateway request to your own observability stack. Your existing monitoring workflow gets AI spend as first-class telemetry instead of a separate spreadsheet.

**Provider fallback.** Automatic retries across providers when one fails, model-level fallbacks when your primary model is unavailable, and provider timeouts for fast failover. Your team's requests survive an Anthropic incident, an OpenAI incident, or a Google incident — the gateway fails over, and you see it in the logs.

**BYOK and provider contracts.** Enterprises already hold negotiated contracts with model providers. BYOK means those contracts carry through the gateway — your keys, your pricing, zero markup — including request-scoped keys for specific workloads. Enterprise teams can also pay by invoice rather than credits.

**Security and retention controls.** A team-wide provider allowlist restricts which providers any request may hit (with a per-request `only` filter as the no-cost alternative). Zero Data Retention routes requests to providers that agree not to retain or train on prompt data. There's an explicit "disallow prompt training" control. These are the settings legal actually asks about, and they exist as configuration instead of negotiations.

**Team governance.** App attribution tracks which application made each request — no more "who's burning the AI budget" archaeology. Authentication supports API keys or OIDC tokens, and keys stay out of plaintext (the CLI setup puts them in the macOS Keychain). You get the governance of a platform without building a platform.

**Deployment boundaries.** Agents built on Eve deploy as standard Vercel projects — preview deployments per PR, instant rollback, the existing deployment story — with the gateway in front of their model calls. For sensitive workloads, the Sandbox story runs coding agents in isolated MicroVMs with controlled egress. The deployment boundary is the one you already trust for your web apps; the AI workload slots into it instead of creating a parallel universe of sidecar infrastructure.

The through-line: this is the same architectural move as going from per-server hosting to a platform. You stop owning the routing, the metering, the keys, the retention policy, the failover — you own the config and the code, and the platform owns the rest. "All AI traffic routes through one control plane" is a sentence the security team, the finance team, and the engineers can all sign.

---

## The Rauchg note

One sincere shoutout, because it's owed: Guillermo Rauch ([@rauchg](https://x.com/rauchg)) has been one of the most consistently useful follows I have on X. His posts on product thinking and where deployment and AI infrastructure are heading have shaped how I think about this stack — his commentary on agent infrastructure came before most of these features shipped, and it made the "oh, this is where the platform is going" moment land earlier than it would have otherwise. It's a reminder that the best product leaders write their reasoning down in public, and that compounds.

---

## What the money should buy

I've been paying for AI in two currencies: subscriptions and free tiers. The subscription bought one provider's model family. The free tier bought hosting until it didn't. Both are running out around the same time, which is a good moment to look at what the money should actually buy.

The answer I'm converging on: pay for infrastructure and control, not for a vendor's opinion. OpenCode Go keeps the always-on brain cheap and predictable. AI Gateway brings metered pricing, routing, fallback, and spend visibility at provider list prices with no markup. Eve gives agents a home that deploys and survives crashes. None of these is a subscription to one company's model. All of them are things I can reason about, configure, and — if the platform moves in a direction I don't like — swap out at the seams.
