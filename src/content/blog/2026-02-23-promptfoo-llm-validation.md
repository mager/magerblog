---
title: "promptfoo: Stop Guessing, Start Testing Your LLMs"
pubDate: "2026-02-23"
description: "Everyone's talking about 'evals' but what does that actually mean? I spent the weekend with promptfoo and learned how to validate LLM outputs like the big labs do — and how to apply it to my side projects."
category: "engineering"
tags: ["AI", "LLM", "Testing", "promptfoo", "Evals", "Validation"]
heroImage: ""
keyword: "LLM evaluation testing promptfoo"
draft: true
---

You've heard the term. "Evals." It's dropped in every AI product meeting, every HN thread about the latest model release, every paper from OpenAI or Anthropic.

But here's what nobody tells you: **evals aren't magic**. They're just tests. And until recently, running proper LLM evaluations required infrastructure most of us don't have.

Enter [promptfoo](https://promptfoo.dev) — an open-source tool that brings the evaluation techniques used by foundation labs to your weekend side project. I spent the last few days deep in their docs, and I'm going to show you exactly how validation works and why it matters for something like [Loooom](https://loooom.xyz).

## What Are "Evals" Really?

At its core, an eval is just a systematic way to answer: **"Is this LLM output good?"**

But "good" is slippery. Good for what? Good compared to what?

The big labs run evals to:
- Compare model versions (GPT-4 vs GPT-4.5)
- Catch regressions (did we break math reasoning?)
- Measure safety (will it generate harmful content?)
- Benchmark capabilities (how's the new coding model?)

For us mere mortals building on top of these models, evals answer different questions:
- Does my prompt produce consistent JSON?
- Is the output actually *correct* or just plausible-sounding?
- How does GPT-4o compare to Claude Sonnet for *my specific use case*?
- Did my prompt change yesterday break something?

## The Two Types of Validation

promptfoo splits validation into two buckets, and understanding this distinction changed how I think about testing LLMs:

### 1. Deterministic Assertions (The Easy Stuff)

These are your classic programmatic tests — the kind you'd write for any API:

```yaml
assert:
  - type: contains
    value: "json"
  - type: equals
    value: "confirmed"
  - type: regex
    value: "^\\d{5}$"
  - type: is-json
```

Use these when you can define "correct" with code. Does the output contain a key phrase? Match a pattern? Parse as valid JSON? These are fast, cheap, and unambiguous.

### 2. Model-Graded Assertions (The Interesting Stuff)

This is where it gets wild. You use an LLM to grade an LLM:

```yaml
assert:
  - type: llm-rubric
    value: "Is not apologetic and provides a clear, concise answer"
  - type: factuality
    value: "Sacramento is the capital of California"
  - type: answer-relevance
```

Why would you do this? Because some qualities are hard to code:
- Is the tone appropriate?
- Is this factually consistent with the reference?
- Does it actually answer the question asked?
- Is it helpful without being verbose?

The model-graded approach uses what promptfoo calls an "LLM-as-a-judge" pattern. You give another model (often a smaller, cheaper one) a rubric and ask it to score the output. It's not perfect — judges can be biased or inconsistent — but it's often the *only* way to validate subjective qualities at scale.

## How Validation Works in Practice

Here's a real promptfoo config that tests a translation feature:

```yaml
prompts:
  - 'Convert the following to {{language}}: {{input}}'

providers:
  - openai:gpt-4o-mini
  - anthropic:claude-sonnet-4-7

tests:
  - vars:
      language: French
      input: "Hello world"
    assert:
      - type: contains
        value: "Bonjour"
      - type: similar
        value: "Bonjour le monde"
        threshold: 0.8
      
  - vars:
      language: Japanese
      input: "Where is the library?"
    assert:
      - type: llm-rubric
        value: "Uses polite/formal Japanese suitable for strangers"
      - type: factuality
        value: "The Japanese word for library is 図書館 (toshokan)"
```

When you run `promptfoo eval`, it:
1. Sends each test case to each provider
2. Runs all assertions against the outputs
3. Scores pass/fail for deterministic checks
4. Uses your judge LLM to score subjective checks
5. Generates a report showing accuracy per model, per test, per assertion

The output is a matrix: models × test cases × assertions. You can see at a glance where Claude beats GPT, which tests are flaky, and whether your changes helped or hurt.

## The Loooom Connection

So how does this apply to [Loooom](https://loooom.xyz), my Claude Code plugin marketplace?

Every plugin on Loooom is essentially a prompt — a `SKILL.md` file that tells Claude Code how to behave. Right now, I validate these manually: install the plugin, run a few conversations, eyeball the results. It's fine for 6 plugins. It won't scale to 60.

Here's what I'm thinking:

**1. Prompt Regression Testing**

Every plugin needs a test suite. For my Japanese learning plugin:

```yaml
tests:
  - vars:
      query: "How do I say 'Where is the bathroom?'"
    assert:
      - type: contains
        value: "トイレ"
      - type: llm-rubric  
        value: "Provides both the Japanese phrase AND pronunciation help"
      - type: factuality
        value: "The Japanese word for bathroom is トイレ (toire) or お手洗い (otearai)"
```

Before shipping an update to a plugin, I'd run the eval. If accuracy drops, the change doesn't ship.

**2. Model Comparison**

Claude Code supports multiple models. A plugin might work great on Sonnet but fail on Haiku. I could test each plugin across the supported model matrix and badge them: "Verified on Sonnet, Opus, GPT-4o."

**3. Community Evals**

What if plugin authors published their eval configs alongside their skills? Users could run the same tests, verify the claims, even contribute new test cases. It turns "trust me bro" into "here's the data."

## Red Teaming: The Other Half

promptfoo isn't just for validation — it's also for *breaking things*. Their red team module systematically probes for vulnerabilities:

- Prompt injection attacks
- Jailbreak attempts  
- Data leakage (is your RAG leaking private context?)
- Hallucination triggers
- Harmful content generation

The approach is similar: generate adversarial inputs, run them through your system, evaluate the outputs. But instead of checking for correctness, you're checking for *failure modes*.

For a production LLM app, this is non-negotiable. The big labs do it. You should too.

## Key Insights From the Docs

After spending hours in promptfoo's documentation, here are the mental models that stuck:

**Accuracy is context-dependent.** promptfoo defines accuracy as "the proportion of prompts that produce expected output." But "expected" is defined by *your* assertions. There's no universal "good" — only good for your use case.

**Assertions compose.** You can stack multiple assertions on a single test. All must pass (or use `assert-set` with thresholds for partial credit). This mirrors real requirements: the output must be JSON AND contain this key AND not be offensive.

**Transforms are powerful.** You can preprocess output before assertions run. Strip markdown, extract JSON from code blocks, normalize whitespace. This keeps your assertions clean while handling messy real-world outputs.

**Embeddings enable semantic comparison.** The `similar` assertion uses vector similarity, not string matching. "The cat sat on the mat" and "A cat was sitting on a mat" are ~0.9 similar even though they're different strings. This is crucial for natural language outputs where exact matching is too rigid.

**Judge models have preferences.** Different models grade differently. GPT-4 is stricter than GPT-3.5. Claude is more nuanced on creative tasks. Your eval results depend on your judge — document which one you used.

## Getting Started (Actually)

If you want to try this yourself:

```bash
# Install and init
npx promptfoo@latest init

# Or grab a pre-built example
npx promptfoo@latest init --example getting-started

# Run your first eval
npx promptfoo@latest eval

# View results
npx promptfoo@latest view
```

The config is just YAML. Start simple — one prompt, one provider, a few test cases with `contains` assertions. Add complexity as you need it.

## The Bottom Line

"Evals" aren't some arcane art reserved for OpenAI's research team. They're just testing — something we already know how to do. The tooling has finally caught up to make LLM evaluation accessible.

For side projects, the bar is low: a few test cases, run before you ship, catch the obvious regressions. For production systems, the bar is higher: systematic red teaming, model comparison, CI/CD integration.

Either way, stop guessing. Start testing. Your users (and your sanity) will thank you.

---

*Want to see evals in action? Check out [promptfoo.dev](https://promptfoo.dev) or browse the plugins I've been testing at [loooom.xyz](https://loooom.xyz).*
