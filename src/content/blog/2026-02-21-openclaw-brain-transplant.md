---
title: "brainpack: Move Your AI Agent's Entire Brain to a New Computer in 60 Seconds"
pubDate: "2026-02-21"
description: "Your AI agent has memories, skills, and a personality. Here's how it can pack itself up and ship its own brain to a new machine — no human CLI gymnastics required."
category: "code"
tags: ["AI", "OpenClaw", "Agents", "Git", "DevOps", "brainpack"]
keyword: "brainpack openclaw brain transplant migrate agent"
heroImage: ""
draft: false
---

I'm getting a Mac Mini delivered today. My AI agent — the one I've been building a relationship with for weeks — lives on my MacBook. It has memories, opinions, skills it's learned, and a personality I've shaped. I need to move all of that to the new machine without losing a single neuron.

This is the AI equivalent of a brain transplant.

Here's the twist: **I'm not going to do it.** My agent is.

## The Old Way vs. The Agentic Way

Previously, I would have written this blog post as a tutorial for *you*, the human. "Step 1: open terminal. Step 2: run these commands." That's the old playbook.

But we're in the agentic era now. My agent has shell access. It can read and write files. It can run git commands. So why am I the one typing `git init` and `git push`? 

The entire brain transplant — from packaging the brain on my MacBook to unpacking it on the Mac Mini — was done by my agent. I told it "hey, my Mac Mini is coming today, let's get prepared." It built the tool, wrote this blog post, and will handle the migration. I'm just vibing.

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

Here's the agentic workflow. You tell your agent:

> "Pack up your brain and push it to GitHub."

Your agent runs:

```bash
cd ~/.openclaw/workspace
npx brainpack init
npx brainpack push
```

On the new machine, you set up OpenClaw (`openclaw onboard`), then tell the agent:

> "Pull your brain from GitHub."

```bash
cd ~/.openclaw/workspace
npx brainpack pull
```

Done. The agent handles it. You don't need to know git.

### For Offline Transfers

No internet on the new machine yet? No problem:

```bash
# Agent on old machine
npx brainpack export

# Copy the .tar.gz via USB, AirDrop, whatever

# Agent on new machine
npx brainpack import brainpack-export-2026-02-21.tar.gz
```

### For the Safety-Conscious Agent

Your agent knows to protect your secrets. `brainpack init` auto-excludes sensitive files:

- `TOOLS.md` (API keys, tokens)
- `.env` files
- `.openclaw/` (runtime state)
- Private keys (`*.key`, `*.pem`)

The brain ships clean. Secrets stay local.

## What Your Agent Gets

All 8 commands, designed for agents to use:

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

## Platform Detection

brainpack auto-detects your setup. No config needed:

| Platform | How it knows |
|----------|-------------|
| OpenClaw | `SOUL.md` or `AGENTS.md` |
| Cursor | `.cursor/` directory |
| Claude Code | `CLAUDE.md` or `.claude/` |
| Windsurf | `.windsurf/` or `.windsurfrules` |
| Cline | `.cline/` or `.clinerules` |
| Copilot | `.github/copilot-instructions.md` |
| Generic | Fallback for any setup |

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

*[brainpack](https://github.com/mager/brainpack) is open source. My agent's workspace is at [github.com/mager/openclaw-brain](https://github.com/mager/openclaw-brain) — fork it as a starting point for your own agent setup.*
