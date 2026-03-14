---
title: "Claude Agent SDK: Build Your Own AI Terminal in 10 Minutes"
pubDate: "2026-03-14"
updatedDate: "2026-03-14"
description: "The Claude Agent SDK gives you the same engine that powers Claude Code, fully programmable. Here's how to build a custom TUI with it in 10 minutes."
draft: false
category: "code"
tags: ["AI", "Agents", "Claude", "TypeScript", "TUI", "Terminal"]
heroImage: "https://lh3.googleusercontent.com/pw/AP1GczMkAoMNzZ5evwXljzJ5Z7TcaPmHmP1OcxQ6lhT1jPqnp4Guwr3xOBLvuB0L8e1vUyXE-GMpb1p-yC4gd13QCVGof_bDKgWobqfrpenI-KJYPhlFsf18z7IvUp_Pu4N2G1P0ofKTnzPl9IxZY0cwLp-7rg=w2322-h1522-s-no-gm"
keyword: "Claude Agent SDK tutorial"
---

You've used Claude Code from the terminal. Now build your own.

That's the pitch for the **Claude Agent SDK** — same engine that powers Claude Code, but programmable. You get the full agent loop — file reading, bash execution, web search, code editing — wrapped in a `for await` loop you control.

The question everyone asks: *why would I use this instead of just calling the Claude API directly?*

The answer: **you don't have to implement the tool loop yourself.**

And the most compelling use case for that? Building your own TUI.

