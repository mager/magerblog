---
title: "Skill Evals: grading the prompts you write, not just the outputs they produce"
description: "Most evals talk is about grading model output. Skill evals grade a different thing — the SKILL.md artifact you wrote — with real numbers from SkillsBench to back it up."
pubDate: 2026-06-26
updatedDate: 2026-07-20T12:00:00-05:00
category: tech
draft: false
keyword: "skill evals"
tags: ["ai", "evals", "skills", "agents", "testing", "skillsbench"]
---

Most "evals" talk is about grading model output. Did the summary hit the right points? Did the agent call the right tools? Was the tone faithful to the brief? The thing being measured is always what the model *produced*.

Skill evals are about something different. They grade the artifact *you* wrote — the SKILL.md-style procedural doc you're attaching to a coding agent. The question isn't "did the model perform well?" It's "did this prompt I authored actually help?"

That's a subtler question than it sounds, and the numbers suggest the ecosystem has been getting it wrong.

## What a skill is

A skill, in the Claude Code sense, is a markdown file that attaches procedural knowledge to an agent. It might describe how to run tests in this repo, how to handle a particular kind of auth flow, or the conventions your team uses for writing migrations. The agent reads it at task time and (ideally) works better because of it.

The premise is appealing: write the knowledge once, get the benefit every time. The problem is there's been no rigorous way to verify whether any given skill is actually doing that.

## The methodology

A skill eval has a simple paired structure: run the same set of tasks with the skill loaded and without. Hold the model constant. Measure the lift.

Everything else in the eval world grades the agent's output. This one grades a document you wrote. That changes what you're optimizing for and what you're watching for when things go wrong.

## What SkillsBench found

