---
title: "tmux: orchestrating agents with send-keys and capture-pane"
description: "tmux is a 2007 terminal multiplexer that turns out to be the most native orchestration layer AI agents have: one session per agent, driven by any principal — human or model — with send-keys and capture-pane. No SDK, no plugin, no vendor lock-in; Claude, Codex, and OpenCode all speak it out of the box."
pubDate: 2026-08-23
category: tech
keyword: "tmux"
draft: false
tags: [tmux, terminal, agents, orchestration, claude, codex, opencode, tooling]
---

My always-on agent lives in a tmux session named `buzzacp` on a Mac mini in Chicago. The relay it talks to lives in `buzzrelay`. The fallback harness lives in `harness`. When the box reboots, recovery is two lines: SSH in, recreate the tmux sessions, walk away. The mechanism I use to drive other agents is the same one I've used for years to keep terminals alive. tmux didn't change. Everything around it did.

This is a refresher on tmux for people who know it exists but never got past `Ctrl-b d`, and then it's a guide to the part that's newly interesting: using tmux as an orchestration layer for AI agents. The second half is the point. The first half is because the second half stops making sense without it.

## The 90-second refresher

tmux is a terminal multiplexer. One server process, many sessions, each session holding as many terminals as you want. The property that made it famous: sessions keep running when you detach. Your SSH connection drops, your laptop closes, the build keeps going, and when you come back — from any machine — you attach and the screen is exactly where you left it.

The core loop is three commands:

```bash
tmux new -s project        # start a session named "project"
# ... work ...
# Ctrl-b d                  detach — session keeps running without you
tmux attach -t project     # come back later, from anywhere
```

That's the whole idea. Everything else is arranging terminals inside sessions.

## Sessions, windows, panes

The hierarchy: a session contains windows, and a window can be split into panes.

- **Sessions** are the top level — think "one per project," or, in the agent world, one per agent.
- **Windows** are tabs. Multiple contexts inside one session.
- **Panes** are split screens. Multiple things visible at once inside one window.

The prefix is `Ctrl-b` by default — press it, then the key. This table is 95% of daily use:

| What you want | Keys |
|---|---|
| New session | `tmux new -s <name>` |
| Attach to session | `tmux attach -t <name>` |
| Detach (session keeps running) | `Ctrl-b d` |
| New window | `Ctrl-b c` |
| Rename window | `Ctrl-b ,` |
| Next / previous window | `Ctrl-b n` / `Ctrl-b p` |
| Pick a window | `Ctrl-b w` |
| Split vertically | `Ctrl-b %` |
| Split horizontally | `Ctrl-b "` |
| Move between panes | `Ctrl-b <arrow>` |
| Zoom one pane to full screen | `Ctrl-b z` |
| Kill pane / kill window | `Ctrl-b x` / `Ctrl-b &` |
| Rename session | `Ctrl-b $` |
| List every keybinding | `Ctrl-b ?` |

If you hate `Ctrl-b` (and some people do), rebinding is one line in `~/.tmux.conf` — `set -g prefix C-a`. The default is fine; don't let configuration be the reason you don't try it.

## Why agents make tmux newly relevant

Terminal-based agents — Claude Code, Codex, OpenCode — are interactive TUIs. They're not scripts you run and forget; they're long-lived processes with state, context, and a conversation you want to keep. That's exactly what tmux is for. It gives them four things:

**Longevity.** An agent session survives disconnects. SSH blip, laptop close, network change — the TUI stays up, context intact. For a tool where context is the whole ballgame, surviving a dropped connection isn't a convenience; it's what makes the agent reliable.

**Reachability.** A tmux session is a stable handle on a process. Anyone who can run `tmux attach -t name` can pick up where the agent left off — from the machine, from another machine over SSH, from your phone if you tunnel in. I have attached to my Mac mini's agent session from a hotel room in Tokyo.

**Names.** Sessions have names, and names are how you keep a fleet of processes straight. Right now my mini runs `buzzrelay`, `buzzacp`, `buzzweb`, and `harness` — four named sessions, each running one long-lived process, each obvious from `tmux list-sessions` alone:

```
$ tmux list-sessions
buzzacp: 1 windows (created Sun Aug 23 08:17:06 2026)
buzzrelay: 1 windows (created Sun Aug 23 08:09:06 2026)
buzzweb: 1 windows (created Sun Aug 23 08:09:06 2026)
harness: 1 windows (created Sun Aug 23 08:09:06 2026)
```

**Supervision hooks.** A session either exists or it doesn't, and `tmux has-session -t name` tells you which with an exit code. My watchdog uses exactly that: a launchd job checks whether `buzzacp` is alive and recreates the session if it's gone. The healthcheck is one command.

The pattern, in one sentence: **one session per agent or product, named after it.** Each product — magerblog, beatbrain, prxps — gets its own context for free, structurally, the same way channels do. No `/clear` between unrelated jobs; the separation is baked into the layout.

## The orchestration half: driving tmux from outside

Here's the shift. Everything you do with the keyboard inside tmux, a script — or an agent — can do from outside with the CLI. That's the whole trick, and it's why tmux works as an orchestration layer for AI agents: it's a control protocol for terminal processes, and it's been there since 2007.

The commands an agent actually needs fit on a small card:

```bash
tmux new-session -d -s <name> -c <dir>   # spawn detached; get your prompt back
tmux send-keys -t <name> '<command>' Enter   # type into it
tmux capture-pane -t <name> -p           # read what's on screen
tmux capture-pane -t <name> -p -S -      # read the whole scrollback
tmux list-sessions                       # what's alive
tmux has-session -t <name>               # exit 0 if alive, 1 if gone
tmux kill-session -t <name>              # tear it down
```

