---
title: "CLAUDE.md: What Karpathy figured out that most devs still haven't read"
description: "A 65-line file distilled from Karpathy's observations about agentic coding hit 220K GitHub stars. Here's why the four rules inside are right, and why his move to Anthropic this week makes them matter even more."
pubDate: 2026-05-22
category: tech
draft: true
tags: ["claude-code", "ai", "karpathy", "llm", "productivity"]
---

A 65-line file is sitting at 220K combined GitHub stars and hit #1 on Trending. It's not a framework, not a library, not a new model. It's a constraint document for an AI coding agent — and the reason it spread is that most developers have experienced exactly what it's trying to fix.

The file is [CLAUDE.md by multica-ai](https://github.com/multica-ai/andrej-karpathy-skills/blob/main/CLAUDE.md), distilled by developer Forrest Chang from Andrej Karpathy's X thread on January 26, 2026. Karpathy had spent weeks doing intensive agentic coding with Claude Code and came out with a precise diagnosis of the failure mode: models "make wrong assumptions on your behalf and barrel ahead without checking. They don't manage their own confusion, don't ask for clarification, don't surface inconsistencies, don't present tradeoffs, don't push back when they should."

Community benchmarks put the accuracy improvement from having this file in place at ~65% → ~94%. I don't know exactly how those numbers were measured, but the directional claim rings true.

---

## The four rules

Karpathy described going from 80% manual code with autocomplete to 80% agent-generated code with targeted edits — in a matter of weeks. That shift in mode is what makes the rules matter. When the agent is doing most of the work, its defaults become your defaults.

**1. Think before coding.** State assumptions explicitly. Ask when something is unclear. Never guess. This sounds like a platitude until you've watched an agent confidently build the wrong thing for 20 minutes because you were ambiguous about a schema and it filled in the gap silently.

**2. Simplicity first.** Write the minimum code that solves the problem. No unrequested abstractions, no speculative generalization. Agents love to extrapolate scope — a request for one endpoint becomes a full API layer because it seemed like "what you probably wanted." This rule kills that pattern at the root.

**3. Surgical changes.** Don't touch code unrelated to the request. Every changed line should trace back to what was asked. Agents have a tendency to clean up, refactor, or "improve" things they pass through. This creates untraceable diffs and breaks things you weren't thinking about.

**4. Goal-driven execution.** Turn vague instructions into verifiable success criteria before writing a line. A task that can't be verified can't be finished — it can only be abandoned when you get tired of iterating.

None of these rules are AI-specific. They're engineering hygiene. The embarrassing part — and I mean this honestly — is that they need to be written down at all.

---

## Why it works

The CLAUDE.md isn't a prompt. It's a constraint document. The distinction matters.

A prompt tries to elicit a behavior by describing what you want. A constraint document sets a boundary the system operates within. Code review checklists work the same way: externalizing a standard makes it enforceable. The reviewer's job isn't to remember every quality criterion — it's to check against the list. CLAUDE.md gives the agent a list to check against before it decides to barrel ahead.

Agents default to improvisation. Nothing in their training says "stop and ask." The CLAUDE.md interrupts that default by making the alternative explicit: "if you're not sure, say so." That's a behavioral override, not a prompt.

---

## Why this week matters

Anthropic announced on May 19 that Karpathy joined their pre-training team. His words: "I think the next few years at the frontier of LLMs will be especially formative."

Karpathy is one of those rare figures who is genuinely canonical in AI. He taught the internet deep learning through Stanford 231n and the makemore/nanoGPT YouTube series. A meaningful fraction of the people building AI systems today learned the fundamentals from him. His research instincts are exceptional, and he's spent the last two years thinking carefully about where the human-AI interface breaks down — which is exactly what the CLAUDE.md diagnosis is about.

Having that lens on the pre-training side at Anthropic — not just the product or alignment side, but the raw model — is significant. The failure modes he described in January aren't just prompt engineering problems. They're baked into how models learn to respond. Pre-training is where you'd address them at the source.

---

## Where I landed

These four rules are already in my CLAUDE.md. I didn't copy them from Karpathy's version — I arrived at most of them through the same friction he described. But reading his thread crystallized why they matter at a systems level, not just as preferences.

The agentic coding shift Karpathy described — from autocomplete to agent-generated — changes what discipline means. With autocomplete, your judgment is the gating factor. With agents, the agent's defaults are. CLAUDE.md is how you set those defaults before the session starts.

If you're using Claude Code and you haven't read the file, read it. It's 65 lines.
