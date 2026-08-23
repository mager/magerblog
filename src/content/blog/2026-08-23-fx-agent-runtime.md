---
title: "fx: a 6MB coding agent built to be embedded"
description: "Vercel Labs shipped fx — a ~6MB, Zig-written coding agent that cold-starts in 10µs, speaks ACP, mounts MCP servers, and prints JSON. It's not a hosted service; it's a runtime you embed. Here's what it is, where I'd put it in my always-on harness, and how a large logistics operator would use it."
pubDate: 2026-08-23
category: tech
keyword: "fx"
draft: true
tags: [fx, vercel, zig, agents, harness, acp, mcp, wasm, tooling, mac-mini]
---

My always-on harness on the Mac mini in Chicago has migrated three times in three months — OpenClaw to Claude Code to OpenCode — and every migration got cheaper because the seams held while the runtime swapped. The latest runtime costs $10/month and the whole agent is one string in three files. So when [Vercel Labs](https://github.com/vercel-labs/fx) shipped fx, a ~6MB coding agent written in Zig that is explicitly built to be *embedded*, it landed exactly where I'm looking. This post is the evaluation: what it is, where I'd put it in my own setup, and where something like this goes in an enterprise.

To be clear at the front: I haven't migrated anything. This is a reading of the docs and a plan, not a post-mortem.

## What fx is

fx is a coding-agent harness and CLI written in Zig, open source under Apache-2.0, from Vercel Labs. The numbers that define it:

- **~6MB binary** (6.39 MiB, per the homepage), for macOS and Linux on x86_64 and arm64.
- **10µs cold start.** It does no unnecessary work or I/O before accepting input.
- **Single-digit megabytes of memory baseline.** The docs' pitch: you can pack many instances on one machine.
- **Shell-like UI**, closer to a Unix shell than an "IDE in the terminal" TUI. It preserves scroll history and repaints sparingly.
- **Context-efficient**: a minimal system prompt and tool set, positioned on lower token spend and better time-to-first-token.
- **Model-agnostic**: local models, gateways, direct provider access, or subscriptions.

The thing that shapes everything else: **fx is not a hosted service and has no public HTTP API.** The llms.txt states it plainly — integration is by installing the binary and invoking the CLI, or by embedding the library. That's the identity. It's a runtime you run and own, not a product you log into.

## The surface area, in commands

Install and authenticate:

```bash
curl -fsSL https://fx.sh/setup.sh | bash   # places fx in ~/.local/bin
fx login                                    # Vercel OAuth, saved to ~/.fx/auth.json
# or: fx setup                              # AI Gateway API key (Keychain on macOS)
```

Model access routes through the [Vercel AI Gateway](https://vercel.com/ai-gateway) catalog; the compiled default is `zai/glm-5.2-fast`. `FX_MODEL` overrides one process, `/models` changes the saved default, and `fx acp --model ...` works for headless runs. Project `.fx.json` files cannot set the model — a deliberate guard so a cloned repo can't silently change your model preferences.

The commands worth knowing:

```bash
fx                          # interactive session, current dir is the workspace
fx ask "summarize this repo"   # one-shot, noninteractive, exits when done
fx ask --json "list failing tests"  # structured output for scripts
fx acp                      # speak Agent Client Protocol over stdio
fx resume last              # continue the latest session
fx -r                       # session picker
fx sessions                 # list saved sessions (~/.fx/sessions/)
fx usage                    # token usage and spend recorded locally
```

`fx ask --json` is the interesting one for anyone who scripts agents. It returns one JSON object with `output`, `exit_code`, `model`, `session_id`, `steps`, `usage` (requests, input/output tokens), and a `tool_calls` array with name and status. That's agent output as a typed structure rather than a screen to parse:

```bash
fx ask --json "summarize the current changes" | jq -r .output
```

Permissions: fx starts in `auto` mode — saved rules apply first, sensitive calls get a review, unresolved calls become a prompt (run once / allow for the session / decline). Reading and searching the workspace needs no approval; writes and command execution do. `fx ask` can't pause for a human, so noninteractive runs use `--auto` to review unresolved requests automatically, or `--yolo` to disable checks entirely — which the docs say to use only in a workspace and container you're willing to lose.

Two capabilities that matter for embedding, both real:

**MCP.** fx is an MCP client, configured only from the trusted profile at `~/.fx/mcp.json` — repository-local MCP files are never loaded, so cloning a repo cannot add a server. Tools are discovered lazily (`mcp_search_tools`, then `mcp_select_tool`), which means a large server catalog doesn't consume the context window until the model actually reaches for a tool. Remote servers support OAuth with PKCE, with credentials in Keychain on macOS.

**Subagents.** A subagent is a session-backed child with its own model, effort, permission mode, and transcript. Children are one-off or persistent; persistent ones return to idle after each turn and receive queued messages, so a parent can hand work to a child without copying the child's full transcript into its own context. Children cannot elevate authority beyond what the caller has.

And the embedding story: `fx acp` for any editor or client that speaks Agent Client Protocol, plus an experimental WebAssembly SDK — `createFxAgent()` for a headless agent (`fx-core.wasm`) and `createFxTerminal()` for an interactive terminal (`fx-term.wasm`), both from JavaScript, both requiring JSPI (Chrome 137+, Safari 27, Node 24 with `--experimental-wasm-jspi`). The wasm build is a smaller agent than the native one: no native processes, no native MCP, no subagents, no skills.

## Where I'd put it in my harness

My setup today: a Rust bridge (`buzz-acp`) subscribes to my Buzz relay, filters for @mentions of magerbot, and drives an agent over ACP — currently `opencode acp` — one session per product channel. The brain is gbrain, mounted as a local MCP server. Supervision is tmux plus a launchd watchdog; the healthcheck is a canary that signs an @mention and waits for a reply.

fx fits the same slots, and that's the point:

**The ACP seam accepts it.** My last migration was a one-line diff — same bridge, same protocol, different process behind it. `fx acp` speaks the same protocol, so the bridge doesn't care. If I want a second opinion on a task without disturbing the principal, the cartridge swap is the same shape I already proved.

**`fx ask --json` for the unattended jobs.** The canary — the healthcheck that signs an @mention and waits for a reply — exists to test the whole path (relay, bridge, agent, model), so it stays a full round trip. But the jobs around it — cron maintenance, log summaries, the things that currently mean either a full agent turn or a shell script with no agent at all — are where `fx ask --json --no-save` fits. It returns `exit_code` and structured `tool_calls`, the kind of output a scheduler actually wants, instead of a transcript to parse. Honest tradeoff: the 10µs cold start saves process overhead, not tokens — each call is still one model request. The win is structure, not free inference.

**Many small agents instead of one big principal.** Single-digit megabytes of memory per instance means I could run one fx per product — magerblog, beatbrain, prxps, loooom, kotsu — each its own session, its own workspace, its own context. That's the same structural separation I get from named tmux sessions, one level down: no `/clear` between unrelated jobs because the separation is baked into the process layout.

**gbrain as a lazy MCP server.** My memory layer is already an MCP server; fx's lazy tool discovery means the full brain stays out of context until the agent reaches for it. That's a real context-budget win compared to always-loaded tools — the thing I pay for by the token.

**Persistent subagents for durable work.** A researcher child that stays idle between turns and receives queued messages is typed message passing instead of me polling a tmux pane and parsing what changed. Same supervision goal as my worker sessions, cleaner mechanics.

**Model economics map directly.** My budget habit — a cheap workhorse by default, an expensive model when the task earns it — is a model string. `FX_MODEL` for a one-off, `/models` for the default, escalation per session. Same shape as my OpenCode config, different knob.

The honest caveat on all of this: auth is Vercel-shaped. `fx login` is Vercel OAuth; the alternative is an AI Gateway API key. I don't live in the Vercel ecosystem, so that's friction to budget for — not a blocker, but real.

## The enterprise version

Take the scale of a large rideshare or logistics operator — thousands of concurrent driver support sessions, dispatch decisions per minute, a fleet of agents doing triage, refunds, ETA adjustments. I'm not naming a company; the shape is what matters.

The property that leads the procurement conversation: **fx is not a hosted service.** Trip data, driver locations, GPS traces — if the agent runtime is a binary you run, none of that leaves your network. For a company whose core asset is location data, that's the whole compliance argument: the model may see the data, the runtime never leaves the building. The tradeoff is you own the plumbing: routing, auth, supervision, storage.

Then the economics. A 6MB binary with a 10µs cold start and a single-digit MB baseline means agent instances are cheap to spawn and cheap to destroy — the container equivalent of a lambda. A driver dispute opens: spawn an fx instance with the trip context, resolve, destroy. Scale to zero between demand spikes. Pack many instances per machine for the steady-state load.

The integration surface is `fx ask --json`. Agents that return `{exit_code, output, usage, tool_calls}` to an internal service are a pipeline component, not a chat window. Dispatch triage, queue classification, fare adjustment — a fleet of agents that hand structured results to your existing services instead of impersonating humans in a UI.

The permission model is an operational boundary. Unattended runs carry saved rules and `--auto` review; `yolo` exists but is documented as disposable-container-only. An agent that cannot be spawned without going through policy is easier to audit than one that can. And the MCP story — trusted config only, repo-local servers never loaded, lazy discovery — is a security posture that reads well when the agents have access to internal tools.

For customer-facing surfaces, the wasm build is the interesting bet: an in-browser agent for a refund or lost-item flow, where the runtime ships to the client and your backend only proxies model calls. It's experimental — JSPI-gated, SDK from source, no npm package yet — so this is a pilot, not a platform decision.

## Tradeoffs

- **You build the plumbing.** No hosted service means routing, identity, supervision, and storage are yours. For my harness that's a feature — I already built all of it. For a team that wants "agents as a service," it's a gap.
- **Auth is Vercel-shaped.** Login or AI Gateway key. The model layer is agnostic; the credential path is not.
- **It's young.** Vercel Labs, Apache-2.0, source on GitHub. The wasm SDK is explicitly experimental. I'd rather bet on the durable seams — ACP, MCP, stdio — than on any one vendor's surface, and fx's seams are exactly the ones I already use.
- **The wasm core is a smaller agent.** No native processes, native MCP, subagents, or skills in the browser build. Embedding has a ceiling; the native binary is the full thing.

## What I'd build first

If I were to start tomorrow, the first build would be small and reversible: `fx acp` behind the buzz bridge on a scratch channel, gbrain mounted as MCP, one product's worth of work routed through it while the OpenCode principal keeps running. The harness treats runtimes as cartridges — the swap is one line, and the canary would catch a silent failure within a working day.

Everything about the last three migrations said the same thing: the brain, the keys, and the protocol seams are the durable assets; the runtime in the middle is a cartridge. fx is the smallest cartridge I've seen that speaks all the seams I already depend on — and the first one whose documentation leads with "embed me." That's the whole reason it's on my list.

The other reason, to close the loop with my [tmux post](/blog/2026-08-23-orchestrating-agents-with-tmux/): keystroke-level control is what you use when the agent has no other surface. `fx ask --json` is what you use when it does — structured output beats screen scraping every time, and a runtime that ships both is worth a hard look.