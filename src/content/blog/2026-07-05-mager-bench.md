---
title: "mager-bench: a personal coding model benchmark"
description: "Instead of reading someone else's leaderboard, build a small set of tasks you actually care about and run them yourself every time a new model drops — Simon Willison's SVG pelican test, but for code."
pubDate: 2026-07-05
category: tech
tags: ["tech", "ai", "benchmarks", "python", "claude"]
---

Simon Willison has a benchmark he runs on every new model: ask it to draw a pelican riding a bicycle as an SVG. He compares the actual drawings side by side. It sounds absurd. The point isn't the pelican — it's that he runs the same prompt himself every time, and over enough models and months, the variation tells him something real about what changed and what got better. You don't need a giant eval suite to have opinions about models. You just need something consistent.

[mager-bench](https://github.com/mager/mager-bench) is the coding equivalent. Five tasks I actually care about, run against any combination of models, scored on three dimensions. When a new model drops, I run `python bench.py` and immediately see where it stands.

---

## The five challenges

The tasks are small enough to run in seconds but designed to expose different failure modes:

1. **fizzbuzz** — baseline correctness and code style. Anything that flubs this is disqualified from further consideration.
2. **binary-search** — algorithm implementation with a full docstring: Args, Returns, Raises, and three inline examples. Tests whether a model can write correct code *and* document it properly in one pass.
3. **api-client** — write a Python `APIClient` class with type hints, a custom exception, class and method docstrings, and a usage example. More surface area, more places to cut corners.
4. **readme-writer** — write a README for a fictional CLI tool called `snapdiff`. No code required. This is a pure writing task — structure, clarity, and whether the model can make a tool sound useful without knowing what it actually does.
5. **refactor** — clean up a deliberately bad function and explain each change. The explanation is the thing being tested. Any model can rewrite bad code; fewer can articulate why the new version is better.

The mix is intentional. Correctness alone is too narrow. A benchmark that only tests whether code runs misses most of what makes a model worth using.

---

## How scoring works

Each response goes to an LLM-as-judge call — Claude Sonnet reads the response against the challenge rubric and scores it 0–10 on three dimensions:

- **Correctness** — does the code solve the problem, and does it handle edge cases?
- **Code Quality** — idiomatic, clean, no unnecessary complexity?
- **Documentation** — docstrings, comments, examples — useful, not boilerplate?

The total score is the average of the three. Speed in milliseconds is tracked and shown in the output table but doesn't affect ranking. Results print as a ranked table and can be saved to JSON.

### Why documentation is a first-class dimension

Most public benchmarks measure correctness and stop there. But in a working codebase, documentation is half the job. A function that's correct but undocumented is tech debt with better test coverage. If I'm evaluating a model to help me write code I'll maintain, I want to know whether it writes the kind of code I'd be glad to find six months later.

Treating docs as a real scoring axis changes what you're optimizing for.

---

## The code

Setup:

```bash
pip install -r requirements.txt
cp .env.example .env
python bench.py
# or target specific models and a specific challenge:
python bench.py --models claude-opus-4-8,gpt-4o --challenge binary-search
```

A challenge definition from `challenges.py`:

```python
Challenge(
    name="binary-search",
    description="Binary search implementation with full docs",
    prompt=(
        "Implement `binary_search(arr: list[int], target: int) -> int` in Python. "
        "It should return the index of target in a sorted list, or -1 if not found. "
        "Write a proper docstring with Args, Returns, and Raises sections. "
        "Add inline comments explaining the algorithm logic. Include 3 test cases as examples in the docstring."
    ),
    rubric={
        "correctness": "Is the binary search algorithm correct? Does it handle edge cases (empty list, target not found, duplicates)?",
        "quality": "Is the loop/recursion clean? Correct handling of integer overflow for mid calculation?",
        "documentation": "Does it have Args/Returns/Raises docstring? Are inline comments meaningful (not just restating the code)? Are the 3 examples correct?",
    },
),
```

The judge call in `judge.py` — one call to Claude Sonnet per response:

```python
msg = client.messages.create(
    model="claude-sonnet-4-6",
    max_tokens=512,
    messages=[{"role": "user", "content": prompt}],
)
```

Adding a new model from a provider that's already wired up is one line in `providers.py`. That's the design intent — when the next thing drops, the barrier to running it against the suite is as close to zero as possible.

---

## The LLM-as-judge tradeoff

Using Claude to judge Claude's competitors is a bit recursive, and worth naming directly. Claude Sonnet grading GPT-4o is not a neutral evaluation. There's a reasonable concern that a model will score its own outputs favorably, even when prompted to be objective.

The alternative is runnable unit tests — more objective, no model in the loop, deterministic. But unit tests only cover correctness. They can't score documentation quality or code clarity in any meaningful way. For the dimensions I actually care about, LLM-as-judge is the only practical option.

A future version could use unit test execution for the correctness dimension specifically and reserve the judge for code quality and documentation. That would tighten the correctness signal considerably. For v0.1, the whole pipeline runs through the judge.

---

## What it's actually for

This isn't a published leaderboard. It's a personal tool. The goal is to have a consistent, repeatable way to evaluate models against tasks I run into regularly — so that when someone says "the new X model is incredible" I have a way to check that claim in about two minutes.

The pelican test works because Simon runs it himself. That's the whole thing. mager-bench is the same idea: a small set of opinions made executable.

The repo is at [github.com/mager/mager-bench](https://github.com/mager/mager-bench) — v0.1, Python, MIT license.

---

## Live results

I also put the results somewhere you don't need to clone anything to see: [mager-bench-web.vercel.app](https://mager-bench-web.vercel.app/). It reads the same JSON `bench.py` writes out, ranks models by average score, and breaks each one down by challenge and by correctness/quality/documentation. There's a JSON endpoint behind it too, if you'd rather pull the numbers than look at the table.
