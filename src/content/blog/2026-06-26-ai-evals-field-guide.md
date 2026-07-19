---
title: "Evals: a plain-English map of the types worth knowing"
description: "Everyone says 'evals' and means ten different things. Here's a quick tour of the main types — what each one checks, and when it's worth the cost."
pubDate: 2026-06-26
updatedDate: 2026-07-19T12:00:00-05:00
category: tech
draft: false
keyword: "evals"
tags: ["ai", "evals", "agents", "testing", "llm-as-judge"]
---

If you've been anywhere near people building with LLMs lately, you've heard the word *evals* thrown around like everyone agrees on what it means. They don't. One person means a unit test. Another means an LLM grading tone on a 1–5 scale. A third means a leaderboard. They're all "evals," and the word does almost no work on its own.

I went looking for a clean mental model and found the [awesome-evals playbook](https://github.com/benchflow-ai/awesome-evals/blob/main/PATTERNS.md). It's good, and it's dense — a real reference, not a quick read. This post is the version I wish I'd had first: a plain-English map of the main types, what each checks, and when it's worth the cost. Everything below is drawn from that playbook; go there when you want the depth.

## One idea to hold onto

Start from real failures, not generic metrics. The instinct is to reach for a fancy LLM judge scoring everything 1–10. That's backwards. The right move is to look at what's actually breaking, then reach for the *cheapest* check that catches it.

There's a rough hierarchy of cost and signal:

1. **Code assertions** (free) — no model call, no drift.
2. **Reference checks** (cheap) — exact match, regex, deterministic comparison.
3. **LLM judges** (expensive) — 100+ labeled examples, ongoing maintenance, real coordination cost.

Climb that ladder only when the cheaper rung can't catch the failure you actually have. Build expensive evaluators only for problems you'll iterate on repeatedly.

## TL;DR

| Eval type | What it checks | Cost |
|-----------|----------------|------|
| Error analysis | What's actually breaking (do this first) | Low |
| Code assertions | Format, syntax, side effects | Free |
| Trajectory / tool-use | Right tools, right order | Low–moderate |
| Outcome / state | Did the world actually change | Moderate |
| LLM-as-judge | Subjective quality (tone, faithfulness) | Expensive |
| CI gating / regression | Fixed bugs stay fixed | Low |
| pass@k vs pass^k | Capability vs reliability | Free |
| Synthetic data | Coverage before you have real traffic | Low |
| Skill evals | Whether an attached skill actually lifts the agent | Moderate |
| Verifiable rewards | Programmatic success that doubles as RL signal | Free-ish |
| Contamination-resistant | Reasoning vs memorization | Low |

## Start here: error analysis

This one isn't a metric. It's the move everything else flows from, and most people skip it.

Take 20–100 real traces. Have one person who knows the domain write a plain-text note on the first thing that went wrong in each. Cluster those notes into 4–8 failure categories. Then prioritize by frequency × severity × how much it matters to the business. Build one narrow check per top failure.

The reason this comes first: you can't write a good evaluator for a failure you haven't seen. The playbook's worked example is an apartment-leasing assistant where date handling was failing 66% of the time — far and away the biggest problem, and invisible until someone read the traces. Fixing that one thing took it to 95%. No generic metric would have pointed there.

As a bonus, those hand-written failure notes become the few-shot examples for your judges later. It's a flywheel.

## Code assertions: the cheap stuff, first

Plenty of failures don't need a model to detect them. Unsubstituted `{{placeholder}}` text. Malformed JSON. A number outside its valid range. An email that was supposed to send and didn't. A database row that should exist and doesn't.

These are deterministic. A few lines of code catch them, they never drift, and they cost nothing to run. Do them before anything fancier.

One sharpening worth internalizing: assert on the *state of the world*, not just the transcript. "Did the `send_email` tool actually fire?" is a better question than "did the reply say it sent the email?" Models will happily claim success they didn't achieve.

## Trajectory evals: did it take the right steps?

For agents that call tools, correctness is partly about the *path* — did it pick the right tools, with the right arguments, in a sensible order?

Two flavors:

- **Deterministic match** — compare the agent's tool-call sequence against a reference. Cheap and reproducible, but it only credits the one path you wrote down. The playbook notes rule-based matching can miss ~44% of genuinely valid runs because the agent took a different-but-correct route.
- **LLM-judge-of-trajectory** — ask a model whether the steps were reasonable toward the goal. This credits alternative paths, but it over-credits too, rubber-stamping runs that didn't actually work.

Neither is great alone. Which is why the next one matters.

## Outcome evals: did the world actually change?

The highest-fidelity question you can ask: did the end state come out right? Was the refund issued, the reservation booked, the row written — regardless of how the agent got there?

You grade this by snapshotting the environment before and after and diffing against a known-good end state, rather than reading the transcript. One benchmark reloads a fresh database, replays the reference solution, hashes the entire datastore, and passes the agent only if its final hash matches. Any path that lands the same correct state passes; the transcript is irrelevant.

This needs more infrastructure (you need an environment you can snapshot), but it's the signal that's hardest to game.

> **The grading fidelity ladder.** Text grading < trajectory grading < outcome grading. "Did the chat say *done*?" is easiest to fake. "Were the right tools called?" is better, but penalizes valid alternate routes. "Did the database actually change?" is the strongest and most path-agnostic. Climb as high as your infrastructure allows.

## LLM-as-judge: for the subjective stuff

Some things genuinely need judgment — tone, faithfulness to a source, whether an answer is helpful. Code can't check those, so you use a model as the grader. This is powerful and it's where most of the cost and most of the mistakes live.

A few rules from the playbook that match what I've seen:

- **Build the judge from your error analysis, not your imagination.** The real signal is in concrete pass/fail examples with expert reasoning, not a rubric stuffed into a system prompt.
- **Make it binary.** Pass/fail, not 1–5. Fuzzy scales produce fuzzy, unactionable numbers.
- **Validate it against human labels before you trust it.** A judge is a model; it can be wrong. I wrote about this validation loop in more depth in my [promptfoo post](/blog/2026-02-23-promptfoo-llm-validation) and again in [SkillOpt](/blog/2026-05-26-skill-evals-skillopt) — get past ~85% agreement with humans on *your* task before you let a judge gate anything.

### The gotcha worth remembering

Don't validate a judge on raw accuracy or raw agreement. On imbalanced data — where most cases pass and failures are rare — a judge can rubber-stamp everything PASS, score 90% agreement, and catch *zero* real failures. The aggregate number looks great and means nothing.

Instead, measure two things separately:

- **True-positive rate** — of the real failures, how many did the judge catch?
- **True-negative rate** — of the real passes, how many did it correctly clear?

Ship only when both are high. The playbook cites factual-consistency judges hitting >95% precision on clean cases but only 30–60% recall on the inconsistent ones — exactly the failures you built the judge to find, slipping through while the headline accuracy looks fine.

## CI gating and regression sets: keep wins from rotting

Every bug you fix is a future regression waiting to happen. The discipline: when you fix something, add the input that triggered it as a test case, in the same change. Version-control your eval cases as plain files, run the suite on every PR, and fail the build if the pass rate drops below threshold.

Keep two buckets separate: an *offline* set (curated golden and regression cases) that gates merges, and *online* evals that sample live production traffic to catch drift. One protects the code you're about to ship; the other watches the system you already shipped.

## pass@k vs pass^k: capability vs reliability

Same model, two very different questions, and people conflate them constantly.

- **pass@k** — out of k tries, does *at least one* succeed? This measures capability. It goes *up* with more attempts.
- **pass^k** — out of k tries, do they *all* succeed? This measures reliability. It goes *down* with more attempts.

A model with a 75% per-attempt success rate has a pass@10 of basically 1.0 and a pass^10 of about 5.6%. Same model, opposite stories. If you're building a customer-facing agent, reliability (pass^k) is the number that matters, and it's brutal. Always say which one you mean.

## Synthetic data: when you have no traffic yet

Before launch you have no production traces to build an eval set from. So generate them — but carefully.

Define your dimensions (features × scenarios × personas), then generate test cases *one at a time* across those combinations. Bulk "give me 50 examples" collapses into a few repetitive shapes. Ground every generated input in real system state — real IDs, real rows, real tool schemas — so the case is actually triggerable, then run it once to confirm it hits the scenario you intended. Throw away the ones that don't.

## Skill evals: does the skill actually help?

*Added July 19, 2026 — this type barely had a name when I first published this post. It has one now, and real numbers behind it.*

Agent skills — the SKILL.md-style procedural docs you attach to Claude Code and its cousins — are prompts, and prompts rot. A skill eval treats the *skill* as the unit under test: run the same task set with the skill loaded and without, hold the model constant, and measure the lift. Everything else in this post grades the agent's output; this one grades an artifact you wrote.

The reason it now deserves its own row is that the numbers came in, and they're spikier than the ecosystem's enthusiasm suggests. [SkillsBench](https://arxiv.org/abs/2602.12670) — 84 tasks across 11 domains, graded by deterministic verifiers so there's no judge variance — found curated skills lift average pass rate by about +16 points. The aggregate hides the interesting parts. Healthcare tasks jumped +52 points while software engineering gained +4.5, and 16 of the 84 tasks got *worse* with skills loaded. Two findings worth pinning to any skill repo: compact, focused skills beat comprehensive ones (+18.8 vs −2.9 points — exhaustive documentation is a liability, not a moat), and skills the model generated for itself were net *negative* (−1.3). You can't ask the agent to synthesize its own expertise and skip the curation step.

There's also a gap between lab and field. A [follow-up benchmark](https://arxiv.org/abs/2604.04323) dropped agents into a pile of ~34,000 real community skills instead of hand-picking the right ones, and most of the benefit eroded: force-loading curated skills scored 55.4% on its hardest setting, while realistic retrieval from the noisy pile landed at 38.4% against a 35.4% no-skills baseline. Agents loaded every relevant skill in only about half their runs, and weaker models actively followed irrelevant skills off a cliff. The uncomfortable implication: your skill can be excellent and still lose to discovery. The name, description, and triggering metadata are part of the artifact under test.

Tooling has caught up enough that there's no infrastructure excuse. Anthropic's skill-creator now [builds evals into the authoring loop](https://www.adwaitx.com/claude-agent-skills-skill-creator-evals/): you define test prompts and expected outcomes, benchmark mode tracks pass rate, token usage, and elapsed time, and a blind A/B comparator judges two skill versions without knowing which is which. Mechanically none of this is new — it's the same ladder as the rest of this post, assertions where you can and judges where you must. What's specific to skill evals is the paired structure (with/without, version A/version B) and the re-run cadence: a skill tuned against one model version can quietly stop paying rent after the next one, so the benchmark baseline is worth re-running on every model update, same as any regression set.

**Verifiable rewards / RL rubrics.** If success can be expressed as a programmatic check over the final state — unit tests pass, DB diff matches — that same check can serve double duty: it's both your eval metric *and* a training reward signal. "An eval is just an RL environment" is the framing. The cleaner your verifier, the more reusable it is.

**Contamination-resistant evals.** When your benchmark is built from public data (GitHub, LeetCode, the web), a high score might mean the model *memorized* the answer during training, not that it can reason. The fix is to date-stamp every task and score each model only on tasks released *after* its training cutoff. One code benchmark showed a model scoring ~60% on problems from before its cutoff and ~0% on problems released just after — a clean illustration of memorization masquerading as skill.

## Where to actually start

You don't need all eleven. For most projects the high-leverage path is short:

1. **Read 30–50 real traces** and name what's breaking.
2. **Write a handful of code assertions** for the deterministic failures — they're free and they catch a surprising amount.
3. **Add an LLM judge only where you genuinely need judgment**, and validate it on true-positive and true-negative rate before you trust it.
4. **Turn every bug you fix into a regression case** so it stays fixed.

Everything else on the list is something you reach for when a specific need shows up — you're shipping an agent and need outcome grading, you have no traffic and need synthetic data, you're publishing a leaderboard and need contamination resistance, you're maintaining a folder of skills and need to know they still earn their context window. The map is useful precisely so you can ignore most of it until you need it.

If you'd rather run this path than reimplement it, I packaged the high-leverage rungs — error analysis, assertion scaffolding, a validated LLM judge, pass@k/pass^k, and synthetic data — into a small Claude Code plugin, [skill-evals](https://github.com/mager/skill-evals). I also wrote a [short note](/notes/2026-06-26-skill-evals/) on what came out of dogfooding it on this blog.

Credit where it's due: the structure and most of the specifics here come from the [awesome-evals PATTERNS playbook](https://github.com/benchflow-ai/awesome-evals/blob/main/PATTERNS.md). If any of these sections made you want the real depth, that's where to go.
