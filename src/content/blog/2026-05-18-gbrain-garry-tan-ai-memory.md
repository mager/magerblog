---
title: "gbrain: Garry Tan gave AI agents a real memory"
description: "A month after gstack, Garry open-sourced gbrain — a self-wiring knowledge graph that lets agents remember everything across sessions. Here's how it works and how I'd use it on my own projects."
pubDate: 2026-05-18
category: tech
draft: true
tags: ["ai", "claude", "memory", "gbrain", "garry-tan", "agents", "mcp", "gstack"]
---

A month ago I wrote about [gstack](/blog/2026-03-28-gstack-garry-tan-claude-plugin), Garry Tan's opinionated set of Claude Code skills — 28 slash commands that put a CEO, staff engineer, security auditor, and QA lead inside your editor. That post was about *how* to work with AI. This one is about *what* the AI knows when you sit down.

gbrain is the memory system Garry open-sourced in April 2026. It solves the thing that makes persistent AI agents frustrating: they're smart inside a session and amnesiac the moment it ends.

---

## The problem it solves

Every conversation with an AI agent starts cold. It doesn't know your preferences, your past decisions, the context behind the project, or who you are. You either re-explain everything each time or you stuff a pile of context into the system prompt and hope it fits.

The Markdown brain files I keep in `~/Code/brain/` are my workaround — SOUL.md, USER.md, MEMORY.md — loaded at session start through `@` includes in CLAUDE.md. It works. But it's flat files, there's no search, nothing gets automatically enriched, and the agent can't write back to it in a structured way without me curating manually.

gbrain is what that should become.

---

## What it actually is

gbrain is a TypeScript CLI and MCP server. At its core, three layers:

**Layer 1 — The brain repo.** Plain markdown files in a git repo. Each page follows a "compiled truth + timeline" pattern: a summary of current understanding at the top, append-only dated entries below. Diffable, version-controlled, readable by a human who opens a text editor.

**Layer 2 — Retrieval.** Postgres + pgvector (or local PGLite, zero-config) with hybrid search: vector similarity (HNSW) + keyword (BM25) merged via reciprocal rank fusion, with backlink-boosted ranking for connected pages. On LongMemEval, the public benchmark, gbrain puts the right answer in the top 5 results 97.6% of the time — without an LLM call at retrieval time. $0.50 per thousand queries.

**Layer 3 — Skills.** 35 bundled markdown workflows that tell the agent *when* to read from the brain, *what* quality standard to write back at, and how to ingest new sources. The agent skills are auditable and editable — you can see exactly what behavioral rules are governing the memory system.

The part that makes it different from generic RAG: gbrain builds a knowledge graph on top of the markdown by extracting typed relationships from wikilinks (`[[person]]`, `[[company]]`) with zero LLM calls. No per-page extraction cost, no hallucinated edges. The graph wires itself from the structure you already have in your notes.

---

## The dream cycle

Every night, gbrain runs a 9-phase maintenance cycle on the brain: lint pages, generate backlinks, synthesize patterns, extract entities, detect emotional weighting, generate embeddings, flag orphaned pages. The agent calls this "dreaming." Your knowledge base improves while you sleep.

Garry's production brain has ~100K pages, 16K people entries, 5K companies, 31K media items — ingested from meetings, emails, tweets, voice notes, and calendar events. That's the benchmark. But gbrain's PGLite mode starts useful in 60 seconds on a local machine.

---

## How someone would actually use it

```bash
git clone https://github.com/garrytan/gbrain.git
cd gbrain && bun install && bun link
gbrain init
gbrain import ~/notes/
gbrain query "what themes show up across my notes?"
```

That gets you the CLI. For Claude Code or Cursor, you add it as an MCP server:

```bash
claude mcp add gbrain "$(which gbrain) serve"
```

From there, the agent can search the brain before answering, write structured updates back after conversations, and run ingestion skills on new inputs (meeting transcript, article, voice note). The compounding effect is the point — the brain gets denser with every session.

---

## How I'd use it on my projects

**magerbot:** This is the obvious one. Right now my brain is flat markdown files with a manual curation step. gbrain would give it semantic search, automatic enrichment, and the dream cycle. Instead of me deciding what goes in MEMORY.md, the agent synthesizes patterns itself. The brain becomes less of a file I maintain and more of a living system.

**Kotsu:** The Japanese learning app already tracks what characters a user has learned in Firebase. gbrain could sit alongside that — not for progress tracking, but for the *reasoning layer*. Which concepts is this user struggling with? What mnemonics have landed for them? What patterns keep tripping them up? An agent with gbrain could give genuinely personalized feedback instead of generic session context.

**prxps:** Sports predictions is all about historical patterns and user preference. gbrain could hold a model of each user's tendencies — what sports they track, what their reasoning style looks like, which predictions they've been confident about vs. hedging on. The agent becomes a second analyst who actually knows the user's history.

**Loooom:** Plugin discovery is a matching problem. If the agent knows your stack, your working style, and what you've already installed, it can recommend skills that are actually relevant instead of serving the full catalog. gbrain gives the agent a profile to reason against.

---

## Why Garry keeps shipping this stuff

I've been following Garry's AI tooling releases closely since gstack dropped. The pattern is consistent: he builds the thing he actually needs for his own workflow, ships it as open source, MIT licensed, and moves on. gbrain is the memory system behind the same setup he's using to ship tens of thousands of lines of production code per week while running YC full-time.

That's the useful signal. This isn't a VC-backed memory startup with a managed cloud tier and a growth team. It's a working system someone built for themselves that happens to be releasable. Those tend to have the rough edges of real use rather than the polish of something designed to demo well.

The fact that the skills layer is plain markdown means you can read exactly what the agent is doing with your knowledge. No black box. The fact that it uses PGLite locally means there's nothing to spin up. The fact that it benchmarks well ($0.50/1K queries, 97.6% recall) means it's not just a philosophy — there's a concrete tradeoff being made.

---

## Getting started

- Repo: [github.com/garrytan/gbrain](https://github.com/garrytan/gbrain)
- If you missed gstack: [my writeup from March](/blog/2026-03-28-gstack-garry-tan-claude-plugin)

I'm going to run gbrain against my existing brain files this week and see how the retrieval holds up against my current `@include` approach. Will report back.
