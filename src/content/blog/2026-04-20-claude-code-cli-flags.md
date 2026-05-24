---
title: "10 CLI flags you probably aren't using"
description: "A practical tour of Claude Code flags that are easy to miss but genuinely useful once you move past the default interactive loop."
pubDate: 2026-04-20
category: tech
draft: false
tags: [ai, claude-code, cli]
---

I like CLI tools that reward a second pass through `--help`.

The first time you use Claude Code, the default loop is enough: open a repo, type a prompt, let it work. But the interesting part of the tool is in the edges, the flags that let you shape how sessions start, resume, stream, constrain, and integrate.

I pulled up the current local help output and found a handful of flags that feel under-discussed, especially if you mostly see Claude Code through screenshots or short demos.

These are not obscure in the sense that they are hidden. They are obscure in the more common CLI sense: they exist in plain sight, and most people never need them until suddenly they really do.

## 1. `--append-system-prompt`

This is one of the cleanest power-user flags in the whole CLI.

Instead of replacing Claude Code's default system prompt, `--append-system-prompt` lets you add a small layer of project-specific behavior on top of the standard runtime instructions.

That matters because full prompt replacement is often too blunt. Usually I do not want to erase the built-in operating model. I want to add a few constraints.

For example:

```bash
claude --append-system-prompt "Always suggest a regression test before editing production code."
```

Good uses:

- adding a house style rule
- enforcing a repo convention
- nudging the agent toward tests, perf, or accessibility
- injecting short-lived task context without editing project-wide config

If you have ever thought "I want Claude Code to keep acting like Claude Code, but with one extra rule," this is the flag.

## 2. `--json-schema`

This is probably the highest leverage flag in the whole CLI if you care about automation.

A lot of people treat agent tooling like it has to end in prose. `--json-schema` is the thing that lets you stop hoping the output is parseable and start requiring that it be shaped the way your next system expects.

Example:

```bash
claude --print \
  --output-format json \
  --json-schema '{"type":"object","properties":{"title":{"type":"string"},"risk":{"type":"string"}},"required":["title","risk"]}' \
  "Review this patch and return a title and risk level"
```

Instead of parsing loose text, you can ask for validated structure.

That is useful for:

- CI annotations
- PR review helpers
- changelog generation
- content pipelines
- release tooling
- chaining Claude Code into other programs without brittle parsing glue

This is the difference between "interesting terminal demo" and "something I can actually wire into a workflow."

If I were building lightweight automation around Claude Code, this is one of the first flags I would reach for.

## 3. `--continue` and `--resume`

These sound similar, but they solve slightly different problems.

- `--continue` resumes the most recent conversation in the current directory
- `--resume` resumes by session ID, or opens a picker

Examples:

```bash
claude --continue
```

```bash
claude --resume
```

```bash
claude --resume 12345678-1234-1234-1234-123456789abc
```

This matters if you treat Claude Code as more than a one-shot assistant.

`--continue` is the low-friction choice when you are back in the same repo and just want to pick up where you left off. `--resume` is better when you have multiple threads of work and want the exact session, not simply the latest one in a directory.

Once you start actually using session history on purpose, Claude Code feels a lot more like a runtime and a lot less like a prompt box.

## 4. `--fork-session`

This one gets much more useful once you care about `--continue` and `--resume`.

When paired with either of them, `--fork-session` creates a new session ID instead of reusing the old one.

```bash
claude --continue --fork-session
```

Why this is nice:

- you can branch off an existing context without mutating its history
- you get the benefit of prior conversation state without collapsing everything into one long thread
- it fits real engineering work, where exploration often diverges

It is basically the CLI equivalent of saying, "start from here, but make this a new branch of thought."

## 5. `--print` with `--output-format stream-json`

A lot of people think of Claude Code as purely interactive, but the non-interactive surface is deeper than it looks.

`--print` makes Claude Code emit output and exit. Add `--output-format stream-json`, and it becomes much easier to integrate into scripts, supervisors, or your own harness.

```bash
claude --print --output-format stream-json "Summarize the latest git diff"
```

Related flags that pair well with this:

- `--input-format stream-json`
- `--include-partial-messages`
- `--replay-user-messages`
- `--json-schema`

This is one of the flags that turns Claude Code from a terminal app into a component.

