---
title: "Entire CLI: Version Control for Your Agent Sessions"
pubDate: "2026-02-10"
description: "A quick look at Entire, a CLI tool that captures AI agent sessions alongside your git commits. Think flight recorder for AI-assisted development."
category: "code"
tags: ["AI", "Developer Tools", "Git"]
keyword: "AI flight recorders"
heroImage: ""
---

When you use AI coding agents like Claude Code, the code stays but the conversation disappears. You get the commit, but not *why* the agent made the choices it did. [Entire](https://entire.io) fixes that.

It hooks into your git workflow to capture AI sessions — prompts, responses, files touched, token usage — and stores them on a separate git branch (`entire/checkpoints/v1`). Your commit history stays clean. The context lives alongside it.

## 30s Setup

```bash
# Install
curl -fsSL https://entire.io/install.sh | bash

# Enable in any git repo
cd your-project
entire enable
```

![Running entire enable in the magerblog repo — hooks installed, checkpoint branch created, ready to go](https://lh3.googleusercontent.com/pw/AP1GczOfvadrrZWqsJtTo-JfctGI__4OF7hr_t6pOL0l1icww7Qz9TD5GSlM_yznj5ZtqotC0aZfAwtY8HPrKwbNmFn4M0QmZti-bApb2ptaaQ5omjuswwvFFsCNeGTjCn42PQXYuZoWFOBCunyPooOP0QQzAw=w2318-h1522-s-no-gm)

That's it. Work with Claude Code or Gemini CLI normally. When you push, Entire prompts you to link the commit to your session. If you say yes, the session gets pushed to your repo as a checkpoint.

## Strategies

Entire has two strategies: `manual-commit` (default) and `auto-commit`. I'd recommend auto-commit — it creates a checkpoint after every agent response, so you get fine-grained save points without having to remember to commit yourself:

```bash
entire enable --strategy auto-commit
```

## Rewind

The standout feature. Entire saves checkpoints as you go. If things go sideways, roll back:

```bash
entire rewind
```

Pick a checkpoint, code snaps back. No `git stash`, no manual undo. You can also use `entire explain` to review what happened in a session or `entire resume` to pick up where you left off.

## Real Example

I used Claude Code to refactor the navigation on this blog — making the header consistent across all pages. Entire captured the full session automatically.

Running `entire explain` shows each checkpoint with the original prompt and resulting commit. And `entire rewind` gives you an interactive picker to roll back to any save point:

![entire explain showing session checkpoints, and entire rewind with an interactive selector to roll back](https://lh3.googleusercontent.com/pw/AP1GczOU-x2EGCqDorE7x3UVdJOy55VUaQEjGgPG95BQwszWOVU8dM8dEFqSqGtsagCcD5hCmTxrtLcZzc8ciftpui61HTo97DUAZMrv6xnTkSZtZe82zlrHjHLgIMlMPdre7iEQE5MK6F983V5nc-zRqQgfOg=w2318-h1522-s-no-gm)

## Works Across Machines

The config files (`.entire/settings.json`, `.claude/settings.json`) get committed to your repo. On a new machine, just install the CLI and re-enable hooks:

```bash
curl -fsSL https://entire.io/install.sh | bash
git pull origin main
entire enable --force
```

Sessions from all your machines push to the same checkpoint branch.

## What It Doesn't Touch

Entire is local dev tooling. No build changes, no CI/CD impact, no new dependencies. Your deploys stay exactly the same.

## One More Thing

Honestly, this feels like something that should just be built into Claude Code. Running a separate CLI for session history adds friction. But the tradeoff makes sense — Entire is agent-agnostic (works with Gemini CLI too) and stores everything in git, not a vendor's cloud. If Anthropic built it in natively, it'd only cover Claude. Having it as a git layer means the history lives in your repo regardless of which agent wrote the code.

Overall it was a good experience getting it set up across my projects. I'm excited to see how it evolves.

Check it out: [entire.io](https://entire.io) · [GitHub](https://github.com/entireio/cli) · [Docs](https://docs.entire.io)
