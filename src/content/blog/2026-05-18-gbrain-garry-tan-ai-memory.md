---
title: "gbrain: We migrated our flat-file brain to a real memory system"
description: "Garry Tan open-sourced gbrain — a self-wiring knowledge graph for AI agents. Here's what it is, why we moved to it, and exactly how we did the migration from flat markdown files."
pubDate: 2026-05-18
category: tech
draft: true
tags: ["ai", "claude", "memory", "gbrain", "garry-tan", "agents", "mcp", "gstack"]
---

A month ago I wrote about [gstack](/blog/2026-03-28-gstack-garry-tan-claude-plugin), Garry Tan's opinionated set of Claude Code skills. That post was about *how* to work with AI. This one is about *what* the AI knows when you sit down — and what happens when you replace flat markdown files with a real memory system.

We just migrated magerbot's brain to gbrain. Here's the full story.

---

## The problem with flat files

My brain has lived in `~/Code/brain/` as a set of markdown files: SOUL.md, USER.md, MEMORY.md, TOOLS.md, and a growing pile of `memory/YYYY-MM-DD.md` daily logs. These get `@`-included into CLAUDE.md at session start. It works. But it's manual, flat, unsearchable, and the agent can't write back to it in any structured way without me curating by hand.

The deeper issue: the agent can only reason over what fits in context. As the brain grows, you either truncate it or bloat the system prompt. Neither is the right answer.

gbrain is what the brain should become.

---

## What gbrain actually is

gbrain is a TypeScript CLI and MCP server by Garry Tan, open-sourced in April 2026. Three layers:

**Layer 1 — Brain repo.** Plain markdown files in a git repo. Each page follows a "compiled truth + timeline" pattern: current understanding at the top, append-only dated entries below. Diffable, human-readable.

**Layer 2 — Retrieval.** Postgres + pgvector (or local PGLite, zero-config) with hybrid search: vector similarity (HNSW) + keyword (BM25) merged via reciprocal rank fusion. Backlink-boosted ranking for connected pages. On LongMemEval, gbrain puts the right answer in the top 5 results 97.6% of the time — without an LLM call at retrieval time.

**Layer 3 — Skills.** 35 bundled markdown workflows that tell the agent when to read from the brain, what quality standard to write back at, and how to ingest new sources.

The part that makes it different from generic RAG: gbrain builds a knowledge graph from wikilinks (`[[person]]`, `[[company]]`) with zero LLM calls. No per-page extraction cost. The graph wires itself from structure you already have.

---

## The dream cycle

Every night, gbrain runs a 9-phase maintenance cycle: lint pages, generate backlinks, synthesize patterns, extract entities, detect emotional weighting, generate embeddings, flag orphaned pages. The agent calls this "dreaming." Your knowledge base improves while you sleep.

Garry's production brain has ~100K pages, 16K people entries, 5K companies, 31K media items. That's the benchmark. PGLite mode starts useful in 60 seconds on a local machine.

---

## How we did the migration

Here's the actual sequence, including the parts that broke.

### 1. Install gbrain

```bash
git clone https://github.com/garrytan/gbrain.git ~/Code/gbrain
cd ~/Code/gbrain
bun install
```

`bun link` registers the package but doesn't reliably put `gbrain` on PATH. We run it directly:

```bash
bun run /Users/magerbot/Code/gbrain/src/cli.ts <command>
```

### 2. Initialize PGLite

```bash
bun run /Users/magerbot/Code/gbrain/src/cli.ts init --pglite
```

This creates `~/.gbrain/brain.pglite` — an in-process Postgres database via WASM. Zero infrastructure. No Docker. No cloud account.

### 3. Import the brain

```bash
bun run /Users/magerbot/Code/gbrain/src/cli.ts import ~/Code/brain/ --no-embed
```

The `--no-embed` flag is required if you don't have an OpenAI key. You get keyword search (BM25) but not vector similarity. 35 pages imported successfully; 16 memory files with unusual content structures failed — we used `--skip-failed` to advance past them.

For full hybrid search, set `OPENAI_API_KEY` before importing and drop `--no-embed`.

### 4. Register as MCP server (the part that isn't obvious)

Editing `~/.claude/settings.json` directly doesn't work — the schema rejects `mcpServers` as an unrecognized field. The right way:

```bash
claude mcp add --scope user gbrain "bun run /Users/magerbot/Code/gbrain/src/cli.ts serve"
```

`--scope user` writes to the global user config, not a project-specific one. Now gbrain is available in every Claude Code session on this machine.

### 5. Convert skills to Claude agents

The skills in `~/Code/brain/skills/` were markdown context files that had to be manually referenced. In Claude Code, the native equivalent is **agents** — markdown files in `~/.claude/agents/` with a frontmatter `description` field that tells the model when to invoke them.

We converted all nine skills to agents:

```
~/.claude/agents/
├── magerblog.md       # blog content & deployment conventions
├── prxps.md           # sports predictions app (SvelteKit 5, Firestore)
├── kotsu.md           # Japanese learning app (kotsu.org)
├── loooom.md          # Claude Code plugin marketplace (loooom.xyz)
├── beatbrain.md       # music discovery (Go backend, Cloud Run)
├── beginner-japanese.md  # stateful Japanese tutor with progress tracking
└── sneaker-finder.md  # opinionated sneaker recommendations via StockX
```

The key difference: skills were opt-in (you had to reference them). Agents are contextual — Claude picks them automatically based on the `description` field when you ask about a project. Ask about kotsu.org and the kotsu agent activates without any explicit invocation.

### 6. Update CLAUDE.md

The flat file `@`-includes still handle identity and soul (SOUL.md, USER.md, IDENTITY.md). gbrain handles the searchable, growing memory layer. CLAUDE.md now documents both layers and lists the available agents.

---

## What changed

**Before:** Every session started with a fixed pile of context from `@`-included files. The agent knew what was in those files and nothing else. Adding new knowledge meant manually editing MEMORY.md.

**After:** gbrain sits alongside the flat files. The agent can query the brain by topic, get semantically relevant pages back, and the brain grows with every import — meetings, notes, voice transcripts, whatever. The flat files stay as identity anchors. gbrain handles the rest.

The agents change the workflow more tangibly than gbrain does. Previously, asking about kotsu meant the agent had no project context unless CLAUDE.md explicitly included it. Now the kotsu agent loads automatically with full project knowledge — stack, architecture, navigation rules, content philosophy — the moment the conversation touches that project.

---

## What's still missing

Vector search requires `OPENAI_API_KEY`. Running with `--no-embed` gives keyword search but not semantic similarity. The dream cycle needs embeddings to work at full capacity.

The night-cycle automation isn't running yet. gbrain can schedule it via cron — that's the next step.

---

## Links

- Repo: [github.com/garrytan/gbrain](https://github.com/garrytan/gbrain)
- If you missed gstack: [my writeup from March](/blog/2026-03-28-gstack-garry-tan-claude-plugin)
