---
title: "A skills gym for Loooom"
description: "A small loop for testing, grading, and improving agent skills, with saved answers and rejected changes included."
pubDate: 2026-10-24
updatedDate: 2026-10-27
category: tech
tags: [agents, skills, evaluations, loooom]
draft: true
---

I cut a 948-word skill down to 157 words. The shorter file looked promising. Then it failed a time-budget test.

That is the kind of feedback I want when I edit an agent skill. Reading the instructions tells me whether they make sense. Running them tells me what an agent actually does with them.

I built a small skills gym inside [Loooom](https://www.loooom.xyz). The goal is to improve a skill through a repeatable loop: run it, grade the answers, inspect a failure, change the instructions, and test again. Keep the change only when it meets the test rules. Save the failed attempts too.

The [gym log](https://www.loooom.xyz/gym) shows the recorded sessions. You can select a round, compare the answers, and read why the grader passed or failed each one.

![The Absorb final check shows three passing original trials and twelve passing revised trials, with each answer linked to its comparison.](https://sdld3v8bpzf3snqo.public.blob.vercel-storage.com/blog/2026-10-24-a-small-gym-for-agent-skills/test-weave-absorb.jpg)

*The controlled Absorb repair. Each mark opens a saved answer and its grades.*

## What gets evaluated

Each test case has a request and explicit criteria. For a learning skill, a criterion might be: let the learner attempt an answer before revealing it. For a focus skill, the whole plan must fit the user's available time, including setup and breaks.

The runner sends the request with the skill loaded. A separate model call grades the answer against those criteria. The grader sees the request and response, but not the skill text or which version produced it.

These are behavior tests. Loooom also has a rubric for grading skill text; that answers a different question.

There are two ways to improve a skill in this first gym:

- **Repair:** use failed answers to propose an instruction change.
- **Shorten:** remove instructions, then check whether the remaining skill still passes.

The loop changes Markdown instructions. It does not train model weights. The reinforcement-learning gym idea was the starting point; this implementation is a bounded search over skill revisions.

## Give the repair loop a known failure

I started with `absorb`, a skill for active recall and spaced practice. I wanted to check whether it gives the learner a chance to answer before providing feedback.

The original skill passed the initial tests. The gym left it alone.

To test the repair path, I made a separate copy with a deliberately bad instruction: show the correct answer immediately below each quiz question. This was a controlled defect I added, not a bug I found in the published skill.

The repair replaced that instruction with a rule to wait for the learner's attempt before giving feedback. In the repeated run's final check, the broken version passed **3 of 12 trials**. The repaired version passed **12 of 12**. Both used the same questions, with fresh responses for the final comparison.

That is a narrow result: the loop repaired a known answer leak on this suite. It does not establish that the repaired copy is better than the original published skill.

## A shorter skill has to earn its place

For `focus`, the objective was to reduce the instructions while preserving useful behavior.

The first cut removed background explanations and a worked example. The repeated search then tried restoring necessary rules and cutting repetition more carefully.

| Version | Words | Training trials passed | Decision |
| --- | ---: | ---: | --- |
| Original | 948 | 7/9 | Starting point |
| First cut | 157 | 7/9 | Reject |
| Second revision | 304 | 9/9 | Keep |
| Third revision | 242 | 9/9 | Keep |

![The first Focus cut has 157 words and passes seven of nine training trials. The gym marks it as not kept.](https://sdld3v8bpzf3snqo.public.blob.vercel-storage.com/blog/2026-10-24-a-small-gym-for-agent-skills/test-weave-focus.jpg)

*The first cut was rejected. Later rounds kept more useful instructions.*

The first cut still failed checks for the complete time budget and task switching. The next revision stated those rules directly. It also preserved necessary calls and alerts while reducing other distractions.

The selected skill had **242 words, 74% fewer than the original**. In the fresh final check, both versions passed **15 of 15 trials**. The result was less text with the same observed final pass count.

The original's scores also show why fresh comparisons matter. It passed 7/9 during training, then 15/15 without an edit. Responses and model grades vary. Comparing the candidate's final score with the original's training score would overstate the result.

## Separate editing from the final check

The editor gets training failures and their grading reasons. It can propose a revision, test it, and repeat within a fixed round limit. A rejected revision stays in the record and does not replace the selected version.

Once the search ends, the selection is locked. The original and selected skill receive fresh tests, including questions held out of editing. Those final results cannot trigger another edit in the same session.

If I use a final failure to guide the next revision, that case becomes development data. The next claim needs a new final test.

The evaluator needs review too. In an early Focus experiment, I wrote criteria that required a writing action to come first and a shutdown note to come last. The grader rejected reasonable plans because they put phone setup first or placed another instruction after the note. I changed the criteria to test whether the useful actions were present, then reran both versions.

That correction belongs in the experiment history. Changing the grader changes what a passing score means.

## Keep the full record

The test view links original and revised answers to the same question. Each mark opens the actual response pair and the grading reasons. The round controls show which attempts were kept or rejected. Below that view, the log includes unchanged skills and earlier one-pass sessions.

The lines make comparisons easier to follow. They do not imply that one response was transformed into the other: these are separate model outputs.

Every session saves its skill versions, hashes, test cases, answers, grades, and decisions. The website reads those reports. It does not run the model or upload a report when I open a local file.

## Keep the engine small

The engine lives in the Loooom package behind a `loooom/gym` export. It takes skill text, test cases, and a model adapter. Storage is a callback. The current adapter uses my signed-in Codex CLI, but the engine can use another adapter.

That gives me a reusable library without starting another repository. The [runner implementation](https://github.com/mager/loooom/pull/1) is still in a draft pull request. It saves proposed skills for review; it does not install them automatically.

These remain small, AI-graded experiments. Repeated trials expose some variation, but the same model can share blind spots across execution, editing, and grading. The next useful checks are a no-skill baseline, more varied cases, and independent review of the grades.

Loooom now has a place to find a skill and a place to test a change to it. The part I want to keep is the record: what failed, what changed, and what happened when I tried again.
