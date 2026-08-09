---
title: "OpenCode CLI: ten commands worth knowing"
description: "OpenCode's CLI is bigger than 'type opencode and start a session.' Headless runs, provider auth, model discovery, MCP wiring, session archaeology, cost stats, and upgrades — the ten commands that carry daily work, with the doc gaps called out where they bite."
pubDate: 2026-08-09
category: tech
keyword: "OpenCode CLI"
draft: true
tags: [opencode, cli, terminal, agents, tooling, ai]
---

I've been running [OpenCode](https://opencode.ai) as my always-on agent harness since the [migration post](/blog/2026-08-08-opencode-go-buzz-harness/), and it's become the open-source harness I default to. It's actively developed, the protocol story is right, and — for my Mac mini setup — it's cheaper than what I ran before. Now I'm at the next stage: customizing it. And the first thing I needed was a real map of the command surface.

That surface is bigger than it looks. The CLI's headline behavior is "run `opencode` and get a TUI," but that's one command out of twenty. Most of them I'll touch rarely. Ten of them carry the actual work. Everything below comes from the [official CLI docs](https://opencode.ai/docs/cli/), cross-checked against what I've actually run this week. Where the docs are ambiguous, I say so.

## The shape of it

The commands fall into three groups:

- **Interactive** — `opencode` itself, the TUI.
- **Scripted** — `run`, the non-interactive mode for automation.
- **Management** — auth, models, MCP servers, sessions, stats, export/import, upgrades. The boring half, and the half that decides whether the setup survives contact with reality.

## 1. `opencode` — the TUI

Plain `opencode` starts the terminal UI. The positional argument is a project path — `opencode ~/Code/magerblog` opens that project.

The flags that matter day to day:

```bash
opencode -c            # continue the last session
opencode -s <id>       # continue a specific session
opencode -m provider/model
opencode --auto        # auto-approve permissions not explicitly denied
```

`--fork` pairs with `--continue` or `--session` to branch the thread instead of mutating it — worth knowing before you resume a long session to test something you don't want in the record. `--auto` is exactly as dangerous as it sounds; it's how I run the unattended harness, and I wouldn't reach for it in an interactive session.

## 2. `opencode run "<prompt>"` — the scripted mode

The workhorse. Non-interactive, takes a prompt as arguments, streams an answer to stdout. This is the command for scripting, CI, and quick answers without launching the full UI:

```bash
opencode run "Explain how closures work in JavaScript"
opencode run -f src/main.ts "review this file for edge cases"
opencode run --format json "summarize the last commit"   # raw events
```

Useful flags: `-f` attaches files, `-m` picks a model in `provider/model` form, `-c` continues the last session, `--share` publishes the session, `--format json` emits raw event objects for parsing.

One bit worth stealing from the docs: `run --attach http://localhost:4096` connects to a running `opencode serve` instance instead of booting a fresh backend. Their stated reason is that it skips MCP server cold-boot time on every run. If you're scripting many short prompts, that's the difference between snappy and sluggish.

## 3. `opencode auth` — providers

