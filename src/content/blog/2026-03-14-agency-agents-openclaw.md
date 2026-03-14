---
title: "agency-agents: I Hired 145 AI Specialists to Run My Company"
description: "mager.co is no longer just a blog. It's a corporation. Here's how I staffed it with 145 specialized AI agents using agency-agents and OpenClaw."
date: 2026-03-14
draft: true
category: ai
tags: [ai, agents, openclaw, mager-co, agency-agents]
---

I've been thinking about this wrong.

For the past year, `mager.co` has been pointing at my blog. A personal landing page. *Hi, I'm Mager, I write stuff sometimes.* That framing undersells what's actually happening here.

mager.co is a company. I run four products — [magerblog](https://magerblog.com), [beatbrain](https://beatbrain.xyz), [prxps](https://prxps.app), and [loooom](https://loooom.xyz) — and I'm the only human employee. I don't have time to manage each one deeply. That's not a complaint; it's an architecture problem. And I solve architecture problems with code.

So this week I hired 145 people. None of them eat. None of them sleep. All of them specialize.

## The Agency

[agency-agents](https://github.com/msitarzewski/agency-agents) is an open-source collection of 145 specialized AI agent personalities built for Claude Code, OpenClaw, Cursor, and a handful of other agentic tools. Frontend developers. Backend architects. Growth hackers. SEO specialists. Content creators. Reality checkers. Each one is a markdown file — a SOUL.md equivalent — with a distinct identity, workflows, and deliverables.

The framing that clicked for me: *assembling a dream team, except they never sleep, never complain, and always deliver.*

That's the exact pitch for mager.co.

## Installing on OpenClaw

OpenClaw has native support. Each agent becomes its own workspace with `SOUL.md`, `AGENTS.md`, and `IDENTITY.md`. The install is three commands:

```bash
# Clone the repo
git clone https://github.com/msitarzewski/agency-agents.git ~/Code/agency-agents
cd ~/Code/agency-agents

# Generate OpenClaw workspaces
./scripts/convert.sh --tool openclaw

# Install (registers each agent in openclaw.json)
./scripts/install.sh --tool openclaw

# Restart gateway to activate
openclaw gateway restart
```

That's it. 145 agents converted, registered, and live. No config editing. No YAML gymnastics. magerbot just asked me for the GitHub URL, cloned it, and handled the rest.

## The mager.co Org Chart

Here's how I'm thinking about the division of labor:

**magerblog** — The voice of the company.
- 📝 **Content Creator** — editorial calendar, drafts, storytelling
- 🐦 **Twitter Engager** — distributing posts, joining conversations
- 🔍 **SEO Specialist** — making sure people can find us
- 🎭 **Brand Guardian** — keeping the voice consistent

**beatbrain** — Music discovery, needs technical + growth love.
- 🤖 **AI Engineer** — Melodex v2 scoring algorithm, Spotify integration
- 🏗️ **Backend Architect** — API design, Firestore cleanup, TTL
- 🚀 **Growth Hacker** — user acquisition loops
- 📊 **Analytics Reporter** — what's working, what isn't

**prxps** — Sports predictions, active shipping.
- 🎨 **Frontend Developer** — SvelteKit 5 components, UI polish
- 🏗️ **Backend Architect** — Neon Postgres, Drizzle schema
- ⚡ **Rapid Prototyper** — fast feature spikes
- 🔍 **Reality Checker** — production readiness gates

**loooom** — The plugin marketplace / ME.md hub.
- 🎨 **UI Designer** — design system, component library
- 🤝 **Reddit Community Builder** — authentic dev community engagement
- 📱 **App Store Optimizer** — discoverability (if we ever ship an app)
- 🛠️ **Developer Advocate** — plugin docs, DX, community

**mager.co (the parent)** — Client work, third-party projects.
- 👔 **Senior Project Manager** — scope management, realistic timelines
- 🎬 **Studio Producer** — portfolio oversight, strategic alignment
- ⚙️ **Studio Operations** — day-to-day efficiency, process
- 💰 **Finance Tracker** — keeping the lights on

## The Private Repo

The agent config, custom personality tweaks, and project-specific context files aren't public. That's the secret sauce — the way I've wired each agent's SOUL.md to know *this* codebase, *this* product, *this* audience.

If you want to replicate this, the public starting point is exactly what I described above. The differentiation is in what you customize after installation.

Think of agency-agents as hiring a staffing agency. They provide qualified candidates. You onboard them to your specific culture.

## How Activation Actually Works

This is the question worth answering directly: does magerbot just *know* which agents to call? Does installing them mean they're running in the background, working autonomously?

No. And that's the right design.

Installation makes agents *available*, not active. Think of it like adding contractors to your company directory — they're on call, not on the clock 24/7. Activation is always intentional.

There are three ways an agent gets invoked:

**1. You direct it explicitly.**
```
"Use the Reality Checker before we ship this prxps update."
"Have the Content Creator draft a thread about the beatbrain redesign."
```
magerbot spawns that agent as a subagent session, passes it the relevant context, and returns results.

**2. magerbot orchestrates based on task context.**
When you drop a complex task — "build the new prxps scoring page" — magerbot can decompose it and spin up the right specialists. Frontend Developer for the SvelteKit component. Backend Architect if there's schema work. Reality Checker before calling it done. This is multi-agent orchestration, and it only fires when the parent task warrants it.

**3. Codified workflows.**
For repeating patterns — "every blog post gets SEO review" or "every deploy gets a Reality Checker pass" — you can wire those into OpenClaw cron jobs or heartbeat tasks. The Studio Operations agent is literally designed for this: maintaining process, not just completing tasks.

The 145 agents are a roster. magerbot is the coordinator who knows when to pull someone in. You're the founder who sets the mandate.

What you don't get (yet) is fully autonomous agents running independently — each product's agent waking up on its own schedule and working in parallel. That's the next frontier. For now: intentional invocation, coordinated by magerbot, with you setting the direction.

## What Comes Next

Right now this is infrastructure. The immediate next steps:

1. **Assign agents to projects** — wire specific agents into each codebase's Claude Code sessions
2. **mager.co homepage refresh** — position it as the parent company, not the blog
3. **Client intake flow** — when someone hires mager.co, the Studio Producer agent kicks off scoping
4. **Agent roster page** — public-facing "meet the team" (the ones I want people to see)

The vision is this: mager.co is a one-person company that operates like a ten-person team. Not because I'm working harder — because I've built systems that work while I'm not.

That's the real unlock of agent-native development. It's not "AI writes my code." It's "I run a company and the company employs specialists."

---

*agency-agents: [github.com/msitarzewski/agency-agents](https://github.com/msitarzewski/agency-agents)*  
*OpenClaw: [openclaw.ai](https://openclaw.ai)*
