---
title: "My AI Has a Brain Now"
pubDate: "2026-02-23"
description: "The problem: Every session, my AI wakes up fresh. The worse problem: Even when AI tools do remember, they trap it in proprietary black boxes. So I built a brain that follows me across tools."
category: "code"
tags: ["AI", "OpenClaw", "brainpack", "mem0", "Claude Code"]
draft: true
---

**The problem:** Every session, my AI wakes up fresh. No memory of yesterday's decisions, no context on my preferences, no clue that I hate cilantro or that my wife knits. It's Groundhog Day with better autocomplete.

**The worse problem:** Even when AI tools *do* remember, they trap it in proprietary black boxes. Cursor's memory doesn't talk to Claude Code. OpenClaw's context doesn't sync to my phone. I wanted a brain that follows me across tools.

So I built one.

## The Architecture

Two layers. Not complicated.

### Layer 1: Files (GitHub)
Structured source of truth. Lives in `~/.openclaw/workspace/` and pushes to a repo every morning at 6 AM.

- `MEMORY.md` — Long-term facts, project context, lessons learned
- `WATCHLIST.md` — TV shows and movies to watch
- `AGENTS.md`, `SOUL.md`, `USER.md` — Who I am, who the AI is, how we work
- Project specs, skills, heartbeat handlers

**Why files:** Portable. Diffable. Works offline. Any AI can read them. I own them completely.

### Layer 2: Cloud (mem0)
Conversational memory layer. Semantic search. Cross-session, cross-tool.

When I say "my wife knits" or "ship it means I trust you" — that goes to mem0. Next time I mention "my wife" in Claude Code or Cursor, the context is there. No file bloat, no manual curation.

**Why cloud:** Fuzzy retrieval. Natural language. Ephemeral facts that don't deserve a file.

## How It Works

**Daily sync:** OpenClaw cron fires `brainpack_push` at 6 AM CST. Stages, commits, pushes. If the machine explodes, my brain is on GitHub.

**Real-time memory:** During conversations, key facts auto-sync to mem0. User ID: `mager`. Searchable from any session.

**Skill integration:** My `beginner-japanese` skill uses both — mem0 for conversational progress, local file for structured lesson state. Falls back gracefully if the cloud is down.

## The Tools

- **brainpack** — Platform-agnostic CLI for managing AI brains (16 platforms supported)
- **OpenClaw** — Gateway daemon handling cron, messaging, session routing
- **mem0** — Memory layer for AI agents (cloud or self-hosted)

## What Changed

Before: "What was that show you recommended?" → Blank stare.

After: I mention "my wife" and the AI knows the yarn metaphor in Loooom is personal. I say "ship it" and it knows not to ask for confirmation. I ask about Japan and it remembers I'm learning Japanese for a trip in two months.

The AI stopped being a chatbot. It became a partner with continuity.

## The Code

```bash
# Daily brain sync
openclaw cron add \
  --name "brain-sync" \
  --cron "0 6 * * *" \
  --tz "America/Chicago" \
  --system-event "brainpack_push"

# HEARTBEAT.md handles the event:
# 1. git add -A
# 2. git commit -m "🧠 daily brain sync $(date +%Y-%m-%d)"  
# 3. git push
```

mem0 is just HTTP:

```bash
curl -X POST https://api.mem0.ai/v1/memories/ \
  -H "Authorization: Token $MEM0_API_KEY" \
  -d '{"messages": [...], "user_id": "mager"}'
```

## The Philosophy

Your AI's personality shouldn't be trapped in a vendor's database. The core of what makes *your* agent yours — its memory, instructions, context — should be portable, versionable, and platform-independent.

Files for structure. Cloud for context. Own your brain.

---

*Repo: [github.com/mager/openclaw-brain](https://github.com/mager/openclaw-brain)*  
*brainpack: `npm install -g @mager/brainpack`*
