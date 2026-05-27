---
title: "Skill evals: what's changed since promptfoo"
description: "The SkillOpt paper treats markdown skill files as trainable parameters. Here's what that means for anyone building agent harnesses in 2026."
pubDate: 2026-05-26
category: tech
draft: true
tags: ["ai", "agents", "skills", "evals", "skillopt"]
---

Back in February, I wrote about [promptfoo](/blog/2026-02-23-promptfoo-llm-validation) — specifically, how to validate what your LLM *outputs*. You give it inputs, you assert things about the response, and you run that in CI. It's essentially unit testing for prompts, and it works.

That post was about evaluating outputs. The [SkillOpt paper](https://arxiv.org/abs/2605.23904) from Microsoft Research is about something different: optimizing the skill file itself as the object under test. Instead of "is this response correct," the question becomes "is this SKILL.md producing better task outcomes than the previous version — and can we prove it rigorously enough to accept the change."

The distinction matters more than it sounds.

## Skill files as trainable parameters

The [SkillOpt paper](https://arxiv.org/abs/2605.23904) frames markdown skill files the way ML practitioners frame model weights: as parameters that can be improved through an iterative update loop with a proper optimization objective. The loop looks roughly like this:

```python
best_skill = load("skill.md")
best_score = evaluate(best_skill, held_out_set)

for epoch in range(max_epochs):
    # Optimizer model proposes bounded edits (4–8 add/delete/replace ops)
    candidate = propose_edits(best_skill, trajectories, budget=8)
    score = evaluate(candidate, held_out_set)

    if score > best_score:          # strict improvement only — ties rejected
        best_skill = candidate
        best_score = score
    else:
        rejected_buffer.append(candidate)   # feed back for contrast

    if no_improvement_for(n=3):
        break

save(best_skill, "best_skill.md")
```

The validation gate is the whole mechanism. The rejected edit buffer feeds back into the next proposal step so the optimizer model learns what didn't work — it's not just hill climbing, it has contrast to reason about.

End-to-end, their best-performing skills landed with 1–4 accepted edits total across the entire optimization run. If your self-improving agent is accepting most of what it proposes, you're not optimizing — you're just appending.

Two structural constraints explain most of the paper's results:

- **Bounded edit size.** 4–8 edits per step is the sweet spot. Remove the budget and performance collapses. This is the textual analog of a learning rate — large edits introduce too much variance to attribute improvement reliably. Cap the diff size.
- **Protected sections.** Fast-state content (task-specific state like session logs or bookmarks) must be separated from slow-state content (voice guidelines, reasoning patterns, accumulated lessons). SkillOpt adds a structural invariant that fast edits cannot overwrite slow sections. Removing that mechanism cost 22 points on SpreadsheetBench in their ablations.

The median final skill file across their experiments was around 920 tokens. Skills don't need to be long. They need to be high-signal. Most skill files I've seen — including early versions of my own — are longer than they should be, because length feels like effort. It isn't.

## Portability is the underappreciated finding

The paper runs across three execution harnesses — direct chat, Codex, and Claude Code — and tests seven different target models. A skill optimized in one harness transfers to another without retraining. The procedural knowledge is in the text, not the runtime.

The headline numbers for GPT-5.5: +23.5 points in direct chat, +24.8 inside Codex, +19.1 inside Claude Code, all relative to no-skill baselines. SkillOpt is best or tied across all 52 evaluated (model, benchmark, harness) cells. The deployed artifact is a `best_skill.md` file — 300 to 2,000 tokens, no model changes required.

This suggests the harness matters less than the skill. The practical implication: a smaller, cheaper model with a well-optimized skill file can approximate the behavior of a larger model on procedural tasks. Fully inspectable, portable across runtimes, zero inference-time overhead. For teams asking "how do we adapt a frontier model for our domain without fine-tuning," this is the answer for most procedural work.

## Two practical observations from the field

Murat Can Koylan, who maintains the [Agent Skills for Context Engineering repo](https://github.com/muratcankoylan/agent-skills-for-context-engineering), published observations from [v2.3.0](https://github.com/muratcankoylan/Agent-Skills-for-Context-Engineering/releases/tag/v2.3.0) that match what the paper finds, measured across GPT-5.5, Claude Opus 4.7, Gemini 3.1 Pro, and Composer-2 via the Cursor AI SDK.

**Descriptions and bodies are separate surfaces.** The router only reads the description when deciding which skill to invoke. The agent only reads the body once a skill is activated. They can quietly disagree with each other, and aggregate accuracy metrics won't catch it — only end-to-end task tests will.

**Aggregate accuracy is the wrong unit.** Rewriting three skill descriptions in one pass moved the corpus average roughly 1 percentage point. Individual skill accuracy moved 23–25 points. The aggregate metric was hiding nearly all the signal. Per-skill effect size is where the action is.

Both observations reinforce the paper's framing: treat skill files as parameters with measurable effect sizes, not documentation you rewrite by feel.

## The unresolved problem

SkillOpt works because its benchmark tasks have correct answers. The gate can be automated. But the tasks where optimized skill files would deliver the most practical value — writing, design, strategy, planning — are exactly the tasks where "better" is contested and auto-graders fail.

The promptfoo post noted that LLM judges correlate with human judgment about 70–80% of the time. That's useful for coarse filtering, not reliable enough to drive an unsupervised optimization loop. You'd be optimizing against a noisy proxy, and the skill file would learn to satisfy the grader rather than improve the actual outcome.

The gap between "we have a proper optimization framework for skill files" and "we can apply it to open-ended work" is almost entirely a verification problem. Whoever builds a reliable verifier for open-ended tasks will make everything else in this space move faster. That's where the constraint actually lives.

## What this means if you're building with agents now

Whether you're a startup with five skills or a larger organization with hundreds, a few things follow directly from SkillOpt and the surrounding evidence.

**Start measuring at the skill level, not the system level.** Aggregate accuracy across a skill corpus is a vanity metric. A 90% pass rate across 20 skills can mask two skills running at 30%. Those two skills are where your users hit walls. Instrument per-skill, set per-skill baselines, and alert on per-skill regression. The corpus average will tell you almost nothing useful.

**Separate slow-state from fast-state immediately — and assign ownership.** At team scale, the slow-state skills (reasoning patterns, domain knowledge, voice guidelines) are organizational assets. They should have reviewers and change control, not be editable by anyone who wants to tweak a prompt. The 22-point SpreadsheetBench drop from removing the protected-section invariant isn't just a technical result — it's an argument for treating your core skill files like schema: changes need review, tests need to pass, rollback needs to be possible.

**Build your verifier before you build your optimizer.** The temptation is to start self-improving loops early. Don't. Without a reliable grader for your domain, you'll optimize against a noisy proxy and the skill files will get worse in ways that are hard to detect until a user notices. For procedural tasks — structured data extraction, code generation, form completion — automated graders are achievable now. For judgment-heavy tasks, invest in a human calibration pipeline first: 50–100 labeled examples, a rubric, spot-check your LLM judge against human scores. Once your grader has >85% agreement with humans on your specific task, you can start running optimization loops against it.

**Treat skill portability as a forcing function for quality.** If a skill only works in one harness, it's probably leaking harness-specific assumptions into the text. A skill that works across Claude Code, direct API, and whatever your internal tooling is tends to be more clearly written and more reliably activated. Run your most important skills against at least two different runtimes. The divergence is usually diagnostic.

For startups: 5–15 tightly scoped skills with per-skill evals and explicit slow/fast separation will outperform a single sprawling system prompt. For larger teams: the org design question is who owns the slow-state skills and what the change process looks like — that's usually where skill quality silently degrades, not from bad intent but from accumulated small edits that no one reviewed end-to-end. Either way, the investment is in the verifier and the measurement system, not the optimization loop. The loop is easy once those exist.
