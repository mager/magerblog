---
title: "Loooom is a skills marketplace. And a gym."
description: "Testing, repairing, and shortening agent skills with repeated trials, held-out cases, and a small library inside Loooom."
pubDate: 2026-10-24
category: tech
tags: [agents, skills, evaluations, loooom]
draft: true
---

I wanted a small way to answer a question about agent skills: when I change the instructions, does the behavior improve?

A skill can read well and still fail in use. A shorter version can look cleaner and lose a useful instruction. Reading the Markdown is part of the review, but I also want to see what an agent does with it.

I built a first version of a skills gym in [Loooom](https://github.com/mager/loooom). It takes a skill, runs a few fixed cases, saves the responses, and compares a candidate with the original. The [website interface](https://github.com/mager/loooom.xyz) is a report viewer at `/gym`. The model calls run locally through my signed-in Codex CLI.

There are two strategies: repair a failure, or remove parts of a skill and test what remains. The first results included a successful controlled repair, a rejected simplification, and a mistake in my test criteria. Then I added repeated trials and a bounded search that can improve a candidate over several rounds.

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

## Keep climbing, then stop editing

The one-pass experiment was a useful start. I wanted the next version to do more than make one edit and hope.

I added a bounded hill climb. The engine evaluates the original on training cases, proposes a candidate, and compares it with the best version so far. A repair must increase passing trials without reducing the pass count on any individual case. A shorter version must remove words and pass every training trial. Rejected candidates stay in the record and never replace the selected version.

I set a limit of three rounds and three responses per case. The first Focus candidate is still the simple section ablation. Later candidates can use the training failures to make a shorter, more complete instruction file. The editor sees training cases and failures. It never receives held-out prompts or their grading criteria.

After the search, the selection is locked. The original and selected skill each get new responses on the full suite. Only then do the held-out cases enter the evaluation. The final result cannot trigger another edit in that session.

That last step is important. If I keep using a final failure to improve the prompt, it is no longer a final test. I can turn it into development data for a later experiment, but the next claim needs new held-out cases.

For this round I wrote a new Focus suite with three training cases and two holdouts before the search. It covers complete time budgets, required phone contact, task switching, a short creative task, and a required building alert. Each case gets three responses. These are still examples I wrote, with model grading, not an external benchmark.

The search found a useful middle ground:

| Version | Words | Training trials passed | Search decision |
| --- | ---: | ---: | --- |
| Original | 948 | 7/9 | Starting point |
| Round 1: section ablation | 157 | 7/9 | Reject |
| Round 2: restore useful rules | 304 | 9/9 | Keep |
| Round 3: remove more repetition | 242 | 9/9 | Keep |

The first cut lost details about choosing a concrete task and including setup in the total time budget. The next version stated those rules directly. It also kept required calls and alerts active while reducing other distractions. The final cut removed more text while preserving those rules.

In fresh verification, both the original and the 242-word version passed all 15 trials, including six held-out trials each. That is a 74% reduction in words with the same observed final pass count. It is not evidence of a higher final pass rate.

There is another useful result in that table: the original passed 7/9 during training, then 15/15 in the fresh check without changing. Model responses and grading vary. Comparing the candidate's final 15/15 with the original's training 7/9 would make the improvement look larger than this experiment supports.

The Focus session used 86 model calls, counting responses, judges, and proposals. The saved report includes the rejected 157-word cut, both accepted rounds, and the fresh responses. I kept the exact 242-word file as a reviewable candidate. Nothing installs it automatically.

I repeated the controlled Absorb repair on its existing cases too. In fresh verification, the broken version passed 3 of 12 trials. The repaired version passed 12 of 12. The file grew from 957 to 997 words. Here the objective was to fix the answer leak, so a small increase in text was acceptable. This reused a known control suite; the fresh part was the responses, not a claim that these cases had never been seen before.

The unchanged Absorb skill also got a new five-case suite. It passed all nine training trials and all six held-out trials. The gym made no edit. That is part of the product: it should be able to leave a working skill alone.

## A library inside Loooom

I kept the engine in Loooom and gave it a public boundary:

```js
import {
  hillClimb,
  evaluateSkill,
  createCodexAdapter,
  createFileStore
} from 'loooom/gym';
```

The engine takes skill text, a suite, and an adapter. The adapter handles model calls. A checkpoint callback handles storage. The engine does not read the user's project, install the winning candidate, or publish anything.

That is enough separation to reuse it in another app or extract a package later. I do not need another repository to prove the idea first.

The default adapter uses my Codex CLI sign-in. Another adapter can use another backend. The judge and editor can also be separate adapters. A call budget covers execution, grading, and proposals. Cancellation saves a partial report. Neither mechanism is a token or money budget.

I added tests for the parts that can make an evaluation look better than it is: leaking holdouts to the editor, accepting a per-case regression, promoting a training winner that fails final verification, and losing the partial record on failure. A package smoke test imports the public API from the packed npm artifact in a separate directory.

## Run it locally

The runner lives in the `loooom` repository and uses [Codex non-interactive mode](https://learn.chatgpt.com/docs/non-interactive-mode). I used the existing ChatGPT sign-in. The commands consume Codex usage on that account.


The gym release (`0.3.0`) is not on npm yet. To try the tested source version now, use Node 22+ and a signed-in Codex CLI:

```sh
npx --yes https://github.com/mager/loooom/archive/f45997f86ced5d8db2020ab74b9e761fc1f30a39.tar.gz gym climb focus-climb --rounds 3 --repetitions 3
```

The shorter npm commands below apply after version `0.3.0` is published.

```sh
codex login status

npx loooom@latest gym climb absorb-climb --model gpt-6-astra
npx loooom@latest gym climb focus-climb --rounds 3 --repetitions 3 --model gpt-6-astra

# Replay the first one-pass examples:
npx loooom@latest gym run absorb-regression --model gpt-6-astra
```

The npm package requires Node 22 or later. A source checkout is not required. Reports are saved under `gym/runs/` in the directory where you run the command.

The recorded runs used `codex-cli 0.154.0` and `gpt-6-astra`. Use a model available to your account. Keep it fixed within a comparison. Model and CLI changes can affect later results.

Each run saves a new JSON report with the skill content, content hashes, suite hash, responses, checks, timestamps, and decision. A failed call leaves a partial report. The runner does not replace or install the original skill.

The website shows every search round, the selected word count, and the fresh verification result. I can open a case, then a trial, to read the response and each grading reason. I can compare the full skill text, download the candidate, or load another local report. Loading a file keeps it in browser memory; it does not upload the report or start model calls.

## What still needs work

Three repeated trials help expose variation. They do not make a small suite representative. Outputs from the same model can be correlated, and the same model judges them. I am reporting saved observations, not statistical significance or a general guarantee.

Some responses retained formatting such as “Next Steps” despite the launch flags that disable user configuration and project document loading. I treat this as a local CLI experiment, not a perfectly isolated prompt environment. Both variants used the same launcher.

The library returns descriptive score intervals, but I do not use them as proof that one prompt caused an improvement. The final variants run sequentially, and model behavior can change. Larger suites, independent review, and more sessions would give stronger evidence.

A no-skill control is another useful next test. A strong model may already handle these tasks. I want to know what the skill contributes, as well as whether one version passes more checks than another.

I also want deterministic checks where they fit, such as checking a stated time budget. Model judgment remains useful for instructions that cannot be reduced to a number, but the grading reasons need to stay visible.

Loooom started as a place to find skills. The gym adds a place to work on them: discover a useful skill, test a change, and keep the record. A marketplace and a gym belong together.
