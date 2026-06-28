---
title: "skill-evals"
pubDate: "2026-06-26"
link: "https://github.com/mager/skill-evals"
linkText: "github.com/mager/skill-evals"
tags: ["AI", "Skills", "Evals", "Claude Code", "LLM-as-judge"]
category: tech
---

[skill-evals](https://github.com/mager/skill-evals) is a small Claude Code plugin for evaluating the skills and agents you build. It came out of reading the [awesome-evals PATTERNS playbook](https://github.com/benchflow-ai/awesome-evals/blob/main/PATTERNS.md) and wanting the patterns as something I could run inside a project, not just a reference to nod along to. v0.1 is two skills.

The first, `error-analysis`, is the unglamorous step most people skip: read 20–100 real traces, write a one-line note on the first thing that broke in each, cluster those into a handful of named failure modes, and rank them by frequency × severity. The point is that you can't write a good eval for a failure you haven't seen yet, and generic metrics like "helpfulness" point nowhere. The output is a short taxonomy that tells you what to actually measure — and which failures need a cheap code assertion versus an LLM judge.

The second, `build-judge`, is the one I learned the most from. Using an LLM to grade subjective things (tone, faithfulness, did-it-follow-the-instruction) is easy; trusting that grader is the hard part. On an imbalanced set — say 90% of outputs are fine — a judge that stamps everything "pass" scores 90% accuracy and catches none of the real failures. So the skill ships a stdlib-only `score.py` that reports true-positive and true-negative rate *separately* and gates on both, exiting non-zero below threshold so it drops straight into CI. The rubber-stamp judge fails that gate even at 90% accuracy, which is exactly the trap it's there to catch.

Since then, v0.2 shipped exactly the patterns I'd left out: `add-assertions` (deterministic check scaffolding), `passk` (pass@k versus pass^k with the unbiased estimator), `synth-data` (grounded synthetic sets when you have no traffic), and an `eval-runner` agent that runs a whole suite and reports honestly. I also did the dogfood — pointing `eval-runner` at all 124 posts on this very blog. The first pass screamed that *zero* posts passed every check, which is exactly the kind of number that makes you panic and learn nothing. The honest finding was that my *spec* was wrong, not the blog: it was grading against categories and a keyword format the real schema never used. Once I fixed the spec, every post came back clean. That's the lesson the whole thing is built to teach — most "failures" are your metric lying, and you only catch it by looking.

If you want the conceptual map behind these patterns rather than the code, I wrote one up: [a plain-English tour of the eval types worth knowing](/blog/2026-06-26-ai-evals-field-guide/).
