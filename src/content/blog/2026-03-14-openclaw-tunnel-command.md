---
title: "OpenClaw: I Turned Three Shell Aliases Into a Real CLI Command"
description: "How a weekend contribution to OpenClaw replaced my autossh aliases with `openclaw tunnel up/down/status` — and what I learned reading a real codebase to do it right."
pubDate: 2026-03-14
category: code
draft: true
---

I had three shell aliases I typed every time I connected to my remote OpenClaw gateway:

```bash
alias tunnel="autossh -M 0 -f -N macmini-tunnel"
alias untunnel="pkill -f autossh"
alias tunnelstat="lsof -i -nP | grep 18789"
```

Every headless OpenClaw user has some version of these. They work, but they're invisible — `openclaw --help` has no idea they exist, there's no PID tracking, and `pkill -f autossh` is the kind of command you have to think about before running.

So I contributed them back as a proper command.

## The PR: `openclaw tunnel`

Three subcommands, one clean interface:

```bash
# Start a background SSH tunnel to your remote gateway
openclaw tunnel up user@myserver

# Check status (target, PID, port, liveness)
openclaw tunnel status

# Kill it cleanly
openclaw tunnel down
```

State persists to `~/.openclaw/tunnel.pid.json` so `down` and `status` work across shells and terminal sessions.

## What I learned reading the codebase first

Before writing a single line, I spent time in the compiled dist to understand what already existed. Turns out `src/infra/ssh-tunnel.ts` already had a solid `startSshPortForward()` with the exact SSH flags I needed — `ServerAliveInterval`, `ExitOnForwardFailure`, `BatchMode`. The gateway's `probe --ssh` command was already using it internally.

The right move was to reuse that, not reinvent it. The new command spawns `/usr/bin/ssh` directly (detached, so it outlives the CLI process) using the same flag discipline, and wraps the lifecycle with a PID file.

The registration pattern was also already there — `src/cli/program/register.subclis.ts` has a clean lazy-load array where every subcommand lives. Adding `tunnel` was nine lines.

## Why `autossh` is the wrong dependency

The AI-generated prompt I started with suggested using `autossh` with `-M 0 -f -N`. That would have been a mistake — it adds a binary dependency that many systems don't have, and OpenClaw already implements the keepalive logic in pure Node/ssh. `ServerAliveInterval=15` + `ServerAliveCountMax=3` does the same job without the extra dep.

## The broader pattern

The interesting thing about this contribution is what it reveals about how OpenClaw is designed. The SSH tunnel infrastructure existed and was battle-tested — it just wasn't exposed to users as a named command. The surface area was the gap, not the implementation.

That's a good sign in a codebase. When you can add a feature by connecting existing pieces instead of building new ones, the architecture is doing its job.

PR: [mager/openclaw → feature/tunnel-command](https://github.com/mager/openclaw/pull/new/feature/tunnel-command)

If you're running a remote OpenClaw gateway and you have similar aliases in your shell config — maybe this lands and you can delete them.
