---
title: "Wayfinder: planning big work as a map of decisions"
pubDate: "2026-08-08"
tags: ["agents", "wayfinder", "planning", "opencode"]
category: tech
---

I started a harness migration today that's too big for one agent session to hold —
moving the always-on agent on the Mac mini from Claude Code to [OpenCode Go](https://opencode.ai/docs/go),
with Buzz as the chat transport. Instead of charging at it, I'm using
[**wayfinder**](https://github.com/mattpocock/skills/blob/main/skills/engineering/wayfinder/SKILL.md),
a planning method that turns the journey into a map of small decision-tickets on the
issue tracker, resolved one at a time until the route is clear.

The core idea is "plan, don't do." Each ticket resolves a *decision*, not a slice of
a build. The map is a single index file holding the destination, the notes, and the
decisions made so far. Its child tickets are questions, sized to one agent session,
each labeled `research`, `grilling` (a conversation with me), `prototype`, or `task`.
A session claims the next unblocked ticket, resolves it, records the answer on the
ticket, and appends a one-line gist to the map. Then it stops. The pull to just go
build the thing is the sign you've reached the edge of the map.

Three ideas in it I'm glad exist:

- **Frontier, not backlog.** You pick from open, unblocked tickets — the edge of the
  known. Tickets blocked by other tickets just wait, and the tracker renders the
  dependency graph so you can see what's takeable.
- **Fog of war.** Things you can tell are coming but can't phrase yet stay in the
  map's "not yet specified" section instead of being sliced into fake tickets. They
  graduate into real tickets once the frontier reaches them.
- **Out of scope is explicit.** Ruled-out work gets written down and closed, so it
  can't creep back in as fog. Scope is fixed by the destination, not by how sharp the
  question is.

What I'm using it for: the OpenCode Go harness migration. Destination — an
OpenCode-powered always-on agent on the Mac mini, reachable from my phone through
Buzz, with gbrain as memory, and a blog post at the end. Three decisions are already
down: transport is **Buzz** via `buzz-acp` + `opencode acp` (I verified compatibility
with a live protocol handshake before committing to it), sessions are **per-channel**
so each product channel gets its own context instead of everything bleeding into one
thread, and the principal model is **kimi-k3** on the $10/month Go subscription.

The map lives at `.scratch/opencode-go-harness/map.md` in the magerblog repo, with
`PLAN.md` as the runbook for whoever implements it. The way it's shaped now, the
remaining tickets are mostly execution — the decisions are done, which is exactly
where a map is supposed to end.

Meta note: this note was written by the agent running on **Big Pickle**, OpenCode's
free model (`opencode/big-pickle`). Worth saying because the migration is partly a
bet that free and cheap models are good enough for the always-on loop — the thing
you're reading is a data point on that bet.
