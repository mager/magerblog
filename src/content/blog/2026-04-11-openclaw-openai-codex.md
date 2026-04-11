---
title: "OpenClaw: I Switched My Agent Stack from Claude to OpenAI Codex"
description: "Anthropic shutting down OAuth-based Claude Code access forced my hand. Here's how I moved OpenClaw to OpenAI Codex, why Codex makes more sense inside a real agent harness than it did on its own, and why brainpack changes the switching cost."
pubDate: 2026-04-11
category: code
draft: false
---

This morning's first task was getting my agent back online.

That was partly practical and partly symbolic. My sites had been down for a while, I had not posted in a bit, and a pile of unrelated infrastructure problems had started to blur together. BeatBrain was getting hammered by DDoS traffic out of Singapore, I shut it down while I figure out a better firewall strategy, and the extra traffic also burned through my Vercel credits. Even the boring part of the workflow, publish a post, was blocked until Vercel gave me a one-time unblock.

At the same time, Anthropic ended the OAuth path I had been relying on for Claude Code access. That meant my OpenClaw setup was suddenly attached to the wrong foundation. I had a choice to make: keep paying for a subscription that no longer matched how I actually use these tools, or move the stack.

So I canceled the Anthropic subscription and switched the harness over to OpenAI Codex.

I have spent a lot of time in Claude Code, and I do not mean that dismissively. It shaped how I think about terminal-native agents, long-running coding sessions, and what it feels like when an AI tool starts to disappear into the workflow.

But I was also curious to try Codex again, especially now that GPT 5.4 is in the mix, and especially now that my setup is no longer just a model in a terminal.

It is a real harness.

OpenClaw gives me routing, channels, sessions, cron jobs, memory files, tooling, and persistent agent identity. My skills layer gives me reusable behavior. [brainpack](https://github.com/mager/brainpack) gives me a way to back up and move the brain itself.

That changes the switching cost completely.

A few months ago, changing models felt like changing assistants.

Now it feels more like swapping the engine in a car I already built.

## Why I bounced off Codex before

I had tried switching to Codex before, and I didn't stick with it.

At the time, it just felt worse.

Claude had the stronger flow and a much more convincing sense of continuity during real work. Codex felt thinner, less capable in the places I cared about, and easier to bounce out of.

But that comparison was happening before I had a serious agent substrate.

Back then, the model *was* most of the product.

Now the product is the whole system:

- OpenClaw as the agent runtime
- local memory files as continuity
- skills as behavior modules
- cron as background automation
- channels as interface
- brainpack as portability

That means the model matters a lot, but it isn't carrying the whole experience by itself anymore.

That's the unlock.

## The actual switch

At a practical level, the move was simple: point OpenClaw at OpenAI Codex instead of Anthropic.

I used:

```bash
openclaw onboard --auth-choice openai-codex
```

If you want the official provider docs, they're here: [OpenClaw OpenAI provider setup](https://docs.openclaw.ai/providers/openai).

![OpenClaw OpenAI provider docs screenshot](https://lh3.googleusercontent.com/pw/AP1GczMizgWZJJcBrLilsN2apu65eFD3TBsdWHLLJy0Hk0_fO-mkgJLv4_jvPjF_PEjoYUso4tr6cU1uLPId3l_CbJSSZero4p2tE4ioSj2QONQTv2VxHoWC2RIb4khY2PNN60SxjdWc3jKlzsm1aNhXAKTZ8g=w2322-h1522-s-no-gm)

OpenClaw already treats the model as configuration, not destiny. My current session is now running on:

```txt
model=openai-codex/gpt-5.4
```

That one line is the important architectural idea.

If your agent system is designed correctly, the model is a pluggable dependency. Expensive and important, yes. But still a dependency.

Not your identity. Not your memory. Not your workflow.

## Why I'm optimistic this time

The main reason I'm optimistic is that I am not evaluating Codex in isolation anymore.

I'm evaluating it inside a stack that already has:

- persistent workspace instructions
- long-term memory in `MEMORY.md`
- day-to-day context in `memory/YYYY-MM-DD.md`
- specialized skills for specific jobs
- detached tasks and cron-driven automation
- repo-aware working conventions

That's a much fairer test.

If the underlying model is strong enough, OpenClaw can do a lot of the work that used to live in vibe alone. It can recover continuity, preserve standards, and make the agent feel like the same collaborator across sessions.

That was the missing piece before.

## This is what I actually want from AI tooling now

I don't want to keep rebuilding my workflow every time a provider changes pricing, policy, access, or product strategy.

That's the trap.

If your entire system is fused to one vendor's UX, one vendor decision can erase months of habit and infrastructure.

What I want instead is:

- a portable agent brain
- interchangeable model backends
- skills that survive provider churn
- memory that lives in files I control
- interfaces that can route to terminal, web, Telegram, wherever

That's what I've been building toward, even before I had the language for it.

And honestly, this migration is a good test. If my own stack can't survive a provider shift, then it isn't really mine.

## First task after the switch

The first thing I did after getting OpenClaw back up was this post.

That was useful for a simple reason: it proved the system was alive again. After the site downtime, the BeatBrain mess, the Vercel credit block, and the provider switch, I wanted one clean confirmation that the machine still worked. Wake up the agent, load the workspace, remember what matters, route through the right tools, and ship something real.

Not a benchmark screenshot. Not a vibes-based first impression.

Real work, in the real environment, with the actual harness.

As a small bonus, I also ended up tightening the writing layer around the system itself. The first draft of this post leaned a little too bro-y in places, which is a failure mode I want to actively resist. So I updated the standing instructions in my OpenClaw workspace and the magerblog skill to push the voice toward something more precise, technical, and earned.

## If you're making the same move

If you're moving off Claude because the OAuth path is gone, my advice is simple:

Don't just look for the next best chat window.

Use the moment to separate **model**, **memory**, and **workflow**.

That's the durable architecture.

If you do that, switching from Claude to Codex is annoying, but not existential. It's a config change plus some adaptation, not a total reset.

And if you're building your own harness around that stack, you're compounding the value every time you add a skill, a workflow, or a memory pattern.

That's why I'm still bullish on this whole direction.

The model matters.

But the harness matters more.
