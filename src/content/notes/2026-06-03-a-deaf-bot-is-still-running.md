---
title: "TIL: a running process isn't a connected one"
pubDate: "2026-06-03"
tags: ["TIL", "debugging", "Claude Code"]
---

My always-on Telegram bot stopped replying. Every obvious check said it was
fine: the process was alive, the token authenticated, no webhook was set, and
Telegram's `pending_update_count` was `0` — meaning the bot *was* polling and
consuming my messages. It even sent the "typing…" indicator. It just never
answered.

The tell was that last fact. Consuming updates but producing no reply means the
messages were being read and then dropped on the floor. The bot delivers each
inbound message to its host session as an MCP notification, and the session only
surfaces that notification if it was launched subscribed to the channel. Mine
had been restarted manually — right after a CLI auto-update — without the flag
that does the subscribing. So the bot dutifully drained the queue into a session
that wasn't listening.

The lesson I keep relearning: "the process is up" and "the process is wired to
the thing it talks to" are different claims, and only the second one matters.
Health checks that stop at liveness will happily report green on a deaf service.