OpenCode pulls its provider list from [Models.dev](https://models.dev), so a single command configures keys for any provider:

```bash
opencode auth login          # interactive provider picker
opencode auth login -p anthropic   # skip the picker
opencode auth list           # or: auth ls
opencode auth logout <provider>
```

Credentials land in `~/.local/share/opencode/auth.json`. The caveat: that file isn't the only source. The docs note OpenCode also loads keys from environment variables and a `.env` file in the project — which is exactly why a provider can "just work" in one directory and not another. If a provider shows up but behaves oddly, check all three places before you suspect the config.

## 4. `opencode models [provider]` — finding the right model string

Every place you name a model — `-m`, config, agents — wants a `provider/model` string. This command lists exactly what's available across your configured providers:

```bash
opencode models              # everything
opencode models anthropic    # filter by provider
opencode models --verbose    # include metadata like costs
opencode models --refresh    # re-fetch from models.dev
```

The `--refresh` flag matters more than it looks: the model list is cached, and the docs point at it specifically for when a provider adds new models. On my Go plan, `opencode models --refresh` is how I learned what the plan actually offers — before the refresh, the cache was telling me a stale story.

## 5. `opencode mcp` — MCP servers

MCP is how my gbrain memory layer gets wired into every session. The management surface:

```bash
opencode mcp list            # or: mcp ls — servers and connection status
opencode mcp add             # interactive, local or remote
opencode mcp auth <name>     # OAuth-enabled servers
opencode mcp auth ls         # OAuth status of all servers
opencode mcp debug <name>    # OAuth connection debugging
```

`mcp list` showing connection status is your first health check when a tool goes quiet — my gbrain server shows up there with its state, and a down status there has saved me a rabbit hole. One caveat from the docs: `mcp debug` is scoped to OAuth connection issues. If the server is local and misbehaving, the list output is diagnostic enough on its own.

## 6. `opencode session` — session archaeology

Sessions are the durable unit in OpenCode. When I'm not sure what happened in a prior session, or which one is eating my budget, this is where I look:

```bash
opencode session list              # table; -n 10 limits, --format json for piping
opencode session delete <sessionID>
```

The session ID in `session delete` is the one `session list` prints — grab it before you need it, because there's no fuzzy lookup. Sessions auto-compact when they outgrow the context window; `OPENCODE_DISABLE_AUTOCOMPACT` exists if you want to keep everything raw, at the cost of context quality.

## 7. `opencode stats` — what the week cost

Token and cost accounting across sessions:

```bash
opencode stats               # all-time
opencode stats --days 7      # rolling window
opencode stats --models 5    # top 5 models by usage
opencode stats --tools       # tool call counts
```

I run an always-on agent, so this command is how I find out what a day actually costs. The docs note that the model breakdown is hidden by default — pass `--models` with a number for the top N, or bare `--models` for the full breakdown. If you're trying to justify a cheap default model with an escalation path, this is the evidence.

## 8. `opencode serve` / `attach` — headless backend, remote TUI

`serve` starts a headless HTTP server for API access; `web` does the same and opens a browser. `attach` points a TUI at an already-running backend — including one on another machine:

```bash
opencode serve
opencode web --port 4096 --hostname 0.0.0.0
# in another terminal, on another machine:
opencode attach http://10.20.30.40:4096
```

The docs are explicit that `OPENCODE_SERVER_PASSWORD` enables basic auth, with the username defaulting to `opencode` (override via `OPENCODE_SERVER_USERNAME`). The ambiguity: nowhere on this page is a default port documented — the examples pin 4096, and so should you, or `attach` will be guessing alongside you.

## 9. `opencode export` / `import` — session portability

Sessions can be pulled out as JSON and put back in — your backup story, and your "hand this context to someone else" story:

```bash
opencode export <sessionID>          # prompts if you omit the ID
opencode export <sessionID> --sanitize   # redact sensitive transcript/file data
opencode import session.json
opencode import https://opncd.ai/s/abc123   # from a share URL
```

`--sanitize` deserves attention. The docs describe it as redacting sensitive transcript and file data — which is the difference between exporting a session for analysis and leaking your `.env` contents into the export. On the sharing side, `run --share` publishes a session and hands you the `opncd.ai` URL that `import` can pull back in.

## 10. `opencode upgrade` — staying current

```bash
opencode upgrade           # latest
opencode upgrade v0.1.48   # pinned version
```

One flag matters here: `--method` tells the updater how you installed it — `curl`, `npm`, `pnpm`, `bun`, or `brew`. If you installed via a package manager and the upgrade misbehaves, this is the flag that fixes the mismatch. The docs don't say what happens on mismatch, but the flag existing implies the updater cares.

## The rest, briefly

A handful of commands didn't make the top ten but are worth knowing exist: `opencode agent create` (interactive unless you pass all of `--path`, `--description`, `--mode`, `--permissions` — and anything you don't allow is denied in the generated agent's frontmatter), `opencode plugin <module>` (alias `plug`, installs and updates your config), `opencode pr <number>` (fetch and checkout a GitHub PR, then run), `opencode db path` (where the database lives), `opencode debug` for troubleshooting, and `opencode uninstall` with `--dry-run` to preview what it would remove.

One that never appears on "top commands" lists but is the one my own harness literally runs every day: `opencode acp`. It starts an [Agent Client Protocol](https://agentclientprotocol.com) server speaking nd-JSON over stdin/stdout — that's the seam buzz-acp uses to drive OpenCode from my phone. It's the command that makes "OpenCode is the runtime" a one-line swap rather than a project.

Two global flags worth memorizing regardless: `--pure` runs without external plugins — the first thing to try when something misbehaves — and `--log-level DEBUG` with `--print-logs` gives you the stderr stream when you need to see what actually happened.

## The pattern

Reading the whole surface, the design intent is consistent: OpenCode is a CLI with a TUI attached, not the other way around. Every interactive thing has a non-interactive twin — `run` for the TUI, `serve` for `web`, `export`/`import` for session continuity. That's exactly the property you want in something you're going to script, supervise, and eventually hand real work to.

The commands themselves are simple. Most are one word. The actual work is knowing which one to reach for — and that's what this list is for.

Source: [opencode.ai/docs/cli](https://opencode.ai/docs/cli/)
