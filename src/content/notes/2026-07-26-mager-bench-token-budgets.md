---
title: "mager-bench: the benchmark was measuring my token budget"
pubDate: "2026-07-26"
link: "https://bench.mager.co"
linkText: "bench.mager.co"
category: tech
tags: ["AI", "benchmarks", "evals", "LLM", "Groq", "open weights"]
---

I added a fifth model to [mager-bench](https://github.com/mager/mager-bench) today and found a bug in the benchmark itself. The bug is more interesting than the model.

## The new model

GPT-OSS 120B — OpenAI's open-weights model, served on Groq's free tier. The board was two Anthropic models, one Meta, one Google, so this is the first OpenAI-lineage model on it and the first free-tier model that reasons before answering. Total API cost, again: $0.

Getting it running took three fixes, two of them token accounting again:

- Groq bills reasoning tokens against `max_tokens`, so a thinking model needs headroom or its answer gets cut mid-implementation.
- `reasoning_format: "parsed"` keeps chain-of-thought out of the response body, but it's a Groq-only parameter — the OpenAI SDK rejects unknown top-level kwargs, so it has to ride in `extra_body`. Miss this and all 13 challenges fail with an unhelpful `TypeError`.
- The free tier caps that model at **8000 tokens per minute, counting prompt + `max_tokens` together**, and rejects over-budget requests outright with a 413 rather than throttling them. So you can't just ask for a big budget and retry.

That last one turned out to matter far beyond one model.

## The actual bug

Three of my challenges ask for a whole app in a single file: a Doom-style raycaster, a Vegas slot machine, a REST API client class. Every model scored near zero on all three. In [an earlier note](/notes/2026-07-18-mager-bench-free-models) I wrote that the free models "collapse on the big signature challenges" and left it there, as if that were a fact about the models.

It was a fact about my harness. Every model was getting 2048 output tokens. A working raycaster does not fit in 2048 tokens. I wasn't measuring whether models can build Doom; I was measuring whether they can build Doom in 2048 tokens, and the answer is no for the same reason it would be no for a human handed a 30-line budget.

The fix is per-challenge budgets: `doom` and `slots` get 7000 tokens, `api-client` gets 4096, and the other ten stay at 2048 because they never came close to the cap. That last detail is what made the fix cheap — the ten unaffected challenges keep their existing scores, so I only had to re-run three challenges across five models instead of the whole board.

7000 isn't a round number I liked. It's the largest budget the tightest free tier on the board can actually accept, which is that 8000 TPM ceiling minus the prompt. The slowest model in the fleet sets the speed limit for everyone, because the alternative is giving different models different budgets and calling the scores comparable.

## What happened when I fixed it

Mostly nothing, and that's the interesting part.

3.4× the budget produced 3–4× longer answers — Haiku's raycaster attempt went from 6,500 characters to 24,000. And every single model still ran out mid-file. Every response tail ends mid-expression: `const time`, `for`, `Set`. Nobody finished.

Score ranges across all five models, before and after:

| Challenge | Before (2048 tok) | After (7000 tok) |
|---|---|---|
| doom | 0.0 – 1.0 | 0.0 – 1.0 |
| slots | 0.0 – 2.3 | 0.0 – 0.7 |
| api-client | 1.7 – 7.0 | 1.7 – 7.7 |

So the scores were roughly right, for entirely the wrong reason. A 70%-complete raycaster and a 25%-complete raycaster both score ~0 against a rubric that asks "is it a working game," which meant a real harness bug was invisible in the numbers. This is the part I'd want to know about someone else's eval: the metric didn't move when the bug was introduced, so it couldn't move when the bug was fixed either. Watching the scores would never have surfaced it. I found it by reading the raw responses and noticing they all ended mid-expression.

Gemini 2.5 Flash fails differently and more honestly: given 15,000 tokens it produced 2,000 characters of prose describing the raycaster it was about to write, then got cut off mid-sentence. It spent its budget thinking and narrating instead of emitting code.

The uncomfortable conclusion is that `doom` and `slots` may not be measurable on a free-tier board at all. A one-shot raycaster needs more output tokens than Groq's free tier can physically produce. Either I scope the prompts down to something completable in ~7000 tokens, or I accept that those two challenges only discriminate at the top of the market while everything else scores zero. I haven't decided which, but a prompt that no model on the board can finish isn't discriminating between them, and a column of zeros is not a measurement.

## Two things I didn't expect

The re-run also caught bad data that had been sitting on the published board. Sonnet 4.6's slot-machine score of 2.3 came from a **zero-character response**, scored by `llama-3.3-70b` rather than the board's locked `claude-sonnet-5` judge — a stale row from before I pinned the judge. An empty answer had been quietly earning points. The board now audits clean on both counts: no empty responses, no rows scored by the wrong judge. That check runs as part of publishing now, since the only reason I caught it was going looking.

And the leaderboard flipped:

| Model | Tier | Avg |
|---|---|---|
| GPT-OSS 120B | free | 6.4 |
| Claude Sonnet 4.6 | paid | 6.2 |
| Claude Haiku 4.5 | cheap | 6.2 |
| Llama 3.3 70B | free | 5.6 |
| Gemini 2.5 Flash | free | 5.2 |

A free open-weights model is now top of my board. I want to be careful about how much that means: 6.4 versus 6.2 on single runs with no repeats is inside the noise, and part of the gap is Sonnet losing those inflated points from the empty-response row. This is not "open weights beat Claude." It's "on thirteen tasks I picked, scored once each by a Claude judge, they're indistinguishable" — which is still a real result, and cost nothing to produce.

The related change: the leaderboard now shows correctness, quality, and documentation as separate columns instead of one average. That immediately paid for itself. GPT-OSS has the best code-quality score on the board while ranking third on correctness — it writes clean code that's more often subtly wrong. A single averaged number hid that completely, and it's the most useful thing the board has told me all month.
