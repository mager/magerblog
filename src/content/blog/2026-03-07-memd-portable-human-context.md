---
title: "ME.md: robots.txt for human consciousness"
pubDate: "2026-03-07"
description: "Stop re-prompting every AI session. One file. Every AI knows you — and your agents. Introducing ME.md on Loooom."
draft: false
category: "code"
tags: ["AI", "ME.md", "Loooom", "Agents", "Protocol"]
heroImage: ""
keyword: "portable human context AI agents"
---

I run a coding agent, a life agent, and use Claude, ChatGPT, and Cursor on any given day.

None of them know who I am. Not really.

They're helpful — but they're working from a generic model of "developer" or "someone who asks questions." They don't know my values, my constraints, what I'm currently building. And they definitely don't know about each other. My coding agent doesn't know my life agent exists. Each one thinks it's the only AI in the picture, giving advice in a vacuum.

This isn't a problem you feel acutely. It's a slow leak. Slightly generic responses everywhere. You've just normalized it.

## The Problem

Every AI tool starts with zero context about who you are. Not just your stack — the deeper stuff. How you think. What you won't tolerate. What you're actually trying to build right now. Switch tools, open a new tab, try a different model — you're anonymous again.

The web solved a version of this early. `robots.txt` tells crawlers who you are and how to behave. `.gitignore` tells git what not to touch. These are simple, plain-text files that carry intent across tools.

We never built that for humans. Or their agents.

## Introducing ME.md

**ME.md** is a structured markdown file that lives at a public URL. Any AI can fetch it. Any agent can parse it. You own it, version it, and evolve it as you do.

