---
title: "brainpack: Move Your AI Agent's Entire Brain to a New Computer in 60 Seconds"
pubDate: "2026-02-21"
description: "Your AI agent has memories, skills, and a personality. Here's how to pack it all up and ship it to a new machine — and why your agent's brain should be version-controlled."
category: "code"
tags: ["AI", "OpenClaw", "Agents", "Git", "DevOps", "brainpack"]
keyword: "brainpack openclaw brain transplant migrate agent"
heroImage: ""
draft: false
---

I'm getting a Mac Mini delivered today. My AI agent — the one I've been building a relationship with for weeks — lives on my MacBook. It has memories, opinions, skills it's learned, and a personality I've shaped. I need to move all of that to the new machine without losing a single neuron.

This is the AI equivalent of a brain transplant.

And here's the thing — this isn't just an [OpenClaw](https://openclaw.ai) problem. Whether you're using Claude Projects, Cursor rules, Windsurf, custom GPTs, or any agentic setup, you probably have a folder of files somewhere that define how your AI thinks. That's your agent's brain. And right now, there's no standard way to pack it up and move it.

## What Is the "Brain"?

No matter what platform you're on, your agent's brain is a collection of text files that give it identity and context. In OpenClaw, it's the **workspace** (`~/.openclaw/workspace/`). In Cursor, it's your `.cursor/rules/`. In Claude Projects, it's your project knowledge files. Same concept, different directories.

Here's what mine looks like (OpenClaw):

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

## brainpack: The Tool I'm Building

Git works great, but wrapping raw Git commands every time you switch machines is tedious. And it's Git — not everyone's cup of tea.

So I'm building [**brainpack**](https://github.com/mager/brainpack) — a platform-agnostic CLI that makes agent brain portability a first-class operation. It doesn't care if you're running OpenClaw, Cursor, Claude Projects, or a custom setup. If your agent's brain is a folder of files, brainpack can manage it.

```bash
npx brainpack init          # initialize your workspace as a brainpack
npx brainpack push          # commit + push to your configured remote
npx brainpack pull          # pull latest brain state
npx brainpack snapshot      # tag a named snapshot you can roll back to
npx brainpack diff          # see what changed since last sync
npx brainpack export        # export as a .tar.gz for offline transfer
npx brainpack import brain.tar.gz  # import on a new machine
```

Think about the possibilities:

- **Brain templates** — share your `SOUL.md` and `AGENTS.md` as a starter kit for others. `npx brainpack clone @mager/main-brain` and you've got a working agent personality in seconds.
- **Multi-machine sync** — laptop, desktop, VPS, Raspberry Pi. Same agent, everywhere. One `brainpack pull` and you're current.
- **Brain snapshots** — before a big experiment, `brainpack snapshot "pre-experiment"`. Roll back if things go sideways.
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

*[brainpack](https://github.com/mager/brainpack) is open source. My agent's workspace is at [github.com/mager/openclaw-brain](https://github.com/mager/openclaw-brain) — fork it as a starting point for your own agent setup.*
