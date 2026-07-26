---
title: "Killing OpenClaw for a native Claude Code setup"
description: "I love OpenClaw. I hate that it doesn't run on my Claude Pro subscription. Turns out Claude Code, with the Telegram channels plugin and one CLAUDE.md, is the same harness — minus the daemon, the API bill, and the second LLM provider. Here's the actual recipe, ported from a hotel in Tokyo to a Mac mini in Chicago in forty minutes."
pubDate: 2026-06-02
updatedDate: 2026-06-02
category: tech
keyword: "OpenClaw"
draft: false
tags: [claude, openclaw, claude-code, channels, telegram, mac-mini, brain, principal-agent]
---

I love OpenClaw. I hate that it runs on Codex instead of my Claude Pro subscription.

On vacation I noticed: Claude channels plus one `CLAUDE.md` *is* OpenClaw. Same shape — always-on session, Telegram reach, brainpack, principal-agent pattern — minus the daemon, the API bill, the second LLM provider.

So I killed it. From a hotel in Tokyo. Here's what I did.

## The setup

OpenClaw was Codex-shaped. It ran as a daemon on a Mac mini under Tailscale, polled Telegram via two bots (`default` and `genny`), kept a brain at `~/.openclaw/workspace/` (SOUL.md, IDENTITY.md, USER.md, MEMORY.md, AGENTS.md, etc.), and used OAuth-to-Codex for inference. The whole thing worked — but I didn't want Codex. I wanted Claude.

What I wanted: the same shape, but Claude-native, on my Pro subscription, with the brain in a place Claude Code already knows how to find.

What worked: three native primitives, in this order.

## 1. Claude channels

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

Without `--channels`, the MCP server is up and the plugin's tools are registered, but there's no socket pushing inbound DMs into the running session. Your bot shows the typing indicator (server received the message), then goes silent (session never sees it). The flag is what wires inbound.

One more flag the always-on shape needs: `--dangerously-skip-permissions`. Without it, every tool call from a DM blocks on a permission prompt that nobody is sitting at the mini to accept. The session is up but it can't *do* anything. With it, the session just runs. The name is loud on purpose — you're trading the interactive safety rail for an autonomous loop, so the allowlist above is what's actually keeping you safe. My full launch line on the mini is:

```
claude --dangerously-skip-permissions --channels plugin:telegram@claude-plugins-official
```

Once it's on, Claude Code prints:

> Listening for channel messages from: plugin:telegram@claude-plugins-official  
> Experimental · inbound messages will be pushed into this session, this carries prompt injection risks.

That second line is real, and it's why the next two commands matter:

```
/telegram:access pair <code>
/telegram:access policy allowlist
```

Pairing captures your numeric Telegram ID into `~/.claude/channels/telegram/access.json`. Switching to `allowlist` means strangers DM'ing your bot get nothing — no pairing reply, no inference. Only IDs you've explicitly approved talk to the session.

