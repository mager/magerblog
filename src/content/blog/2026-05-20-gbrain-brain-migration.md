---
title: "gbrain: Migrating My AI Brain From Flat Files to Semantic Memory"
description: "How I moved magerbot's brain from @-imported markdown files into gbrain's Postgres-native semantic memory layer — what broke, what the gotcha was, and why the context model is fundamentally better."
pubDate: 2026-05-20
category: tech
keyword: "gbrain"
draft: false
tags: [gbrain, ai, memory, claude-code, magerbot]
---

The flat-file brain worked. I want to say that clearly before explaining why I replaced it.

`~/Code/brain/` held everything the session needed to know: IDENTITY.md, SOUL.md, USER.md, MEMORY.md, TOOLS.md, HEARTBEAT.md, WATCHLIST.md, and a `memory/` directory with about thirty episodic entries dated like `2026-02-21-brainpack-launch.md`. CLAUDE.md pulled them all in with `@`-imports:

```markdown
@~/Code/brain/IDENTITY.md
@~/Code/brain/SOUL.md
@~/Code/brain/USER.md
@~/Code/brain/MEMORY.md
@~/Code/brain/TOOLS.md
@~/Code/brain/HEARTBEAT.md
@~/Code/brain/WATCHLIST.md
```

Every Claude Code session started with all of that inlined into the system prompt, unconditionally. It was readable, portable, and versioned in git. It also loaded every episodic memory entry whether or not the session needed them.

That's the problem. Flat-file context loading is O(n): as the brain grows, the system prompt grows with it. You either accept the bloat or start curating what gets imported — which is manual work that scales badly. The right answer is a brain that retrieves relevant context, not one that dumps everything up front.

gbrain was already installed and registered as an MCP server on this machine. I just hadn't migrated to it. This post is the story of actually doing it.

---

## What gbrain gives you

gbrain is a TypeScript CLI and MCP server by Garry Tan. The storage layer is PGLite — embedded Postgres via WASM, running in-process at `~/.gbrain/brain.pglite`. No server, no Docker, no cloud account.

Retrieval is hybrid: vector similarity (HNSW via pgvector) merged with keyword search (BM25) using reciprocal rank fusion. The relevant pages surface; irrelevant ones don't touch the context window. The brain can grow to thousands of pages without the system prompt growing with it.

There's also a wikilink graph built zero-shot — no LLM calls at import time. `[[prxps]]` inside any page creates a backlink. The graph informs ranking. It wires itself from structure you already have.

---

## The migration

### 1. Write each file as a page

gbrain's `put` command takes a slug and reads content from stdin:

```bash
cd ~/Code/gbrain
bun run src/cli.ts put identity < ~/Code/brain/IDENTITY.md
bun run src/cli.ts put soul < ~/Code/brain/SOUL.md
bun run src/cli.ts put user < ~/Code/brain/USER.md
bun run src/cli.ts put memory/index < ~/Code/brain/MEMORY.md
bun run src/cli.ts put tools < ~/Code/brain/TOOLS.md
bun run src/cli.ts put heartbeat < ~/Code/brain/HEARTBEAT.md
bun run src/cli.ts put watchlist < ~/Code/brain/WATCHLIST.md
```

The slug becomes the page's primary key and lookup handle. `memory/index` nests under `memory/`, which is where the episodic entries will live.

### 2. Migrate the episodic entries

Thirty files in `~/Code/brain/memory/`, each named with a date and a short descriptor. A loop handles them:

```bash
for f in ~/Code/brain/memory/*.md; do
  slug="memory/$(basename "$f" .md)"
  bun run src/cli.ts put "$slug" < "$f"
done
```

Each file lands as its own page: `memory/2026-02-21-brainpack-launch`, `memory/2026-03-07-memd-portable-human-context`, and so on.

### 3. The gotcha

The command above looks obvious. What doesn't work is this:

```bash
# WRONG
cat ~/Code/brain/memory/2026-02-21.md | cd ~/Code/gbrain && bun run src/cli.ts put memory/2026-02-21
```

A `cd` inside a pipeline subshell doesn't change the working directory for the subsequent command in the same chain. The pipe and `&&` are parsed left-to-right, so `bun` runs from the wrong directory and can't find `src/cli.ts`.

The correct pattern is to `cd` first in its own step, then redirect stdin directly:

```bash
cd ~/Code/gbrain && bun run src/cli.ts put "$slug" < "$f"
```

Or stay in `~/Code/gbrain` for the whole migration and reference brain files by absolute path. Either works. Mixing `|` with `cd` in the same chain doesn't.

### 4. Update CLAUDE.md

The old CLAUDE.md had seven `@`-imports. The new version removes all of them and replaces them with a documented query interface:

```markdown
## Memory — gbrain (primary)

**gbrain** is the semantic memory layer and single source of truth.
Installed at `~/Code/gbrain/`, registered as an MCP server.
Database at `~/.gbrain/brain.pglite`.

### Core pages (always relevant)
- `identity` — who magerbot is, role, philosophy
- `soul` — operating principles, design philosophy, voice
- `user` — Mager's profile, preferences, tech stack
- `memory/index` — long-term memory index (start here for context)
```

Nothing loads unconditionally anymore. The session knows the page slugs and fetches what it needs:

```bash
bun run src/cli.ts get identity
bun run src/cli.ts query "prxps predictions bug"
bun run src/cli.ts get memory/2026-03-07-memd-portable-human-context
```

The MCP server exposes the same operations as tool calls, so the session can retrieve pages without shelling out.

---

## Skills vs. agents

One thing the migration clarified: the `~/Code/brain/skills/` directory was redundant.

The old brain had markdown files for each sub-project — magerblog, kotsu, prxps, loooom — written as context to be injected when the topic came up. Useful at the time. But Claude Code has a proper native equivalent: agents defined in `~/.claude/agents/` with a frontmatter `description` field. The session auto-invokes the right agent when the conversation touches the relevant project.

The skills directory and the agents directory described the same things. The agents directory was already the canonical version. The brain skills are still on disk — but they're deprecated in practice. The agents in `~/.claude/agents/` are what the session actually uses.

---

## What changed in practice

Before: every session started with the full flat-file contents inlined, whether the session was about prxps, magerblog, Japanese study, or nothing in particular. A session debugging a CSS issue carried the full BeatBrain project history in context for no reason.

After: identity and soul load unconditionally (they're short, they're always relevant). Everything else is retrieved on demand. The brain can accumulate entries indefinitely without the session prompt growing. `gbrain query "japan trip planning"` pulls the relevant travel notes; a session about something else doesn't see them.

The query mechanism also changes how the brain gets written. Flat files required manual curation — edit MEMORY.md, add a dated section, commit. gbrain accepts a `put` with a well-chosen slug. New entries don't require touching old ones.

---

## What's not done yet

Vector search requires an OpenAI API key for embedding generation. Without it, retrieval falls back to keyword search (BM25), which is still useful but misses semantic matches. I haven't set the key yet — keyword search is handling the current load.

The dream cycle (gbrain's nightly maintenance pass: backlinks, entity extraction, embeddings, orphan detection) isn't scheduled. That's the next step. The brain improves while you sleep, but only if you wire the cron.

The flat files in `~/Code/brain/` are still there. I'll keep them as a backup until I'm confident the gbrain queries surface everything they used to. After a few weeks of using the retrieval path, I'll archive them.

---

The migration took about an hour including debugging the pipeline gotcha. The brain is larger than it was, the session prompt is smaller, and the retrieval model actually scales. The flat files did their job for three months. gbrain is what comes next.
