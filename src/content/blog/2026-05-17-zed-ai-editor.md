---
title: "Zed: A fast AI editor, with real tradeoffs"
description: "Zed combines a fast native editor with inline assistance, agent threads, and Claude Code through ACP. I read the docs to separate the measurable advantages from the workflow tradeoffs."
pubDate: 2026-05-17
category: tech
keyword: "Zed"
draft: true
tags: [zed, ai, editor, cursor, claude-code, tools]
---

Zed keeps coming up whenever people talk about a faster AI editor. Before I install it and change my Claude Code workflow, I wanted to separate the measurable differences from the marketing.

Here's what the research turned up.

## What Zed actually is

Zed is a code editor written in Rust with a custom GPU-backed UI framework called GPUI. It uses native rendering rather than an Electron-style web stack, which is the technical reason it can feel lighter. The published comparisons are compelling: 0.12s startup versus VS Code's 1.2s, 222MB of memory versus 3,549MB, and roughly 2ms of input latency versus 25ms.

That last number is the one that matters. 25ms of input latency is below the perceptual threshold for most people, but above it for some. If you've ever felt VS Code or Cursor getting "heavy" under load, Zed is genuinely solving a different problem.

## The AI features, concretely

There are two modes:

**Inline Assistant** — select code, hit `Ctrl+Enter`, describe the change, get an in-place rewrite. Works with multiple cursors simultaneously. This is the quick-edit path.

**Agent Panel** — conversational AI that can read files, write across the codebase, run shell commands, and call MCP tools. Three sub-modes: Ask (read-only), Write (edits), and Thread (persistent sessions that survive window restarts). Tool calls surface inline so you can inspect them.

The headline feature from Zed 1.0 (April 2026) is **Parallel Agents** — multiple agent threads running concurrently in the same window, each on different files or repos, and each optionally using a different model. You open the Threads Sidebar and run them side by side. That combination is unusual among editors I've looked at.

Model support is broad: Claude, GPT, Gemini, DeepSeek, Bedrock, Ollama, LM Studio, OpenRouter. You can bring your own keys or use Zed's hosted credit ($5/month included with Pro). The "not paying Zed" path is fully supported.

## Where Claude Code fits in

This is the most interesting part for me. Zed integrates Claude Code via the **Agent Client Protocol** — Claude Code runs as an external process, communicates over ACP via stdin/stdout, and appears inside Zed's editor with full syntax highlighting and diff review. You get the visual layer on top of the CLI tool.

The catch: there's a documented context window issue. When running Claude Code through Zed's ACP adapter, context gets compacted aggressively — reportedly to 120–200K tokens instead of Claude's actual 1M maximum. After compaction the model forgets what it read and changed earlier in the session. That's a real limitation, tracked as an open GitHub issue with no fix yet.

The other missing pieces: not all slash commands work inside Zed's agent window, agent teams aren't supported, hooks aren't supported, and there's no checkpointing.

So the Zed + Claude Code combo gives you visual diffs and syntax-highlighted edits inside a fast editor, but you trade away context depth and some command functionality compared to running Claude Code in the terminal.

## Zed vs Cursor vs Claude Code terminal

The honest comparison I kept coming back to:

**Cursor** is still best-in-class for integrated AI editing. Composer does coordinated multi-file diffs better than anything Zed offers natively. If AI-first IDE experience is the goal, Cursor wins today.

**Claude Code in the terminal** is the right tool for complex autonomous tasks — full 1M context, full command support, no ACP wrapper overhead. The terminal isn't a limitation, it's the unobstructed path.

**Zed** is the right choice if the editor itself has become the bottleneck — if you're losing time to startup, memory pressure, or input lag. You still get functional AI (inline assistant, agent panel, Claude Code via ACP), just with the tradeoffs above.

The hybrid stack most engineers seem to land on: **Zed for the editor, Claude Code in the terminal for heavy lifting**. Or Cursor daily + Claude Code for the long autonomous runs.

## What people actually say

Praise: the speed claims are real, parallel agents are genuinely useful once you understand the model, and the 1.0 release cleared a reliability bar that earlier versions didn't meet.

Complaints worth noting: CPU spikes in some workflows (not universal, but reported enough to be real), language server instability that's improving but not gone, and agent UX that's less mature than Cursor's — the distinction between agent threads and text threads confuses people, and context window behavior isn't always predictable.

The "LLM infested" complaint exists too. Some Zed users came for the fast editor and don't want AI at all. That's valid, and Zed supports disabling AI entirely.

## What I haven't done yet

I haven't actually installed it. That's the next step — try the Inline Assistant on a real codebase, run the Agent Panel on something non-trivial, test the Claude Code ACP integration and see how the context compaction actually feels in practice.

The current hypothesis is: Zed is fast, its limitations are fairly legible, parallel agents are the main differentiator, and Claude Code through ACP is useful but degraded compared with the terminal. I’ll update this post after I’ve run it for a few days.

---

*Research done before first install — will update with hands-on experience.*