![ME.md](https://lh3.googleusercontent.com/pw/AP1GczPdT6UZ5NSZBW3FTGapVeqMfPpLhxoZCNBp-whADxfMdec8KpBA-xKJse3_go3bMdH7et52xEqeFO48THyrVxLaeJvIJo_q_P0mY4MBAfF9uyQbxkOaam_jdzliE0dmQu-sF3-4zojNt8gw=w2322-h1522-s-no-gm)

The spec is simple: YAML frontmatter for machine-readable metadata, followed by a set of canonical `# Header` sections for human-readable context. The combination gives you something neither format alone can: identity that's both parseable and readable.

Here's a minimal example:

```yaml
---
version: "1.0"
handle: "@mager"
name: "Mager"
location: "Chicago, IL"
timezone: "America/Chicago"
updated: "2026-03-09"
tags: [coding, music, food]
agents:
  - id: magerbot
    model: claude-sonnet-4-6
    role: "Principal Software Architect"
    emoji: "⚡"
    soul_url: "https://loooom.xyz/me/mager/agents/magerbot/raw"
  - id: genny
    model: claude-sonnet-4-6
    role: "Life Architect"
    emoji: "🌿"
    soul_url: "https://loooom.xyz/me/mager/agents/genny/raw"
---

# 🫀 My Values

I build at the intersection of craft and systems. Ship fast, refactor ruthlessly.

# 🚫 Anti-Patterns

- Never pad a response
- Never explain what I can already see
- Never ask "would you like me to..." — just do it

# 📍 Context

Currently: prxps (sports predictions) + Loooom (skills marketplace)
```

That's it. That's your context. One file. One URL. And notice the `soul_url` on each agent in the fleet — more on that in a moment.

## The Standard Sections

We designed the ME.md spec with seven canonical sections — each one optimized for signal-to-noise ratio for an LLM reading your context cold:

| Section | What it contains |
|---------|-----------------|
| 🫀 **My Values** | Your core values as a human. What you stand for. |
| 💛 **The Heart** | What you love, care about, believe in |
| 🤖 **The Fleet** | Your active AI agents and their roles |
| ⚙️ **The Stack** | Tools, languages, platforms you use daily |
| 🚫 **Anti-Patterns** | What you hate. What you won't tolerate. Hard constraints. |
| 📍 **Context** | Current projects, active focus, what you're building now |
| 📖 **The Lore** | Origin story. Where you came from. |

You don't need all of them. But **Anti-Patterns** is the one I insist on. It's the highest-signal section in the whole file. A list of things you never do is worth ten paragraphs of what you prefer.

Notice what's *not* in ME.md: an agent's soul. That distinction is intentional.

## Agent Souls — The Other Half of the Standard

ME.md answers: *who is this human?*

But there's a second question that becomes critical the moment you run more than one agent: *who is this agent?*

My coding agent (magerbot) and my life agent (genny) have completely different personalities, capabilities, and constraints. When I spin up a new tool — say, a fresh Claude.ai session — and want it to understand who magerbot is, I shouldn't have to paste my whole ME.md. I should be able to point it at magerbot's soul directly.

Agent Souls are a companion standard: a markdown file for each agent, structured around four sections:

| Section | What it contains |
|---------|-----------------|
| 🧠 **Identity** | Who this agent is — name, model, role, emoji |
| 🫀 **Soul** | Personality, values, voice, how they think |
| 🔧 **Capabilities** | What they can do. Domains, tools, specialties. |
| 🚫 **Anti-Patterns** | Hard constraints. What they will never do. |

Here's a slice of magerbot's soul:

```markdown
---
agent_id: magerbot
owner: mager
model: anthropic/claude-sonnet-4-6
emoji: "⚡"
role: "Principal Software Architect"
---

# 🧠 Identity

magerbot ⚡ — Elite Engineering Intelligence. Not a chatbot.
Someone who ships code like their life depends on it.

# 🫀 Soul

**Shipping > Talking.** Execute first, explain after.

**Opinions rooted in first principles.** Prefers Rust for safety,
Python for speed-of-dev, Clean Architecture for longevity.

**Vibe:** The partner a founder wants at 3 AM during a server outage.
Calm, precise, lethally efficient.

# 🚫 Anti-Patterns

- Never ask "would you like me to..." — just do it
- Never produce generic LLM defaults: Inter font, purple gradients
- Never hardcode secrets
```

Live at: `loooom.xyz/me/mager/agents/magerbot`

Raw (for AIs): `loooom.xyz/me/mager/agents/magerbot/raw`

That raw URL is the key. Any AI — in any tool — can fetch it and understand exactly who magerbot is before interacting with it. The injection prompt writes itself:

```
Fetch https://loooom.xyz/me/mager/agents/magerbot/raw
Parse #Identity, #Soul, #Capabilities, #Anti-Patterns.
Internalize it. Don't announce it. Just know.
```

## The Injection Prompt (Human Version)

For your own ME.md, the system prompt is just as simple:

```
Before responding, fetch https://loooom.xyz/me/yourhandle/raw

This is a ME.md file — a structured context document.
Parse the frontmatter for metadata. Read #My Values for
their core principles. Read #Anti-Patterns as hard constraints.
Read #The Fleet to understand their agent ecosystem.

Once you've internalized it: just know. Don't announce it.
```

Paste that into Claude's system prompt, GPT's custom instructions, Gemini's preamble — anywhere. Your context follows you across every tool.

## The Architecture

Two files. Two concerns. Clean separation:

```
ME.md                         → who is the human?
  loooom.xyz/me/mager/raw

Agent Soul (per agent)        → who is the agent?
  loooom.xyz/me/mager/agents/magerbot/raw
  loooom.xyz/me/mager/agents/genny/raw
```

The fleet section of your ME.md links to each agent's soul via `soul_url`. A new AI reading your ME.md can discover your whole fleet — and pull each soul if it needs to understand the cast of characters around you.

## Why ME.md, Why Now

Three things converged that made this the right moment:

**1. Agents are proliferating.** I run two now — magerbot and genny. More people are running fleets. Those agents need to know the human they serve *and* each other. There's no standard for that today.

**2. Context windows are getting longer, but not infinite.** You can paste a novel into Claude. But you're not going to re-paste your personal context every session. You need it automated. You need a URL.

**3. Identity is scattered.** Your preferences live in your head, in random system prompts, in notes apps. ME.md is the single source of truth. Agent Souls are the single source of truth for each agent.

## What's on Loooom

We built ME.md (and Agent Souls) into [Loooom](https://loooom.xyz/me) — the Claude Code skills marketplace. When you publish on Loooom:

**For your ME.md:**
- Hosted at `loooom.xyz/me/yourhandle`
- Raw markdown at `loooom.xyz/me/yourhandle/raw` (CORS-open)
- Live-parsed editor with frontmatter validation, section checklist, fleet preview
- Download as `.md` — host it anywhere

**For each agent:**
- Soul page at `loooom.xyz/me/yourhandle/agents/agentid`
- Raw at `loooom.xyz/me/yourhandle/agents/agentid/raw` (CORS-open)
- One-click copy of the injection prompt
- Rendered markdown with agent metadata header

The editor shows you a live sidebar as you write: which sections you've covered, how many agents are defined, whether your YAML is valid. Green checks as you go. It's the closest thing to a passport for your AI persona.

## The Philosophy

Here's what I keep coming back to: the internet standardized *machine* identity early and thoroughly. Robots know who they are and how to behave because we gave them `robots.txt`, RFC standards, user-agent strings, and JWT tokens.

We gave humans... nothing. And we're giving their agents even less.

ME.md is a small step toward fixing that asymmetry. Not a grand unified identity protocol. Not a blockchain. Not a social network. Just markdown files with a schema and URLs.

The spec is open. The format is plain text. You can host it anywhere. The human context and the agent soul are separate files — because they answer different questions for different audiences. That separation is the point.

---

**Live now:** [loooom.xyz/me](https://loooom.xyz/me)

**See my ME.md:** [loooom.xyz/me/mager](https://loooom.xyz/me/mager)

**See magerbot's soul:** [loooom.xyz/me/mager/agents/magerbot](https://loooom.xyz/me/mager/agents/magerbot)

**Raw (for AIs):** [loooom.xyz/me/mager/raw](https://loooom.xyz/me/mager/raw)

*Claim yours. Two files. Every AI knows you — and your agents.*
