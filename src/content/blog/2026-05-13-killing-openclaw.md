---
title: "Claude Code is the better OpenClaw"
description: "I love OpenClaw. I hate that it doesn't run on my Claude Pro subscription. Turns out Claude Code, with the Telegram channels plugin and one CLAUDE.md, is the same harness — minus the daemon, the API bill, and the second LLM provider. Here's the actual recipe, ported from a hotel in Tokyo to a Mac mini in Chicago in forty minutes."
pubDate: 2026-05-13
category: tech
draft: true
tags: [claude, openclaw, claude-code, channels, telegram, mac-mini, brain, principal-agent]
---

I love OpenClaw. I hate that I can't run it on my Claude Pro subscription.

The harness is OpenAI-OAuth-only — the daemon needs an Anthropic API account to talk to Claude, and I'm not paying for that on top of GPT Pro on top of Claude Pro. So OpenClaw has been running on Codex this whole time, and my actual Claude Pro account has been sitting idle on my laptop, watching its sibling do all the work.

It bugged me. Not enough to fix it, until I sat down on vacation, opened Claude Code on the laptop, and noticed something: `claude --channels plugin:telegram@claude-plugins-official`, plus one `CLAUDE.md`, plus my Pro subscription, *is* OpenClaw. Same shape — always-on session, Telegram reach, brainpack with personality, principal-agent pattern for sub-tasks — minus the daemon I was babysitting, minus the API account I'd refused to set up, minus the whole second LLM provider.

So today I'm killing OpenClaw. From a hotel in Tokyo. SSH'd into the Mac mini in Chicago. While Claude Code drives the whole port.

This post is what I actually did, what's running now, and what I'm deleting when I get back to Chicago.

## The setup

OpenClaw was Codex-shaped. It ran as a daemon on a Mac mini under Tailscale, polled Telegram via two bots (`default` and `genny`), kept a brain at `~/.openclaw/workspace/` (SOUL.md, IDENTITY.md, USER.md, MEMORY.md, AGENTS.md, etc.), and used OAuth-to-Codex for inference. The whole thing worked, but it was infrastructure I was babysitting — backup files named `openclaw.json.clobbered.2026-04-11T13-24-46-956Z` are not the sign of a healthy daemon.

What I wanted: the same shape, but Claude-native, on my Pro subscription, with the brain in a place Claude Code already knows how to find.

What worked: three native primitives, in this order.

## 1. `claude --channels plugin:telegram@claude-plugins-official`

The Telegram plugin is a Claude Code plugin from the official marketplace. The MCP server runs on Bun and provides `reply` / `react` / `edit_message` tools to the assistant. The setup inside `claude`:

```
/plugin install telegram@claude-plugins-official
/reload-plugins
/telegram:configure <bot-token-from-BotFather>
```

That writes the token to `~/.claude/channels/telegram/.env` with `chmod 600`. Then — and this is the part I missed for thirty minutes while debugging a "bot is typing but never replies" loop — you have to **exit and relaunch with the channel flag**:

```
claude --channels plugin:telegram@claude-plugins-official
```

Without `--channels`, the MCP server is up and the plugin's tools are registered, but there's no socket pushing inbound DMs into the running session. Your bot shows the typing indicator (server received the message), then goes silent (session never sees it). The flag is what wires inbound. Once it's on, Claude Code prints:

> Listening for channel messages from: plugin:telegram@claude-plugins-official  
> Experimental · inbound messages will be pushed into this session, this carries prompt injection risks.

That second line is real, and it's why the next two commands matter:

```
/telegram:access pair <code>
/telegram:access policy allowlist
```

Pairing captures your numeric Telegram ID into `~/.claude/channels/telegram/access.json`. Switching to `allowlist` means strangers DM'ing your bot get nothing — no pairing reply, no inference. Only IDs you've explicitly approved talk to the session.

That's the entire Telegram layer. No Tailscale glue, no custom long-poller, no `default-update-offset.json`. The plugin handles all of it.

## 2. `~/.claude/CLAUDE.md` with `@`-imports

OpenClaw kept its brain at `~/.openclaw/workspace/`. Claude Code reads `CLAUDE.md` from three places automatically: `~/.claude/CLAUDE.md` (user-global, every session), `<cwd>/CLAUDE.md` and every parent up to home (auto-discovered), and `.claude/CLAUDE.md` in the repo. The `@path/to/file.md` syntax inlines a file's contents at session start.

