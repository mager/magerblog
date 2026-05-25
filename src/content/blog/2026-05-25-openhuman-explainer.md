---
title: "OpenHuman: an open-source agent harness that learns who you are"
description: "OpenHuman is a desktop-first agentic assistant with persistent memory, 118+ OAuth integrations, and a token compression layer. Here's what it does and how it fits alongside an existing Claude Code harness."
pubDate: 2026-05-25
category: tech
draft: true
tags: ["ai", "agents", "memory", "openhuman", "harness"]
---

[OpenHuman](https://github.com/tinyhumansai/openhuman) crossed 27k stars this week. It's an open-source agentic assistant built in Rust/Tauri — desktop-first, UI-forward, and designed around one core premise: agents should already know your context when you need them, not accumulate it slowly over weeks of use.

It's early beta and rough in places, but the architecture is worth understanding.

---

## What it does

The simplest summary: OpenHuman connects to your services (Gmail, Notion, GitHub, Slack, Calendar, Linear, and 110+ more via OAuth), pulls data from them every 20 minutes automatically, compresses it into Markdown chunks stored in SQLite on your machine, and builds a hierarchical memory tree from all of it. When you ask the agent something, it already has context from your inbox, your calendar, your repos, and your docs — without you having to paste anything in.

This is the pattern Karpathy called the [LLM Knowledgebase](https://x.com/karpathy/status/2039805659525644595) — an Obsidian-style vault of compressed, chunked documents that the agent can query rather than reload from scratch each session. OpenHuman implements it out of the box, with the vault stored as `.md` files you can open in Obsidian directly.

The four things that make the architecture distinct:

**Memory Tree.** Every integration you connect gets canonicalized into ≤3k-token Markdown chunks, scored, and folded into summary trees. The auto-fetch loop runs every 20 minutes and updates the tree without you doing anything. It's local, in SQLite, and survives restarts.

**TokenJuice.** Every tool call result, scraped page, and email body passes through a compression layer before reaching the LLM. HTML → Markdown, long URLs shortened, verbose output deduped. CJK and emoji are preserved grapheme-by-grapheme rather than stripped. The claim is up to 80% token reduction, which matters if you're running long agent sessions with lots of integration calls.

**One subscription, model routing built in.** Instead of managing API keys for OpenAI, Anthropic, and whatever else, OpenHuman routes requests through its backend to the right model per workload — reasoning tasks, fast tasks, vision. One account covers it. You can also point it at a local Ollama instance if you want on-device inference for some tasks.

**It has a face.** The desktop mascot sounds gimmicky but the meeting-agent feature is genuinely interesting — it joins Google Meet as a participant, listens, and can summarize or respond. The voice layer uses ElevenLabs TTS out and STT in.

---

## Installing it

```bash
# macOS or Linux
curl -fsSL https://raw.githubusercontent.com/tinyhumansai/openhuman/main/scripts/install.sh | bash

# Windows
irm https://raw.githubusercontent.com/tinyhumansai/openhuman/main/scripts/install.ps1 | iex
```

Or grab the DMG/EXE from [tinyhumans.ai/openhuman](https://tinyhumans.ai/openhuman). After install, the onboarding flow walks you through connecting your first integrations — no config files to write, no terminal required after setup.

One caveat: Linux AppImage users hitting Wayland or Arch crashes should check [#2463](https://github.com/tinyhumansai/openhuman/issues/2463) for the env-var workaround.

---

## Where it fits alongside an existing harness

The comparison that comes up in the README is direct. Harnesses like OpenClaw or Hermes are terminal-first and BYO-model — you bring your own keys, write your own plugins, and the context you have is whatever you've explicitly wired in. OpenHuman's pitch is that most of that setup work shouldn't exist.

That's a real tradeoff. Terminal-first harnesses are more composable — you can hook them into CI, run them headless, pipe their output, call them from other agents. OpenHuman's desktop-first model trades that flexibility for a faster start and a richer default surface (voice, meetings, mascot).

The more interesting integration path is the **agentmemory backend**. If you're already running a Claude Code or similar agent alongside OpenHuman, you can point OpenHuman at an [agentmemory](https://github.com/rohitg00/agentmemory) instance that both agents share:

```toml
# config.toml
[memory]
backend = "agentmemory"
```

That means the memory OpenHuman builds from your Gmail and Notion sync becomes available to your Claude Code agent as well, without the Claude Code session having to do its own fetching. The compression OpenHuman does gets you more context per token window on that side too.

For a harness running on a Mac mini that's already managing agent sessions and gbrain for long-term memory, the most practical addition from OpenHuman is probably TokenJuice-style compression in tool call pipelines — the principle applies whether you use OpenHuman directly or implement something similar. Pulling your own data into an Obsidian vault and querying it from Claude Code via MCP is achievable without OpenHuman; OpenHuman just makes the wiring less manual.

---

The project is moving fast. Worth watching if you're thinking about persistent agent memory, and worth installing if you want a low-friction way to experiment with a connected agent that already knows your calendar and inbox before you say anything.

Repo: [github.com/tinyhumansai/openhuman](https://github.com/tinyhumansai/openhuman)
