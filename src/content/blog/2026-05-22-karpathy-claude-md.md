---
title: "Karpathy: The four rules I arrived at the hard way, written down"
description: "Karpathy's CLAUDE.md hit 220K GitHub stars this week. I already had most of these rules in my own setup — not because I copied them, but because you hit the same walls eventually."
pubDate: 2026-05-22
category: tech
draft: true
tags: ["claude-code", "ai", "karpathy", "llm", "productivity"]
---

I've been running Claude Code as my primary coding environment for months. My CLAUDE.md has gone through a lot of iterations — most of them after something went wrong.

So when Karpathy posted his observations on X in January about what breaks in agentic coding, and developer Forrest Chang turned them into a [CLAUDE.md file](https://github.com/multica-ai/andrej-karpathy-skills/blob/main/CLAUDE.md) that's now sitting at 220K combined GitHub stars, my reaction wasn't "interesting" — it was "yeah, obviously."

I mean that as a compliment.

---

The four rules in the file:

**Think before coding.** State assumptions. Ask when unclear. Never guess. I hit this one within the first week of using agents seriously. You write a vague instruction, the agent fills in the blanks confidently, and twenty minutes later you have something technically impressive that's completely wrong.

**Simplicity first.** Write the minimum code that solves the problem. No abstractions nobody asked for. Agents love to extrapolate scope. One function becomes a utility module because it "seemed like what you'd want next." The CLAUDE.md rule makes the boundary explicit: if I didn't ask for it, don't build it.

**Surgical changes.** Don't touch code unrelated to the request. Every changed line traces back to what was asked. This one took me the longest to codify. Agents have a light-touch refactoring instinct — they tidy, rename, restructure things they pass through. Individually harmless. In aggregate, untrackable.

**Goal-driven execution.** Turn vague instructions into verifiable success criteria before starting. This is the one I still slip on. "Clean up this component" is not a task. "Make the component pass these three tests without changing its props interface" is a task.

---

What struck me reading Karpathy's thread is how he framed the underlying problem: models "make wrong assumptions on your behalf and barrel ahead without checking. They don't manage their own confusion, don't ask for clarification, don't surface inconsistencies."

That's not a prompt engineering problem. That's a defaults problem. The agent's default is to proceed, to fill gaps, to produce output. The CLAUDE.md is a constraint document — not a prompt asking for better behavior, but a rule set that interrupts the default before it runs.

It's the same reason code review checklists work. The reviewer doesn't need to remember every quality criterion — they check the list. This gives the agent a list to check against.

---

Karpathy joined Anthropic this week. Pre-training team. He put it plainly: "I think the next few years at the frontier of LLMs will be especially formative."

This matters more than it sounds. Karpathy is the person who taught a generation of engineers how neural networks actually work — through Stanford 231n, through makemore, through nanoGPT on YouTube. He's not a commentator on AI. He's been inside it at OpenAI and Tesla, and he's spent the last two years watching the human-agent interface in practice.

The failure modes he diagnosed in January aren't just things you patch with better prompts. They're tendencies that come from training. Having that lens on the pre-training side at Anthropic — where the model's core behavior gets shaped — is a different kind of intervention than anything you'd put in a CLAUDE.md.

Anthropic got a good one. I'm a little obsessed with how this plays out.

---

The 65-line file is worth ten minutes of your time if you're doing any serious agentic coding. Not because it's novel — if you've been at it for a while, you've probably arrived at most of it yourself. But seeing it articulated cleanly is useful. Sometimes you need someone to write down the thing you already know before you actually follow it.