> **Demo repo:** [github.com/mager/claude-tui-demo](https://github.com/mager/claude-tui-demo) — clone it and follow along.

## The SDK vs. The API: What's the Actual Difference

With the standard Anthropic client SDK, you implement tool execution yourself:

```typescript
// You write this loop. Every time.
let response = await client.messages.create({ ...params });
while (response.stop_reason === "tool_use") {
  const result = yourToolExecutor(response.tool_use);
  response = await client.messages.create({ tool_result: result, ...params });
}
```

With the Agent SDK:

```typescript
import { query } from "@anthropic-ai/claude-agent-sdk";

for await (const message of query({
  prompt: "Find and fix the bug in auth.ts",
  options: { allowedTools: ["Read", "Edit", "Bash"] }
})) {
  console.log(message);
}
```

Claude reads the file, finds the bug, edits it. You stream the output. No tool loop, no executor, no boilerplate.

Built-in tools you get for free:

| Tool | What it does |
|------|-------------|
| `Read` | Read any file |
| `Write` | Create files |
| `Edit` | Precise edits |
| `Bash` | Run commands, git ops |
| `Glob` | Find files by pattern |
| `Grep` | Regex file search |
| `WebSearch` | Search the web |
| `WebFetch` | Fetch + parse URLs |

That's Claude Code's entire toolset, programmable.

## Why a TUI?

The Claude Code CLI is great for general use. But the moment you have a specific domain — a codebase with custom conventions, a workflow with specialized steps, a team with different permission needs — you want your *own* interface.

A custom TUI lets you:
- **Pre-load context** your team cares about (architecture docs, style guides)
- **Lock down tools** — a read-only reviewer can't accidentally edit prod
- **Surface domain-specific shortcuts** — one keystroke to run your whole test suite
- **Pipe output** into your CI/CD or logging infrastructure
- **Add hooks** — audit every file change, block destructive operations, require approval

You're not replacing Claude Code. You're building the version of Claude Code that fits your workflow exactly.

## Let's Build It

Clone the demo and install:

```bash
git clone https://github.com/mager/claude-tui-demo.git
cd claude-tui-demo
npm install
export ANTHROPIC_API_KEY=your-key
```

> **API credits:** You'll need an Anthropic API key with credits. Top up at [platform.claude.com/settings/billing](https://platform.claude.com/settings/billing).

I'm using **[Ink](https://github.com/vadimdemedes/ink)** for the terminal UI. If you know React, you already know Ink — same component model, same hooks (`useState`, `useEffect`), same JSX. But instead of rendering to the DOM, it renders to your terminal. `Box` is your `div`. `Text` is your `span`. Flexbox and colors work exactly as you'd expect. It's the cleanest way to build interactive terminal UIs in TypeScript.

> **Note on the runner:** The demo uses `tsx` instead of `ts-node`. `tsx` is zero-config — it handles `.tsx`, JSX, and ESM out of the box without loader flags. Also make sure `"type": "module"` is in your `package.json` — Ink's layout engine (`yoga-layout`) uses top-level `await`, which requires ESM mode. You'll hit a cryptic error without it.

### Step 1: The Message Stream

```typescript
// agent.ts
import { query } from "@anthropic-ai/claude-agent-sdk";

export async function* runAgent(prompt: string) {
  for await (const message of query({
    prompt,
    options: {
      allowedTools: ["Read", "Glob", "Grep", "Bash"],
    },
  })) {
    yield message;
  }
}
```

> **What's `async function*`?** The `*` makes this a *generator function* — instead of computing everything and returning at once, it hands you one value at a time via `yield`, pausing between each. `async` means it can also `await` internally. On the consumer side, `for await` handles the async stream one message at a time. This is how the tool calls and responses stream to your UI as they happen, not after everything finishes.

### Step 2: The TUI Component

[Ink](https://github.com/vadimdemedes/ink) gives us React-style components for the terminal. `Box` handles layout, `Text` handles output with color and style support.

```typescript
// App.tsx
import React, { useState, useEffect } from "react";
import { Box, Text, useInput, useApp } from "ink";
import { runAgent } from "./agent.js";

type LogLine = { type: "user" | "agent" | "tool" | "result"; text: string };

function formatToolCall(block: any): string {
  return `⚙ ${block.name}(${JSON.stringify(block.input).slice(0, 60)})`;
}

function handleAssistantMessage(msg: any, setLines: React.Dispatch<React.SetStateAction<LogLine[]>>) {
  for (const block of msg.message.content) {
    if (block.type === "text") {
      setLines((prev) => [...prev, { type: "agent", text: block.text }]);
    }
    if (block.type === "tool_use") {
      setLines((prev) => [...prev, { type: "tool", text: formatToolCall(block) }]);
    }
  }
}

export function App({ prompt }: { prompt: string }) {
  const [lines, setLines] = useState<LogLine[]>([]);
  const [done, setDone] = useState(false);
  const { exit } = useApp();

  useEffect(() => {
    setLines([{ type: "user", text: `> ${prompt}` }]);

    (async () => {
      for await (const msg of runAgent(prompt)) {
        if (msg.type === "assistant") handleAssistantMessage(msg, setLines);
        if (msg.type === "result") {
          setLines((prev) => [...prev, { type: "result", text: `✓ ${msg.result}` }]);
          setDone(true);
        }
      }
    })();
  }, []);

  useInput((_, key) => {
    if (key.escape || (key.ctrl && _.toLowerCase() === "c")) exit();
  });

  const colors: Record<LogLine["type"], string> = {
    user: "cyan",
    agent: "white",
    tool: "yellow",
    result: "green",
  };

  return (
    <Box flexDirection="column" padding={1}>
      <Box marginBottom={1}>
        <Text bold color="cyan">◆ My AI Terminal</Text>
        <Text color="gray">  (esc to quit)</Text>
      </Box>
      {lines.map((line, i) => (
        <Text key={i} color={colors[line.type]}>{line.text}</Text>
      ))}
      {!done && <Text color="gray">▸ thinking...</Text>}
    </Box>
  );
}
```

> **Message types:** The SDK streams several message types — `assistant` (Claude's response), `result` (final outcome), `system` (init event with the session ID), and `user` (echoed input). Log `msg.type` during development to see everything flowing through.

### Step 3: The Entry Point

```typescript
// index.tsx
import React from "react";
import { render } from "ink";
import { App } from "./App.js";

const prompt = process.argv.slice(2).join(" ") || "What files are in this directory?";

render(<App prompt={prompt} />);
```

`process.argv.slice(2)` grabs everything after `node` and the script path — your actual typed arguments. `.join(" ")` reassembles multi-word prompts. Seven lines. That's the whole entry point.

Run it:

```bash
npm start "What files are in this directory?"
```

![Claude TUI running — tool calls stream in yellow, result in green](https://lh3.googleusercontent.com/pw/AP1GczMkAoMNzZ5evwXljzJ5Z7TcaPmHmP1OcxQ6lhT1jPqnp4Guwr3xOBLvuB0L8e1vUyXE-GMpb1p-yC4gd13QCVGof_bDKgWobqfrpenI-KJYPhlFsf18z7IvUp_Pu4N2G1P0ofKTnzPl9IxZY0cwLp-7rg=w2322-h1522-s-no-gm)

You'll see Claude's tool calls stream in real-time — `⚙ Bash({"command":"ls"})` in yellow, the response in white, `✓ done` in green. That's a working AI TUI in ~80 lines.

## Level Up: The Forever Loop (REPL Mode)

The single-prompt TUI is great for one-shot tasks. But what if you want Claude to just... keep responding? Like the real Claude Code experience — type a prompt, get a response, type another?

That's a REPL, and it's a `while (true)` loop:

```typescript
// repl.ts
import { query } from "@anthropic-ai/claude-agent-sdk";
import * as readline from "readline";

let sessionId: string | undefined;

const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
const ask = (prompt: string) => new Promise<string>((resolve) => rl.question(prompt, resolve));

async function runTurn(userPrompt: string) {
  for await (const msg of query({
    prompt: userPrompt,
    options: { allowedTools: ["Read", "Glob", "Grep", "Bash"], resume: sessionId },
  })) {
    if (msg.type === "system" && msg.subtype === "init") sessionId = msg.session_id;
    if (msg.type === "assistant") {
      for (const block of msg.message.content) {
        if (block.type === "text") process.stdout.write(`\n🤖 ${block.text}\n`);
        if (block.type === "tool_use") {
          process.stdout.write(`⚙  ${block.name}(${JSON.stringify(block.input).slice(0, 80)})\n`);
        }
      }
    }
  }
}

console.log("◆ Claude REPL — type your prompt, ctrl+c to quit\n");

while (true) {
  const input = await ask("\n> ");
  if (!input.trim()) continue;
  await runTurn(input.trim());
}
```

Run it with `npm run repl`. Type anything. Claude responds. Type again — it still has context from everything before. That's the `resume: sessionId` doing its job.

![REPL demo — asking Claude why Chicago dyes the river green on St. Patty's Day](https://lh3.googleusercontent.com/pw/AP1GczN3F6Kj_iJAIHSxKGHutE7r29Wulw3YIaCkBVl46_uFSoGP2hn45_lUYduMGJ5QaaadNd_J0UlOMZNNxN7JNh7FEqNyU5NWex8Yi0uqKc1v3X-PNXmqoQDkEF0FO1T6HuGYopJ8-f3ibGKrxQISUtvAg=w2322-h1522-s-no-gm)

![REPL demo — follow-up question about St. Patty's Day traditions in the midwest](https://lh3.googleusercontent.com/pw/AP1GczNPxJG8XKMUNQYZ0M01k8xAPNZaCSF9evWXECJC5b3Xfd9MH-cFxagMnZFp7Ya0gSVcDYI4ewI1gWvo6n8zggY81zE-MiJcCktKn7NxgO9-vgszEaWwVLZTWUubczywszxxMzxH9dZSe3DIaCH_17iK8Q=w2322-h1522-s-no-gm)

## Level Up: Hooks

The real power is hooks — callbacks that fire at key points in the agent lifecycle. This is how you add audit logs, approval gates, or custom UI feedback:

```typescript
// agent.ts (with hooks)
import { query } from "@anthropic-ai/claude-agent-sdk";
import { appendFile } from "fs/promises";

const auditHook = async (input: any) => {
  const tool = input.tool_name ?? "unknown";
  const args = JSON.stringify(input.tool_input ?? {}).slice(0, 100);
  await appendFile("./audit.log", `${new Date().toISOString()}  ${tool}  ${args}\n`);
  return {};
};

for await (const message of query({
  prompt: "Refactor the auth module",
  options: {
    allowedTools: ["Read", "Edit", "Bash"],
    hooks: {
      PostToolUse: [{ matcher: ".*", hooks: [auditHook] }],
    },
  },
})) {
  // render to your TUI
}
```

Every tool call gets logged to `audit.log` with a timestamp. `matcher: ".*"` catches everything — narrow to `"Edit|Write"` if you only care about mutations.

Other hooks worth knowing: `PreToolUse` to block operations before they run, `Stop` to detect when the agent finishes, `UserPromptSubmit` to pre-process or validate input.

## Level Up: Persistent Sessions

The agent remembers context across multiple `query()` calls. Capture the session ID from the first run, pass it to the next:

```typescript
let sessionId: string | undefined;

// First turn — Claude reads the file
for await (const msg of query({ prompt: "Read the auth module" })) {
  if (msg.type === "system" && msg.subtype === "init") {
    sessionId = msg.session_id;
  }
}

// Second turn — zero tool calls, Claude already knows
for await (const msg of query({
  prompt: "Now find everything that calls it",
  options: { resume: sessionId },
})) {
  // ...
}
```

The money detail: the second turn fires **zero tool calls** — Claude already has the file in context. No re-reading, no extra API calls. It just answers.

![Persistent session demo — same session ID across both turns, Turn 2 needs no tool calls](https://lh3.googleusercontent.com/pw/AP1GczNbxDRyGbdLs8pDgB4E6ZNTQrNUA0FdJzTGq6wQNqeKgUFZbhlCb1zXxklJwcwmEzKCIcf9UvqSqHOO6gmbP21IE4fX6_HhimhAKbsjjwT_tvVK8xKK7FLLqvuCa_xUlS4ddyOfywfZpWbtDOi0EERWGQ=w2322-h1522-s-no-gm)

Run the demo: `npm run session`.

## Bonus: Go Flavor with Bubble Tea

If TypeScript isn't your thing, [Bubble Tea](https://github.com/charmbracelet/bubbletea) is the Go equivalent — and it's gorgeous. Built by [Charm](https://charm.sh/), it uses the **Elm Architecture**: all state in a `model`, pure `Update(msg)` and `View()` functions, no side effects anywhere.

Where Ink feels like React (hooks, JSX, component tree), Bubble Tea feels like a state machine. Same streaming pattern underneath — but the mental model is completely different.

The core structure:

```go
// main.go
type model struct {
    lines  []lineMsg  // all output so far
    done   bool
    prompt string
}

// Init — kick off the agent as a Cmd
func (m model) Init() (tea.Model, tea.Cmd) {
    return m, runAgent(m.prompt)
}

// Update — pure: (model, msg) → (model, cmd)
func (m model) Update(msg tea.Msg) (tea.Model, tea.Cmd) {
    switch msg := msg.(type) {
    case lineMsg:
        m.lines = append(m.lines, msg)
        if msg.kind == "result" {
            m.done = true
            return m, tea.Quit
        }
    case tea.KeyMsg:
        if msg.String() == "ctrl+c" { return m, tea.Quit }
    }
    return m, nil
}

// View — pure: model → string (lipgloss for colors)
func (m model) View() string {
    var sb strings.Builder
    for _, line := range m.lines {
        switch line.kind {
        case "tool":   sb.WriteString(styleTool.Render("⚙ " + line.text))
        case "agent":  sb.WriteString(styleAgent.Render(line.text))
        case "result": sb.WriteString(styleResult.Render(line.text))
        }
        sb.WriteString("\n")
    }
    if !m.done { sb.WriteString(styleWait.Render("▸ thinking...")) }
    return sb.String()
}
```

`Init` returns a command (the agent stream). Each streamed line comes back as a `lineMsg` and flows through `Update`. `View` just renders whatever's in the model. No hooks, no `useEffect`, no async state — just pure functions.

The full Go version lives in [`bubbletea/main.go`](https://github.com/mager/claude-tui-demo/tree/main/bubbletea) in the demo repo:

```bash
cd bubbletea
go mod tidy
export ANTHROPIC_API_KEY=your-key
go run main.go "What files are in this directory?"
```

**Ink vs Bubble Tea at a glance:**

| | Ink (TypeScript) | Bubble Tea (Go) |
|---|---|---|
| Mental model | React hooks | Elm Architecture |
| State | `useState` | `model` struct |
| Side effects | `useEffect` | `Cmd` return values |
| Styling | Props (`color`, `bold`) | lipgloss |
| Best for | TS/React developers | Go developers, strict state control |

Both are production-grade. Pick the one that matches your team.

## Real-World Example: The Email Agent

Anthropic ships a reference implementation of this pattern — an [email agent](https://github.com/anthropics/claude-agent-sdk-demos/tree/main/email-agent) that reads your inbox, drafts replies, and sends them. It's a great study in how hooks + persistent sessions compose in production: `PreToolUse` to require approval before sending, `PostToolUse` to log every action, session resume to maintain context across a multi-step triage workflow. The same ~80-line skeleton we just built, extended into something genuinely useful.

## When to Use the SDK vs. the CLI

| Scenario | Use |
|----------|-----|
| Daily development, one-off tasks | Claude Code CLI |
| CI/CD pipelines | SDK |
| Custom team tools | SDK |
| Domain-specific workflows | SDK |
| Production automation | SDK |
| Audit trails + permission control | SDK |

The workflows translate directly. Anything Claude Code can do in the CLI, the SDK can do programmatically.

## The Bigger Picture

The Agent SDK is a general-purpose agent runtime — not just a coding tool. The built-in tools, the hooks system, the subagent delegation, the MCP support — it's a full agent platform.

The TUI is just one entry point. You could build:
- A Slack bot where Claude actually edits your codebase
- A CI/CD step that auto-fixes lint errors before merging
- An internal tool where junior devs prompt in plain English and senior devs approve tool calls
- A research agent with web search and file output

The pattern is always the same: `for await (const message of query(...))`. Stream it, render it, hook into it.

Explore further:
- **Demo repo:** [github.com/mager/claude-tui-demo](https://github.com/mager/claude-tui-demo)
- **Docs:** [platform.claude.com/docs/en/agent-sdk/overview](https://platform.claude.com/docs/en/agent-sdk/overview)
- **Reference agents:** [github.com/anthropics/claude-agent-sdk-demos](https://github.com/anthropics/claude-agent-sdk-demos)
- **Python SDK:** `pip install claude-agent-sdk`

The terminal isn't going anywhere. Might as well make it yours.