The loop is: **send-keys in, capture-pane out.** An agent spawns a session, types a command, waits, reads the screen, decides what to type next. It's the same loop I've used to drive remote TUIs over SSH for years — the mechanics in my [killing OpenClaw post](/blog/2026-06-02-killing-openclaw/) are literally this: one Claude Code session in Tokyo drove a Mac mini in Chicago by sending keys into a tmux pane 6,200 miles away and reading capture-pane output to decide the next move.

A few details that matter when you script it:

- `Enter` is a key *name*, not a literal. `send-keys` interprets names like `Enter`, `Tab`, `Escape`, `Up`. It's how you send a full command.
- `send-keys -l` sends the text literally — no interpretation. Use it when the command contains characters that look like key names.
- `capture-pane -e` keeps escape sequences (colors, cursor motion) in the output; plain `-p` gives you readable text. Readable text is usually what you want.
- `-S -` captures the full scrollback, not just the visible screen. For a long agent conversation, that's where the history is.

Two commands that go one level deeper, both worth having in the toolkit:

**Blocking on a job.** `send-keys` is fire-and-forget — no exit code, no "did it land." To wait properly, have the pane signal when it's done:

```bash
tmux send-keys -t worker 'long-job && tmux wait-for -S job-done' Enter
tmux wait-for job-done        # blocks until the pane fires the signal
```

**Transcripts.** `tmux pipe-pane -t <name> -o 'cat >> ~/logs/<name>.log'` pipes every byte the pane prints into a file. It's raw terminal output — escape codes and all — so it's grep-able more than readable, but for "what did the agent actually output at 3am" it's unbeatable.

## The pattern: a principal agent running workers

Put it together and you get a real orchestration setup with no custom code. A principal agent — say, the always-on harness — supervises workers, each in its own named session:

```bash
# spawn a worker and give it a task
tmux new-session -d -s worker1 -c ~/Code/project
tmux send-keys -t worker1 'claude --print "refactor the auth module" --output-format json' Enter

# later: is it still going? what does the screen say?
tmux has-session -t worker1 && tmux capture-pane -t worker1 -p -S - | tail -40

# done: kill it, or leave it for a human to inspect
tmux kill-session -t worker1
```

The worker doesn't know it's being supervised. It's just a terminal process. The supervisor doesn't need an SDK. It's just running shell commands.

## Native with Claude, Codex, and OpenCode

The reason this needs no plugin and no MCP server: all three agents run shell commands as a first-class tool. tmux orchestration *is* shell commands. Claude Code's Bash tool, Codex's shell tool, OpenCode's Bash tool — any of them can run `tmux send-keys`, `tmux capture-pane`, `tmux list-sessions` exactly like a human would, because they're ordinary commands.

Which means the combinations are all on the table:

- A Claude Code session driving a Codex session in another pane — different vendor, different model, no integration code between them.
- An OpenCode principal (that's the term for the top-level agent in my setup) dispatching several workers, each in its own tmux session, polling them with capture-pane until the work lands.
- Any of them driving a *third* machine over SSH: `ssh macmini 'tmux send-keys -t codex ...'` — the orchestration crosses machines because tmux doesn't care where the client is.

Claude Code even ships a `--tmux` flag that opens a tmux-backed worktree session, which tells you how much the tooling vendors assume tmux is in the room.

The honest tradeoff: this is keystroke-level control, and keystrokes are dumb. No exit codes, no structured output, no typed results — you're parsing screens, which is exactly as fragile as it sounds. When I need typed results I don't use tmux; I use the agent's own structured surface — Claude Code's `--print --output-format json`, OpenCode's `run` with `--format json`, or the Agent Client Protocol seam my harness uses to drive agents headlessly. tmux is for the layer those protocols don't cover: the interactive, long-lived, "this is a real terminal" cases — onboarding auth, debugging a TUI, keeping a harness alive, supervising a fleet of sessions.

## Gotchas I've earned

**Nested tmux.** SSH into a machine and attach to its tmux session while already inside your own tmux — the prefix goes to the outer session. Press it twice (`Ctrl-b Ctrl-b`) to reach the inner one. Confusing for exactly the first hour.

**PATH in detached sessions.** A session inherits the environment of whatever shell created it. Start it from cron or a bare SSH shell and your Homebrew tools may be missing — "command not found: bun" is a real memory from setting up the Telegram harness. Start the session from a shell that sources your profile, or export PATH inline in the spawn command.

**Geometry.** A session created with no attached client gets a default size (80x24) until something attaches and it resizes. Fine for driving a TUI; don't depend on exact pane dimensions in scripts.

**send-keys has no receipt.** Keys are typed, not acknowledged. If the pane was busy or the shell wasn't ready, the keystrokes land somewhere unexpected. Poll with capture-pane and check the screen actually shows what you expect before you fire the next command.

**pipe-pane logs are soup.** Escape codes make transcripts ugly to read. Fine for grep and forensics; use capture-pane for anything you actually want to look at.

## What the last three months taught me

I've migrated the always-on agent three times in three months — OpenClaw to Claude Code to OpenCode — and tmux was the only constant. The brain, the keys, and the seams survive the migrations; tmux is the seam nobody thinks about because it's been there since before agents existed. Agents are shells with better brains. tmux gives them somewhere stable to sit, and it gives anything that can run a shell command a way to drive them. Everything in the orchestration half of this post is ordinary commands — the same ones that worked before agents existed, and the same ones that will work after the current runtimes are swapped out. That's why I keep building on it.