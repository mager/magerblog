---
title: "Opus 5 is the default now, and subagents can nest three deep"
pubDate: "2026-07-26"
link: "https://github.com/anthropics/claude-code/blob/main/CHANGELOG.md"
linkText: "claude-code CHANGELOG"
category: tech
tags: ["AI", "claude", "claude-code", "agents", "Opus"]
---

Claude Code 2.1.219 shipped three changes worth pulling out of the changelog.

**Opus 5 (`claude-opus-5`) is now the default Opus model, with a 1M context window.** The context number is the part that matters for how I actually use it. My always-on session runs for days at a time, and the thing that used to end a session wasn't the task getting hard — it was the context filling up with tool output from work that was already finished.

**Fast mode now applies to Opus 5 and Opus 4.8.** Worth being precise about what this is, because the name invites the wrong assumption: fast mode is still Opus, with faster output. It isn't a silent downgrade to a smaller model. Toggle it with `/fast`.

**Subagents can spawn nested subagents, up to depth 3 by default.** This is the one that changes my setup. I run a [principal-agent pattern](/blog/2026-05-08-advisor-strategy-principal-agent/) — one always-on session on a Mac mini in Chicago that dispatches per-product subagents for magerblog, beatbrain, prxps, loooom, and kotsu. Until now that tree was two levels: the principal delegates once, and whatever it delegated to had to finish the job alone. A subagent that needed a code review or a scraper check had to do it inline.

The honest tradeoff: every level of nesting is another process with its own cold-start context, re-deriving things the parent already knew. Depth 3 is a budget, not a target. The failure mode isn't running out of levels — it's a tree where the leaves are solving the wrong problem confidently, and the root has no way to tell.

It lines up with the [unhobbling shift](/blog/2026-07-24-context-engineering-claude-5/) from earlier this week. The model gets trusted with more judgment; the harness gets room to build deeper structures. Both bets are that the thing at the bottom of the tree can read the room.
