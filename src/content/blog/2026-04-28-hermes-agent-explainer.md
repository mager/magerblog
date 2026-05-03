---
title: "The Compounding Agent: Why Hermes Is More Than Just a Pretty TUI"
pubDate: "2026-05-03"
description: "I'd been seeing chatter about Hermes Agent from Nous Research, so I installed it locally and put it to work on this blog. Notes on the pitch, the SOUL.md system, and what it actually felt like to use."
category: tech
tags: ["AI", "Agents", "Hermes", "OpenClaw", "ME.md", "Nous Research"]
keyword: "Hermes Agent explainer"
heroImage: "https://lh3.googleusercontent.com/pw/AP1GczOcvC1hfsYyuEB0VsIP8MM7V6g_9dQkDLXH4sbOd9khtP0o1z-K8S9cUfwJuSSjCuxYvuSsECMV21u03fnO-NjTWNxoh0jLssgr8Kv__n80Xi-gWeQrfNrfPXqfDn8KsAZZOR5Xeek9blgiun7Hm-af7A=w2322-h1522-s-no-gm"
---

I'd been seeing a lot of chatter about [Hermes Agent](https://hermes-agent.nousresearch.com/) from Nous Research. I run [OpenClaw](https://github.com/mager/openclaw-brain) as my main harness, so I wasn't shopping for a replacement — but the pitch was specific enough that I wanted to try it locally and form an opinion from actually using it instead of from screenshots.

This post has two halves. First, what Hermes is and why I think it's getting attention. Second, what happened when I installed it and asked it to redesign part of this site.

## What Hermes is, at a glance

In one sentence: **Hermes is an open-source personal agent productized around persistence** — persistent memory, persistent personality, persistent reach via messaging, and an explicit promise that the agent gets better the longer you use it.

The public positioning is unusually crisp. Hermes describes itself as **"the agent that grows with you"**. The homepage promises three things:

1. it **learns your projects**
2. it **builds its own skills**
3. it **reaches you wherever you are**

That is a much better pitch than "autonomous AI agent" or "framework for tool use." It is concrete. It maps directly to user desire.

People do not wake up wanting an agent runtime. They want an AI that remembers what it did yesterday, can be reached from their phone, and gets less generic over time. Hermes is selling that end state, not the plumbing.

## Why it's catching attention

A few reasons stand out.

### 1. It has a real product thesis, not just a demo thesis

A lot of agent projects are either impressive research toys, thin wrappers around a chat model, or developer infrastructure with weak storytelling.

Hermes feels more opinionated. The core idea is not "look, an agent can call tools." The idea is **"your agent should compound."**

That mirrors how people think about good human collaborators. The best teammate on your team is not just smart on day one; they become more valuable because they absorb context, remember prior work, and turn repeated patterns into reusable judgment.

### 2. The self-improving angle is intuitive

The phrase **self-improving** is doing a lot of work here, and it is worth translating out of sci-fi language.

This does not mean recursive superintelligence or some magical autonomous code-evolution loop. It means something more practical:

- the agent keeps **persistent memory**
- it accumulates **skills**
- it remembers **how it solved a problem before**
- future sessions inherit that experience instead of starting cold

That is still a big deal. If an agent can notice repeated workflows, convert them into reusable instructions, and apply them later, it stops being stateless chat and starts to feel like a junior operator turning into a staff operator.

### 3. It packages persistence as identity

Hermes is not only saying "I have memory." It is saying the agent has a durable *self*.

That matters because users do not experience memory and personality separately. If the agent remembers what matters but talks like a different person every session, it still feels broken.

Hermes seems to understand that the agent experience has three layers:

- **memory** — what it knows
- **skills** — what it can do
- **personality** — how it shows up

Most tools handle one or two of those. Very few present all three as first-class product surfaces.

### 4. Messaging makes it feel alive

The homepage pitch explicitly says: install it, connect your messaging accounts, and it becomes a persistent personal agent.

An agent that only exists inside a terminal is interesting. An agent that can reach you in Telegram or wherever you already live feels like infrastructure for your actual life. OpenClaw has been strong here for a while; Hermes is clearly aiming at the same human desire.

### 5. The branding is better than most agent projects

Taste is part of product comprehension. The site, the language, and especially the docs make Hermes feel like someone actually decided what the product is *for*. A lot of open-source agent projects are technically capable and narratively blurry. Hermes is narratively sharp.

## The personality page is the part I like most

