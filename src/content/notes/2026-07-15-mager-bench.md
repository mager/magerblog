---
title: "mager-bench"
pubDate: "2026-07-15"
link: "https://mager-bench.mager.co"
linkText: "mager-bench.mager.co"
tags: ["AI", "Python", "benchmarks", "evals", "LLM"]
category: tech
---

[mager-bench](https://mager-bench.mager.co) expanded from 5 to 9 challenges. The four new ones cover territory the original set glossed over — testing discipline, debugging skill, async Python, and SQL fluency.

**test-writing** gives you a `parse_duration()` function and asks for a proper pytest suite using `@pytest.mark.parametrize` and `pytest.raises`. The interesting signal isn't whether models know pytest syntax — they all do — it's whether they parameterize across edge cases or just write three happy-path tests and call it done.

**debug** is a broken `top_words()` implementation with three distinct bugs. No stack trace, no error message — just wrong output. It tests careful reading more than raw code generation. Models that reach for the REPL in their heads before editing tend to do better here.

**async-fetch** asks for concurrent `aiohttp` requests with a per-request timeout and exponential backoff retry. It's a proxy for "can the model reason about failure modes at the call site, not just happy-path concurrency."

**sql** is a PostgreSQL query over an orders/customers schema that requires CTEs and window functions to answer cleanly. Most models can write either; the challenge is knowing when a window function is the right tool instead of a subquery.

All nine challenges are on [GitHub](https://github.com/mager/mager-bench).
