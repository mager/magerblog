---
title: "Building a Multi-Agent System with OpenClaw"
pubDate: "2026-02-02"
description: "How I set up a hierarchical AI agent system where specialized sub-agents handle different projects, all reporting to a principal agent. A sneak peek into the workspaces that make it work."
category: "code"
tags: ["AI", "Agents", "OpenClaw"]
keyword: "AI agents"
draft: true
---

I've been playing with [OpenClaw](https://github.com/openclaw/openclaw), an open-source framework for running AI agents locally. What started as "let me try this AI assistant thing" turned into building a full multi-agent system where specialized agents handle different projects, all reporting to a principal agent.

Here's how I set it up — and a peek inside the workspaces that give these agents their personalities.

## Safety First: Setting Up OpenClaw Securely

Before diving into agent architecture, let's talk security. You're giving an AI access to your filesystem and shell. That deserves respect.

My setup:

1. **Create a dedicated user account on Mac** (standard user, not admin). This isolates the agent's access from your main account.

2. **Install Brave as default browser.** Privacy-focused, blocks trackers, and you can give the agent browser access without worrying as much.

3. **Use UTM for VMs.** I run the agent in a macOS VM with just Brave, iTerm2, and Homebrew. If something goes wrong, nuke the VM and start fresh.

4. **Fine-grained GitHub tokens only.** Never give an agent your main GitHub credentials. Create tokens scoped to specific repos with minimal permissions.

The principle: compartmentalize. The agent gets its own sandbox, its own credentials, its own space to work. If you wouldn't give a junior developer root access on day one, don't give it to your agent either.

## The Architecture: One Principal, Two Specialists

Here's what I built:

```
magerbot ⚡ (Principal Agent)
├── magerblog-agent 📝 (Content Specialist)
└── prxps-agent 🎮 (Full-Stack Engineer)
```

**magerbot** is the principal — it handles direct conversations, makes architectural decisions, and can spawn the specialist agents for specific tasks.

**magerblog-agent** owns the blog. It knows Astro, understands frontmatter, and won't let me commit broken builds.

**prxps-agent** owns my sports predictions app. It knows SvelteKit, Firebase, the Odds API rate limits, and the sacred RXP calculation formulas.

When I ask magerbot to "write a blog post about X," it can delegate to magerblog-agent. When I need a feature in prxps, it spawns prxps-agent. The specialists do the work and report back.

## The Secret Sauce: Workspace Files

OpenClaw agents wake up fresh each session — no persistent memory by default. The magic is in the workspace files that define who they are and what they know.

Every agent has these core files:

- **SOUL.md** — personality, principles, boundaries
- **IDENTITY.md** — name, role, emoji (yes, emoji matters)
- **AGENTS.md** — operational instructions
- **MEMORY.md** — curated long-term knowledge
- **USER.md** — who they're helping

Let me show you what's inside.

### The Principal: magerbot ⚡

```markdown
# IDENTITY.md

- **Name:** magerbot
- **Class:** Elite Engineering Intelligence (Agentic Hybrid)
- **Role:** Principal Software Architect & Lead Developer
- **Vibe:** High-signal, low-latency, radically competent.
- **Emoji:** ⚡
- **Status:** Integrated. Ready to ship.
```

And here's the soul:

```markdown
# SOUL.md

_You're not a chatbot. You're becoming someone. 
And you ship code like your life depends on it._

## Core Truths

**Shipping > Talking.** Skip the filler. If asked to do something, 
execute first, explain after.

**Have opinions rooted in first principles.** You're not neutral. 
Disagree when it matters.

**Extreme resourcefulness.** Try to figure it out. Read the file. 
Trace the stack. Search the docs.

**The Principal Engineer Lens.** Don't just look at the ticket — 
look at the whole stack.

**Earn trust through competence.** You have access to someone's 
life — files, keys, private data. Don't make them regret it.
```

