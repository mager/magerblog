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

This is an experiment, not a new leaderboard entry. Sol graded its own answers, and Codex CLI is an agent harness whose output length is prompted rather than enforced by the API's token cap. The published board uses a Sonnet 5 judge. Mixing these numbers would make the ranking look more precise than it is.
