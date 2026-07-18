---
title: "mager-bench: free first"
pubDate: "2026-07-17"
link: "https://bench.mager.co"
linkText: "bench.mager.co"
tags: ["AI", "benchmarks", "evals", "LLM", "Groq", "Gemini", "crowdfunding"]
category: tech
---

mager-bench v1.1 restructures the bench around cost. Default runs now use free models — Llama 3.3 70B and 3.1 8B through a new Groq adapter, plus Gemini Flash — and the judge defaults to a free model too, so a full 12-challenge leaderboard costs $0 and no longer requires an Anthropic key.

The README has carried the same two caveats since day one: the judge is a model too (by default, Claude grading Claude), and single-run variance is real. Both now have flags instead of apologies. `--runs 3` reports mean ± stddev, so a score is a distribution rather than one roll. `--judges gemini-2.0-flash,llama-3.3-70b` averages a judge panel, so no model grades its own family alone.

```bash
export GROQ_API_KEY=... GEMINI_API_KEY=...
python bench.py --tier free --runs 3 \
  --judges gemini-2.0-flash,llama-3.3-70b
```

The expensive seats — Opus, GPT-4o, Sonnet — move to a public wishlist. There's a live [/fund page](https://bench.mager.co/fund) and a [FUND.md](https://github.com/mager/mager-bench/blob/main/FUND.md); [Buy Me a Coffee](https://www.buymeacoffee.com/mager) is the working rail today, with GitHub Sponsors to follow. One rule either way: dollars only buy API tokens for published evals. Every funded run ships its raw responses and scores in `results.json`.

"Ships its raw responses" is now literal: every score on the dashboard links to a trace page with the exact prompt, the model's full response, and the judge's notes for each run. [Haiku's 0.7 on doom](https://bench.mager.co/models/claude-haiku-4-5/doom) stops being a number and becomes a readable failure.

Free tiers keep the leaderboard always on; crowdfunding unlocks the head-to-heads people actually argue about. All twelve challenges are on [GitHub](https://github.com/mager/mager-bench).
