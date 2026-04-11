---
title: "OpenClaw: I Switched My Agent Stack from Claude to OpenAI Codex"
description: "Anthropic shutting down OAuth-based Claude Code access forced my hand. Here's how I pointed OpenClaw at OpenAI Codex, why I came back to Codex after bouncing off it before, and why skills plus brainpack changed the equation."
pubDate: 2026-04-11
category: code
draft: true
---

This morning's first task was getting my agent back online.

Anthropic ended the OAuth usage path I had been relying on, which meant my old setup for Claude Code and OpenClaw was suddenly the wrong foundation. I had to make a call: keep paying for a subscription that no longer matched how I actually use these tools, or move the stack.

So I canceled my Anthropic subscription.

Honestly, that felt a little sad.

I've spent a lot of time in Claude Code. It shaped how I think about terminal-native agents, long-running coding sessions, and what it feels like when an AI tool actually starts to disappear into the workflow.

But I was also weirdly excited, because this felt like the right moment to try OpenAI Codex again, especially now that GPT 5.4 is in the mix.

And more importantly: my setup is no longer just "a model in a terminal."

It's a real harness now.

OpenClaw gives me the routing, channels, sessions, cron jobs, memory files, tooling, and persistent agent identity. My skills layer gives me reusable behavior. And [brainpack](https://github.com/mager/brainpack) gives me a way to back up and move the brain itself.

That changes the switching cost completely.

A few months ago, changing models felt like changing assistants.

Now it feels more like swapping the engine in a car I already built.

## Why I bounced off Codex before

I had tried switching to Codex before, and I didn't stick with it.

At the time, it just felt worse.

Claude had the stronger vibe, better flow, and a much more convincing sense of continuity during real work. Codex felt thinner. Less capable in the places I cared about. Easier to bounce out of.

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

That felt right.

Not because writing about infrastructure is inherently important, but because it proved the system was alive again. Wake up the agent, load the workspace, remember what matters, route through the right tools, and ship something real.

That's the bar.

Not a benchmark screenshot. Not a vibes-based first impression.

Real work, in the real environment, with the actual harness.

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