## 6. `--allowedTools` and `--disallowedTools`

These are easy to skip until you want tighter control over what the session can do.

Claude Code exposes tool-level constraints through:

- `--allowedTools`
- `--disallowedTools`

Example:

```bash
claude --allowedTools "Read,Edit,Bash(git:*)"
```

Or the inverse:

```bash
claude --disallowedTools "Bash(curl:*)"
```

This is useful when you want to:

- limit a session to code reading and editing
- permit git but block arbitrary shell usage
- create safer scripted workflows
- debug whether a behavior depends on a specific tool

A lot of agent weirdness disappears when the tool boundary is explicit.

## 7. `--permission-mode`

Most people know Claude Code has permission controls. Fewer seem to use the CLI flag that makes the mode explicit up front.

Current choices include:

- `acceptEdits`
- `bypassPermissions`
- `default`
- `dontAsk`
- `plan`
- `auto`

Example:

```bash
claude --permission-mode plan
```

This is great when you want different interaction styles for different moments:

- `plan` when you want architecture first and no surprise mutations
- `dontAsk` when you are in a trusted sandbox and want less interruption
- `acceptEdits` when file changes are fine but command execution should stay more controlled

The main win is predictability. The session starts in the operating mode you intended, instead of drifting there interactively.

## 8. `--mcp-config` and `--strict-mcp-config`

Claude Code's MCP support is broad enough now that config isolation matters.

`--mcp-config` lets you load MCP servers from JSON files or inline JSON strings. The more important flag, in my opinion, is `--strict-mcp-config`, which tells Claude Code to use only the MCP servers supplied that way and ignore other MCP configuration sources.

That combination is excellent for reproducibility.

```bash
claude --mcp-config ./mcp.review.json --strict-mcp-config
```

I like this for task-specific sessions where I want:

- one known toolchain
- no ambient config bleed from global settings
- cleaner debugging when an MCP server behaves badly
- confidence that the integration surface is exactly the one I intended

It is the difference between "use whatever is lying around" and "use this exact tool boundary."

## 9. `--add-dir`

This one is practical and easy to overlook.

`--add-dir` expands tool access beyond the current working directory.

```bash
claude --add-dir ../shared-lib --add-dir ../design-system
```

That is useful when your real task spans multiple repos or adjacent directories, but you still want to start from a specific working directory.

Good examples:

- app repo + shared package repo
- service repo + infra repo
- product repo + docs repo

In real codebases, the interesting context is often one directory over.

It also hints at something bigger: once you combine `--add-dir`, structured output, and strict tool boundaries, you are getting pretty close to building your own custom harness around Claude Code without needing some giant framework.

## 10. `--debug-file`

Debug flags are rarely glamorous, but this one earns its place.

`--debug-file <path>` writes debug logs to a file and implicitly enables debug mode.

```bash
claude --debug-file ./claude-debug.log
```

This is especially useful when you are trying to understand:

- MCP failures
- session startup behavior
- why a specific integration did or did not load
- weird differences between interactive and scripted runs

Terminal debug output scrolls away. A file gives you an artifact you can inspect, diff, or attach to a bug report.

## A few honorable mentions

There are a few more flags worth keeping in the back pocket:

- `--agent` picks the agent for the current session
- `--agents` defines custom agents inline as JSON
- `--worktree` creates a new git worktree for the session
- `--tmux` opens a tmux-backed worktree session
- `--setting-sources` lets you control whether settings come from `user`, `project`, or `local`
- `--no-session-persistence` disables saving sessions to disk in `--print` mode
- `--fallback-model` gives `--print` workflows a fallback when the default model is overloaded

None of these are flashy. All of them become valuable when Claude Code stops being a toy and starts being part of your actual workflow.

## The bigger pattern

The reason these flags matter is not just convenience. They expose the shape of the product.

Claude Code is no longer just "chat in a terminal." It is a session runtime with resumption, tool governance, structured I/O, MCP composition, and multiple ways to control execution boundaries.

That is a more serious tool than most of the discourse around it suggests.

And as usual with serious CLI tools, the best features are often sitting right there in `--help`, waiting for the second read.

---

*All flags above were verified against the local `claude --help` output on my machine at the time of writing. CLI surfaces move fast, so check your installed version before scripting against anything important.*
