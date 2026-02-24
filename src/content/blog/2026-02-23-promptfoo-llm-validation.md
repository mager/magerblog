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

## The Full Landscape: Beyond promptfoo

promptfoo is excellent, but it's not the only player in this space. If you're serious about AI validation, you should know the landscape. Here's what's out there — from open-source to enterprise, from pre-deployment to production.

### OpenAI Evals (The Reference Standard)

[OpenAI's evals framework](https://github.com/openai/evals) is what the foundation labs use. It's essentially a registry of standardized benchmarks plus a framework for running them. If you want to compare your use case against the same tests OpenAI uses to evaluate GPT-5, this is where you start.

**Best for:** Benchmarking against industry standards, academic-style evaluation
**Trade-off:** Less focused on individual app testing, more on model capability assessment

### Ragas (The RAG Specialist)

[Ragas](https://docs.ragas.io/) is purpose-built for Retrieval-Augmented Generation apps. If you're building anything with vector databases and context retrieval, Ragas provides metrics like:
- **Context Relevance:** Is the retrieved context actually relevant to the query?
- **Faithfulness:** Does the answer stick to the provided context (or hallucinate)?
- **Context Recall:** Did the retriever find all the relevant information?

**Best for:** RAG pipelines, knowledge bases, document Q&A systems
**Key insight:** They emphasize an "experiments-first" approach — every change should be a controlled experiment with measurable results.

### Arize Phoenix (The Observability Layer)

[Phoenix](https://arize.com/docs/phoenix) from Arize AI combines **tracing** with **evaluation**. It auto-instruments your LLM app (LangChain, LlamaIndex, Vercel AI SDK) and captures detailed traces of every model call, retrieval, and tool use. Then you run evals on those traces.

The workflow: instrument → observe → annotate → evaluate → deploy

**Best for:** Production systems where you need to understand *why* something failed, not just *that* it failed
**Unique angle:** Built on OpenTelemetry — integrates with your existing observability stack

### Braintrust (The Enterprise Platform)

[Braintrust](https://www.braintrust.dev/) positions itself as the "AI observability platform for teams." It's more opinionated than the open-source tools — it provides a structured workflow (instrument, observe, annotate, evaluate, deploy) and is designed for collaborative team use.

**Best for:** Teams shipping production AI features who need shared dashboards, human-in-the-loop annotation, and regression tracking
**Key feature:** Playgrounds for rapid prompt iteration with automatic eval runs

### DeepEval (The Pythonic Framework)

[DeepEval](https://deepeval.com/) is a Python-first evaluation framework with a pytest-like developer experience. It comes with 20+ built-in metrics (hallucination, answer relevance, contextual recall, etc.) and integrates with CI/CD pipelines.

**Best for:** Python shops, teams that want code-first evaluation (not YAML configs)
**Bonus:** Their cloud platform (Confident AI) provides team collaboration features

### The Managed Cloud Players

Don't sleep on the fully-managed options:
- **Weights & Biases (W&B):** Already standard for ML model training, now expanding into LLM evaluation
- **LangSmith:** LangChain's native observability and eval platform — seamless if you're already in the LangChain ecosystem
- **Helicone:** AI gateway + observability that sits between your app and LLM providers
- **Traceloop:** OpenTelemetry-native tracing specifically for AI applications

### Emerging & Bleeding Edge

Here's where it gets interesting — the stuff that's not quite mainstream yet but will be:

**1. Synthetic Data Generation**

Instead of hand-writing test cases, generate them from your production traffic. Tools like [Glaider](https://glaider.ai/) and [Humanloop](https://humanloop.com/) can mine real user queries and generate diverse test variations automatically.

**2. Multi-Judge Consensus**

Using one LLM to judge another is noisy. The bleeding edge uses *multiple* judges and aggregates their scores — similar to how prediction markets work. If GPT-4, Claude, and Gemini all agree the output is bad, it's probably bad.

**3. Online Learning from Production**

The holy grail: your evals improve themselves. New tools are emerging that monitor production traffic, detect edge cases that failed silently, and automatically add them to your test suite. It's eval-driven development in a loop.

**4. Adversarial Testing as a Service**

Why write your own jailbreak attempts? Services now offer continuously updated attack patterns — prompt injection techniques, social engineering framing, encoding tricks — that you can run against your app on every deploy.

**5. Human-in-the-Loop at Scale**

Some qualities (humor, creativity, cultural nuance) still need human judgment. New platforms are making it feasible to get human labels on thousands of outputs for calibration, not just spot-checking.

### How to Choose

| Tool | Best For | When to Use |
|------|----------|-------------|
| **promptfoo** | Open-source, flexible, CI/CD | Side projects, startups, any scale |
| **Ragas** | RAG evaluation | Vector DB apps, knowledge bases |
| **Phoenix** | Observability + evals combined | Production systems needing deep debugging |
| **Braintrust** | Team collaboration | Multiple developers, shared dashboards |
| **DeepEval** | Python-first workflows | Pytest lovers, code-first evaluation |
| **OpenAI Evals** | Benchmarking | Academic comparisons, research |

## Blind Spots to Watch For

Even with all these tools, there are validation gaps the industry hasn't solved yet:

**Long-term Consistency:** Most evals test single-turn interactions. But what about conversation drift? A chatbot might pass every individual test but accumulate errors over a 20-turn conversation. Multi-turn evals are still primitive.

**Subjective Quality at Scale:** "Helpfulness" is easy to eyeball, hard to automate. Current LLM judges correlate with human judgment ~70-80% of the time. That's useful but not trustworthy enough for high-stakes decisions without human spot-checking.

**Emergent Capabilities:** You can't evaluate what you don't know the model can do. New capabilities (chain-of-thought reasoning, tool use, in-context learning) often emerge unexpectedly and lack standardized tests.

**Cost-Accuracy Trade-offs:** Running 1000 eval cases against GPT-4 costs real money. The best eval strategy might be: cheap deterministic checks → mid-cost heuristic evals → expensive LLM judges only when necessary. Most tools don't optimize for this tiering yet.

## The Bottom Line

"Evals" aren't some arcane art reserved for OpenAI's research team. They're just testing — something we already know how to do. The tooling has finally caught up to make LLM evaluation accessible.

For side projects, the bar is low: a few test cases, run before you ship, catch the obvious regressions. For production systems, the bar is higher: systematic red teaming, model comparison, CI/CD integration.

The landscape is moving fast. What promptfoo does today, others will do differently tomorrow. But the core principle won't change: **trust, but verify**. Don't ship AI features without knowing how they break.

Either way, stop guessing. Start testing. Your users (and your sanity) will thank you.

---

*Want to see evals in action? Check out [promptfoo.dev](https://promptfoo.dev), explore [Ragas](https://docs.ragas.io/) for RAG apps, or browse the plugins I've been testing at [loooom.xyz](https://loooom.xyz).
