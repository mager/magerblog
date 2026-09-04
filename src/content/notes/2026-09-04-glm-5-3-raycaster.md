---
title: "GLM 5.3 vs. my raycaster, or: the benchmark fought back"
pubDate: "2026-09-04"
link: "https://bench.mager.co"
linkText: "bench.mager.co"
category: tech
tags: ["AI", "benchmarks", "evals", "LLM", "agents", "Zhipu", "Vercel"]
---

I put GLM 5.3 on [mager-bench](https://github.com/mager/mager-bench) today — Zhipu's flagship coder, run two ways (direct Z.ai key, plus Vercel AI Gateway routing). First pass: 11 of 13 challenges scored, averaging **7.8**. The current board leader is GPT-OSS 120B at 6.4. Fizzbuzz 9.7, refactor 9.3, readme-writer 9.0.

Those numbers are preliminary — they're not on the board yet, and the story of why is more interesting than the numbers.

## The model fought the harness twice

**Doom + slots produced zero characters.** Not bad code — no code at all. GLM 5.3 thinks before it writes, and thinking tokens count against the same budget as the answer. On the two big-build challenges (7000-token answer budget + 8192 headroom), it spent the entire 15,192-token budget thinking about raycasting and shipped nothing: `finish_reason=length`, empty response. A starvation artifact, not a score. The fix is a 32768-token thinking headroom — billed only on tokens actually used, so the generous cap is free insurance. Three parallel copies then ground away at doom for 6+ minutes each.

**The judge crashed on debug.** The board judge is now Claude Sonnet 5, which also thinks by default. On the long debug responses it thought past the 8192-token judge cap and returned an empty verdict — a 0.0 that dragged the debug mean to 4.9 ± 3.44. Same failure class as the first one, one level up: the grader starved instead of the student. Judge cap is now 16384. Both rules are the same rule I've had since July: a 0.0 with a crash signature is a crash, re-run it, never merge it.

## Then the agent harness fought me

The run itself was executed by an agent session, and watching it was its own eval. The queue transport failed three times mid-run (`Queue delivery failed at the transport, retrying`), the workflow SDK kept re-executing crashed steps via redelivery, and `py-spy` couldn't attach without elevated ptrace — so for the 6-minute doom calls, the only proof of life was a pile of established HTTPS connections to the gateway and three worker threads doing network I/O. When I asked the dumb question — "why not streaming??!" — there was no good answer. Blocking calls with 10-minute SDK timeouts and total silence is no way to run 39k-token generations.

So the gateway provider now streams and accumulates: same return contract, but a stderr heartbeat every 30 seconds (`+90s: 0 text chars, 4120 think chars`) so silence reads as *thinking* versus *stalled*, an 1800s timeout, and mid-stream cuts that report how far they got instead of vanishing. That feature exists because I got impatient watching nothing happen, which is as good a reason as any.

The run never finished cleanly. The sandbox held the only copy of the 11 scored challenges, the handoff I asked for never materialized, and the scores never landed in `results.json` — which still shows five models, no GLM. Meanwhile the funding wishlist already says GLM 5.3 is "scored." It isn't, quite. The board will catch up when a clean rerun lands; until then the 7.8 lives in run logs, not on the leaderboard. I'm leaving the wishlist as-is rather than flip-flopping it, but consider this note the disclosure.

## What actually shipped today

- Direct Z.ai provider plus gateway fallback routing: one `AI_GATEWAY_API_KEY` now stands in for any missing family key, with unified billing visible under AI Gateway Logs/Usage.
- Spend guards, learned from a $0.90 window where 55% was the judge: `--dry-run` (mandatory before paid runs), `--thinking-budget`, `--reasoning-effort`, `--thinking-headroom`, `--judge-max-tokens`, `--gateway-timeout`.
- The harness moved to opencode: `/bench` is canonical, with the Claude skill mirroring it.
- [bench.mager.co](https://bench.mager.co) redeployed with all of the above.

## Update (Sept 4, morning)

The rows are in `results.json`. Rebuilt overnight and morning under the new harness: 10 fresh challenges plus the clean debug re-judge, all Sonnet-5 graded — refactor 9.6, fizzbuzz 9.3, readme 9.0, down to api-client 4.9, debug 7.3. GLM 5.3 sits atop [the board](https://bench.mager.co) at 11/13 challenges. Doom and slots remain failed-with-notes: doom thought through a full 39k budget without writing a character (more headroom just buys more thinking — next attempt gets `--reasoning-effort low` instead), slots wrote 8–24k chars of real slot machine and still hit the cap. Eve's lost 7.8 checks out. Believed.
