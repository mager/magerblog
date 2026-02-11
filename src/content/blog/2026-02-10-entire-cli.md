---
title: "Entire CLI: Version Control for Your AI Coding Sessions"
pubDate: "2026-02-10"
description: "A quick look at Entire, a CLI tool that captures AI agent sessions alongside your git commits. Think flight recorder for AI-assisted development."
category: "code"
tags: ["AI", "Developer Tools", "Git"]
keyword: "entire cli ai sessions"
draft: true
---

When you use AI coding agents like Claude Code, the code stays but the conversation disappears. You get the commit, but not *why* the agent made the choices it did. [Entire](https://entire.io) fixes that.

It hooks into your git workflow to capture AI sessions — prompts, responses, files touched, token usage — and stores them on a separate git branch (`entire/checkpoints/v1`). Your commit history stays clean. The context lives alongside it.

## Setup

```bash
# Install
curl -fsSL https://entire.io/install.sh | bash

# Enable in any git repo
cd your-project
entire enable
```

That's it. Work with Claude Code or Gemini CLI normally. When you push, Entire prompts you to link the commit to your session. If you say yes, the session gets pushed to your repo as a checkpoint.

## Rewind

The standout feature. During a live Claude Code session, Entire saves checkpoints as you go. If things go sideways, roll back:

```bash
entire rewind
```

Pick a checkpoint, code snaps back. No `git stash`, no manual undo.

**One thing that tripped me up:** rewind only works during an active session. Once the session ends, checkpoints get condensed onto the `entire/checkpoints/v1` branch. After that, use `entire explain` to review what happened or `entire resume` to pick up where you left off.

## Real Example

I used Claude Code to refactor the navigation on this blog — making the header consistent across all pages. Entire captured the full session automatically.

<!-- TODO: Add screenshot of the Claude Code session -->

Later, I could see exactly why Claude restructured the layout the way it did. And if it had broken something, I could've rewound mid-session to before the refactor.

<!-- TODO: Add screenshot of the entire/checkpoints/v1 branch -->

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
