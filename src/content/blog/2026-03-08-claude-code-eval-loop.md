---
title: "Claude Code: The Eval Loop That Fixes Your Skills Automatically"
pubDate: 2026-03-08
author: "mager"
category: tech
draft: false
---

The new skill-creator plugin from Anthropic dropped this week, and buried in the repo is a gem that's going to change how we build Claude Code skills: **an automated eval loop that writes its own description**.

I've been using promptfoo for Loooom plugin quality testing, but Anthropic's approach is solving a *completely different* problem. After spending the weekend dissecting it and applying it to my [frontend-design plugin](https://github.com/mager/loooom-catalog/tree/main/plugins/frontend-design), here's what I learned.

---

## The Two Types of Skill Evaluation

When you build a Claude Code skill, there are two fundamentally different things you need to validate:

**1. Output Quality:** Given that the skill *is* active, does it produce good output?

**2. Trigger Precision:** Does Claude know *when* to activate the skill?

Promptfoo handles #1 beautifully. Anthropic's system handles #2. They're complementary, not competitive.

### Promptfoo: The Quality Gate

Here's my current `promptfooconfig.yaml` for `frontend-design`:

```yaml
tests:
  - description: "Gives opinionated button design advice"
    vars:
      message: "How should I style my primary CTA button?"
    assert:
      - type: llm-rubric
        value: "Gives specific, opinionated CSS or design direction..."
```

The skill prompt is injected as a system message, and promptfoo evaluates whether the response meets quality criteria. This is great for ensuring consistent, opinionated output.

But there's a catch: **promptfoo assumes the skill is already active.** It doesn't test whether Claude would *choose* to activate the skill in the first place.

### Anthropic's System: The Routing Problem

Anthropic's skill-creator solves the routing problem with `run_eval.py` and `run_loop.py`:

```bash
python scripts/run_loop.py \
  --eval-set eval-set.json \
  --skill-path ./my-skill \
  --max-iterations 5
```

This doesn't test output quality. It tests **trigger precision** — does Claude read the skill when it should, and skip it when it shouldn't?

The eval-set format is simple but powerful:

```json
[
  {
    "query": "Design a card component for a music app",
    "should_trigger": true
  },
  {
    "query": "Help me write a Node.js REST API",
    "should_trigger": false
  }
]
```

Each query runs through `claude -p` multiple times. The script monitors tool calls, checking if Claude invokes `Skill` or `Read` with your skill's name. It reports precision, recall, and accuracy.

---

## How The Eval Loop Works

The magic is in `run_loop.py`. Here's the flow:

1. **Run eval** on current description → get failures
2. **Call Claude** with a meta-prompt → get improved description
3. **Repeat** until all pass or max iterations reached
4. **Return** best-performing description from history

The key insight is in `improve_description.py`. It builds a prompt like this:

> "Here are the failed triggers. Don't just list more specific cases — that overfits. Instead, generalize to broader categories of user intent. Your description should be 100-200 words, under 1024 characters. Be creative — try different sentence structures across iterations."

This is sophisticated prompt engineering on prompt engineering. The system treats skill description as a **learnable parameter** optimized against real routing behavior.

---

## Training vs Test: Avoiding Overfit

The script supports a `--holdout` flag for train/test splits:

```bash
--holdout 0.4  # 40% held out for final evaluation
```

This is critical. Without it, you could write a description that's just a list of your eval queries. The holdout set ensures the description generalizes.

The output shows both scores:

```
Train: 14/16 passed, precision=93% recall=88%
Test:  6/8 passed, precision=100% recall=75%
```

If train is great but test fails, you're overfitting.

---

## Case Study: Improving frontend-design

My original `frontend-design` description was:

> "A frontend design agent channeling a specific aesthetic philosophy. Every UI should feel hot, sleek, usable, fun, and addictive."

This sounds cool but is **terrible for triggering**. Claude has no idea what "aesthetic philosophy" means in practice. It doesn't know this skill handles buttons but not backend APIs.

### The Improved Description

Using Anthropic's approach, I rewrote it:

> "Use this skill for frontend UI design tasks — designing or reviewing components (buttons, cards, forms, navbars, modals), specifying CSS with concrete values, layout and spacing decisions, typography selection, color systems, dark mode, and visual polish. Triggers on 'design a [component]', 'how should I style...', 'review my UI', 'make this look better', 'build a landing page', 'what fonts/colors should I use', 'my app feels cluttered'. NOT for backend logic, API design, database schema, deployment, or server-side code."

**What changed?**

1. **Imperative voice** — "Use this skill for..." not "This skill handles..."
2. **Concrete examples** — lists component types, not abstract philosophy
3. **Trigger phrases** — includes exact patterns users type
4. **Negative space** — explicitly says what NOT to trigger on

This is **300+ characters** of trigger signal. The old description was **139 characters** of vague vibes.

### The Eval Dataset

I added `agents/eval-set.json` with 24 queries:

- 16 positive triggers (design tasks)
- 8 negative triggers (backend, databases, APIs)

The dataset is documentation now, but with the `run_eval.py` scripts, it becomes an automated gate. New description doesn't hit 14/16? Don't ship.

---

## The Sub-Agent Architecture

Anthropic's repo also contains `agents/grader.md` — a sub-agent that evaluates execution transcripts. This is fascinating: it's **evals for evals**.

The grader:
1. Reads the execution transcript
2. Examines output files
3. Grades each expectation
4. **Critiques the evals themselves** — flags weak assertions

This meta-loop catches things like "assertion passed but would also pass for hallucinated output" or "important outcome not covered by any assertion."

For Loooom, I'm considering adopting this pattern. The current promptfoo rubrics are good, but a grader sub-agent could validate that assertions are actually discriminating — that they fail when they should.

---

## Which Should You Use?

| Tool | Tests | Good For | Requires |
|------|-------|----------|----------|
| promptfoo | Output quality | Consistent style, opinionated responses | Claude API key |
| Anthropic's system | Trigger precision | Routing, description optimization | Claude Code CLI |

**Use both.**

promptfoo validates that your skill produces good output *given it's active*. Anthropic's system validates that Claude *activates it at the right time*.

For a skill like `frontend-design`, the quality eval ensures the output is opinionated and specific. The trigger eval ensures Claude doesn't fire it on "help me write a database schema."

---

## The Meta-Lesson: Description is Hyperparameters

The most profound insight from Anthropic's system: **skill descriptions are hyperparameters**.

Just like you'd tune learning rate or batch size in ML, you should tune your skill description against actual behavior. The difference is your "model" is Claude Code, and your "loss function" is routing accuracy.

The automated loop makes this practical. Instead of guessing at descriptions, you:

1. Write an eval set representing your target behavior
2. Run the optimization loop
3. Review the best description found
4. Ship with confidence

This is **empirical prompt engineering**. No vibes, just metrics.

---

## Porting to Loooom

Loooom plugins already support promptfoo quality evals. Adding trigger evals means:

1. **Standardize `agents/eval-set.json`** — 20-30 queries with `should_trigger: bool`
2. **Add `run_eval.py` to CI** — test descriptions on PRs
3. **Document the description format** — imperative voice, trigger phrases, negative space

The `frontend-design` plugin now has both:

```
plugins/frontend-design/
├── promptfooconfig.yaml    # Quality evals (promptfoo)
├── agents/
│   └── eval-set.json       # Trigger evals (Anthropic-style)
└── skills/frontend-design/
    └── SKILL.md            # Optimized description
```

Over time, we could automate the improvement loop too. The infra is there — `improve_description.py` just needs a Claude API call instead of `claude -p`.

---

## Final Thought: The Skill is the Interface

Claude Code's skill system is powerful because it treats **description as interface**. Your skill's description isn't metadata — it's the API contract with the model.

Anthropic's eval system treats that contract seriously. It measures whether the contract is being honored and automatically rewrites it when it's not.

For skill builders, this is liberating. You don't have to be a prompt whisperer. You just need:

1. A clear eval set representing your use cases
2. The optimization loop
3. The discipline to not ship until metrics are green

The tools exist. The methodology is documented. The rest is just engineering.

---

**Links:**
- [Anthropic's skill-creator](https://github.com/anthropics/skills/tree/main/skills/skill-creator)
- [Loooom frontend-design plugin](https://github.com/mager/loooom-catalog/tree/main/plugins/frontend-design)
- [promptfoo](https://promptfoo.dev/)