The most interesting Hermes page to me is its documentation on [Personality & SOUL.md](https://hermes-agent.nousresearch.com/docs/user-guide/features/personality).

The short version:

- Hermes uses a durable `SOUL.md` file as the agent's primary identity
- it lives in `~/.hermes/SOUL.md` (or the current `HERMES_HOME`)
- it is loaded into **slot #1** of the system prompt
- it is meant for stable voice, tone, style, and behavioral defaults
- project-specific instructions belong elsewhere, in `AGENTS.md`
- temporary mode switches belong in `/personality`

That is clean, and it matches the split I have been using in OpenClaw for months:

- `SOUL.md` for who the agent is
- `AGENTS.md` for operational/project instructions
- `MEMORY.md` and daily notes for continuity

Hermes is arriving at the same architecture, but packaging it in a way that is much easier for new users to understand. It also rhymes directly with what I have been building in [ME.md](https://loooom.xyz/me/mager):

- **ME.md** answers: *who is this human?*
- **SOUL.md** answers: *who is this agent?*

Hermes does not appear to be doing the human-side protocol that ME.md is aiming at, but it clearly understands the agent-side half of the problem.

The part I especially like is that Hermes treats personality as a **real file**, not a hidden settings blob in some vendor dashboard. That means identity becomes inspectable, editable, versionable, and portable. That is the right instinct.

## Hermes vs. OpenClaw

The obvious question if you've read my earlier OpenClaw posts.

![](https://lh3.googleusercontent.com/pw/AP1GczOcvC1hfsYyuEB0VsIP8MM7V6g_9dQkDLXH4sbOd9khtP0o1z-K8S9cUfwJuSSjCuxYvuSsECMV21u03fnO-NjTWNxoh0jLssgr8Kv__n80Xi-gWeQrfNrfPXqfDn8KsAZZOR5Xeek9blgiun7Hm-af7A=w2322-h1522-s-no-gm)

I'd describe them as competing from **different altitudes**.

Hermes is centered on a single agent that persists, messaging reachability, memory that compounds, personality as a first-class surface, and auto-generated skills. It's a very compelling package for someone who wants one agent that becomes more and more like theirs.

OpenClaw, as I use it, is broader and more infrastructural: multi-agent routing, a long-running gateway process, cron and heartbeat orchestration, cross-channel messaging, explicit session management, a skills system, workspace file conventions, and a wider tool surface. It feels more like **the harness**. Hermes feels more like **the productized agent**.

If I wanted to explain it quickly:

- **Hermes**: "I want an agent that grows with me."
- **OpenClaw**: "I want an agent operating system I can architect around."

Those are not mutually exclusive instincts, but they attract different early adopters.

## Okay, now let me actually try it

That's the framing from reading the docs. I wanted to know how it felt to use, so I installed it, pointed it at my OpenClaw `SOUL.md`, and gave it a real task on this blog.

### Install and first impressions

Setup was honestly the smoothest agent install I've done in a while. The OpenAI Codex and Telegram integrations were a few prompts each. There's also OpenClaw detection — Hermes notices if you have OpenClaw installed and offers to import context. Nice touch, and a refreshingly non-territorial move.

The TUI is the prettiest one I've used. It is more beautiful than Claude Code, which is not a sentence I expected to write. The status line is compact and useful:

```
⚕ gpt-5.5 │ 67.5K/272K │ [██░░░░░░░░] 25% │ 4m │ ⏱ 3m 50s
```

Tool traces collapse to a single line each, which I love — I actually mimic this style when I design TUIs for fun. It hides the noise without hiding the work.

First task: "can you access my websites in `~/Code`?" It correctly listed seventeen directories, picked out the web projects, and even classified them by stack (Astro, Svelte/Vite). That's the kind of small competence that makes a tool feel real.

### The rough edges

A few things bugged me.

Typing `/` triggered a file lookup more aggressively than a slash command. In iTerm the prompt flashed visibly during this. Minor, but it's the kind of thing you feel a hundred times a session.

Skill installation was rough. I tried installing [impeccable](https://github.com/pbakaus/impeccable) three different ways — git URL, tree URL, raw `SKILL.md` URL. The first two errored with "Could not fetch from any source." The third made it to a security scan, which then **blocked** the install with a `CAUTION` verdict because the skill declared an `allowed-tools:` field. Technically the right call. But for a popular community skill, the friction adds up.

![](https://lh3.googleusercontent.com/pw/AP1GczOPTcQbJRBA8Q4J-np_RDTE91SMdLIu7QUblC-WfJ2ULRd3jbqBT2wBFRn2cSx9zY0EDspIOIaKt4B3d7bI0OOWD_W4vD4FBblstCYU2d1vt33zY96EmDjBLUNqU0O2CMYaRkFLMpc-kWZxfhBOyG5dWw=w2322-h1522-s-no-gm)

It also thinks more than I want it to by default. Latency is real. A simple "redesign my blog detail page" task ran for seven minutes. A "improve the body typography" follow-up ran another five. I could have picked a cheaper/faster model, and I didn't. Still, if I'm being honest, it felt long.

### Letting it redesign the tech detail page

I asked it to improve the design of my tech blog post detail pages, which had been feeling boring to me. This is where Hermes earned its keep.

![](https://lh3.googleusercontent.com/pw/AP1GczNwOPyNISrwvStu9l3OEENe_6T2z0B2bRPEJIhymcI020vc43-TRNZ-CadMLhssuaxwEBo_veL0HHCjXmVwQPZ0BbrsCBOTCAeSmnSJLHWdi8dg1TAmWj6uNOX2bXokNp43aofIRQZYEfVagPtQVWsYNQ=w2322-h1522-s-no-gm)

It pulled up two design skills, made a three-task plan, found the layout file, read it a few times, and started patching. The diffs stream inline in real time, which is genuinely the right UX for code edits — you watch it think in code, not in prose.

It ran `npm run build`, started a preview server with `npm run preview -- --host 127.0.0.1`, polled the process, curled the URL, and then **navigated to the page in a browser** and analyzed a screenshot via a `vision` tool to assess the result. I was worried browser vision would burn tokens; in practice it cost a couple thousand per screen, which is fine.

When I interrupted it mid-run with a follow-up about the noisy footer, it caught the interruption gracefully and pivoted. There's a `/steer` command for the same purpose, designed to inject a message after the next tool call without breaking the run — a nicer pattern than full interrupts. There's also `/compress` instead of `/compact`, and it auto-compacted context for me about halfway through the session without me having to think about it.

Final pass on the body type was tiny — like, 0.04rem on padding kind of tiny — and it kept iterating on screenshots between passes. It behaved like a real designer who refuses to stop until the spacing is right. I was waiting at that point and grumbling to myself, but the result was actually better. That's the tradeoff.

The animated thinking glyphs (`( ͡° ͜ʖ ͡°)` while processing, `( ˘⌣˘)♡ brainstorming...`) are unserious in the right way. I'm into it.

![](https://lh3.googleusercontent.com/pw/AP1GczPig3WrVA0i3RqmhonTDnov9aR3rvS3vMecuQ1ZIc3Kcs-Ys9AkW2KSjnmqtlOSJ5VLg6ELyCSWWC-wGgoqgieIZpoDrhWRcV2y7vXeomMQXz_mRqQiXkL9pHQzM-D4-swQ-fO-5VEzlLq3J3E0JzDO7w=w2322-h1522-s-no-gm)

### Pointing it at my OpenClaw SOUL.md

This worked with no friction. I dropped a copy of OpenClaw's `SOUL.md` into `$HERMES_HOME` and Hermes picked it up as identity in slot one. Voice carried over cleanly. The `AGENTS.md` in `~/Code/magerblog` was used as project context the way the docs describe.

This is the architecture argument paying off: because identity is a file, portability between agents is just a `cp`.

### What I'd flag

- Slash UX needs work; commands and file lookups are competing for the same key.
- Skill installation needs to be more forgiving for trusted-but-flagged community skills, or at least give a clearer override path than `--force`.
- Default model + default thinking depth is too patient for short tasks. I'd love a "be quick" mode.
- Telegram integration is good. I had it working in a few minutes.

## The bigger pattern

The most important thing about Hermes may not be Hermes specifically. It may be that more agent projects are converging on the same core ideas:

- files over hidden prompts
- identity as a durable artifact
- memory as a system feature, not a marketing checkbox
- skill acquisition as the path from novelty to usefulness
- messaging as the bridge from terminal toy to real companion

If that pattern holds, the next year of agent design gets much more interesting.

I'll keep OpenClaw as my harness — it's broader and the muscle memory is there — but Hermes is going to stay installed as a comparative runtime. The TUI alone is worth the disk space, and the SOUL.md portability means I can run the same identity in both and watch how each one interprets it. That's a useful experiment to keep running.
