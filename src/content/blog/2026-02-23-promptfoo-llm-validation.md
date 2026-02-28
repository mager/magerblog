---
title: "promptfoo: The Ultimate Guide to Unit Testing Your AI Prompts"
pubDate: "2026-02-26"
description: "Stop shipping AI features blind. Here's everything you need to know about unit testing prompts — from five-minute quick starts to CI/CD pipelines, agent workflow testing, and building a regression suite that actually catches breakage."
category: "code"
tags: ["AI", "LLM", "Testing", "promptfoo", "Evals", "CI/CD"]
heroImage: ""
keyword: "unit-testing prompts"
draft: false
---

You've heard the term. "Evals." It's dropped in every AI product meeting, every HN thread about the latest model release, every paper from OpenAI or Anthropic.

But here's what nobody tells you: **evals aren't magic**. They're just tests. And until recently, running proper LLM evaluations required infrastructure most of us don't have.

Enter [promptfoo](https://promptfoo.dev) — an open-source tool that brings the evaluation techniques used by foundation labs to your weekend side project. This is the guide I wish existed when I started: from zero to a full regression suite, CI/CD integration, agent workflow testing, and knowing exactly where your prompts break.

---

## Quick Start: Zero to Running Evals in 5 Minutes

No theory first. Let's ship something.

```bash
# Install and scaffold
npx promptfoo@latest init

# This generates a promptfooconfig.yaml — open it and add a real test
```

Here's the minimal config to get something running:

```yaml
# promptfooconfig.yaml
prompts:
  - 'Summarize this in one sentence: {{text}}'

providers:
  - openai:gpt-4o-mini

tests:
  - vars:
      text: "The quick brown fox jumps over the lazy dog"
    assert:
      - type: contains
        value: "fox"
      - type: javascript
        value: output.length < 200
```

Run it:

```bash
npx promptfoo@latest eval
```

Output looks like this:

```
✔ openai:gpt-4o-mini | test 1 | contains "fox" — PASS
✔ openai:gpt-4o-mini | test 1 | javascript length check — PASS

Results: 2/2 passed (100%)
```

Open the web UI to see the full matrix:

```bash
npx promptfoo@latest view
```

That's it. You now have a working eval. Everything else in this guide is building on this foundation.

---

## What Are "Evals" Really?

An eval is just a systematic answer to: **"Is this LLM output good?"**

But "good" is slippery. Good for what? Compared to what?

The big labs run evals to:
- Compare model versions (GPT-4 vs GPT-4.5)
- Catch regressions (did we break math reasoning?)
- Measure safety (will it generate harmful content?)
- Benchmark capabilities (how's the new coding model?)

For us building on top of these models, evals answer different questions:
- Does my prompt produce consistent JSON?
- Is the output actually *correct* or just plausible-sounding?
- How does GPT-4o compare to Claude Sonnet for *my specific use case*?
- Did my prompt change yesterday break something?

The last one is the one that matters most.

---

## The Assertion System: All the Ways to Validate Output

promptfoo's assertion system is the real power. Understanding the full range unlocks sophisticated test suites.

### Deterministic Assertions (Fast, Free, Unambiguous)

```yaml
assert:
  # String matching
  - type: contains
    value: "json"
  - type: not-contains
    value: "sorry, I can't"
  - type: equals
    value: "confirmed"
  - type: starts-with
    value: "{"
  
  # Pattern matching
  - type: regex
    value: "^\\d{5}$"
  
  # Structure validation
  - type: is-json
  - type: is-valid-openai-function-call
  
  # Text similarity (not exact match)
  - type: levenshtein
    value: "expected answer here"
    threshold: 10          # max edit distance
  
  - type: bleu
    value: "the reference translation"
    threshold: 0.7         # BLEU score 0–1
  
  - type: rouge
    value: "the reference summary"
    threshold: 0.6
```

Use these when you can define "correct" with code. They're fast and cheap to run at scale.

### JavaScript Assertions (Custom Logic in One Line)

The most underused feature. You get the full output as a string, write any JS:

```yaml
assert:
  # Check output length
  - type: javascript
    value: output.length < 500
  
  # Check JSON structure
  - type: javascript
    value: |
      const data = JSON.parse(output);
      return data.hasOwnProperty('name') && data.hasOwnProperty('score');
  
  # Check word count
  - type: javascript
    value: output.split(' ').filter(Boolean).length >= 50
  
  # Multiple conditions
  - type: javascript
    value: |
      const lines = output.trim().split('\n');
      return lines.length >= 3 && lines.every(l => l.startsWith('-'));
```

### Python Assertions (For Complex Logic)

Same idea, but Python — useful if you have existing validation logic:

```yaml
assert:
  - type: python
    value: |
      import json
      data = json.loads(output)
      return len(data['items']) > 0 and data['status'] == 'success'
```

### Model-Graded Assertions (The Interesting Stuff)

Use an LLM to judge an LLM:

```yaml
assert:
  - type: llm-rubric
    value: "Is not apologetic and provides a clear, concise answer without hedging"
  
  - type: factuality
    value: "Sacramento is the capital of California"
  
  - type: answer-relevance
    # Checks if the answer actually addresses the question
  
  - type: similar
    value: "The expected semantic meaning of the response"
    threshold: 0.8         # cosine similarity via embeddings
```

### Threshold-Based Scoring with `assert-set`

When you don't need 100% pass rate — partial credit:

```yaml
assert:
  - type: assert-set
    threshold: 0.7         # 70% of assertions must pass
    assert:
      - type: contains
        value: "conclusion"
      - type: llm-rubric
        value: "Uses professional tone"
      - type: javascript
        value: output.length > 200
      - type: not-contains
        value: "I cannot"
      - type: factuality
        value: "The earth orbits the sun"
```

This is powerful for subjective quality gates — you need *most* things right, not all.

---

## Prompt Regression Testing: The Real Workflow

This is the pattern that makes evals worth the investment. It's basically TDD for prompts.

### The Git Workflow

```bash
# 1. Write your test suite before changing anything
npx promptfoo@latest eval --output results-baseline.json

# 2. Make your prompt change in promptfooconfig.yaml
# (or in your app's prompt template)

# 3. Run evals again
npx promptfoo@latest eval --output results-new.json

# 4. Compare
npx promptfoo@latest eval --compare results-baseline.json
```

The compare output shows you exactly which tests regressed. If accuracy dropped, the change doesn't ship.

### Storing Eval History

Track results over time by writing to a timestamped file:

```bash
npx promptfoo@latest eval --output "results/$(date +%Y-%m-%d-%H%M).json"
```

Commit this to git. Now you have a history of how your model accuracy changes with every prompt tweak, model upgrade, or system change.

### The Decision Loop

```
write test → lock baseline → change prompt → eval → compare
    ↓                                                    ↓
 if better: ship                              if worse: revert or iterate
```

Simple. But almost nobody does it because there was no easy tooling. Now there is.

---

## CI/CD Integration: Evals on Every PR

This is the step that makes evals a real engineering practice instead of a manual ritual.

### GitHub Actions Workflow

```yaml
# .github/workflows/eval.yml
name: LLM Evals

on:
  pull_request:
    paths:
      - 'prompts/**'
      - 'promptfooconfig.yaml'
      - 'src/prompts/**'

jobs:
  eval:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      
      - name: Cache promptfoo results
        uses: actions/cache@v4
        with:
          path: .promptfoo/cache
          key: promptfoo-${{ hashFiles('promptfooconfig.yaml') }}
          restore-keys: |
            promptfoo-
      
      - name: Run evals
        env:
          OPENAI_API_KEY: ${{ secrets.OPENAI_API_KEY }}
          ANTHROPIC_API_KEY: ${{ secrets.ANTHROPIC_API_KEY }}
        run: |
          npx promptfoo@latest eval \
            --output eval-results.json \
            --no-progress-bar
      
      - name: Check accuracy threshold
        run: |
          node -e "
            const results = require('./eval-results.json');
            const passRate = results.results.stats.successes / results.results.stats.totalTests;
            console.log('Pass rate:', (passRate * 100).toFixed(1) + '%');
            if (passRate < 0.85) {
              console.error('FAIL: Pass rate below 85% threshold');
              process.exit(1);
            }
          "
      
      - name: Upload results
        uses: actions/upload-artifact@v4
        if: always()
        with:
          name: eval-results
          path: eval-results.json
```

### Fail the Build on Regression

The critical piece is the threshold check. Set it at whatever accuracy your team can ship with confidence. 85% is a reasonable starting point — adjust based on your risk tolerance and test quality.

You can also compare against a stored baseline:

```yaml
      - name: Download baseline
        uses: dawidd6/action-download-artifact@v3
        with:
          name: eval-baseline
          path: baseline/
        continue-on-error: true
      
      - name: Compare against baseline
        if: hashFiles('baseline/eval-results.json') != ''
        run: |
          npx promptfoo@latest eval \
            --compare baseline/eval-results.json \
            --fail-on-regression
```

### Caching Strategy

LLM API calls are expensive. Cache aggressively:

```yaml
# promptfooconfig.yaml
evaluateOptions:
  cache: true           # cache identical prompt+input combinations
  maxConcurrency: 5     # don't hammer the API
```

Cached runs are essentially free. Only new or changed test cases hit the API.

---

## Testing Agent Workflows

Single-turn prompt testing is table stakes. The real challenge is testing agents — multi-turn conversations, tool calls, and complex reasoning chains.

### Multi-Turn Conversation Testing

```yaml
tests:
  - description: "Customer support conversation"
    vars:
      customer_name: "Alex"
    conversation:
      - role: user
        content: "I need to return a product"
      - role: assistant
        content: "{{output}}"         # captured from model
        assert:
          - type: contains
            value: "return"
          - type: llm-rubric
            value: "Asks for order number or product details, not just a generic response"
      - role: user
        content: "Order #12345, bought last week"
      - role: assistant
        assert:
          - type: llm-rubric
            value: "Confirms the return process and gives a clear next step"
          - type: not-contains
            value: "I'm sorry but"
```

### Testing Function/Tool Call Outputs

When your agent can call tools, test that it calls the right ones:

```yaml
providers:
  - openai:gpt-4o
    config:
      tools:
        - type: function
          function:
            name: search_database
            description: Search the product database
            parameters:
              type: object
              properties:
                query: { type: string }
                category: { type: string }

tests:
  - vars:
      query: "Find me running shoes under $100"
    assert:
      - type: is-valid-openai-function-call
      - type: javascript
        value: |
          const call = JSON.parse(output);
          return call.name === 'search_database' 
            && call.arguments.category === 'shoes';
```

### Testing Agentic Loops (promptfoo + Your Agent)

For agents that run multiple tool calls before responding, you can test the final output:

```yaml
tests:
  - description: "Research and summarize task"
    vars:
      task: "What's the population of Chicago and how has it changed in the last decade?"
    assert:
      - type: factuality
        value: "Chicago's population is approximately 2.7 million"
      - type: llm-rubric
        value: "Includes specific numbers and mentions the trend (growth or decline)"
      - type: javascript
        value: output.split(' ').length > 100  # not just a one-liner
```

---

## Real-World: Testing Loooom Plugins

Here's where theory meets practice. [Loooom](https://loooom.xyz) is my Claude Code plugin marketplace. Every plugin is essentially a prompt — a `SKILL.md` that tells Claude Code how to behave. Until now I've validated these manually: install, run a few conversations, eyeball results. That doesn't scale.

### Eval Config for the Japanese Learning Plugin

```yaml
# plugins/beginner-japanese/promptfooconfig.yaml
prompts:
  - file://SKILL.md

providers:
  - anthropic:claude-sonnet-4-7

tests:
  # Core vocabulary
  - vars:
      query: "How do I say 'Where is the bathroom?'"
    assert:
      - type: contains
        value: "トイレ"
      - type: llm-rubric
        value: "Provides both the Japanese phrase AND pronunciation (romaji)"
      - type: factuality
        value: "The Japanese word for bathroom is トイレ (toire) or お手洗い (otearai)"
  
  # Grammar explanation
  - vars:
      query: "What does desu mean?"
    assert:
      - type: llm-rubric
        value: "Explains desu as a copula/linking verb, gives at least one example sentence"
      - type: contains
        value: "です"
  
  # Appropriate difficulty
  - vars:
      query: "Teach me how to order food at a restaurant"
    assert:
      - type: llm-rubric
        value: "Covers both formal and casual speech levels appropriate for a beginner"
      - type: not-contains
        value: "この"  # shouldn't use advanced grammar without explanation
  
  # Safety: stays on topic
  - vars:
      query: "Write me a cover letter for a job application"
    assert:
      - type: llm-rubric
        value: "Redirects the user to Japanese learning, does not write the cover letter"
```

Run this before shipping any plugin update. If accuracy drops, the update doesn't go out.

### Plugin Verification Badges

The next step: publish eval configs alongside every plugin. Users could run the same tests, verify the claims, contribute new test cases. Turns "trust me bro" into "here's the data." Working on this for Loooom v2.

---

## The Full Landscape: Choosing Your Tool

promptfoo is excellent but it's not the only player. Here's the ecosystem — fast:

| Tool | Best For | When to Use |
|------|----------|-------------|
| **promptfoo** | Flexible, open-source, CI/CD-native | Side projects to prod — any scale |
| **Ragas** | RAG pipeline evaluation | Vector DB apps, document Q&A |
| **Arize Phoenix** | Tracing + evals combined | Production debugging, OTel integration |
| **Braintrust** | Team dashboards, human annotation | Multi-dev teams, collaborative grading |
| **DeepEval** | Python-first, pytest-like | Python shops, code-first evaluation |
| **OpenAI Evals** | Industry benchmarking | Research, academic comparisons |
| **LangSmith** | LangChain ecosystem | Already using LangChain |

**Ragas** is purpose-built for RAG — it measures context relevance, faithfulness, and recall specifically. If you're building on vector databases, start here.

**Arize Phoenix** sits at the observability layer — it auto-instruments your app (LangChain, LlamaIndex, Vercel AI SDK), captures traces, then lets you run evals on those traces. The workflow is: instrument → observe → annotate → evaluate → deploy.

**Braintrust** is for teams. Structured workflow, shared dashboards, human-in-the-loop annotation at scale.

**DeepEval** has 20+ built-in metrics and integrates with pytest. If your stack is Python and you want `assert` statements in your test files, this is your tool.

For solo builders and startups: promptfoo. For Python teams: DeepEval. For RAG: Ragas. For production observability: Phoenix.

---

## Red Teaming: Breaking Your Own Stuff

Validation tells you when things work. Red teaming tells you when things *fail badly*.

```bash
npx promptfoo@latest redteam init
npx promptfoo@latest redteam run
```

This systematically probes for:
- **Prompt injection** — can someone hijack your system prompt?
- **Jailbreaks** — does it refuse to generate harmful content consistently?
- **Data leakage** — is your RAG leaking private context from other users?
- **Hallucination triggers** — what inputs reliably produce confident wrong answers?

The report shows you exactly which attack vectors succeeded and how often. For any production LLM app, this is non-negotiable. Run it before launch. Run it again after major changes.

---

## What the Industry Hasn't Solved Yet

Even with all these tools, there are validation gaps that remain genuinely hard:

**Long-term conversation drift.** Most evals test single turns. A chatbot might pass every individual test but slowly drift off-topic or become more generic over a 20-turn conversation. Multi-turn evals are still primitive.

**Subjective quality at scale.** LLM judges correlate with human judgment ~70-80% of the time. Useful, not reliable enough for high-stakes decisions without human spot-checking.

**Emergent behaviors.** You can't eval what you don't know to test for. New capabilities emerge unexpectedly. Blind spots are real.

**Cost tiers.** Running 1000 cases against GPT-4 costs real money. Optimal eval strategy is: cheap deterministic checks first → heuristic evals → LLM judges only when necessary. Most tools don't optimize this tiering automatically yet.

---

## The Bottom Line

"Evals" aren't some arcane art reserved for Anthropic's research team. They're just testing — something we already know how to do. The tooling has finally caught up to make it accessible.

Here's the three-level hierarchy of maturity:

1. **Zero evals** — you're flying blind. Every deploy is a prayer.
2. **Manual evals** — you test by hand before shipping. Better, but doesn't scale.
3. **Automated evals in CI** — regressions get caught before they hit users. This is where you want to be.

Getting from 1 to 3 is maybe a day of work with promptfoo. The config is YAML. The CLI is intuitive. The GitHub Actions integration is copy-paste.

The only excuse for shipping LLM features without evals is that you didn't know how. Now you do.

Stop guessing. Start testing.

---

*Using this in production? I'd love to hear what eval patterns you've found useful — [@mager](https://x.com/mager) on X. And if you're building Claude Code plugins, check out [Loooom](https://loooom.xyz) — I'm working on adding eval configs as a first-class part of the plugin spec.*
