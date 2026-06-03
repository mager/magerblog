---
title: "Keeping an always-on agent alive across reboots"
pubDate: "2026-06-03"
tags: ["agents", "macOS", "harness"]
category: tech
---

I run a Claude Code agent on a Mac mini in Chicago that I reach over Telegram. The
hard part isn't the agent, it's keeping it up without me — across crashes, model
swaps, and the occasional reboot. The fix is layered supervision, where each
layer owns one kind of failure:

- **`run.sh`** loops the agent and watches its exit code. An in-session model
  switch exits with code 42; the loop sees that and relaunches on the new model.
  Any other code stops the loop and hands control up.
- **tmux** holds the session. The CLI is interactive and wants a PTY, so it runs
  inside a detached tmux session rather than a bare background process.
- **launchd** is the floor. A `LaunchAgent` with `RunAtLoad` starts the tmux
  session at login (so it survives a reboot), and a `StartInterval` watchdog
  re-checks every couple of minutes and rebuilds the session if it's gone.

The thing I keep relearning: "restart it when it dies" is not one job. A reboot,
a crash, and an intentional model swap are different failures, and each wants a
different layer to catch it. Pile them all into one script and it's brittle;
separate them and the whole thing just stays up.
