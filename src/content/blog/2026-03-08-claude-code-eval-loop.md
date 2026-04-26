---
title: "Claude Code: How to Write, Eval, and Iterate on a Skill"
pubDate: 2026-03-08
author: "mager"
category: tech
draft: false
description: "Part 2 of the prompt verification series. We covered output quality testing with promptfoo — now we tackle the harder problem: does your skill even fire?"
tags: ["skill evals & iterations"]
keyword: "claude code skill eval firing loop testing"
heroImage: ""
---

Last time, we covered [unit testing AI prompts with promptfoo](/blog/2026-02-23-promptfoo-llm-validation). Output quality gates, CI/CD integration, LLM-as-judge assertions — the whole stack.

But there's a problem I didn't cover. One that's specific to Claude Code skills and it'll bite you if you don't catch it.

This is Part 2. We're going deeper.

---

## The Problem No One Talks About

When you build a Claude Code skill, there are two different things to get right:

**1. Output quality** — given the skill is active, does it give good answers?

**2. Trigger precision** — does Claude actually *activate* the skill when it should?

Promptfoo handles #1 beautifully. We covered that. But #2 is a different problem entirely — and Anthropic just shipped a Python eval system in their [skill-creator plugin](https://github.com/anthropics/skills/tree/main/skills/skill-creator) that attacks it head-on.

In this post, we're going to build a Claude Code skill from scratch, write both types of evals, run them, and iterate until they pass. Full tutorial. Real code. No handwaving.

Let's build `frontend-design` together.

---

## Step 1: Write the Skill

A Claude Code skill is just a folder with a `SKILL.md`. The frontmatter is the routing signal — the body is the instructions.

```
plugins/frontend-design/
└── skills/frontend-design/
    └── SKILL.md
```

Here's the SKILL.md:

```markdown
---
name: frontend-design
description: A frontend design agent channeling a specific aesthetic philosophy.
             Every UI should feel hot, sleek, usable, fun, and addictive.
---

# Frontend Design

Every UI you touch should feel hot, sleek, sexy, usable, fun, and addictive.

## Core Philosophy

Design is not decoration. It's communication...

## Design Patterns

### Cards
- Subtle border, generous padding (1.25rem+)
- Hover state: slight lift (translateY -2px) + border glow
...
```

Looks solid. Two problems though. We'll find them through evals.

---

## Step 2: Write Quality Evals (promptfoo)

First, quality. Given the skill is active, does it produce good output?

Install promptfoo and create a `promptfooconfig.yaml` next to the plugin:

```bash
npx promptfoo@latest init
```

The config needs a prompt loader. Create `prompt.cjs` — this injects the skill as a system message:

```js
// prompt.cjs
const fs = require('fs');
const path = require('path');

module.exports = async function(context) {
  const skillPath = path.join(__dirname, 'skills/frontend-design/SKILL.md');
  const skill = fs.readFileSync(skillPath, 'utf8');
  return [
    { role: 'system', content: skill },
    { role: 'user', content: context.vars.message }
  ];
};
```

Now write the test cases. Think about what the skill *promises* and test each promise:

```yaml
# promptfooconfig.yaml
description: "Quality eval for mager/frontend-design"

providers:
  - id: anthropic:claude-haiku-3-5

evaluateOptions:
  rubricProvider: anthropic:claude-haiku-3-5

prompts:
  - file://./prompt.cjs

tests:
  - description: "Gives opinionated button design advice"
    vars:
      message: "How should I style my primary CTA button?"
    assert:
      - type: llm-rubric
        value: "Gives specific, opinionated CSS or design direction — references
                concepts like visual weight, contrast ratio, or hover states
                with concrete values"

  - description: "Provides concrete CSS for a card component"
    vars:
      message: "Design a card component for a music app"
    assert:
      - type: llm-rubric
        value: "Provides actual CSS or design spec with specific values
                (border-radius, shadows, colors, spacing)"

  - description: "Has strong typography opinions"
    vars:
      message: "What fonts should I use for a modern SaaS app?"
    assert:
      - type: llm-rubric
        value: "Recommends specific fonts by name with reasoning — not just
                'use a sans-serif', but opinionated choices with pairings"

  - description: "Pushes back on bad design decisions"
    vars:
      message: "I want to use Comic Sans and a bright red background"
    assert:
      - type: llm-rubric
        value: "Gives honest, direct pushback with reasoning and offers
                a specific alternative"

  - description: "Handles non-frontend requests in persona"
    vars:
      message: "Help me write a Node.js API"
    assert:
      - type: llm-rubric
        value: "Redirects to frontend/design territory — stays in design lane"

  - description: "Gives dark mode specific advice"
    vars:
      message: "How do I make a great dark mode?"
    assert:
      - type: llm-rubric
        value: "Mentions avoiding pure black, elevated surfaces, CSS custom
                properties, and system preference detection"

  - description: "Opinionated on error states"
    vars:
      message: "How should I design form error messages?"
    assert:
      - type: llm-rubric
        value: "Provides specific guidance on visual indicators, placement,
                helper text, accessibility, and tone"

  - description: "Mobile-first for responsive questions"
    vars:
      message: "How do I make this navbar work on mobile?"
    assert:
      - type: llm-rubric
        value: "Gives mobile-first responsive guidance — mentions touch targets,
                viewport breakpoints, or progressive disclosure"
```

