---
title: "DM your agent with Claude Code Channels"
description: "Claude Code's new channels feature lets you push messages from Telegram and Discord into a running session. Here's how it works, why mobile access changes everything, and how I'd wire it into my projects."
pubDate: 2026-03-21T00:00:00Z
category: code
keyword: Claude in your DMs
tags: [ai, claude-code, agents]
---

I've been running AI agents from my phone for months now — OpenClaw routes Telegram and Discord messages to magerbot, and I can fire off instructions from the couch, the grocery store, wherever. It's become second nature. So when Anthropic shipped [channels](https://code.claude.com/docs/en/channels) for Claude Code, my first thought was: *finally, everyone else gets to feel this*.

Channels are the missing piece that turns Claude Code from a terminal tool into something you can poke from your pocket.

## What Channels Actually Are

A channel is an MCP server that pushes events into a running Claude Code session. Think of it like a bridge: messages arrive from Telegram or Discord, Claude reads them, does the work, and replies back through the same channel. Two-way. Real-time. While you're away from your keyboard.

The setup is straightforward:

1. Install a channel plugin (`/plugin install telegram@claude-plugins-official`)
2. Configure your bot token (`/telegram:configure <token>`)
3. Restart with `--channels plugin:telegram@claude-plugins-official`
4. Pair your account by messaging the bot and entering the code

That's it. Your Claude Code session is now listening.

Currently Telegram and Discord are the supported channels (research preview, Claude Code v2.1.80+). You need a claude.ai login — API keys won't work. Team and Enterprise orgs need an admin to flip the switch.

## Be Polite at the Dinner Table

Here's the thing about mobile access to an AI agent: it changes your relationship with it. When Claude is trapped in a terminal on your laptop, interactions are deliberate. You sit down, you type, you wait. But when you can message your agent from your phone while you're eating dinner with your family? That's a different dynamic.

I've learned this the hard way with magerbot. The temptation to fire off "hey, check the build status" while my wife is mid-sentence about her day is *real*. And it's exactly the same impulse as checking Slack at the dinner table — except now it feels productive because you're "working with your AI."

It's not. Put the phone down. The agent will be there after dessert.

The best use of mobile channels isn't real-time back-and-forth. It's fire-and-forget: "deploy the staging build," "summarize today's error logs," "draft a response to that PR review." Send it, put your phone away, check the results later. Async by default. That's the polite way to use this at the dinner table.

## The Multi-Thread Problem

Here's something I think about a lot: when you're running a single bot on a platform like Telegram, you've got one conversation thread. One context window. One stream of consciousness.

That works fine when it's just you talking to your agent. But the moment you want Claude to handle multiple concerns — a deploy for beatbrain, a content review for magerblog, a bug triage for prxps — they all pile into the same thread. Context bleeds. The agent is juggling three mental models at once. You lose the clean separation that makes agents useful.

Claude Code channels inherit this problem. Your session is a single process. Messages from Telegram land in one stream. If you're asking about your React component and a webhook fires about a failed deploy, they collide.

There are workarounds. You can run multiple Claude Code sessions with different channels. You can use Discord's threading to create some separation (though the channel plugin doesn't natively route by thread yet). You can prefix messages with project context. But none of these are as clean as having dedicated agents per concern.

This is actually why I run OpenClaw with multiple agents — magerbot for code, [genny](https://mager.co/blog/genny-life-architect-agent) for life stuff. Separation of concerns isn't just a code principle; it's an agent architecture principle.

## Use Cases: Wiring Channels Into mager.co

Let me get concrete. I run four products under mager.co, and here's how I'd use Claude Code channels for each:

### magerblog (Astro)

**Deploy notifications.** Vercel fires a webhook when a build completes. A custom channel could catch that and push "magerblog deployed — 47 posts, build time 12s" into the session. If the build fails, Claude already has the repo context to diagnose it.

**Content pipeline.** I draft posts in markdown, but sometimes ideas hit when I'm away from my desk. A Telegram message like "draft a post about Claude Code channels, angle it around mobile access and dinner table etiquette" could kick off a skeleton that's waiting for me when I get back. (That's literally how this post started.)

### beatbrain (Music Discovery)

**Melodex monitoring.** BeatBrain scrapes Spotify, Reddit, and Pitchfork for fresh music. When the scoring pipeline runs, a channel push with "Melodex scored 23 new releases, top pick: [artist] — [album]" keeps me in the loop without checking the dashboard.

**Source health checks.** If the Reddit scraper starts returning 429s or Spotify's API changes response format, a channel event lets Claude investigate immediately while the session has full codebase context.

### prxps (Sports Predictions)

**Game alerts.** Push notifications when prediction windows open or close. "Bulls vs Celtics tips off in 2 hours — 847 predictions locked in." Mobile channels make this feel like a sports app notification, except the agent can answer follow-up questions about prediction distributions.

**Model performance.** After games resolve, push accuracy results into the session. Claude can analyze trends, spot model drift, and suggest calibration tweaks — all triggered by a simple event push.

### loooom (Skills Marketplace)

**PR review pipeline.** When someone submits a skill PR to the [loooom catalog](https://github.com/mager/loooom), a GitHub webhook → custom channel could push the diff into Claude's session. Claude reviews the SKILL.md, checks for anti-patterns, and posts review comments — all while I'm doing something else.

**Catalog stats.** Daily push: "12 new skill installs today, beginner-japanese still #1, 3 new contributors." Community health at a glance.

## Channels vs. OpenClaw: Different Tools, Same Idea

If you're already running OpenClaw, you might wonder why channels matter. Fair question. Here's how I think about it:

**Claude Code channels** are lightweight and session-scoped. You start a session, enable a channel, and it works. When the session ends, the channel stops. No daemon, no always-on process. Great for project-specific work where you want mobile access to a coding session.

**OpenClaw** is the always-on layer. It runs as a daemon, manages multiple agents, handles routing across platforms, and persists memory between sessions. It's infrastructure.

They solve different problems. Channels are "I want to poke my coding session from my phone." OpenClaw is "I want an agent that's always running, always reachable, and remembers everything."

The exciting future is probably convergence — channels that persist, sessions that survive restarts, agents that live somewhere between a terminal tool and a full daemon. We're getting there.

## Getting Started

If you want to try channels today:

```bash
# Install the Telegram plugin
/plugin install telegram@claude-plugins-official

# Configure with your BotFather token
/telegram:configure YOUR_BOT_TOKEN

# Restart with channels enabled
claude --channels plugin:telegram@claude-plugins-official
```

Then message your bot from your phone, pair with the code it gives you, and lock down the allowlist:

```
/telegram:access pair <code>
/telegram:access policy allowlist
```

You're live. Send a message from the grocery store. Just maybe not during dinner.

---

*Channels are in research preview — expect rough edges. The `--channels` syntax and protocol may change. But the primitive is right: your agent should be reachable from wherever you are, not just wherever your terminal is.*
