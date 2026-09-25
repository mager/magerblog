---
title: "Running mager-bench through my ChatGPT subscription"
pubDate: "2026-09-25"
link: "https://bench.mager.co/experiments/codex-cli-sol"
linkText: "the full Codex CLI run"
category: tech
tags: ["AI", "benchmarks", "evals", "Codex"]
---

My OpenAI API key was out of credits, but the local Codex CLI was already signed in to ChatGPT. I added a headless provider to [mager-bench](https://github.com/mager/mager-bench) and ran GPT-5.6 Sol through all 13 coding challenges. Each answer and each verdict came from a fresh, read-only `codex exec` session. The run averaged **9.0/10**; Doom scored 8.7, Slots 8.3, and async-fetch was the low point at 6.3.

The first pass told a different story: Doom 3.0, Slots 0.3. The judge was receiving only the first 6,000 characters of each response, so it saw partial apps even though both complete HTML files had been saved. I fixed the CLI judge path to read the full response and rescored those two saved answers. The [run page](https://bench.mager.co/experiments/codex-cli-sol) includes every response and judge note.

Sol graded its own answers, and Codex CLI is an agent harness whose output length is prompted rather than enforced by the API's token cap. I kept this result separate from the original Sonnet 5 board rather than mix judges.

**Update:** I moved new mager-bench runs to my ChatGPT subscription and put Sol and GPT-6 Astra on a new board, both judged by the same GPT-5.6 Sol CLI model. Astra averaged **9.3/10** across all 13 challenges, ahead of Sol's 9.0. The older Sonnet 5 results are now an [archive](https://bench.mager.co/archive/sonnet-5). Self-judging bias still matters, so the full answers and verdicts remain open for inspection.