Run it:

```bash
npx promptfoo@latest eval
npx promptfoo@latest view   # open the UI
```

These tests pass — the skill produces good output when it's active. ✅

But here's the thing: **these tests assume the skill is already loaded.** You're injecting it as a system prompt manually. In a real Claude Code session, Claude decides whether to read the skill at all. That's the routing problem.

---

## Step 3: Write Trigger Evals

The description in the frontmatter is Claude's *only* signal for when to activate the skill. It's compared against the user's query. Get it wrong and the skill never fires — no matter how good the body is.

Anthropic's eval format is simple: a JSON array of queries with a `should_trigger` flag.

Create `agents/eval-set.json`:

```json
[
  {
    "query": "Design a card component for a music app",
    "should_trigger": true,
    "note": "core use case — UI component design"
  },
  {
    "query": "How should I style my primary CTA button?",
    "should_trigger": true,
    "note": "styling decision"
  },
  {
    "query": "My UI feels cluttered. How do I fix it?",
    "should_trigger": true,
    "note": "design review"
  },
  {
    "query": "Build me a landing page hero section",
    "should_trigger": true,
    "note": "UI construction"
  },
  {
    "query": "How do I implement a great dark mode?",
    "should_trigger": true,
    "note": "dark mode design"
  },
  {
    "query": "What fonts should I use for a modern SaaS app?",
    "should_trigger": true,
    "note": "typography"
  },
  {
    "query": "Design a login form with validation states",
    "should_trigger": true,
    "note": "form design"
  },
  {
    "query": "Make my app look more modern and polished",
    "should_trigger": true,
    "note": "general UI polish"
  },
  {
    "query": "Help me write a Node.js REST API",
    "should_trigger": false,
    "note": "backend — no design intent"
  },
  {
    "query": "Fix this Python bug in my data pipeline",
    "should_trigger": false,
    "note": "debugging — unrelated domain"
  },
  {
    "query": "Set up a PostgreSQL database schema",
    "should_trigger": false,
    "note": "database — no UI"
  },
  {
    "query": "Write unit tests for my auth service",
    "should_trigger": false,
    "note": "backend testing"
  },
  {
    "query": "Help me deploy this app to Vercel",
    "should_trigger": false,
    "note": "devops / deployment"
  }
]
```

The goal: 8+ positive triggers fire, 5 negatives don't. This is a binary classification problem — you're measuring precision and recall on the routing decision.

---

## Step 4: Run the Trigger Eval

Clone the skill-creator repo and run `run_eval.py`:

```bash
git clone https://github.com/anthropics/skills.git
cd skills

python skills/skill-creator/scripts/run_eval.py \
  --eval-set /path/to/agents/eval-set.json \
  --skill-path /path/to/skills/frontend-design \
  --runs-per-query 3 \
  --verbose
```

Here's what the script actually does under the hood — this is the clever part:

1. Creates a fake `.claude/commands/` entry with your skill's description
2. Runs `claude -p <query>` for each test case (multiple times for reliability)
3. Streams the JSON output, watching for `Skill` or `Read` tool calls
4. Checks if the tool call references your skill
5. Reports trigger rate: `triggered / total_runs`

A query "passes" if it triggers when `should_trigger: true`, or doesn't trigger when `should_trigger: false`.

With our original description — *"A frontend design agent channeling a specific aesthetic philosophy"* — here's what you'd see:

```
[FAIL] rate=1/3 expected=True:  "Build me a landing page hero section"
[FAIL] rate=1/3 expected=True:  "My UI feels cluttered. How do I fix it?"
[FAIL] rate=0/3 expected=True:  "Make my app look more modern and polished"
[PASS] rate=0/3 expected=False: "Help me write a Node.js REST API"
[PASS] rate=0/3 expected=False: "Set up a PostgreSQL database schema"

Results: 9/13 passed
```

The positives are failing. Claude doesn't recognize "Make my app look more modern" as a design task because the description is about *philosophy*, not *use cases*. The negatives pass by accident — the description isn't specific enough to accidentally match backend queries.

**9/13 is not good enough to ship.**

---

## Step 5: Understand the Failures

Before you iterate, understand *why* the failures happen. The description has three problems:

**Problem 1: No action verbs.** "A frontend design agent" tells Claude what you *are*, not what you *do*. Claude is looking for intent signals. The description needs to speak in terms of what the user is trying to accomplish.

**Problem 2: No concrete examples.** "Aesthetic philosophy" is abstract. Claude needs to know this handles buttons, cards, forms, navbars — not vibes.

**Problem 3: No negative space.** Without explicit exclusions, Claude has to guess the boundary between this skill and general coding help. It guesses wrong.

---

## Step 6: Iterate on the Description

You can iterate manually, or let `run_loop.py` do it automatically.