So the port was: copy the brain to a location that isn't OpenClaw-shaped, then write one `CLAUDE.md` that pulls it in. I moved `~/.openclaw/workspace/` to `~/Code/brain/` (preserving the git history — the brain was already a repo, now living at [github.com/mager/brain](https://github.com/mager/brain), private), then wrote this in `~/.claude/CLAUDE.md` on the mini:

```markdown
# Mager brain — loaded into every Claude Code session on this machine

## How DMs reach you
Inbound: Telegram DM → channels MCP → pushed into this session as a prompt.
Outbound: call the `reply` tool on the `telegram` MCP server.

## Principal-agent pattern
This session is the principal. For narrow sub-tasks, dispatch a subagent via
the Agent tool. Definitions live in ~/.claude/agents/. Subagents return text,
not control.

## Brain
@~/Code/brain/IDENTITY.md
@~/Code/brain/SOUL.md
@~/Code/brain/USER.md
@~/Code/brain/BRAINPACK.md
@~/Code/brain/AGENTS.md
@~/Code/brain/TOOLS.md
@~/Code/brain/HEARTBEAT.md
@~/Code/brain/WATCHLIST.md
@~/Code/brain/MEMORY.md

Memory entries (~/Code/brain/memory/YYYY-MM-DD*.md) are NOT auto-imported.
Read them on demand when a topic surfaces.
```

User-global location means every session on that machine starts with my brain loaded — regardless of which repo I `cd` into. No wrapper script, no shadow copy, no daemon to keep alive. Claude Code's existing file discovery does the work that OpenClaw was doing with a custom workspace.

The brain repo at github.com/mager/brain is private, and honestly I'm not sure it needs to be a repo at all. With one Mac mini and one laptop, plain markdown files in `~/Code/brain/` are enough. The repo gives me version history and a path to portability if I ever add a second machine. For now it's belt-and-suspenders.

## 3. Claude Pro, not API

The advisor-tool post had a footnote that turned out to be the load-bearing detail: **the advisor tool is API only**. Pro and Max credits don't apply. I built [conseiller](https://github.com/mager/conseiller) as a small API harness exactly because of that — it needs API tokens.

But the always-on harness doesn't. `claude --channels` runs against your subscription. The login flow is `/login` → option 1 (Claude account with subscription) → paste the OAuth code. After that, the session banner reads `Sonnet 4.6 · Claude Pro · Mager` and every Telegram round-trip is on subscription credits, not per-token billing.

Which means: I can cancel my GPT Pro subscription that I was renewing only because OpenClaw was wired to it. And I don't need to set up an Anthropic API account to run an always-on agent over Telegram. The Pro subscription I already have is enough.

The advisor-tool integration (conseiller) doesn't fit this stack — that lives separately and gets called at planning moments when I actually want Opus-level second-opinions. For the always-on loop, Sonnet 4.6 on Pro is fine.

## What I'm deleting when I get back to Chicago

- `~/.openclaw/` on the Mac mini — daemon state, backup files, the whole tree. The brain markdown was already migrated to `~/Code/brain/`.
- The OpenClaw `default` and `genny` long-pollers — they were still running. New Claude bot is on a fresh BotFather token, no collision.
- My GPT Pro subscription. I'll let it lapse at the end of the cycle. A month of GPT was fine; a year of Claude on Pro is going to be better.

## What I'm keeping

- The brain. Same files I curated for OpenClaw — SOUL, IDENTITY, USER, MEMORY, AGENTS, the daily memory entries. They didn't need to change. They just needed a CLAUDE.md to point at them.
- The Mac mini under Tailscale. Same hardware, same network, same Telegram bot pattern.
- The principal-agent pattern. Native Claude Code has the `Agent` tool; subagent definitions live in `~/.claude/agents/`. The always-on session is the principal, and I can dispatch a "draft a post about X" or "check the scraper" subagent when I want without rebuilding the harness.
- The Telegram reach. From a hotel room in Tokyo I can ping a Mac mini in Chicago and get work done. That's the actual feature.

## The session lifetime thing worth calling out

One detail that confused me and will probably confuse anyone else copying this recipe: a long-running `claude --channels` session is one continuous conversation. Every Telegram DM adds to the same context. Modern Claude Code auto-compacts when it approaches the window limit, so I don't need to run `/compact` by hand — but I do want to run `/clear` between unrelated tasks, otherwise the "fix the recipe page" call still has the prior "draft a post about X" context attached.

If you treat the Telegram thread like a Discord channel, that's the right mental model. Each new task: `/clear`, then DM. Continuous threads: just keep going, auto-compact handles it.

