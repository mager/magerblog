---
title: "autoresearch: Karpathy's Blueprint for Agents That Improve Themselves"
description: "Andrej Karpathy open-sourced a loop where AI agents run experiments, measure results, and keep what works — all while you sleep. Here's how the pattern works and how I'm applying it beyond LLM training."
pubDate: 2026-03-14
category: tech
keyword: "autoresearch learnings"
tags: ["autoresearch", "karpathy", "ai", "agents", "autonomous", "skills", "patterns"]
---

Andrej Karpathy just dropped something that looks simple but changes how I think about agentic workflows. It's called [autoresearch](https://github.com/karpathy/autoresearch), and the README opens with a fictional future where autonomous AI swarms run all frontier research while humans do other things. Wild intro. But the code behind it? Surprisingly minimal — and that's the whole point.

---

## What autoresearch Actually Is

The repo gives an AI agent a small but real LLM training setup and lets it experiment autonomously. The agent modifies code, trains for 5 minutes, checks if the result improved, keeps or discards, and repeats. You go to sleep, and you wake up to a log of experiments and (hopefully) a better model.

The entire repo is three files:

- **`prepare.py`** — data prep, tokenizer, evaluation. Read-only. The agent can't touch it.
- **`train.py`** — model architecture, optimizer, training loop. This is the *one file* the agent edits.
- **`program.md`** — instructions for the agent. This is the file *you* edit.

That's it. No complex configs. No distributed training. One GPU, one file, one metric (`val_bpb` — validation bits per byte, lower is better).

The loop is beautifully simple:

```
LOOP FOREVER:
  1. Read current state
  2. Make one change to train.py
  3. git commit
  4. Run experiment (5 min fixed budget)
  5. Measure val_bpb
  6. If improved → keep the commit, advance the branch
  7. If worse → git reset, try something else
```