![Telegram chat with the newly-paired Claude bot returning the pair code from the Mac mini](https://lh3.googleusercontent.com/pw/AP1GczOo16tlAfgAnkF5mcKAzk3T8I0Q5t_1zD3VuA72owJrhiKzynx6ixvEQawemUi90gto0J8ZN3wDJ3x-FMlm9psgNVEhr4JNm4Czg9nIU_nN9HhiKZSuM78uGbZfJNpl62LR1Wgeq-sLGpzN6pTiBEuKXQ=w700-h1522-s-no-gm)

*The eureka moment: the bot's first reply, with the pair code, on my phone in Tokyo, from the Mac mini in Chicago.*

That's the entire Telegram layer. No Tailscale glue, no custom long-poller, no `default-update-offset.json`. The plugin handles all of it.

## 2. `~/.claude/CLAUDE.md` as the always-on brain

OpenClaw kept its brain at `~/.openclaw/workspace/`. Claude Code reads `CLAUDE.md` from three places automatically: `~/.claude/CLAUDE.md` (user-global, every session), `<cwd>/CLAUDE.md` and every parent up to home (auto-discovered), and `.claude/CLAUDE.md` in the repo.

So the port was: write one `~/.claude/CLAUDE.md` that tells the session who it is, how DMs arrive, and where memory lives. The initial version used `@path/to/file.md` syntax to inline flat markdown files at session start — a dead-simple way to load identity, soul, and memory from `~/Code/brain/`. That worked well until the brain grew beyond what flat files handle cleanly.

Since then the brain has migrated to [gbrain](https://github.com/garrytan/gbrain) — an open-source semantic memory layer that runs as an MCP server and stores everything in a local PGLite database. The `~/.claude/CLAUDE.md` no longer needs `@`-imports; instead it tells the session how to use the MCP tools (`mcp__gbrain__search`, `mcp__gbrain__get_page`, `mcp__gbrain__put_page`) and which core pages to consult. The brain is now queryable, writable by the agent, and hybrid-searchable — things flat files never were.

The current `~/.claude/CLAUDE.md` looks roughly like this:

```markdown
# Mager brain — loaded into every Claude Code session on this machine

## How DMs reach you
Inbound: Telegram DM → channels MCP server → pushed into this session as a prompt.
Outbound: call the `reply` tool on the `telegram` MCP server.

## Principal-agent pattern
This session is the principal. For narrow sub-tasks, dispatch a subagent via
the Agent tool. Definitions live in ~/.claude/agents/. Subagents return text,
not control.

## Memory — gbrain (single source of truth)
gbrain is the semantic memory layer. Installed at ~/Code/gbrain/, registered
as an MCP server. Prefer gbrain MCP tools over shelling out.
Core pages: identity, soul, user, tools, heartbeat, watchlist, memory/index.
```

User-global location means every session on that machine starts with this context loaded — regardless of which repo I `cd` into. No wrapper script, no shadow copy. Claude Code's existing file discovery does the work.

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

- The brain. Migrated from flat files at `~/Code/brain/` to [gbrain](https://github.com/garrytan/gbrain) — an open-source semantic memory layer that runs as a local MCP server. Same knowledge, now queryable and agent-writable instead of append-only markdown.
- The Mac mini under Tailscale. Same hardware, same network, same Telegram bot pattern.
- The principal-agent pattern. Native Claude Code has the `Agent` tool; subagent definitions live in `~/.claude/agents/`. The always-on session is the principal, and I can dispatch a "draft a post about X" or "check the scraper" subagent when I want without rebuilding the harness.
- The Telegram reach. From a hotel room in Tokyo I can ping a Mac mini in Chicago and get work done. That's the actual feature.

## When the mini reboots

Power blip, macOS update, anything that takes the box down — the tmux session dies with it and the always-on layer goes quiet. The channels plugin ships a supervisor script at `~/.claude/channels/telegram/run.sh` that handles model selection and auto-restart; recovery is two lines from any SSH client:

```bash
ssh macmini
tmux new-session -d -s tg 'bash ~/.claude/channels/telegram/run.sh'
```

The supervisor reads `~/.claude/channels/telegram/model.state` for the model slug and relaunches `claude --dangerously-skip-permissions --model $MODEL --channels plugin:telegram@claude-plugins-official` in a loop, so if Claude exits cleanly it comes back up without intervention. After relaunch, DMs start landing immediately — the brain auto-loads from `~/.claude/CLAUDE.md` and gbrain connects over MCP, so there's nothing to reattach.

The `PATH` matters here — put Homebrew and `~/.local/bin` on the path before running tmux or you'll get "command not found" on `bun` and `claude`. I source my shell profile in the ssh invocation or export PATH inline.

A launchd plist that starts the run.sh on boot is the obvious next step; I haven't written one yet because a reboot is the one moment I want to look at the session by hand — confirm Pro is still logged in, confirm the channel is listening, confirm the first DM round-trips. Two minutes of manual ceremony beats waking up to a silent mini.

## When the bot goes quiet (silent MCP crash)

Update from a week later: I tried to DM the bot and got nothing back. Not the "typing indicator and silence" failure mode from setup — full silence, single checkmark, no response. SSH'd in and the situation was:

- `tmux` session still up.
- `claude` process still alive at the prompt.
- `bun` (the Telegram MCP server) **not in the process list anymore**.

Inside `claude`, `/mcp` showed it plainly:

```
plugin:telegram:telegram · ✘ failed
```

The Telegram channel plugin doesn't auto-restart its MCP server when it dies, and Claude Code doesn't surface the failure in the main pane — the session looks alive from the outside, but inbound DMs have nowhere to land. The one-line healthcheck from outside the session:

```bash
ssh macmini "export PATH=/opt/homebrew/bin:\$PATH; ps -ef | grep '[c]laude-plugins-official/telegram' | head"
```

No output = MCP is dead = `/exit` and relaunch with the same flags. The fix is a restart; the lesson is that "process is alive" isn't the same as "agent is reachable." Eventually I'll wire a launchd healthcheck that grep's for the bun child process every few minutes and restarts the parent if it's missing. For now I'm letting the bot's own silence be the signal.

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

## What this turned into

A note from a few weeks later: after writing this I got the itch to go further and built a custom harness called plexus — roughly 250 lines of TypeScript wrapping the Claude Agent SDK, with per-message model routing and gbrain wired in over MCP. The idea was total ownership.

What I found: plexus routed everything through the Anthropic API, not the Pro subscription. Every Telegram message was a per-token bill. The whole reason I killed OpenClaw was to stay on the subscription. Plexus quietly broke that.

So I deleted it. The setup described in this post is still the right one: `claude --channels` on Pro, `~/.claude/CLAUDE.md` for context, gbrain for memory, `Agent` subagents for narrow tasks. No custom code. The channels plugin handles Telegram. The subscription handles billing. The brain handles memory.

Sometimes the simplest thing you can build is nothing.