## The way this actually got built

The detail that delighted me, and that I think is worth surfacing: I didn't run any of the commands above. Claude Code (on my laptop in Tokyo) drove all of it, on the Mac mini in Chicago, by SSH'ing in and driving a `tmux` session it had started.

The mechanic is dumb and great. On the mini:

```bash
ssh macmini '/opt/homebrew/bin/tmux new-session -d -s oc2 -c ~/Code'
ssh macmini "/opt/homebrew/bin/tmux send-keys -t oc2 '~/.local/bin/claude' Enter"
```

Then to interact with the TUI running inside the tmux pane, `send-keys` for input and `capture-pane` to read what's on screen:

```bash
ssh macmini "/opt/homebrew/bin/tmux send-keys -t oc2 '/login' Enter"
ssh macmini "/opt/homebrew/bin/tmux capture-pane -t oc2 -p | tail -30"
# returns the OAuth URL, I open it in a browser, paste the code back
ssh macmini "/opt/homebrew/bin/tmux send-keys -t oc2 '<auth-code>' Enter"
```

This is how Claude installed the Telegram plugin, configured the bot token, paired my Telegram ID, debugged the missing `--channels` flag, copied the brain to `~/Code/brain/`, wrote `~/.claude/CLAUDE.md`, and restarted the session. I was reading capture-pane output in my Claude Code window and making decisions; the actual keystrokes landed in a tmux pane 6,200 miles away.

There were two real moments of debugging that capture-pane made tractable. The first was the Telegram MCP server failing on startup because `bun` wasn't on the tmux session's PATH — capture-pane showed `1 MCP server failed · /mcp`, navigating to `/mcp` showed `plugin:telegram:telegram · ✘ failed`, and one `brew install oven-sh/bun/bun` + a relaunch fixed it. The second was the "bot is typing but never replies" loop — capture-pane showed the session sitting idle with no inbound prompt, which is what made me re-read my own advisor-strategy post and notice the `--channels` flag I'd skipped.

Without `capture-pane` I'd have been guessing at what the remote TUI looked like. With it, the loop is: send keys, capture pane, read the output, decide what to send next. It's not pretty. But it works, and it's the loop that let one Claude Code session in Tokyo install software, configure auth, debug an MCP failure, and migrate a brain on a machine on the other side of the planet — without any of it ever being "automated" in the brittle, script-the-keystrokes-in-advance sense.

## What this took

Forty minutes. From a hotel room in Tokyo. The Mac mini in Chicago is a remote desktop I haven't touched physically in two weeks. SSH in, `tmux new-session`, run Claude Code in it, install one plugin, write one CLAUDE.md, restart. Test with a DM. Done.

The thing that made it forty minutes instead of three days: I didn't write any custom code. Every primitive I used is shipped Anthropic surface area — `claude --channels`, the Telegram plugin, `CLAUDE.md` discovery, `@`-imports, the user-global config location, the `Agent` tool for subagents. The post about advisor-strategy already mapped each OpenClaw piece to an Anthropic equivalent. This post is just me actually doing the mapping.

OpenClaw was scaffolding. The scaffolding came down. The brain stayed up.

## What's next, and a small ask

The Claude-native stack I'm running today is the subscription path: `claude --channels` + `CLAUDE.md` + `Agent` subagents. That's enough to retire OpenClaw and the GPT Pro account.

The pieces that would make this the *full* shape from the advisor-strategy post are still gated behind request-access forms:

- **[Claude Managed Agents](https://claude.com/form/claude-managed-agents)** — so I can retire the tmux babysitting too. Right now `tmux new-session -d -s oc2` is the daemon. Managed Agents would be the daemon.
- **[Dreams](https://claude.com/form/claude-managed-agents)** — overnight reflection that writes new memory artifacts from past sessions. The brain at `~/Code/brain/memory/` currently accumulates by hand. Dreams is the loop that would curate it.
- **Routines** — scheduled async automations. Wire one to "wake up to PRs ready to merge on magerblog" and the iteration shape gets a lot tighter.
- **Multi-agent Orchestration** — the principal-agent pattern at the agent layer, not just the model layer. Public beta now; I haven't wired it in yet.
- **Remote Agents** — drive a session from my phone, not just message it. Channels are messaging; Remote Agents are control.

If anyone at Anthropic reads this and feels generous: I would put any of those into production this week. The brain is portable, the harness is small, the substrate is already there.
