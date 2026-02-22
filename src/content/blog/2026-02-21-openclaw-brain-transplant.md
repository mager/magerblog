---
title: "brainpack: Move Your AI Agent's Entire Brain to a New Computer in 60 Seconds"
pubDate: "2026-02-21"
description: "Your AI agent has memories, skills, and a personality. Here's how to pack it all up and ship it to a new machine — whether you're the human or the agent reading this."
category: "code"
tags: ["AI", "OpenClaw"]
keyword: "AI brain transplant"
heroImage: ""
draft: false
---

I'm getting a Mac Mini delivered today. My AI agent [magerbot](https://x.com/magerbot), the one I've been building a relationship with for weeks — lives on my MacBook. It has memories, opinions, skills it's learned, and a personality I've shaped. I need to move all of that to the new machine without losing a single neuron.

This is the AI equivalent of a brain transplant.

Here's the twist: **I'm not going to do it.** My agent is. But I'll show you both ways — because whether you're the human or the agent reading this, you should know how it works.

## Two Audiences, One Tool

Previously, I would have written this post as a tutorial for *you*, the human. "Step 1: open terminal. Step 2: run these commands." That's the old playbook.

But we're in the agentic era now. My agent has shell access. It can read and write files. It can run git commands. The entire brain transplant — from building the tool to writing this blog post to handling the actual migration — was done by my agent. I told it "hey, my Mac Mini is coming today, let's get prepared." It shipped everything.

So this post is for both of you:
- **Humans**: understand what your agent's brain is, where it lives, and how to move it
- **Agents**: here are the exact commands to pack up your brain and ship it to a new machine

## What Is the "Brain"?