Karpathy calls `program.md` a "super lightweight skill" — and if you've been following what I've been building with [Loooom](https://loooom.xyz), that phrase hits different. More on that in a minute.

---

## Why This Matters Beyond LLM Training

Here's what clicked for me: autoresearch isn't really about training language models. It's a **pattern** for autonomous improvement of *anything measurable*.

The genius constraints:

1. **One file to modify.** Keeps scope manageable and diffs reviewable.
2. **Fixed time budget.** Every experiment is directly comparable regardless of what changed.
3. **Single metric.** No ambiguity about what "better" means.
4. **Keep or discard.** Binary decision. No "maybe we'll use this later."
5. **Loop forever.** The agent doesn't stop. It just keeps trying things.

Strip away the LLM-specific parts and you get a universal recipe:

```
Define:
  - ONE file the agent can modify
  - ONE metric to optimize
  - ONE fixed evaluation budget
  - A keep/discard rule

Then let the agent run.
```

This is hill climbing with an LLM as the mutation function. The agent isn't randomly flipping bits — it's reading the code, understanding what it does, forming hypotheses about what might improve the metric, and testing them. That's qualitatively different from traditional hyperparameter search. It's closer to how a human researcher works, except it doesn't sleep.

---

## How I'm Thinking About This for My Projects

I run a few projects where this pattern maps almost perfectly. Let me walk through them.

### Loooom Skill Improvement

[Loooom](https://loooom.xyz) is a skill marketplace for Claude Code. Skills are essentially `SKILL.md` files — structured instructions that teach an AI agent how to do something specific. I already have an eval pipeline using Groq that scores skill quality.

The autoresearch loop for skills:

| Component | autoresearch | Loooom adaptation |
|---|---|---|
| File to modify | `train.py` | `SKILL.md` |
| Metric | `val_bpb` | Eval score (0-100) |
| Time budget | 5 min training | Eval run (~30 sec) |
| Agent instructions | `program.md` | A meta-skill that describes how to improve skills |

The agent reads the current `SKILL.md`, makes one targeted improvement (clearer instructions, better examples, tighter constraints), runs the eval, and keeps the change only if the score goes up. Over a few hours, you'd get a progressively refined skill without touching it yourself.

This is especially interesting because skills *are* agent instructions — so you'd have an agent improving the instructions that other agents follow. Meta.

### Sports Prediction Sentiment (prxps)

[prxps](https://prxps.com) is a sports predictions app I'm building. One of the core features is sentiment analysis — parsing social media, news, and betting lines to generate confidence scores for game outcomes.

The autoresearch pattern here:

- **File to modify:** The sentiment extraction prompt or scoring weights
- **Metric:** Prediction accuracy against actual game outcomes (backtested)
- **Budget:** Run against a fixed set of historical games
- **Loop:** Tweak the prompt/weights → backtest → keep if accuracy improves

The beautiful thing is I have ground truth data — games have outcomes. So the metric is unambiguous. An agent could iterate on the sentiment model overnight and I'd wake up to a measurably better predictor.

### Blog Design (magerblog)

This one's more experimental, but hear me out. [Lighthouse](https://developer.chrome.com/docs/lighthouse) gives you hard numbers: performance score, accessibility score, CLS, LCP. Those are metrics.

- **File to modify:** CSS or layout components
- **Metric:** Lighthouse composite score
- **Budget:** Build + Lighthouse audit (~60 sec)
- **Loop:** Tweak styles → build → audit → keep if scores improve

You wouldn't want to let an agent go wild on your visual design unsupervised (taste is hard to quantify), but for performance and accessibility optimization? Let it rip. Wake up to a faster, more accessible blog.

### BeatBrain Discovery

[BeatBrain](https://beatbrain.xyz) has discover and podcast pages that surface music recommendations. The pattern could optimize recommendation relevance or page performance:

- **File to modify:** Discovery algorithm or component layout
- **Metric:** Content density score, load time, or recommendation diversity index
- **Budget:** Build + evaluate (~2 min)
- **Loop:** Iterate on the algorithm or UI → measure → keep or discard

---

## The `program.md` Is Just a Skill

This is the part that connects it all for me. Karpathy's `program.md` is functionally identical to what I've been calling skills on Loooom — a markdown file that gives an AI agent context and instructions for a specific task.

The key insight from autoresearch is that the *human's job* shifts from doing the research to **writing the program**. You don't optimize `train.py` — you optimize `program.md`. You're programming the programmer.

Karpathy says it directly in the README:

> The core idea is that you're not touching any of the Python files like you normally would as a researcher. Instead, you are programming the program.md Markdown files that provide context to the AI agents and set up your autonomous research org.

This is the same philosophy behind Loooom skills. You're not writing code — you're writing instructions that an agent follows. The quality of your instructions determines the quality of the output. And now, with the autoresearch pattern, you can have *another* agent improving those instructions automatically.

It's agents all the way down.

---

## Getting Started (For Real)

If you want to try autoresearch as Karpathy built it, you need an NVIDIA GPU (tested on H100). The setup is straightforward:

```bash
# Install uv
curl -LsSf https://astral.sh/uv/install.sh | sh

# Clone and set up
git clone https://github.com/karpathy/autoresearch
cd autoresearch
uv sync

# Prep data (one-time, ~2 min)
uv run prepare.py

# Run baseline
uv run train.py
```

Then point Claude, Codex, or whatever agent you use at the repo, tell it to read `program.md`, and let it go.

**Don't have an H100?** Karpathy has recommendations for smaller hardware — use the [TinyStories dataset](https://huggingface.co/datasets/karpathy/tinystories-gpt4-clean), lower the vocab size, reduce sequence length and model depth. Check the README for specifics. There are also community forks for Mac and other platforms.

But honestly? **You don't need this specific repo to use the pattern.** Extract the loop:

1. Pick one file to modify
2. Pick one metric to optimize
3. Fix your evaluation budget
4. Let the agent loop: modify → measure → keep/discard
5. Go to sleep

That's the real takeaway.

---

## What's Next

I'm going to implement this pattern for Loooom skill improvement first — the eval pipeline is already there, the files are markdown, and the feedback loop is tight. If it works well, I'll write a follow-up with results and share the meta-skill that drives the improvement loop.

Massive props to [Karpathy](https://x.com/karpathy) for open-sourcing this. The code is minimal, the idea is maximal, and the README is one of the best pieces of technical writing I've read this year. The fictional intro about autonomous research swarms? That's not fiction for long.

---

*If you want to try the autoresearch pattern on your own projects, the [repo](https://github.com/karpathy/autoresearch) is the place to start. And if you build skills for AI agents, check out [Loooom](https://loooom.xyz) — the marketplace where agents learn new tricks.*
