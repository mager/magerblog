---
title: "What gbrain's May tells us about agent memory"
description: "Garry Tan's gbrain added multi-client MCP, hit v0.40.6, and kept articulating a thesis worth taking seriously: compounding knowledge systems as personal moat."
pubDate: 2026-05-27
category: tech
draft: true
tags: ["ai", "agents", "memory", "gbrain", "garry-tan"]
---

I've been on sabbatical and mostly ignoring the AI news cycle, but one signal I keep returning to is Garry Tan's public work on gbrain. Not because it's the only thing happening in agent memory, but because Tan is building in the open, shipping regularly, and actually articulating what he's trying to do. That combination makes it a useful read on where serious practitioners are going.

I've been following this thread for a while. Earlier posts on this blog cover the backstory in more depth: [gbrain: We migrated our flat-file brain to a real memory system](/blog/2026-05-18-gbrain-garry-tan-ai-memory/), [gbrain: Migrating My AI Brain From Flat Files to Semantic Memory](/blog/2026-05-20-gbrain-brain-migration/), and [gstack: Garry Tan's Claude Setup Is 🔥](/blog/2026-03-28-gstack-garry-tan-claude-plugin/). This post focuses on what May added.

## What gbrain actually is

gbrain launched April 10, 2026 and pulled 5,400 stars in the first 24 hours. The pitch is in the tagline: "the brain layer your AI agent has been missing." What that means in practice is a markdown-first, Postgres-backed knowledge layer that ingests meetings, emails, tweets, and notes, then auto-extracts a typed knowledge graph — people, companies, relationships, dates — without any LLM calls for the graph extraction itself. That last part is worth pausing on. The knowledge graph is built from structured parsing, not from asking a model to interpret your data. That's a meaningful design choice: it's faster, more deterministic, and cheaper to run at scale.

The retrieval layer uses hybrid search — vector embeddings, BM25 keyword matching, and Reciprocal Rank Fusion to merge results from both. The benchmark number is 97.6% top-five accuracy on LongMemEval.