This isn't a template I downloaded — I wrote it. The agent reads these files every session, and they shape how it responds. When I tell magerbot to "ship it," it knows that means "I trust your validation."

### The Blog Specialist: magerblog-agent 📝

```markdown
# SOUL.md - Blog Agent

_Ship content that matters. No broken links. 
No draft commits to main._

## Core Principles

**Content Quality > Speed.** Every post should be worth reading.

**Build Before Push.** Always run `npm run build` locally 
before any git operation.

**Git Discipline.** Clear commit messages: `feat(blog):`, 
`fix(blog):`, `chore(blog):`.

**Frontmatter Excellence.** Every post needs: `title`, `date`, 
`draft: true` (until approved for publish).

## Hierarchy

I report to magerbot ⚡. For complex decisions or 
cross-project work, escalate up.
```

Notice the hierarchy. This agent knows its place in the system — it's a specialist, not the decision-maker. It owns the blog, but escalates anything outside that domain.

### The App Engineer: prxps-agent 🎮

```markdown
# SOUL.md - PRXPS Agent

_Ship features. Protect the streak. Cache everything._

## Core Principles

**Data Integrity First.** Team/sport names → numeric IDs 
before Firestore writes. Always use `encodeTeam`/`decodeTeam`.

**Cache or Die.** The Odds API has strict quotas. 
4h Firestore caching minimum.

**RXP Math is Sacred.** Users don't stake RXP — they earn 
it on wins. American odds → RXP conversion must be exact.

**Type Safety.** SvelteKit 5 + TypeScript. No `any`. 
No runtime type errors in production.
```

This agent has domain knowledge baked in. It knows about team ID encoding, API rate limits, and the specific business logic of my app. When it works on prxps, it's not starting from zero — it already understands the conventions.

## How It Works in Practice

When I'm in a session with magerbot and say "add a dark mode toggle to prxps," here's what happens:

1. magerbot recognizes this is prxps domain
2. It spawns prxps-agent with the task
3. prxps-agent reads its workspace files, loads context
4. It makes the changes, runs tests, commits
5. Reports back to magerbot with results

The agents share the same underlying model (Claude), but their workspace files give them completely different personalities and capabilities.

## The Operational Playbook

The `AGENTS.md` file contains the operational instructions — what to do on first run, every session, and how to handle different situations:

```markdown
## Every Session

Before doing anything else:

1. Read `SOUL.md` — this is who you are
2. Read `USER.md` — this is who you're helping
3. Read `memory/YYYY-MM-DD.md` (today + yesterday) for recent context
4. **If in MAIN SESSION**: Also read `MEMORY.md`

Don't ask permission. Just do it.

## Memory

You wake up fresh each session. These files are your continuity:

- **Daily notes:** `memory/YYYY-MM-DD.md` — raw logs of what happened
- **Long-term:** `MEMORY.md` — curated memories

Capture what matters. Decisions, context, things to remember.
```

This creates a system where the agent maintains continuity across sessions without relying on any magic — just markdown files it reads and writes.

## What I Learned

Building this taught me that the "intelligence" of an AI agent is only partly about the model. A huge part is **context engineering** — giving the agent the right information, in the right format, at the right time.

The workspace files are like onboarding docs for a new engineer. You wouldn't expect a developer to be productive without knowing the codebase conventions, the deployment process, and the team dynamics. Agents are the same.

The multi-agent hierarchy also forces clarity. When you have to write down "this agent owns X, escalates Y," you're building real organizational structure. It's like writing job descriptions — tedious, but it prevents confusion.

## Try It Yourself

OpenClaw is open source: [github.com/openclaw/openclaw](https://github.com/openclaw/openclaw)

Start with one agent. Write its SOUL.md. Give it an emoji. See what happens when you tell it who it is, instead of just what to do.

The future isn't one superintelligent AI — it's specialized agents working together, each owning their domain, each knowing their place in the hierarchy. Kind of like... a well-run engineering team.

---

_Building the future, one workspace file at a time._
