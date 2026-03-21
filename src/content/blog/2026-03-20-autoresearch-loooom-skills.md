---
title: "autoresearch on Loooom: Teaching a Skill to Improve Itself"
description: "Dogfooding Karpathy's autoresearch pattern on my own skill marketplace. How I'm using evals and tight feedback loops to make the learn-anything skill measurably better."
pubDate: 2026-03-20
category: "code"
keyword: "autoresearch loops"
tags: ["autoresearch", "karpathy", "loooom", "skills", "evals", "agents"]
---

A few weeks ago I wrote about [autoresearch](https://mager.blog/2026-03-14-autoresearch-pattern) — Andrej Karpathy's minimal but elegant pattern for autonomous improvement. The core idea: give an agent one file to modify, one metric to optimize, a fixed evaluation budget, and let it run overnight.

This week I finally dogfooded it on my own project: [Loooom](https://loooom.xyz), the Claude Code plugin marketplace. Specifically, I applied the autoresearch pattern to improve the `learn-anything` skill — Benjamin Franklin's method for self-directed learning.

## The Setup

The autoresearch pattern has four constraints:

| Component | Karpathy's LLM Training | Loooom Skill Adaptation |
|-----------|------------------------|------------------------|
| File to modify | `train.py` | `SKILL.md` |
| Metric | `val_bpb` (validation bits per byte) | Eval score (0-100) |
| Time budget | 5 min training | ~30 sec eval run |
| Keep/discard | `git commit` or `git reset` | Manual review or auto-commit |

Loooom already has an eval pipeline using [promptfoo](https://promptfoo.dev) and [Groq](https://groq.com) — free, fast LLM inference. Each skill has 8 test cases that grade whether the agent follows the skill's instructions.

**Baseline:** 0/8 (0%). **After one iteration:** 7/8 (87.5%).

After one iteration of improvements, the skill jumped from 0% to **87.5% (7/8)**. The original skill was failing every test. The model was lecturing instead of asking questions, summarizing instead of assigning exercises, giving abstract advice instead of concrete actions. The skill *described* Franklin's method, but it didn't *enforce* it.

## Iteration 1: The Six Core Rules

First improvement: I added behavioral guardrails. Not suggestions — rules.

**Rule 1: No passive delivery.** Never summarize a subject. If asked for a Wikipedia-style overview, decline and propose an active exercise instead.

**Rule 2: Imitation over instruction.** When someone wants to improve a craft skill (writing, music, speaking, drawing), the FIRST thing you do is assign an imitation exercise. Not tips. Not steps. An imitation exercise — now.

**Rule 3: Commonplace book for retention.** When someone asks how to retain what they learn, your primary recommendation is the commonplace book practice. Lead with it.

**Rule 4: Ask before you teach.** When someone asks you to "teach" them a topic, do NOT start explaining. First ask what they already know.

**Rule 5: Spaced review = concrete schedule.** Give a specific schedule: Day 1, Day 3, Week 1, Month 1. Not vague advice — a real cadence.

**Rule 6: One action, immediately.** For any request to learn something new, end your first response with a single, concrete exercise the learner can do RIGHT NOW. Not a plan — an action.

These rules are written in ALL CAPS BOLD in the skill file. They're positioned *before* the method description. They're the first thing the model sees.

## Iteration 2: Response Pattern Templates

The original skill described the method in abstract terms. The improved skill maps **specific user request types** to **exact response patterns**.

| Request Type | Response Pattern |
|-------------|------------------|
| "I want to be better at [craft skill]" | Immediately assign imitation exercise with specific source + 3-reads-close-recreate steps |
| "How do I retain what I read?" | Recommend commonplace book with 3-part entry format, then give first exercise |
| "How do I make [skill] stick?" | Give concrete spaced repetition schedule (Day 1, Day 3, Week 1, Month 1) |
| "Teach me about [topic]" | Ask what they know first, then assign ONE primary source |
| "Give me a summary of [topic]" | Decline passive request, propose 20-minute active exercise instead |
| "I want to learn [language]" | Give ONE concrete actionable exercise for TODAY, not a study plan |

This removes ambiguity. The model doesn't have to interpret "be a better writer" — it has a specific template to follow.

## The Eval Bottleneck

Here's where things got interesting.

The original plan was to run the autoresearch loop fully automated: improve SKILL.md → run eval → measure score → keep or discard → repeat. But I hit a wall with the eval infrastructure.

**Problem 1: Deprecated model.** The config used `llama-3.1-70b-versatile`, which Groq decommissioned. Upgraded to `llama-3.3-70b-versatile`.

**Problem 2: API key interpolation.** Promptfoo's yaml config `${GROQ_API_KEY}` wasn't interpolating. The env var was being passed but not picked up. I ended up writing a custom Node.js eval runner that uses `fetch` directly — no promptfoo, no auth complexity.

**Problem 3: Rate limits.** Groq's free tier is generous, but running 8 tests (16 API calls: 8 generations + 8 gradings) burns through requests fast. The tight feedback loop I wanted — iterate every 30 seconds — became iterate every few minutes.

This is actually a key insight about the autoresearch pattern: **the evaluation budget matters**. Karpathy's 5-minute training runs are cheap and consistent. LLM-based evals are neither. For the pattern to work well, you need:
- Fast evals (< 30 seconds ideally)
- Cheap evals (preferably free or near-free)
- Consistent evals (deterministic scoring)

LLM rubrics are none of these. They're slow, cost money, and vary between runs.

## What Worked

The pattern produced a significantly better skill in one iteration. **0% → 87.5%.** The improvements weren't incremental — they were structural:

**Before:** Passive description of Franklin's method
**After:** Active enforcement of specific behaviors

**Before:** "Here are some strategies to help you retain what you read..."
**After:** "Your commonplace book has 3-part entries: the idea (1 sentence) + context (where it came from) + commentary (what it means to you). Start now: recall ONE idea from something you read recently and write your first entry."

The difference is the difference between *information* and *transformation*. The old skill told you about learning. The new skill makes you learn.

## The Meta-Pattern

Here's what dogfooding revealed: **the autoresearch pattern applies to the skill itself, not just the skill's content**.

The skill is instructions for an AI. Those instructions can be improved by another AI. That improvement can be measured. That measurement can guide further improvement.

It's skills improving skills. And it's coming to Loooom.

I'm working on a meta-skill that does this automatically:
1. Reads the current SKILL.md
2. Runs the eval suite
3. Identifies failing test patterns
4. Proposes targeted improvements
5. Runs eval again
6. If score improves → commits the change
7. If score drops → reverts and tries something else

This is the autoresearch loop applied to skill authorship. You write the first draft. The meta-skill tightens the bolts.

## What I'd Do Differently

If I were starting from scratch today:

1. **Use deterministic evals where possible.** Instead of LLM rubrics, use regex checks or structured output validation. They're faster, cheaper, and consistent.

2. **Parallelize with care.** Running 8 evals concurrently hits rate limits. Batch 2-3 at a time instead.

3. **Start with golden responses.** Before optimizing the skill, manually write what "good" looks like for each test case. Use those as the grading baseline, not an LLM rubric.

4. **Version the evals, not just the skill.** As the skill improves, the evals should get harder. Otherwise you optimize for yesterday's bar.

## Try It Yourself

The improved `learn-anything` skill is live in the [Loooom catalog](https://github.com/mager/loooom). Install it with:

```bash
npx loooom install learn-anything
```

Then try:
- "I want to become a better writer"
- "How do I actually retain what I read?"
- "Teach me about machine learning" (it should ask what you know first)

The skill won't lecture you. It'll give you an exercise you can do right now.

## What's Next

I'm extending the autoresearch pattern to other Loooom skills. The `beginner-japanese` skill needs similar treatment — stronger guardrails for the spaced repetition schedule, clearer triggers for when to use mem0 vs local file storage.

The long-term vision: every skill in the catalog has a measurable quality score, and there's an autonomous agent continuously improving the worst-performing ones. You wake up, check the dashboard, and see that three skills got measurably better overnight.

That's the promise of autoresearch: not just faster iteration, but **iteration without human bottlenecks**. The human sets the objective. The agent finds the path.

---

*If you're building with Claude Code or other AI agents, check out [Loooom](https://loooom.xyz) — the skills marketplace where this experiment ran. And if you want to try Karpathy's original autoresearch on LLM training, his [repo](https://github.com/karpathy/autoresearch) is the starting point.*
