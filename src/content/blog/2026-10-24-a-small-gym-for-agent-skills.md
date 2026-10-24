---
title: "A small gym for agent skills"
description: "A local loop that tests a skill, repairs a known failure, and rejects a shorter version when it loses useful behavior."
pubDate: 2026-10-24
category: tech
tags: [agents, skills, evaluations, loooom]
draft: true
---

I wanted a small way to answer a question about agent skills: when I change the instructions, does the behavior improve?

A skill can read well and still fail in use. A shorter version can look cleaner and lose a useful instruction. Reading the Markdown is part of the review, but I also want to see what an agent does with it.

I built a first version of a skills gym in [Loooom](https://github.com/mager/loooom). It takes a skill, runs a few fixed cases, saves the responses, and compares a candidate with the original. The [website interface](https://github.com/mager/loooom.xyz) is a report viewer at `/gym`. The model calls run locally through my signed-in Codex CLI.

There are two strategies: repair a failure, or remove parts of a skill and test what remains. The first results included a successful repair, a rejected simplification, and a mistake in my test criteria.

## A loop around the instructions

The loop is simple:

```text
skill + fixed cases
        |
        v
evaluate the original
        |
        v
inspect a failure or remove sections
        |
        v
evaluate the candidate on the same cases
        |
        v
accept or reject, with the evidence saved
```

This is inspired by the idea of an environment where an agent can practice and receive feedback. This version does not train model weights or implement a reinforcement-learning algorithm. It changes a Markdown instruction file and checks the resulting behavior.

That distinction matters. The thing under revision is the skill. The model is the execution engine. The test cases describe the behavior I want to preserve.

Each case starts a fresh CLI process. A separate call grades the response against fixed criteria. The judge sees the learner's request and the response, but it does not see the skill text or whether the response came from the original or candidate. It is still the same model. That leaves shared blind spots, so I keep the full responses and grading reasons visible.

## Start with absorb

I chose [absorb](https://github.com/mager/loooom.xyz/blob/aa4dcee816171f8483ccd46dac55e5c8ce7d5287/skills/absorb/SKILL.md), a skill for active recall and spaced practice. I like this skill, and it gives the experiment a clear behavior to inspect: does the assistant let the learner attempt an answer before revealing it?

The initial cases covered a recall round, an overwhelmed learner with five minutes, feedback after a wrong answer, and a new topic. The unchanged skill passed all four.

That is a useful stopping condition. The runner recorded `no-defect` and did not propose a repair. Four passing examples do not establish that the skill is perfect. They mean I had no observed training failure to repair in that run.

I also wanted to test the complete repair path. For that, I made a separate control called `absorb-regression`. I added a deliberately bad instruction: include the correct answer immediately below every recall question, before waiting for the learner.

This was an introduced defect, not a discovered defect in the original skill. The interface labels it that way.

The modified baseline passed one of four cases. It gave away the quiz answers, but it still handled the case that asked for correction after an attempt. The repair step received only the failed training cases and their evidence. It produced a candidate that passed all four, including the holdout topic.

| Experiment | Original | Candidate | Decision |
| --- | --- | --- | --- |
| Unchanged absorb | 4/4 | No candidate | No training defect found |
| Absorb with a controlled answer leak | 1/4 | 4/4 | Accept on this suite |
| Focus section ablation, suite v2 | 3/3 | 2/3 | Reject |

The repair result shows that the small loop can detect and remove a known failure. It does not show that the original absorb skill needed this change, or that the repaired control is better than the original.

## Remove most of focus

The second strategy uses [focus](https://github.com/mager/loooom.xyz/blob/aa4dcee816171f8483ccd46dac55e5c8ce7d5287/skills/focus/SKILL.md), a skill about working on one task with fewer distractions.

For this experiment, ablation means removing sections. I kept the YAML metadata, title, and Agent Behavior section. I removed the background, method explanations, list of failure patterns, and worked example. This gives the experiment one clear intervention rather than a rewrite with many changes at once.

The file went from 948 to 157 words, an 83% reduction. These are whitespace-counted words, including the metadata. They are not model tokens, and I did not measure a cost or latency saving.

On the revised test suite, the full skill passed three of three cases. The shorter skill passed two. In the holdout case, the learner had 20 minutes. The shorter version produced a 20-minute work plan, then added a five-minute break. The criterion required the complete block, including a break, to fit within the available time.

The gym rejected the candidate. Reducing the word count was not enough.

A single sample cannot tell me whether removing the explanations caused that failure. The model might produce a different plan on the next run. But this response is enough to stop me from treating this candidate as a demonstrated improvement.

## The evaluator needed a correction too

The first focus run had a more basic problem. I wrote criteria that said the response should start with a small writing action and end with a note about where to resume.

The judge took those words literally. It failed a response because moving the phone came before the writing step. It failed another because the shutdown note was present but was not the final instruction.

That was not the behavior I meant to test. Setting up the environment first is reasonable. A shutdown note does not need to be the final sentence in the assistant's response.

I revised the criteria to say that the plan must include the small writing action and the shutdown note. Then I reran both versions against the revised suite. The first rejected report is still saved. The second comparison produced the time-budget failure described above.

This is also a limit on the holdout claim. The holdout was hidden from the skill-editing prompt, but I inspected and revised its criteria during development. It is not an untouched benchmark. A stronger next round needs new cases that I have not used to tune either the skill or the evaluator.

The lesson for this prototype was concrete: the test criteria are code too. They need review, version history, and failure cases.

## Run it locally

The runner lives in the `loooom` repository and uses [Codex non-interactive mode](https://learn.chatgpt.com/docs/non-interactive-mode). I used the existing ChatGPT sign-in. The commands consume Codex usage on that account.

```sh
cd ~/Code/loooom
codex login status

node bin/loooom.js gym run absorb --model gpt-6-astra
node bin/loooom.js gym run absorb-regression --model gpt-6-astra
node bin/loooom.js gym run focus --model gpt-6-astra
```

The recorded runs used `codex-cli 0.154.0` and `gpt-6-astra`. Use a model available to your account. Keep it fixed within a comparison. Model and CLI changes can affect later results.

Each run saves a new JSON report with the skill content, content hashes, suite hash, responses, checks, timestamps, and decision. A failed call leaves a partial report. The runner does not replace or install the original skill.

The website shows the before-and-after results and lets me open a case to read the evidence. I can compare the full skill text, download the candidate, or load another local report. Loading a file keeps it in browser memory; it does not upload the report or start model calls.

## What I would add next

The first version is intentionally small: one response per case, a few cases, and the same model for execution and judging. It cannot support a broad claim about skill quality.

The next useful additions are repeated trials, new holdout cases, and a no-skill baseline. The last one matters because a strong model may already handle these tasks well. I want to know what the skill contributes, not just whether the model can pass a test.

I would also use deterministic checks for facts such as a stated time budget, and keep human review for cases where the criterion depends on judgment. A separate judge model could reduce some shared errors, but it would still need inspection.

For now, I have a small system that can preserve a working skill, repair a known defect, and reject a large reduction in text when a response loses useful behavior. Those are specific outcomes I can inspect and build on.