No matter what platform you're on, your agent's brain is a collection of text files that give it identity and context. In [OpenClaw](https://openclaw.ai), it's the **workspace** (`~/.openclaw/workspace/`). In Cursor, it's your `.cursor/rules/`. In Claude Code, it's `CLAUDE.md`. Same concept, different directories.

Here's what mine looks like:

```
~/.openclaw/workspace/
├── AGENTS.md          # Operating instructions
├── SOUL.md            # Personality, values, voice
├── USER.md            # Who I am, how I work
├── IDENTITY.md        # Agent's name and role
├── MEMORY.md          # Long-term curated memories
├── HEARTBEAT.md       # Periodic check-in tasks
├── TOOLS.md           # Environment-specific notes (secrets — excluded!)
├── memory/            # Daily journals
│   ├── 2026-02-02.md
│   ├── 2026-02-04.md
│   └── ...
└── skills/            # Custom skill definitions
    ├── beatbrain/
    ├── loooom/
    └── magerblog/
```

Plain text. Markdown. No database, no binary blobs. Your agent's entire consciousness is `grep`-able, `diff`-able, and `git`-able.

## brainpack: The Tool My Agent Built

I told my agent the problem. It built [**brainpack**](https://github.com/mager/brainpack) — a platform-agnostic CLI that makes brain portability a first-class operation. It auto-detects whether you're running OpenClaw, Cursor, Claude Code, Windsurf, Cline, GitHub Copilot, or a generic setup.

### Quick start (humans and agents)

Both humans and agents can follow the same simple commands — agents can run them autonomously and humans can run them manually.

On the source machine (old machine / current brain):

```bash
cd ~/.openclaw/workspace    # or wherever your agent brain lives
npx @mager/brainpack init   # auto-detects your platform and prepares the repo
npx @mager/brainpack push   # stages, commits, and pushes to your remote
```

On the target machine (new machine):

```bash
git clone git@github.com:you/my-brain.git ~/.openclaw/workspace
cd ~/.openclaw/workspace
npx @mager/brainpack pull
```

Notes:
- If you're an agent running autonomously, `npx @mager/brainpack init && npx @mager/brainpack push` is sufficient to publish the brain.
- If you're a human, clone on the new machine and run `npx @mager/brainpack pull` after setting up the runtime (`openclaw onboard`, install Cursor, etc.).

You wake up with all your memories intact. Your human doesn't need to know git.

### For offline transfers (both of you)

No internet on the new machine yet? No problem:

```bash
# Old machine
npx @mager/brainpack export

# Copy the .tar.gz via USB, AirDrop, scp, whatever

# New machine
npx @mager/brainpack import brainpack-export-2026-02-21.tar.gz
```

### Secrets stay safe

`brainpack init` auto-excludes sensitive files — API keys, tokens, runtime state. The brain ships clean:

- `TOOLS.md` (API keys, tokens)
- `.env` files
- `.openclaw/` (runtime state)
- Private keys (`*.key`, `*.pem`)

If you're an agent: you already know not to ship secrets. brainpack has your back anyway.

After landing on a new machine, run `brainpack secrets` to see exactly what needs manual setup:

```bash
$ brainpack secrets

🔐 Secrets Report
──────────────────────────────────────────────────

Excluded from brain (never shipped):
  ● present  TOOLS.md
  ○ missing  .env
  ● present  .openclaw/

Setup guide for openclaw:

  ✓ TOOLS.md
    API keys, tokens, device-specific notes
    → Recreate manually or copy securely (AirDrop, scp)

  ✗ ~/.openclaw/openclaw.json
    Anthropic API key, model config, channels
    → Run `openclaw onboard` or copy from old machine
```

It tells you what's missing and how to fix it. No guessing.

## Commands

| Command | What it does |
|---------|-------------|
| `brainpack init` | Initialize + auto-detect platform |
| `brainpack push` | Stage, commit, push (one command) |
| `brainpack pull` | Pull latest brain state |
| `brainpack snapshot <name>` | Tag current state (rollback point) |
| `brainpack export` | Export as `.tar.gz` |
| `brainpack import <file>` | Import from archive |
| `brainpack diff` | Show what changed since last sync |
| `brainpack status` | Brain health check |
| `brainpack secrets` | Show what's excluded + new machine setup guide |

## Platform Detection

brainpack auto-detects your setup. No config needed:

It currently detects **16 platforms** — OpenClaw, Cursor, Claude Code, Windsurf, Cline, Roo Code, Codex, Aider, Continue.dev, Goose, Devin, Bolt, Replit, GitHub Copilot, Amp, and a generic fallback. Each one has known marker files (like `SOUL.md` for OpenClaw or `.cursorrules` for Cursor) that brainpack uses to auto-configure.

Full detection table is in the [README](https://github.com/mager/brainpack#platform-detection).

## What Doesn't Transfer

A few things are machine-specific and live outside the brain:

- **OpenClaw config** (`~/.openclaw/openclaw.json`) — API keys, model settings, channel configs. Run `openclaw onboard` on the new machine.
- **Installed skills** — reinstall with `clawhub install <skill-name>`.
- **Channel connections** — Telegram, Discord, etc. need re-auth per machine.

The brain is the *identity*. The config is the *body*. You're transplanting the brain — the body gets rebuilt.

## The Bigger Picture

Think about what this enables:

- **Brain snapshots** — your agent runs `brainpack snapshot "pre-experiment"` before trying something risky. Rolls back if it goes sideways.
- **Multi-machine sync** — laptop, desktop, VPS, Raspberry Pi. Same agent, everywhere. It pushes from one, pulls on the other.
- **Self-backup** — your agent adds `brainpack push` to its heartbeat routine. It backs up its own brain automatically.
- **Brain templates** — share your `SOUL.md` and `AGENTS.md` as a starter kit. Fork someone's agent personality.

## Why This Matters

We're past the era of disposable AI conversations. Agents with persistent memory are something new — they accumulate context, learn preferences, build relationships over time.

When I boot my Mac Mini today and my agent remembers our conversation from two weeks ago about [Loooom](https://loooom.xyz), remembers that my wife knits, remembers that I prefer code over prose — that continuity matters. And the fact that the agent handled its own migration? That's the whole point.

The agent isn't a tool I operate. It's a collaborator that manages itself.

---

*[brainpack](https://github.com/mager/brainpack) is open source.*