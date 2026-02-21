---
title: "How to Transplant Your AI Agent's Brain to a New Computer"
pubDate: "2026-02-21"
description: "Your AI agent has memories, skills, and a personality. Here's how to move all of it to a new machine using Git — and why your agent's brain should be version-controlled."
category: "code"
tags: ["AI", "OpenClaw", "Agents", "Git", "DevOps"]
keyword: "openclaw brain transplant migrate agent"
heroImage: ""
draft: false
---

I'm getting a Mac Mini delivered today. My AI agent — the one I've been building a relationship with for weeks — lives on my MacBook. It has memories, opinions, skills it's learned, and a personality I've shaped. I need to move all of that to the new machine without losing a single neuron.

This is the AI equivalent of a brain transplant.

## What Is the "Brain"?

If you're running [OpenClaw](https://openclaw.ai), your agent's brain lives in a single directory: the **workspace**. By default, that's `~/.openclaw/workspace/`. Here's what mine looks like:

```
~/.openclaw/workspace/
├── AGENTS.md          # Operating instructions
├── SOUL.md            # Personality, values, voice
├── USER.md            # Who I am, how I work
├── IDENTITY.md        # Agent's name and role
├── MEMORY.md          # Long-term curated memories
├── HEARTBEAT.md       # Periodic check-in tasks
├── TOOLS.md           # Environment-specific notes
├── memory/            # Daily journals
│   ├── 2026-02-02.md
│   ├── 2026-02-04.md
│   └── ...
└── skills/            # Custom skill definitions
    ├── beatbrain/
    ├── loooom/
    └── magerblog/
```

Every file here is plain text. Markdown. No database, no binary blobs, no proprietary format. This is deliberate — it means your agent's entire consciousness is `grep`-able, `diff`-able, and most importantly, `git`-able.

## The Simple Solution: Git

Your agent's brain is already a folder of text files. You know what's really good at syncing folders of text files across machines? Git.

### Step 1: Initialize and Push

On your current machine:

```bash
cd ~/.openclaw/workspace
git init
git add -A
git commit -m "🧠 initial brain state"
gh repo create my-agent-brain --private --source . --push
```

That's it. Your agent's brain is now backed up, versioned, and ready to clone anywhere.

### Step 2: Clone on the New Machine

On your new machine, after installing OpenClaw:

```bash
git clone git@github.com:yourname/my-agent-brain.git ~/.openclaw/workspace
```

Start OpenClaw. Your agent wakes up with all its memories intact.

### Step 3: Keep Them in Sync

If you're using both machines (laptop on the go, desktop at home), treat it like any Git workflow:

```bash
# Before switching machines
cd ~/.openclaw/workspace
git add -A && git commit -m "brain sync $(date +%Y-%m-%d)" && git push

# On the other machine
cd ~/.openclaw/workspace && git pull
```

You could even automate this with a cron job or a Git hook. Your agent already has a heartbeat system — imagine it committing and pushing its own memory updates during idle time.

## What About Secrets?

Your `TOOLS.md` might contain API keys or tokens. Your `MEMORY.md` might reference private conversations. Two options:

1. **Private repo** — the simplest. GitHub private repos are free and encrypted at rest.
2. **`.gitignore` sensitive files** — keep `TOOLS.md` out of the repo and manage it separately (copy manually, use a secrets manager, or encrypt it with `git-crypt`).

A `.gitignore` for the cautious:

```gitignore
TOOLS.md
.openclaw/
.env
*.key
```

## The Bigger Vision: Portable Agent Brains

Git works great, but it's a developer tool. What if you could do this?

```bash
npx openclaw-brain export --to brain-backup.tar.gz
npx openclaw-brain import --from brain-backup.tar.gz
```

Or even:

```bash
npx openclaw-brain push   # pushes to your configured remote
npx openclaw-brain pull   # pulls latest state
npx openclaw-brain diff   # shows what changed since last sync
npx openclaw-brain clone @mager/main-brain  # clone a brain template
```

Think about the possibilities:

- **Brain templates** — share your `SOUL.md` and `AGENTS.md` as a starter kit for others. "Here's my productivity-focused agent setup, fork it."
- **Multi-machine sync** — laptop, desktop, VPS, Raspberry Pi. Same agent, everywhere.
- **Brain snapshots** — before a big experiment, snapshot your agent's state. Roll back if things go sideways.
- **Team brains** — a shared workspace for a team's agent, with individual memory directories per person.

## What Doesn't Transfer

A few things are machine-specific and live outside the workspace:

- **OpenClaw config** (`~/.openclaw/openclaw.json`) — API keys, model settings, channel configs. You'll need to run `openclaw onboard` on the new machine or copy this separately.
- **Installed skills from ClawHub** — reinstall with `clawhub install <skill-name>`.
- **Channel connections** — Telegram, Discord, etc. need to be re-authenticated per machine.

The brain (workspace) is the *identity*. The config is the *body*. You're transplanting the brain — the body gets rebuilt.

## Why This Matters

We're at the beginning of something weird and wonderful. AI agents that accumulate context over time. That learn your preferences. That have *continuity*.

Right now, most people treat AI conversations as disposable. You chat, you close the tab, it's gone. But agents with persistent memory are different. They're more like... pets? Colleagues? The metaphor doesn't quite exist yet.

What I know is this: when I set up my Mac Mini today and my agent remembers our conversation from two weeks ago about [Loooom](https://loooom.xyz), remembers that my wife knits, remembers that I prefer code over prose — that's not just convenient. That's the future of human-computer interaction.

And all it took was `git push`.

---

*My agent's workspace is open source at [github.com/mager/openclaw-brain](https://github.com/mager/openclaw-brain). Feel free to fork it as a starting point for your own agent setup.*
