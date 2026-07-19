---
title: "mager-bench: free models, thinking-token bugs, and traces"
pubDate: "2026-07-18"
link: "https://bench.mager.co"
linkText: "bench.mager.co"
category: tech
tags: ["AI", "benchmarks", "evals", "observability", "Llama", "Gemini"]
---

Quick update on [mager-bench](https://github.com/mager/mager-bench). Three things happened today: the leaderboard got its first free models, two real eval-engineering bugs surfaced and got fixed, and every run is now traced end to end.

## Free models on the board

I added Llama 3.3 70B via Groq's free tier and Gemini 2.5 Flash via Google AI Studio's free tier. Total API cost for the model calls: $0.

One wrinkle: I set out to add Gemini 2.0 Flash, but Google has fully retired it — the API 404s with "no longer available." 2.5 Flash is the free-tier successor, so that's what's on the board.

## Two bugs, one cause: thinking tokens

Both bugs came from the same place — models that think by default, and token budgets that didn't account for it.

**The judge crashed before scoring.** The judge is Claude Sonnet 5, which thinks by default, and its token cap counted thinking and verdict together. Sometimes it spent the entire budget thinking and died before emitting a score. Fix: parse the response's text blocks properly and give the judge a much bigger budget.

**Gemini scored zero on everything.** Gemini 2.5 Flash also thinks by default, and its thoughts counted against the same output budget as its answer. Its first run produced ~300-character truncated stubs, which the judge correctly scored 0. Fix: give thinking its own headroom on top of the visible-answer budget, then re-run.

If you're building evals in 2026, this is the class of bug to expect. The model isn't bad; your token accounting is.

## The results

Final board across 13 challenges, judged by Claude Sonnet 5:

| Model | Tier | Avg |
|---|---|---|
| Claude Haiku 4.5 | cheap | 6.7 |
| Claude Sonnet 4.6 | paid | 6.3 |
| Llama 3.3 70B | free | 5.5 |
| Gemini 2.5 Flash | free | 5.4 |

The free models hang surprisingly close to the paid ones on bread-and-butter tasks — Llama scored 9.7 on fizzbuzz and 8.7 on refactor. But both collapse to roughly 0 on the big signature challenges (the doom raycaster, the slot machine). And Llama has one genuine superpower: speed. About 1.9s average response on Groq, versus 22–24s for everything else.

## Traces

Every bench run is now instrumented with Arize AX via OpenTelemetry/OpenInference: one CHAIN span per model×challenge with the scores attached as metadata, auto-instrumented Anthropic and OpenAI calls nested underneath, and each result row stores its trace_id. Run detail pages on [the dashboard](https://mager-bench-web.vercel.app) deep-link straight to the trace in Arize, so when a score looks wrong I can open the exact conversation that produced it.

That's the loop I wanted: benchmarks are effectively free now if you're willing to debug thinking-token budgets, and observability is what closes the loop when the numbers look off.
