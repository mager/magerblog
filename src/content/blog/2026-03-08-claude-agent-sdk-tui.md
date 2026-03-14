---
title: "Claude Agent SDK: Build Your Own AI Terminal in 10 Minutes"
pubDate: "2026-03-08"
description: "The Claude Agent SDK gives you the same engine that powers Claude Code, fully programmable. Here's how to build a custom TUI with it in 10 minutes."
draft: false
category: "code"
tags: ["AI", "Agents", "Claude", "TypeScript", "TUI", "Terminal"]
heroImage: ""
keyword: "Claude Agent SDK tutorial"
---

You've used Claude Code from the terminal. Now build your own.

That's the pitch for the **Claude Agent SDK** — same engine that powers Claude Code, but programmable. You get the full agent loop — file reading, bash execution, web search, code editing — wrapped in a `for await` loop you control.

The question everyone asks: *why would I use this instead of just calling the Claude API directly?*

The answer: **you don't have to implement the tool loop yourself.**

And the most compelling use case for that? Building your own TUI.

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

Install the SDK and a terminal rendering library:

```bash
npm install @anthropic-ai/claude-agent-sdk ink react
npm install -D @types/react typescript
export ANTHROPIC_API_KEY=your-key
```

I'm using [Ink](https://github.com/vadimdemedes/ink) — React for the terminal. The pattern: stream messages from the Agent SDK, render them reactively.

### Step 1: The Message Stream

```typescript
// agent.ts
import { query, Message } from "@anthropic-ai/claude-agent-sdk";

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

### Step 2: The TUI Component

```typescript
// App.tsx
import React, { useState, useEffect } from "react";
import { Box, Text, useInput, useApp } from "ink";
import { runAgent } from "./agent.js";

type LogLine = { type: "user" | "agent" | "tool" | "result"; text: string };

export function App({ prompt }: { prompt: string }) {
  const [lines, setLines] = useState<LogLine[]>([]);
  const [done, setDone] = useState(false);
  const { exit } = useApp();

  useEffect(() => {
    setLines([{ type: "user", text: `> ${prompt}` }]);

    (async () => {
      for await (const msg of runAgent(prompt)) {
        if (msg.type === "assistant") {
          // Text response from Claude
          for (const block of msg.message.content) {
            if (block.type === "text") {
              setLines((prev) => [...prev, { type: "agent", text: block.text }]);
            }
            if (block.type === "tool_use") {
              setLines((prev) => [
                ...prev,
                { type: "tool", text: `⚙ ${block.name}(${JSON.stringify(block.input).slice(0, 60)})` },
              ]);
            }
          }
        }
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
        <Text bold color="cyan">
          ◆ My AI Terminal
        </Text>
        <Text color="gray">  (esc to quit)</Text>
      </Box>

      {lines.map((line, i) => (
        <Text key={i} color={colors[line.type]}>
          {line.text}
        </Text>
      ))}

      {!done && <Text color="gray">▸ thinking...</Text>}
    </Box>
  );
}
```

### Step 3: The Entry Point

```typescript
// index.tsx
import React from "react";
import { render } from "ink";
import { App } from "./App.js";

const prompt = process.argv.slice(2).join(" ") || "What files are in this directory?";

render(<App prompt={prompt} />);
```

Run it:

```bash
npx ts-node index.tsx "Find all TODO comments and summarize them"
```

You'll see Claude's tool calls stream in real-time — `⚙ Glob({"pattern":"**/*.ts"})`, `⚙ Grep({"pattern":"TODO"})` — followed by a structured summary.

That's a working AI TUI in ~80 lines.

## Level Up: Hooks

The real power is hooks — callbacks that fire at key points in the agent lifecycle. This is how you add audit logs, approval gates, or custom UI feedback:

```typescript
import { query, HookCallback } from "@anthropic-ai/claude-agent-sdk";
import { appendFile } from "fs/promises";

// Log every file edit to an audit trail
const auditEdit: HookCallback = async (input) => {
  const path = (input as any).tool_input?.file_path ?? "unknown";
  await appendFile("./audit.log", `${new Date().toISOString()}: edited ${path}\n`);
  return {};
};

for await (const message of query({
  prompt: "Refactor the auth module",
  options: {
    permissionMode: "acceptEdits",
    hooks: {
      PostToolUse: [{ matcher: "Edit|Write", hooks: [auditEdit] }],
    },
  },
})) {
  // render to your TUI
}
```

Other useful hooks: `PreToolUse` to block operations, `Stop` to detect when the agent finishes, `UserPromptSubmit` to pre-process input.

## Level Up: Persistent Sessions

The agent remembers context across multiple `query()` calls. Capture the session ID from the first run, pass it to the next:

```typescript
let sessionId: string | undefined;

// First turn
for await (const msg of query({ prompt: "Read the auth module" })) {
  if (msg.type === "system" && msg.subtype === "init") {
    sessionId = msg.session_id;
  }
}

// Second turn — Claude still knows what it read
for await (const msg of query({
  prompt: "Now find everything that calls it",
  options: { resume: sessionId },
})) {
  // ...
}
```

In a TUI, this means you can build a multi-turn conversation where the agent accumulates context across messages — like a REPL that actually remembers.

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

Install and explore:
- **TypeScript:** `npm install @anthropic-ai/claude-agent-sdk`
- **Python:** `pip install claude-agent-sdk`
- **Docs:** [platform.claude.com/docs/en/agent-sdk/overview](https://platform.claude.com/docs/en/agent-sdk/overview)
- **Demo agents:** [github.com/anthropics/claude-agent-sdk-demos](https://github.com/anthropics/claude-agent-sdk-demos)

The terminal isn't going anywhere. Might as well make it yours.
