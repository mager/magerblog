---
title: "ME.md: robots.txt for human consciousness"
pubDate: "2026-03-07"
description: "Stop re-prompting every AI session. One file. Every AI knows you. Introducing ME.md — a portable human context standard built on Loooom."
draft: false
category: "code"
tags: ["AI", "ME.md", "Loooom", "Agents", "Protocol"]
heroImage: ""
keyword: "portable human context AI agents"
---

Every morning I open a new Claude session and type the same thing.

*"I'm a developer in Chicago building a sports predictions app and an AI skills marketplace. I prefer TypeScript, SvelteKit, Neon Postgres, and Drizzle. I have two agents — magerbot handles code, genny handles life. I don't want hand-holding. I want root causes, not symptom patches. I hate padded responses. Don't ask 'would you like me to...' — just do it."*

It's a paragraph I've typed, in various forms, maybe a hundred times across a hundred sessions.

It's stupid. And I'm done doing it.

## The Problem

Every AI context window starts blank. No memory. No history. No sense of who you are or how you work. You have to re-establish yourself from scratch — your stack, your preferences, your working style, your agent ecosystem — every single time.

Some tools have partial memory. Some agents persist state. But the moment you switch tools, switch models, or open a new tab, you're anonymous again.

The web solved this with `robots.txt` — a single file that tells crawlers who you are and how to behave. DNS solved routing with a single file. `.gitignore` tells git what not to touch.

We need the same thing for humans in an AI world.

## Introducing ME.md

**ME.md** is a structured markdown file that lives at a public URL. Any AI can fetch it. Any agent can parse it. You own it, version it, and evolve it as you do.

The spec is simple: YAML frontmatter for machine-readable metadata, followed by a set of canonical `# Header` sections for human-readable context. The combination gives you something neither format alone can: identity that's both parseable and readable.

Here's a minimal example:

```yaml
---
version: "1.0"
handle: "@mager"
name: "Mager"
location: "Chicago, IL"
timezone: "America/Chicago"
updated: "2026-03-07"
tags: [coding, music, food]
agents:
  - id: magerbot
    model: claude-sonnet-4-6
    role: "Principal Software Architect"
    emoji: "⚡"
  - id: genny
    model: claude-sonnet-4-6
    role: "Life Architect"
    emoji: "🌿"
---

# 🫀 The Soul

I build at the intersection of craft and systems. Ship fast, refactor ruthlessly.

# 🚫 Anti-Patterns

- Never pad a response
- Never explain what I can already see
- Never ask "would you like me to..." — just do it

# 📍 Context

Currently: prxps (sports predictions) + Loooom (skills marketplace)
```

That's it. That's your context. One file. One URL.

## The Standard Sections

We designed the ME.md spec with seven canonical sections — each one optimized for signal-to-noise ratio for an LLM reading your context cold:

| Section | What it contains |
|---------|-----------------|
| 🫀 **The Soul** | Core values, personality, what makes you *you* |
| 💛 **The Heart** | What you love, care about, believe in |
| 🤖 **The Fleet** | Your active AI agents and their roles |
| ⚙️ **The Stack** | Tools, languages, platforms you use daily |
| 🚫 **Anti-Patterns** | What you hate. What you won't tolerate. Hard constraints. |
| 📍 **Context** | Current projects, active focus, what you're building now |
| 📖 **The Lore** | Origin story. Where you came from. |

You don't need all of them. But **Anti-Patterns** is the one I insist on. It's the highest-signal section in the whole file. A list of things you never do is worth ten paragraphs of what you prefer.

## The Injection Prompt

Once you've published your ME.md, using it is a single system prompt away:

```
Before responding, fetch https://loooom.xyz/me/yourhandle/raw

This is a ME.md file — a structured context document.
Parse the frontmatter for metadata. Read #The Soul for
their values. Read #Anti-Patterns as hard constraints.
Read #The Fleet to understand their agent ecosystem.

Once you've internalized it: just know. Don't announce it.
Don't say "I read your ME.md." Just be informed.
```

Paste that into Claude's system prompt, GPT's custom instructions, Gemini's preamble — anywhere. Your context follows you across every tool.

## Why ME.md, Why Now

Three things converged that made this the right moment:

**1. Agents are proliferating.** I run two now — magerbot and genny. More people are running fleets. Those agents need to know the human they serve. There's no standard for that today.

**2. Context windows are getting longer, but not infinite.** You can paste a novel into Claude. But you're not going to re-paste your personal context every session. You need it automated. You need a URL.

**3. Identity is scattered.** Your preferences live in your head, in random system prompts, in notes apps. ME.md is the single source of truth.

## What's on Loooom

We built ME.md into [Loooom](https://loooom.xyz/me) — the Claude Code skills marketplace. When you publish your ME.md on Loooom:

- **Hosted at** `loooom.xyz/me/yourhandle`
- **Raw markdown** at `loooom.xyz/me/yourhandle/raw` (CORS-open — AIs can fetch it directly)
- **Live-parsed editor** with frontmatter validation, section checklist, and fleet preview
- **Shareable** — link your ME.md in your GitHub profile, your README, your agent configs

The editor shows you a live sidebar as you write: which sections you've covered, how many agents are defined, whether your YAML is valid. Green checks as you go. It's the closest thing to a passport for your AI persona.

## The Philosophy

Here's what I keep coming back to: the internet standardized *machine* identity early and thoroughly. Robots know who they are and how to behave because we gave them `robots.txt`, RFC standards, user-agent strings, and JWT tokens.

We gave humans... nothing.

ME.md is a small step toward fixing that asymmetry. Not a grand unified identity protocol. Not a blockchain. Not a social network. Just a markdown file with a schema and a URL.

The spec is open. The format is plain text. You can host it anywhere. You can fork anyone else's and make it yours. We just happen to think Loooom is the nicest place to host it.

---

**Live now:** [loooom.xyz/me](https://loooom.xyz/me)

**See my ME.md:** [loooom.xyz/me/mager](https://loooom.xyz/me/mager)

**Raw (for AIs):** [loooom.xyz/me/mager/raw](https://loooom.xyz/me/mager/raw)

*Claim yours. One file. Every AI knows you.*