[SkillsBench](https://arxiv.org/abs/2602.12670) is the first benchmark to put real numbers to this. 84 tasks across 11 domains, graded by deterministic verifiers — no LLM judge in the loop, so the variance is low. Curated skills lifted average pass rate by about +16 percentage points. That's a meaningful number.

The aggregate hides the interesting parts.

Healthcare tasks jumped +52 points. Software engineering gained +4.5. Sixteen of the 84 tasks got *worse* with skills loaded. The distribution is spiky, not smooth, which means "does skill X help?" is a real empirical question and not something you can answer by intuition or by looking at how well-written the skill is.

Two findings are worth pinning to any skill repo:

**Compact skills beat comprehensive ones.** Focused, concise skills scored +18.8 points on average. Exhaustive documentation — the kind that tries to cover everything — scored −2.9. More is not better. A skill that overexplains is a liability.

**Self-synthesized skills were net negative.** Skills the model generated for itself scored −1.3 points on average. You can't ask the agent to synthesize its own expertise and then skip the curation step. The selection and editing judgment is load-bearing; you can't outsource it to the model you're trying to help.

## The discovery gap

A [follow-up benchmark](https://arxiv.org/abs/2604.04323) dropped agents into a realistic pool of ~34,000 community skills instead of pre-selecting the right ones. Most of the benefit eroded.

Force-loading curated skills (the lab condition) scored 55.4% on the hardest setting. Realistic retrieval from the noisy community pool landed at 38.4%, against a 35.4% baseline with no skills at all. The agent found the right skill in only about half its runs, and weaker models actively followed irrelevant skills off a cliff.

The uncomfortable implication: a skill can be excellent and still lose to discovery. The name, description, and triggering metadata are part of the artifact under test. When you run a skill eval, you're evaluating all of it — not just the prose in the body.

## Where the tooling is now

Anthropic's skill-creator now [builds evals into the authoring loop](https://www.adwaitx.com/claude-agent-skills-skill-creator-evals/): you define test prompts and expected outcomes before writing the skill, benchmark mode tracks pass rate, token usage, and elapsed time, and a blind A/B comparator judges two versions without knowing which is which.

None of the underlying mechanics are new — it's the same eval hierarchy as always: assertions where you can, LLM judges where you must. What's specific to skills is the paired structure (with skill / without skill, version A / version B) and the re-run cadence. A skill tuned against one model version can quietly stop paying rent after the next model update. The benchmark baseline is worth re-running on every model update, the same way you'd treat any regression suite.

I wrote about the judgment call on LLM-as-judge validation in more detail in my [promptfoo post](/blog/2026-02-23-promptfoo-llm-validation) and the earlier [SkillOpt post](/blog/2026-05-26-skill-evals-skillopt) — the short version: get past ~85% agreement with humans on your specific task before you let a judge gate anything.

## What makes skill evals their own category

The paired structure is the key distinction. You're not asking "is this output good?" You're asking "is this output better *because of this document*?" That requires a control condition, which most eval work doesn't bother with because the thing being evaluated (model weights, prompt template) isn't something you can easily swap in and out.

Skills are. You can run the same task set with the skill in context and without it, in the same session, against the same model, and get a clean lift number. The cost is moderate — you're paying for two runs per task — but the signal is direct.

The secondary thing skill evals surface: skill rot. A skill that scores +15 points against one model version might score −3 against the next. Abilities the skill was compensating for (or leaning on) shift. This isn't a theoretical concern; it's the reason re-running on model updates matters. Skills are living documents, not write-once artifacts.

## Run it yourself

The [skill-evals plugin](https://github.com/mager/skill-evals) has a `skill-lift` skill that handles this. Here's the full loop from scratch.

**Step 1: Install the plugin**

```bash
claude --plugin-dir /path/to/skill-evals
```

Or just clone it and use the script directly — it's stdlib-only Python, no dependencies.

**Step 2: Build your task set**

Create a CSV with 10–30 tasks representative of what your skill is supposed to help with:

```
task_id,condition,success
t01,without,pass
t01,with,pass
t02,without,fail
t02,with,pass
t03,without,pass
t03,with,fail
```

Run each task against your agent twice — once with the skill loaded, once without. Score each run pass/fail using whatever grader fits: a unit test, a code assertion, or an LLM judge you've already validated. Record the results in the CSV above.

**Step 3: Compute lift**

```bash
python3 skills/skill-lift/scripts/lift.py results.csv
```

Output:

```
Skill lift report — 3 tasks, 6 total run(s)
============================================================
Condition     Pass rate
------------------------------------------------------------
without         67%  (2/3)
with            67%  (2/3)
lift            +0pp

Task breakdown:
  t01           without=100%(1/1)    with=100%(1/1)    → no change
  t02           without=0%(0/1)      with=100%(1/1)    → IMPROVED
  t03           without=100%(1/1)    with=0%(0/1)      → BROKE

Regressions (1 task(s) where 'with' performed WORSE):
  t03
  → Inspect skill instructions for rules that could mislead on these inputs.
```

The regression on t03 is the most important line. Something in the skill's instructions is causing the agent to perform *worse* on that input. Read the skill and ask: is there a rule that would mislead on t03 specifically? Is t03 in scope for the skill at all? That's where you start editing.

**Step 4: Tighten the skill, re-run**

Skill development is iterative. Edit the SKILL.md, re-run the same task set, compare lift. The paired structure means you're always comparing against a stable baseline — not against your memory of how it used to work.

When you're comparing two versions of the same skill (instead of with/without):

```bash
python3 skills/skill-lift/scripts/lift.py results.csv --baseline v1 --treatment v2
```

**Step 5: Re-run after model updates**

Set a reminder. After any model update that touches the capabilities your skill relies on, re-run the same benchmark. Treat it the same as a regression suite — the skill is a prompt artifact written against a specific model's behavior, and that behavior shifts.

---

## The rest of the eval landscape

For reference, here's where skill evals sit relative to the broader taxonomy. The post I first published on this date covered all of these in depth — if you want the longer version, it's in the [awesome-evals PATTERNS playbook](https://github.com/benchflow-ai/awesome-evals/blob/main/PATTERNS.md).

| Eval type | What it checks | Cost |
|-----------|----------------|------|
| Error analysis | What's actually breaking — do this first | Low |
| Code assertions | Format, syntax, side effects | Free |
| Trajectory / tool-use | Right tools, right order | Low–moderate |
| Outcome / state | Did the world actually change | Moderate |
| LLM-as-judge | Subjective quality (tone, faithfulness) | Expensive |
| CI gating / regression | Fixed bugs stay fixed | Low |
| pass@k vs pass^k | Capability vs reliability | Free |
| Synthetic data | Coverage before you have real traffic | Low |
| **Skill evals** | **Whether an attached skill lifts the agent** | **Moderate** |
| Verifiable rewards | Programmatic success that doubles as RL signal | Free-ish |
| Contamination-resistant | Reasoning vs memorization | Low |

The practical hierarchy most projects follow: start with error analysis (read 30–50 real traces, name what's breaking), then code assertions for the deterministic failures, then an LLM judge only where genuine judgment is needed — validated on true-positive and true-negative rate before you trust it. Skill evals enter the picture the moment you're maintaining a library of skills and want to know they still earn their context window.

If you want to run this without standing up the infrastructure yourself, I packaged the core pieces into a small Claude Code plugin, [skill-evals](https://github.com/mager/skill-evals).
