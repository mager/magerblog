---
title: "OpenRouter: The routing layer magerbot was missing"
description: "OpenRouter lets you pick a different model for every step in a pipeline. Here's how to use Fable for planning and Sonnet for execution — with runnable TypeScript."
pubDate: 2026-07-08
category: tech
draft: true
tags: ["ai", "openrouter", "agents", "magerbot", "typescript", "claude"]
---

magerbot — the always-on Claude Code session running on my Mac mini — uses a single model for everything. A Telegram message asking for a blog post draft goes through the same model as a one-word "yes" reply. That's the default and it's fine, but it leaves something on the table. Orchestration and execution are different cognitive loads. A model that's good at decomposing an ambiguous request into a crisp plan isn't necessarily the right tool for grinding through each step.

[OpenRouter](https://openrouter.ai) solves this in the simplest way possible: it gives you a single API endpoint that routes to any model from any provider. You pick the model per call. That's it. Which means you can write an orchestration layer that uses Fable for the "what should I do" decisions and Sonnet for the "do the thing" execution — with no vendor lock-in and a unified billing view.

This post is about that pattern, with the actual code.

---

## What OpenRouter is

OpenRouter is an OpenAI-compatible proxy that aggregates models from Anthropic, OpenAI, Google, Mistral, and others. You swap your base URL to `https://openrouter.ai/api/v1`, add an OpenRouter API key, and model names become the router's namespace:

| Provider | Model ID |
|---|---|
| Anthropic Fable | `anthropic/claude-fable-5` |
| Anthropic Sonnet | `anthropic/claude-sonnet-4-6` |
| OpenAI | `openai/gpt-4o` |
| Google | `google/gemini-2-pro` |

Swapping the model string is the entire API surface change. Everything else — messages format, tool use, streaming — stays the same.

The useful properties for a routing pattern:

1. **One key, all providers.** No juggling six API keys across providers.
2. **Model IDs are stable.** You can hardcode `anthropic/claude-fable-5` as your orchestrator model and `anthropic/claude-sonnet-4-6` as your executor model and those strings don't change when Anthropic updates something on their end.
3. **Spend tracking per model.** The dashboard breaks down cost by model. You can see exactly what your Fable calls cost vs. your Sonnet calls.

---

## The pattern: plan with Fable, execute with Sonnet

The reason this is worth doing rather than just using one model for everything:

**Fable** is a bigger model. It's better at ambiguous, multi-step planning — taking an underspecified goal and decomposing it into concrete, ordered steps. It's slower and costs more per call, so you don't want it doing the repetitive work.

**Sonnet** is faster and cheaper. It's excellent at executing well-specified tasks — writing a file, calling an API, formatting output, generating code from a clear spec. Once you've told it exactly what to do, it does it well and quickly.

The split: Fable runs once to produce a plan. Sonnet runs once per step to execute the plan. A three-step task costs one Fable call and three Sonnet calls. For tasks with five or more steps, the cost difference becomes meaningful.

---

## Setup

```bash
npm install openai
```

OpenRouter uses the OpenAI SDK with a different base URL and API key. No separate package needed.

```typescript
// lib/openrouter.ts
import OpenAI from "openai";

export const router = new OpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: process.env.OPENROUTER_API_KEY,
  defaultHeaders: {
    "HTTP-Referer": "https://mager.co",
    "X-Title": "magerbot",
  },
});

export const MODELS = {
  orchestrator: "anthropic/claude-fable-5",
  executor: "anthropic/claude-sonnet-4-6",
} as const;
```

The `HTTP-Referer` and `X-Title` headers are optional but appear in OpenRouter's usage dashboard — useful for tracking which pipeline generated which costs.

---

## Orchestrator: Fable decomposes the task

The orchestrator's job is to take an underspecified goal and return a list of concrete, bounded subtasks. Fable does this well. The output needs to be structured so the executor can consume it without ambiguity.

```typescript
// lib/orchestrator.ts
import { router, MODELS } from "./openrouter.js";

export interface Subtask {
  id: number;
  description: string;
  expectedOutput: string;
}

export interface Plan {
  goal: string;
  subtasks: Subtask[];
}

export async function planTask(goal: string): Promise<Plan> {
  const response = await router.chat.completions.create({
    model: MODELS.orchestrator,
    messages: [
      {
        role: "system",
        content: `You are a task planner. Given a goal, decompose it into 3-6 concrete, 
ordered subtasks. Each subtask must be independently executable and have a clear, 
verifiable output. Return JSON only.`,
      },
      {
        role: "user",
        content: `Goal: ${goal}

Return a JSON object with this shape:
{
  "goal": "<the original goal>",
  "subtasks": [
    {
      "id": 1,
      "description": "<what to do>",
      "expectedOutput": "<what done looks like>"
    }
  ]
}`,
      },
    ],
    response_format: { type: "json_object" },
  });

  const content = response.choices[0].message.content;
  if (!content) throw new Error("Orchestrator returned empty response");

  return JSON.parse(content) as Plan;
}
```

Requesting JSON output from the orchestrator is important. You want a data structure, not prose — Sonnet will be reading this as its input, not a human.

---

## Executor: Sonnet runs each subtask

The executor receives a single subtask, any context from prior steps, and returns a result. Sonnet is well-suited for this: the task is already fully specified, and it executes quickly.

```typescript
// lib/executor.ts
import { router, MODELS } from "./openrouter.js";
import type { Subtask } from "./orchestrator.js";

export interface ExecutionResult {
  subtaskId: number;
  output: string;
  success: boolean;
}

export async function executeSubtask(
  subtask: Subtask,
  context: string = ""
): Promise<ExecutionResult> {
  const response = await router.chat.completions.create({
    model: MODELS.executor,
    messages: [
      {
        role: "system",
        content: `You are a task executor. Complete the given subtask precisely.
${context ? `\nContext from prior steps:\n${context}` : ""}`,
      },
      {
        role: "user",
        content: `Subtask ${subtask.id}: ${subtask.description}

Expected output: ${subtask.expectedOutput}

Complete this subtask. Return only the output, no preamble.`,
      },
    ],
  });

  const output = response.choices[0].message.content ?? "";

  return {
    subtaskId: subtask.id,
    output,
    success: output.length > 0,
  };
}
```

The `context` parameter is how prior results flow into later steps. If subtask 3 needs to know what subtask 1 produced, you pass that in. Simple string concatenation works for most cases; you can get fancier with structured context as the pipeline grows.

---

## Putting it together

```typescript
// pipeline.ts
import { planTask } from "./lib/orchestrator.js";
import { executeSubtask } from "./lib/executor.js";

async function run(goal: string) {
  console.log(`\nGoal: ${goal}\n`);

  // Fable plans
  console.log("Planning with Fable...");
  const plan = await planTask(goal);
  console.log(`Plan: ${plan.subtasks.length} subtasks\n`);

  // Sonnet executes each step
  const results = [];
  let context = "";

  for (const subtask of plan.subtasks) {
    console.log(`Executing subtask ${subtask.id}: ${subtask.description}`);
    const result = await executeSubtask(subtask, context);
    results.push(result);

    // Accumulate context for subsequent steps
    context += `\nSubtask ${subtask.id} result:\n${result.output}\n`;
    console.log(`  ✓ Done\n`);
  }

  return { plan, results };
}

// Example
await run("Write a technical overview of how content delivery networks work, suitable for a developer blog post.");
```

One Fable call. N Sonnet calls. The cost scales with the number of steps, not with the complexity of the goal.

---

## The magerbot version

Here's the pattern applied to what I actually use magerbot for. A Telegram message arrives with an underspecified task. Instead of sending it straight to a single model, it goes through the planner first:

```typescript
// magerbot/task-handler.ts
import { planTask } from "../lib/orchestrator.js";
import { executeSubtask } from "../lib/executor.js";
import { router, MODELS } from "../lib/openrouter.js";

interface TelegramMessage {
  chatId: string;
  text: string;
  timestamp: Date;
}

export async function handleTask(message: TelegramMessage): Promise<string> {
  const { text } = message;

  // Is this complex enough to plan, or just answer directly?
  const complexity = await assessComplexity(text);

  if (complexity === "simple") {
    // Simple question or command — go straight to Sonnet
    const response = await router.chat.completions.create({
      model: MODELS.executor,
      messages: [{ role: "user", content: text }],
    });
    return response.choices[0].message.content ?? "";
  }

  // Complex task — plan with Fable, execute with Sonnet
  const plan = await planTask(text);

  const results = [];
  let context = "";

  for (const subtask of plan.subtasks) {
    const result = await executeSubtask(subtask, context);
    results.push(result);
    context += `\nSubtask ${subtask.id}:\n${result.output}\n`;
  }

  // Sonnet synthesizes the results into a final reply
  const synthesis = await router.chat.completions.create({
    model: MODELS.executor,
    messages: [
      {
        role: "system",
        content: "Synthesize the following task results into a concise summary for Telegram. Plain text, no markdown.",
      },
      {
        role: "user",
        content: `Original task: ${text}\n\nResults:\n${context}`,
      },
    ],
  });

  return synthesis.choices[0].message.content ?? "Task complete.";
}

async function assessComplexity(text: string): Promise<"simple" | "complex"> {
  // Cheap heuristic before spending a model call:
  // simple = question, short command, yes/no
  // complex = anything that implies multiple steps or research
  const simplePatterns = [
    /^(what|who|when|where|how much|is|are|does|did|can|will)/i,
    /^(yes|no|ok|sure|thanks)/i,
  ];

  if (simplePatterns.some((p) => p.test(text.trim())) || text.length < 80) {
    return "simple";
  }

  return "complex";
}
```

The complexity gate is worth calling out. Not every message needs a planning pass. A Telegram message that says "what's the weather?" doesn't need Fable to decompose it — that's overhead with no benefit. The heuristic is rough (length + question pattern), but it costs nothing and routes the clear cases correctly. You can replace it with a fast lightweight model call if you want more precision.

For the complex path, the final synthesis step is also Sonnet. Fable did the hard thinking at the start; everything from there is execution.

---

## When this pattern earns its overhead

The routing pattern adds latency (one extra model call for planning) and cost (Fable is priced higher per token than Sonnet). It's worth it when:

- **Tasks are multi-step and the steps aren't obvious upfront.** If you already know the steps, just hardcode them.
- **Execution steps are repetitive.** The more Sonnet calls you make, the more the cost difference from using Sonnet vs. Fable for those calls compounds.
- **Planning quality matters more than plan latency.** Fable produces better decompositions on ambiguous goals. If the plan is wrong, the execution doesn't matter.

It's not worth it when:

- The task is a single step. One Fable call and one Sonnet call costs more than one Sonnet call.
- The task is already fully specified. If you can write out the subtasks yourself, do it — hardcoded pipelines are faster and cheaper than dynamically planned ones.
- Latency is critical. The planning step adds time. For a synchronous user-facing response, that may be too slow.

For magerbot specifically, most requests coming in via Telegram are either clearly simple (a quick lookup, a yes/no, a status check) or genuinely complex (draft a post, research something, coordinate a multi-step workflow). The bimodal distribution makes the routing worthwhile.

---

## Running it

```bash
export OPENROUTER_API_KEY=sk-or-...
npx tsx pipeline.ts
```

OpenRouter's dashboard at [openrouter.ai/activity](https://openrouter.ai/activity) shows every call with model, token counts, and cost. After a few runs, the Fable vs. Sonnet cost split becomes concrete — which makes the routing decision easier to tune.

The full code from this post is at [github.com/mager/openrouter-routing-pattern](https://github.com/mager/openrouter-routing-pattern).