LongMemEval ([arxiv.org/abs/2410.10813](https://arxiv.org/abs/2410.10813)) is worth understanding if you're evaluating memory systems. It's a benchmark for long-term memory in chat assistants: 500 curated questions embedded in realistic user-assistant chat histories, testing across up to 1.5M tokens of context. The evaluation covers five specific memory abilities — information extraction, multi-session reasoning, temporal reasoning, knowledge updates, and abstention (knowing when you don't know). The baseline problem it exposes is striking: commercial chat assistants and long-context LLMs show roughly a 30% accuracy drop when asked to recall information across sustained multi-session interactions. That's not a model quality problem. It's an architecture problem — systems without persistent memory have to re-derive context from scratch every session, and they fail at the seams.

That 30% gap is the problem gbrain is designed to address. Persistent, queryable memory rather than relying on context window recall. The 97.6% top-five accuracy benchmark is a direct response to that baseline. Tan's own production numbers add texture: 146,646 pages ingested, 24,585 people tracked, 5,339 companies, 66 cron jobs running autonomously. The system exposes 74 tools through an MCP server, which means it integrates directly with Claude Code, Cursor, and Windsurf without any custom glue code.

## The thin harness, fat skills philosophy

The companion repo, gstack, gives this stack an organizing philosophy captured in `docs/ethos/THIN_HARNESS_FAT_SKILLS.md`. The phrase "fat skill fat code thin harness" is easy to scan past, but it's worth actually unpacking.

**Thin harness** means the orchestration layer — Claude Code, OpenClaw, Hermes, whatever you use to route agent requests and manage tool calls — should be minimal. Just enough to route requests and invoke tools. Don't build complex logic into the harness itself. If your orchestration layer is doing heavy lifting, that's a sign you've put business logic in the wrong place.

**Fat code** means the actual code your agents write and execute should do the real work. The agent isn't a UI wrapper — it's writing and running programs. The computation lives in the code, not in the agent's reasoning loop.

**Fat skill** is the most counterintuitive piece. The SKILL.md files — documents that encode domain knowledge, reasoning patterns, and step-by-step behaviors for a specific role or task — should be your primary investment. A well-crafted skill can move a small model to frontier-level performance on a specific task. This is what the SkillOpt work has been demonstrating: the skill file as the unit of optimization, not the model and not the system prompt. A thin, vague skill wastes the model's potential; a precise, detailed one concentrates it.

The philosophy inverts how most teams approach agent building. The default is to over-engineer the orchestration — add routing layers, state machines, retry logic, complex prompt chaining — and under-invest in the skills. The claim here is that you have the priorities backwards. Get the skill right first. Keep the harness light.

## What changed in May: multi-client MCP and gstack v1.26.3.0

The most important technical development from May is PR #1399: multi-client MCP via socket multiplexer and stdio proxy. Before this, each agent process that wanted to connect to gbrain needed its own instance. Now multiple agents can share a single gbrain instance simultaneously. PR #1408 followed immediately with a concurrency fix — `pg_advisory_lock` acquire and release on the same backend connection via `pool.reserve()` — which is exactly the kind of locking correctness issue you'd expect to surface once multiple clients start hitting the same data layer at the same time.

This matters for anyone running gbrain in a real agentic setup. If you have a coding agent, a research agent, and a scheduling agent all running in parallel — which is increasingly just what "using AI" looks like for people building in this space — you want them reading from and writing to a shared knowledge layer, not three separate ones. The multi-client architecture makes that possible without duplicating state or running separate databases per agent.

gstack reached v1.26.3.0 on May 4, 2026 with a cluster of meaningful additions. The `/sync-gbrain` skill added code indexing and cross-machine sync. A native code-surface orchestrator landed. Monorepo VERSION paths are now configurable via `--version-path` and a `.gstack/version-path` config (PR #1627). PR #1626 fixed a Cmd+Q regression on managed Chromium that was stopping the supervisor from respawning. PR #1622 addressed a gbrain-sync `sourceLocalPath` handling bug.

The `/setup-gbrain` and `/sync-gbrain` pair is worth calling out specifically. Together they give agents per-repo trust policies: read-write, read-only, or deny. That's a meaningful capability when you're running multiple agents against a shared knowledge base — you're not handing every agent full access to everything you've ever ingested. The trust model exists at the skill layer rather than requiring custom access control code in the harness, which is consistent with the fat-skill philosophy.

gstack is currently sitting at 89.7K stars.

## May's GitHub landscape

gbrain and gstack don't exist in isolation. Looking at GitHub trending in May 2026, the pattern is hard to miss.

OpenClaw went from 9K to 210K+ stars in 2026 — a headless agent harness that's become the default orchestration layer for a lot of teams. Hermes hit 105K+ stars as an autonomous agent framework. Ollama is at 165K+ — local model execution is now a first-class consideration rather than an edge case. Langflow and Dify are at 146K and 136K respectively — visual agent builders for teams that aren't writing harness code themselves. And `mattpocock/skills` was trending this past week at +1,618 stars in seven days, which is a skill library in the explicit gbrain/gstack tradition.

The aggregate picture: May 2026's GitHub trending leaderboard is dominated by infrastructure for agents — memory, context compression, local execution, and skills. Not new models. Not new chat UIs. The stack around the model is where the commits are going.

Projects this blog has covered directly: [gstack](/blog/2026-03-28-gstack-garry-tan-claude-plugin/), [gbrain](/blog/2026-05-18-gbrain-garry-tan-ai-memory/), [OpenHuman](/blog/2026-05-25-openhuman-explainer/), [SkillOpt](/blog/2026-05-26-skill-evals-skillopt/).

The aggregate star count for that top tier of agent infrastructure repos is somewhere around 290K, with roughly 73K new stars in a single week in May. That's not a trend in its early innings.

## Getting started

If you want to actually run these tools rather than just track them, here's the shortest path.

For gbrain:

```bash
# Install and scaffold
npx gbrain@latest init

# Connect your first sources (interactive)
npx gbrain@latest connect gmail
npx gbrain@latest connect notion

# First fetch (runs automatically every 20min after this)
npx gbrain@latest fetch

# Query your knowledge base
npx gbrain@latest query "what did I discuss with the design team last week"
```

For gstack inside Claude Code:

```bash
# Install gstack skills into your Claude Code setup
npx gstack@latest install

# Wire in gbrain for persistent memory
/setup-gbrain    # one-time setup
/sync-gbrain     # sync on new machines or repos
```

The two are designed to work together. gstack gives you the skill layer, gbrain gives you the memory layer, and the MCP server is the bridge that makes both available to any compatible agent. The setup is opinionated but not exotic — if you're already using Claude Code, you can have both running in under twenty minutes.

## The open question

What I find genuinely compelling about the gbrain + gstack combination is that it's an attempt to build something that compounds. Your knowledge base gets richer over time. Your skill files get more refined. The agents that run against both get more effective. That's a different model than using a hosted AI product that resets its context every session and never learns your domain.

The open question I keep returning to: how fragile is this in practice? Ingesting your email, meetings, and tweets into a personal knowledge graph that 74 MCP tools can query is powerful if the retrieval is good and the graph stays coherent. It's expensive to debug if it isn't. The LongMemEval benchmark is encouraging, but benchmarks and production systems diverge in ways that are usually invisible until they aren't. The gbrain-evals repo suggests Tan is taking this seriously. How it holds up at scale across diverse data sources — noisy emails, inconsistent note formats, duplicate entries from multiple sources — is still something to watch.

Tan's framing on X has been consistent: "compounding AI systems" as a personal moat, process power as something anyone can build for themselves. He claims his 2026 coding pace is roughly 810x his 2013 baseline. I don't know how to independently verify that figure — the methodology matters enormously for a claim like that — but the underlying idea is more defensible than the specific number. If you build systems that learn from everything you do and accumulate structured knowledge over time, the compounding effect is real even if it's hard to put a precise multiplier on.

v0.40.6.0 dropped May 23. The development pace is fast, the architecture decisions are deliberate, and the thesis is coherent. That's enough to keep paying attention.
