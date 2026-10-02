---
title: "mager-bench 1.2: useful code, fast runs"
description: "Three everyday coding tasks with difficult edge cases, 36 exact checks, and the lowest supported reasoning effort."
pubDate: "2026-10-02T18:33:51-05:00"
link: "https://bench.mager.co/"
linkText: "Explore mager-bench 1.2"
category: tech
tags: ["AI", "benchmarks", "evals", "JavaScript"]
---

I rebuilt [mager-bench](https://bench.mager.co/) because I was having trouble explaining my own benchmark. Counterexample Lab asked models to write tests that exposed deliberately broken ledger implementations. I wanted something I could understand by looking at an input and the answer it should produce. The site also had too much language getting in the way of the results.

Version 1.2 asks each model to write three JavaScript programs:

- **Split a bill:** handle weighted shares, refunds, leftover pennies, and who pays whom.
- **Clean a contact CSV:** parse quoted commas and multiline fields, normalize emails, merge duplicate contacts, and count rejected rows.
- **Find a meeting time:** reconcile time zones, split workdays, overlapping appointments, and buffers around meetings.

Splitting $10 among three people leaves a cent to assign. Refunding part of that expense needs the same rounding rules. A meeting that starts exactly when a busy period ends should be allowed, unless that person needs a buffer.

Each program gets twelve fixed checks, for **36 checks total**. The returned values are compared with explicit expected outputs. There is no model judge. The site lets you select a case and read its expected answer in plain English before inspecting the JSON.

Speed is a requirement. Every eval uses the **lowest reasoning effort the model supports**, selected automatically from the local Codex catalog. There are at most three generation calls, a 90-second deadline per call, and no automatic retries. Each local code check has a 100-millisecond CPU limit. Those are limits, not a claim that every model will finish in the same time.

I tried GPT-6 Sol first, through my ChatGPT subscription. The CLI rejected it as unsupported for this account before it returned any code. The [attempt is saved and unscored](https://bench.mager.co/attempts/2026-10-02-gpt-6-sol-r1); I haven't substituted another model.

These are public tests of a small slice of JavaScript correctness, not a general model ranking. The [old results are archived](https://bench.mager.co/archive), and the [v1.2 protocol and source](https://github.com/mager/mager-bench/blob/main/docs/mager-bench-1.2.md) explain the scoring and limits.
