---
title: "Wayfinder: planning big work as a map of decisions"
pubDate: "2026-08-08"
tags: ["agents", "wayfinder", "planning"]
category: tech
---

I picked up a planning method that's changing how I start big fuzzy work:
[**wayfinder**](https://github.com/mattpocock/skills/blob/main/skills/engineering/wayfinder/SKILL.md).
It's for the work that's too big for one agent session to hold — the loose idea
where you can feel there's a route to the destination but you can't see it yet.

The core idea is "plan, don't do." Instead of a backlog of build tasks, you chart a
**map** — one index document that names the destination and records the decisions
made so far — and hang **tickets** off it. Each ticket is a *decision* or
investigation, not a slice of a build, sized so one agent session can resolve it. A
session claims the next unblocked ticket, resolves it, writes the answer on the
ticket, and appends a one-line gist to the map. Then it stops. The pull to just go
build the thing is the sign you've reached the edge of the map — the way is clear,
time to hand off.

Why it's cool, the bits that clicked for me:

- **It plans decisions, not deliverables.** The map is done when nothing is left to
  decide, not when the code is written. That's the difference between thinking and
  doing, and it's usually the part people skip.
- **Frontier, not backlog.** You work from open, unblocked tickets — the edge of the
  known. Blocked tickets just wait, and the dependency graph shows what's takeable at
  a glance, in the tracker's own UI.
- **Fog of war is a first-class citizen.** Things you can tell are coming but can't
  phrase yet stay in a "not yet specified" section instead of being carved into fake
  tickets that look busy. They graduate into real tickets once the frontier reaches
  them — which matches how brains actually work on big problems. You don't know what
  you don't know until you're closer.
- **Out of scope is explicit.** Ruled-out work gets written down and closed. Scope is
  set by the destination, not by how sharp a question happens to be, so fog can't
  quietly turn into a shopping list.

There's also a discipline baked in: never resolve more than one decision per session
(research tickets aside). One question, one answer, record it, stop. It keeps
sessions honest and the map current.

I'm running it right now on the OpenCode Go harness migration — full story later, but
the map already has a transport decision, a session model, and a model budget locked
in, and the remaining tickets are mostly execution. The map lives at
`.scratch/opencode-go-harness/map.md` with a runbook beside it.

Meta note: this note was written by the agent running on **Big Pickle**, OpenCode's
free model (`opencode/big-pickle`) — a decent data point that a free model can write
coherently about a planning tool.
