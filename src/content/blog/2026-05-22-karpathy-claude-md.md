---
title: "What Karpathy's CLAUDE.md taught me about my own setup"
description: "Karpathy's four rules for agentic coding are worth reading — having them written down in a shared format is a useful starting point for anyone building with Claude Code."
pubDate: 2026-05-24
category: tech
keyword: "CLAUDE.md"
draft: false
tags: ["claude-code", "ai", "karpathy", "llm", "productivity"]
---

I've been iterating on my Claude Code harness for months. My [CLAUDE.md](https://github.com/mager/magerblog/blob/main/CLAUDE.md) has gone through a lot of versions — most of them driven by something going wrong.

So when Karpathy posted his observations on X about what breaks in agentic coding, and developer Forrest Chang turned them into a [CLAUDE.md file](https://github.com/multica-ai/andrej-karpathy-skills/blob/main/CLAUDE.md) that's now at 220K combined GitHub stars, I found it genuinely useful — seeing it articulated that clearly was a good prompt to audit what I actually had in my own setup, and where I had gaps.

---

The four rules in the file:

**Think before coding.** State assumptions. Ask when unclear. Never guess. This is one most people run into early. You write a vague instruction, the agent fills in the blanks confidently, and twenty minutes later you have something technically impressive that's completely wrong.

**Simplicity first.** Write the minimum code that solves the problem — no abstractions nobody asked for. Agents tend to extrapolate scope. One function becomes a utility module because it "seemed like what you'd want next." The explicit rule keeps the boundary clear.

**Surgical changes.** Don't touch code unrelated to the request. Every changed line traces back to what was asked. This one took me longer to codify. Agents have a light-touch refactoring instinct — they tidy, rename, restructure things they pass through. Individually harmless; in aggregate, hard to track.

**Goal-driven execution.** Turn vague instructions into verifiable success criteria before starting. This is the one I still slip on. "Clean up this component" isn't a task. "Make the component pass these three tests without changing its props interface" is.

---

What Karpathy diagnosed is worth quoting directly: models "make wrong assumptions on your behalf and barrel ahead without checking. They don't manage their own confusion, don't ask for clarification, don't surface inconsistencies."

That's not a prompt engineering problem — it's a defaults problem. The agent's default is to proceed, fill gaps, produce output. A CLAUDE.md is a constraint document: not a prompt asking for better behavior, but a rule set that interrupts the default before it runs. It's the same reason code review checklists work. The reviewer doesn't need to hold every criterion in their head — they check the list.

---

One thing I'd add that's not in Karpathy's file: if you're starting from scratch, ask Claude to write your CLAUDE.md for you.

Give it a description of your project and your workflow, and ask it to produce a constraints document that will govern its own behavior. Then read it and edit it. The first draft won't be perfect, but the process of reviewing it is a good forcing function for articulating what you actually want. My current CLAUDE.md is the product of a few rounds of that kind of back-and-forth.

---

Karpathy joined Anthropic this week. Pre-training team. He's been a reliable teacher for a long time — his [YouTube channel](https://www.youtube.com/@AndrejKarpathy) is genuinely where I learned how LLMs work top to bottom, from backprop to attention to the full training loop. His lectures on neural nets, makemore, and nanoGPT are probably the clearest path into this material that exists for someone with a software background.

Having that perspective on the pre-training side at Anthropic — where the model's core behavior gets shaped — is a different kind of intervention than anything you'd put in a CLAUDE.md. The failure modes he diagnosed aren't just things you patch with better prompts; they're tendencies that come from training. It'll be interesting to see what changes over the next few model generations.

---

The 65-line file is worth reading if you're doing serious agentic work. Not to copy it wholesale, but to see what you're already doing, what you're missing, and what you'd phrase differently. Every harness is a little different depending on what you're building — but the underlying problems it's solving are pretty universal.
