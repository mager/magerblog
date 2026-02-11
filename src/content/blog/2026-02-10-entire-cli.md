---
title: "Entire CLI: Version Control for Your AI Coding Sessions"
pubDate: "2026-02-10"
description: "A quick look at Entire, a CLI tool that captures AI agent sessions alongside your git commits. Think flight recorder for AI-assisted development."
category: "code"
tags: ["AI", "Developer Tools", "Git"]
keyword: "entire cli ai sessions"
draft: true
---

I've been using AI coding agents (Claude Code, OpenClaw) across several projects, and one thing that's always bugged me: **the reasoning disappears**. You get the commit, but not the conversation that produced it. Why did the agent refactor that function? What alternatives did it consider?

[Entire](https://entire.io) solves this by hooking into your git workflow to capture AI agent sessions on every push.

## What It Does

Entire installs lightweight git hooks that run in the background while you work with Claude Code or Gemini CLI. It captures:

- Every prompt and response in the session
- Files modified and when
- The full reasoning chain

All of this gets stored on a separate git branch (`entire/checkpoints/v1`), so your actual commit history stays clean. No extra noise in your PRs.

## Setup Takes 30 Seconds

```bash
# Install
curl -fsSL https://entire.io/install.sh | bash

# Enable in your project with auto-commit
cd your-project
entire enable --strategy auto-commit

# That's it. Work normally.
```

I'd recommend `auto-commit` over the default `manual-commit`. With auto-commit, Entire creates a checkpoint after every agent response — so you get fine-grained save points without having to remember to commit. It does mean more commits on your branch, but that's a small price for being able to rewind to any point in the conversation.

Check on it anytime:

```bash
entire status
```

## The Killer Feature: Rewind

This is the part that sold me. With `auto-commit` strategy, Entire creates a checkpoint after every agent response. If an agent goes sideways three steps into a task, you can roll back to any of those save points — **while the session is still active**:

```bash
entire rewind
```

It shows all checkpoints in the current session. Pick one, and your code snaps back to that exact state. No more `git stash` gymnastics or hunting through undo history.

**Important caveat I learned the hard way:** `rewind` only works during a live session. Once the session ends, the temporary shadow branches get cleaned up and the session data gets condensed onto `entire/checkpoints/v1`. After that, use `entire explain` to review what happened, or `entire resume` to pick up where you left off:

```bash
entire explain HEAD              # what happened in the last session?
entire resume feature/my-branch  # restore session metadata and continue
```

## A Real Example: Updating My Blog's Navigation

I wanted to make the navigation consistent across my Astro blog — same header on every page, clean routing, no more one-off nav components. I fired up Claude Code and got to work:

```bash
claude

> "Update the navigation to be consistent across all pages..."
```

<!-- TODO: Add screenshot of the Claude Code session -->

Claude refactored the header component, updated the layout files, and fixed the routing. A few back-and-forth exchanges later, the nav was solid. I committed and pushed:

```bash
git add -A && git commit -m "fix: consistent navigation across all pages"
git push
```

Here's the part that wasn't obvious to me at first: **Entire captured that entire session automatically.** I didn't have to do anything extra. The prompts, responses, and file changes all got pushed to a separate branch (`entire/checkpoints/v1`) alongside my commit.

<!-- TODO: Add screenshot of the entire/checkpoints/v1 branch -->

Later, when I wanted to remember *why* Claude restructured the header the way it did, I could pull up the session:

```bash
entire explain HEAD
```

And with `auto-commit`, if the nav changes started going sideways mid-session, I could rewind to a checkpoint before the layout refactor while Claude Code was still running:

```bash
entire rewind
# Pick a save point → code snaps back, keep working
```

## Multi-Machine: The Part I Missed

One thing that wasn't clear to me initially — **Entire's config and session history sync across machines via git.**

When you run `entire enable`, it creates:
- `.entire/settings.json` — your strategy config (committed to git)
- `.claude/settings.json` — Claude Code hook config (committed to git)
- `.entire/metadata/` — session data (gitignored, pushed to the checkpoint branch)

So when I pulled the repo on a different machine, the config was already there. I just needed to:

```bash
# Install the CLI on the new machine
curl -fsSL https://entire.io/install.sh | bash

# Install the git hooks locally (hooks don't transfer via git clone)
# --force reinstalls hooks, picks up the auto-commit strategy from settings.json
entire enable --force
```

After that, sessions from both machines get pushed to the same `entire/checkpoints/v1` branch. One unified history of how the code was written, regardless of which computer I was on.

## What It Doesn't Do

Entire is a **local dev tool**. It doesn't touch your build pipeline, CI/CD, or deployments. No changes to `package.json`, no new dependencies in your app. Your Vercel/Netlify/whatever deploys stay exactly the same.

The only file it adds to your project is `.entire/settings.json` for configuration.

## Why I'm Using It

I run AI agents across three projects (a music app, a sports picks app, and this blog). Having a searchable record of *how* code was written — not just what changed — is genuinely useful for:

- **Debugging agent decisions** — "Why did it choose this approach?"
- **Onboarding** — New contributors can read the AI sessions alongside the code
- **Rewinding mistakes** — Cheaper than `git revert` when the agent went off the rails

It's one of those tools that costs nothing to run and pays off the first time you need it.

Check it out: [entire.io](https://entire.io) / [GitHub](https://github.com/entireio/cli)