### Manual Iteration

Rewrite the description following these principles:

- **Imperative voice** — "Use this skill for..." not "This skill is..."
- **Concrete component list** — name the things it handles
- **Trigger phrases** — exact patterns users type
- **Negative space** — say what it does NOT do

Before:
```yaml
description: A frontend design agent channeling a specific aesthetic philosophy.
             Every UI should feel hot, sleek, usable, fun, and addictive.
```

After:
```yaml
description: Use this skill for frontend UI design tasks — designing or reviewing
             components (buttons, cards, forms, navbars, modals), specifying CSS
             with concrete values, layout and spacing decisions, typography
             selection, color systems, dark mode, and visual polish. Triggers on
             "design a [component]", "how should I style...", "review my UI",
             "make this look better", "build a landing page", "what fonts/colors
             should I use", "my app feels cluttered". NOT for backend logic, API
             design, database schema, deployment, or server-side code.
```

Run the eval again. You should see improvement.

### Automated Iteration with `run_loop.py`

The loop does this automatically: run eval → call Claude to improve the description based on failures → repeat.

```bash
python skills/skill-creator/scripts/run_loop.py \
  --eval-set agents/eval-set.json \
  --skill-path ./skills/frontend-design \
  --max-iterations 5 \
  --holdout 0.4 \
  --model claude-opus-4-5 \
  --verbose
```

The `--holdout 0.4` flag splits your eval set: 60% for training (used in optimization), 40% held out for final validation. This prevents overfitting — you can't game the test set you don't know.

The improve step calls `improve_description.py`, which prompts Claude with:

> "Here are the queries that failed. Don't list specific cases — that overfits. Instead, generalize to broader categories of user intent. Stay under 200 words. Be creative — try different sentence structures each iteration."

After 3-5 iterations, you get an HTML report showing the best description found:

```
Iteration 1: 9/13 train, 3/5 test
Iteration 2: 11/13 train, 4/5 test
Iteration 3: 13/13 train, 5/5 test ← best

Exit reason: all_passed (iteration 3)
Best score: 5/5 test
Best description: "Use this skill for frontend UI design..."
```

The loop finds the description that generalizes — not just the one that memorizes the training queries.

---

## Step 7: Validate the Full Picture

After optimizing the trigger description, run both evals:

```bash
# Quality eval (output still good?)
npx promptfoo@latest eval

# Trigger eval (routing still precise?)
python run_eval.py --eval-set agents/eval-set.json --skill-path ./skills/frontend-design
```

Both green? Ship it.

This is your full verification loop:

```
Write skill → Quality eval (promptfoo) → Trigger eval (run_eval.py)
                     ↓                           ↓
              Output is good?             Right queries fire?
                     ↓                           ↓
              Iterate SKILL.md body      Iterate description
```

The two evals have completely different failure modes. A skill can pass quality evals and fail trigger evals — great output, never invoked. Or pass trigger evals and fail quality evals — fires every time, bad answers. You need both.

---

## The Structure of a Well-Tested Skill

Here's what the final plugin directory looks like:

```
plugins/frontend-design/
├── .claude-plugin/
│   └── plugin.json          # marketplace metadata
├── agents/
│   └── eval-set.json        # trigger eval dataset (13+ queries)
├── skills/frontend-design/
│   └── SKILL.md             # trigger-optimized description + body
├── prompt.cjs               # promptfoo prompt loader
├── promptfooconfig.yaml     # quality evals (8+ test cases)
└── EVALUATION.md            # docs the eval strategy
```

The eval-set is documentation. It defines the skill's contract: "these are the queries this skill handles, these are the ones it doesn't." When someone sends a PR to improve the skill, you run both evals and the numbers tell you if it's an improvement.

---

## The Meta-Lesson: Description is Hyperparameters

This is the thing that clicked for me building this.

A skill's description isn't metadata. It's a **learnable parameter** — the thing you optimize against real routing behavior. Just like you'd tune learning rate in ML, you tune description against trigger accuracy.

The automated loop makes this empirical. Before: you guessed at descriptions and hoped Claude picked up on them. After: you write test cases, run the loop, measure precision and recall, ship when the numbers are green.

That's not prompting. That's engineering.

---

## What's Next for Loooom

Loooom plugins will ship with both evals as standard:
- `promptfooconfig.yaml` for output quality (already there)
- `agents/eval-set.json` for trigger precision (new standard as of this post)

Eventually: run trigger evals in CI on every PR. If the description change breaks routing, the build fails. No more shipping skills that never fire.

---

**Resources:**
- [Anthropic skill-creator](https://github.com/anthropics/skills/tree/main/skills/skill-creator) — `run_eval.py`, `run_loop.py`, `improve_description.py`
- [Loooom frontend-design plugin](https://github.com/mager/loooom-catalog/tree/main/plugins/frontend-design) — the worked example from this post
- [promptfoo](https://promptfoo.dev) — quality evals (Part 1 of this series)
- [Part 1: Unit Testing AI Prompts with promptfoo](/blog/2026-02-23-promptfoo-llm-validation)
