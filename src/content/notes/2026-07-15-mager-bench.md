---
title: "mager-bench"
pubDate: "2026-07-15"
link: "https://bench.mager.co"
linkText: "bench.mager.co"
tags: ["AI", "Python", "Go", "Elixir", "benchmarks", "evals", "LLM"]
category: tech
---

[mager-bench](https://bench.mager.co) expanded from 5 to 11 challenges. The four new ones cover territory the original set glossed over — testing discipline, debugging skill, async Python, and SQL fluency.

**test-writing** gives you a `parse_duration()` function and asks for a proper pytest suite using `@pytest.mark.parametrize` and `pytest.raises`. The interesting signal isn't whether models know pytest syntax — they all do — it's whether they parameterize across edge cases or just write three happy-path tests and call it done.

**debug** is a broken `top_words()` implementation with three distinct bugs. No stack trace, no error message — just wrong output. It tests careful reading more than raw code generation. Models that reach for the REPL in their heads before editing tend to do better here.

**async-fetch** asks for concurrent `aiohttp` requests with a per-request timeout and exponential backoff retry. It's a proxy for "can the model reason about failure modes at the call site, not just happy-path concurrency."

**sql** is a PostgreSQL query over an orders/customers schema that requires CTEs and window functions to answer cleanly. Most models can write either; the challenge is knowing when a window function is the right tool instead of a subquery.

Two more just landed: **go-test** asks for a table-driven `WordCount` test file using `t.Run` subtests and a benchmark — the idiomatic Go testing pattern that most models know in theory but often write awkwardly. **elixir-test** asks for an ExUnit suite with `describe` blocks and `assert_raise`, including a unicode string case that trips up anything relying on byte counts instead of `String.length/1`.

All eleven challenges are on [GitHub](https://github.com/mager/mager-bench).
