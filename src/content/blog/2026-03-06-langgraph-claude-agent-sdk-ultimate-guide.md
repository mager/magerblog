---
title: "LangGraph + Claude Agent SDK: The Ultimate Guide to Multi-Agent Systems in 2026"
pubDate: 2026-03-06
draft: true
description: "A deep dive into the two most powerful tools for building production-grade multi-agent systems — LangGraph's graph-based orchestration and Anthropic's Claude Agent SDK (formerly Claude Code SDK)."
category: tech
---

The agent era isn't coming. It's here. And if you're building serious agentic systems in 2026, two tools belong in your arsenal: **LangGraph** and **Anthropic's Claude Agent SDK** (which Anthropic just renamed from the Claude Code SDK — we'll get into that). This isn't a "hello world" primer. This is the guide I wish existed when I started going deep on these.

Let's go.

---

## The Multi-Agent Landscape

Before we dive into the tools, let's zoom out. The market right now looks something like this:

| Framework | Philosophy | Best For |
|---|---|---|
| **LangGraph** | Graph-based, low-level, model-agnostic | Complex workflows, durable execution, fine-grained control |
| **Claude Agent SDK** | Agent loop in a box, Claude-native | Code tasks, file ops, rapid multi-agent builds |
| **AutoGen (Microsoft)** | Conversation-driven, role-based agents | Research automation, conversational teams |
| **CrewAI** | Role-playing agent crews | Business process automation with natural-language roles |
| **Haystack** | Pipeline-based, retrieval-focused | RAG, search, document intelligence |
| **Semantic Kernel** | Microsoft-backed, .NET/Python | Enterprise teams already in Azure |

The leaders are LangGraph and the Claude Agent SDK — one for control freaks (affectionate), one for velocity.

---

## Part 1: LangGraph

### What It Is

LangGraph is a **low-level orchestration framework** for stateful, long-running agents. It's built by the LangChain team but is fully independent — you don't need LangChain to use it. Companies like Klarna, Replit, and Elastic run it in production.

The mental model: your agent is a **directed graph**. Nodes are functions (think: LLM calls, tool invocations, conditional checks). Edges define flow. State is typed and persisted across the entire execution.

This is fundamentally different from a simple chain or loop. You get:

- **Branching** — conditional logic based on state
- **Cycles** — agents that loop back and retry
- **Checkpointing** — resume from exactly where you left off after a crash
- **Human-in-the-loop** — pause at any node, get a human decision, continue

### Core Concepts

#### StateGraph

Everything starts with `StateGraph`. You define a typed state schema, add nodes, connect them with edges.

```python
from langgraph.graph import StateGraph, MessagesState, START, END

def agent_node(state: MessagesState):
    # call your LLM here
    return {"messages": [{"role": "ai", "content": "..."}]}

def tool_node(state: MessagesState):
    # execute tools based on last message
    ...

graph = StateGraph(MessagesState)
graph.add_node("agent", agent_node)
graph.add_node("tools", tool_node)

# conditional routing: if agent called a tool, go to tools; else end
graph.add_conditional_edges("agent", should_use_tools, {
    "tools": "tools",
    "end": END
})
graph.add_edge("tools", "agent")  # tools feed back into agent
graph.add_edge(START, "agent")

app = graph.compile()
```

That loop — `agent → tools → agent` — is the ReAct pattern. LangGraph makes it explicit and controllable.

#### Custom State

`MessagesState` is the default. But you can define any typed state:

```python
from typing import Annotated, TypedDict
from langgraph.graph.message import add_messages

class AgentState(TypedDict):
    messages: Annotated[list, add_messages]
    plan: str
    iterations: int
    approved: bool
```

State is **immutable by merge** — each node returns a partial update, LangGraph merges it. This makes concurrent subgraph execution safe.

#### Durable Execution

LangGraph's killer feature for production: **checkpointing**.

```python
from langgraph.checkpoint.memory import MemorySaver

checkpointer = MemorySaver()  # or SqliteSaver, PostgresSaver
app = graph.compile(checkpointer=checkpointer)

# each run gets a thread_id — resume with same id after failure
config = {"configurable": {"thread_id": "run-42"}}
result = await app.ainvoke({"messages": [...]}, config=config)
```

If your agent crashes mid-execution? It resumes from the last checkpoint on retry. For long-running tasks (minutes, hours), this is non-negotiable.

#### Human-in-the-Loop

Pause execution at any node. Wait for human input. Continue.

```python
from langgraph.graph import interrupt

def review_node(state: AgentState):
    # this pauses and surfaces the state to a human
    decision = interrupt({"plan": state["plan"], "action": "approve?"})
    return {"approved": decision["approved"]}
```

This maps directly to real-world workflows: code review approval, compliance check, content moderation. Not a hack — built into the framework at the runtime level.

### Multi-Agent Patterns in LangGraph

LangGraph supports three main multi-agent topologies:

**1. Supervisor Pattern**
A central supervisor routes tasks to specialized subagents:

```python
def supervisor(state):
    # decide which agent handles next task
    next_agent = llm.invoke(routing_prompt + str(state))
    return {"next": next_agent}

builder = StateGraph(State)
builder.add_node("supervisor", supervisor)
builder.add_node("coder", coding_agent)
builder.add_node("researcher", research_agent)
builder.add_conditional_edges("supervisor", lambda s: s["next"], 
    {"coder": "coder", "researcher": "researcher", "FINISH": END})
```

**2. Network Pattern**
Agents communicate peer-to-peer. Each agent decides where to route next.

**3. Hierarchical**
Trees of agents — supervisors managing sub-supervisors managing workers. LangGraph handles the recursion.

### LangSmith Integration

LangGraph's observability story is via **LangSmith**. Set two env vars:

```bash
export LANGSMITH_TRACING=true
export LANGSMITH_API_KEY=your-key
```

Every graph execution is traced — node inputs/outputs, latency, token usage, state diffs. For debugging multi-agent systems, this is invaluable. You can't debug what you can't see.

### When to Use LangGraph

- You need **precise control** over agent behavior at each step
- Your workflow has **complex conditional logic** (not just loops)
- You need **durable execution** (long-running, resumable)
- You're **model-agnostic** (OpenAI, Anthropic, Gemini, local models)
- You need to **pause for humans** mid-execution
- You're building a **production system** that needs to handle failures gracefully

---

## Part 2: Claude Agent SDK

### Wait — It Got Renamed

Hot off the presses: Anthropic just renamed the **Claude Code SDK** → **Claude Agent SDK**. If you're on old docs, you'll see migration notes. The packages:

```bash
# TypeScript
npm install @anthropic-ai/claude-agent-sdk

# Python
pip install claude-agent-sdk
```

The rebrand signals Anthropic's intent: this isn't just a tool for coding tasks. It's a general-purpose agent runtime.

### What It Is

The Claude Agent SDK gives you the same agent loop, tools, and context management that power the Claude Code CLI — but programmable. You get an autonomous agent that can:

- Read and write files
- Run terminal commands
- Search the web
- Edit code with surgical precision
- Spawn subagents for parallel work

The core API is dead simple:

```typescript
import { query } from "@anthropic-ai/claude-agent-sdk";

for await (const message of query({
  prompt: "Audit src/ for security vulnerabilities and write a report",
  options: { allowedTools: ["Read", "Grep", "Glob", "Write"] }
})) {
  if ("result" in message) console.log(message.result);
}
```

`query()` returns an **async iterator** that streams messages as Claude works. You get Claude's reasoning, tool calls, tool results, and the final output — all in one stream.

### Built-in Tools

No glue code. No tool execution to implement yourself. These are ready:

| Tool | What It Does |
|---|---|
| `Read` | Read any file in working dir |
| `Write` | Create new files |
| `Edit` | Make precise, surgical edits |
| `Bash` | Run terminal commands, scripts, git |
| `Glob` | Find files by pattern (`**/*.ts`) |
| `Grep` | Regex search across file contents |
| `WebSearch` | Live web search |
| `WebFetch` | Fetch and parse web pages |
| `AskUserQuestion` | Ask for clarification with multiple choice |
| `Task` | Invoke a subagent |

This is the same toolset powering Claude Code. Battle-tested, production-hardened.

### Hooks — The Control Plane

Hooks let you intercept and modify agent behavior at key lifecycle points:

```python
from datetime import datetime
from claude_agent_sdk import query, ClaudeAgentOptions, HookMatcher

async def audit_file_changes(input_data, tool_use_id, context):
    file_path = input_data.get("tool_input", {}).get("file_path", "unknown")
    with open("./audit.log", "a") as f:
        f.write(f"{datetime.now()}: modified {file_path}\n")
    return {}

async def block_dangerous_commands(input_data, tool_use_id, context):
    cmd = input_data.get("tool_input", {}).get("command", "")
    if "rm -rf" in cmd or "DROP TABLE" in cmd:
        return {"decision": "block", "reason": "dangerous command detected"}
    return {}

async for message in query(
    prompt="Refactor the auth module",
    options=ClaudeAgentOptions(
        permission_mode="acceptEdits",
        hooks={
            "PostToolUse": [HookMatcher(matcher="Edit|Write", hooks=[audit_file_changes])],
            "PreToolUse": [HookMatcher(matcher="Bash", hooks=[block_dangerous_commands])],
        }
    )
):
    ...
```

Available hooks: `PreToolUse`, `PostToolUse`, `Stop`, `SessionStart`, `SessionEnd`, `UserPromptSubmit`. This is where you enforce safety policies, log for compliance, or inject dynamic context.

### Subagents — The Big One

This is where the Claude Agent SDK gets serious. You can define named subagents with specialized prompts and tool restrictions, and Claude orchestrates delegation automatically:

```python
from claude_agent_sdk import query, ClaudeAgentOptions, AgentDefinition

async for message in query(
    prompt="Review the auth module for security issues and test coverage",
    options=ClaudeAgentOptions(
        # Task tool is required — it's how Claude invokes subagents
        allowed_tools=["Read", "Grep", "Glob", "Bash", "Task"],
        agents={
            "security-reviewer": AgentDefinition(
                description="Expert in security vulnerabilities. Use for auth, crypto, injection risks.",
                prompt="""You are a security specialist. Review code for:
- SQL injection, XSS, CSRF
- Insecure crypto (MD5, SHA1 for passwords)
- Hardcoded secrets
- Auth bypass patterns
Be specific: file name, line number, severity.""",
                tools=["Read", "Grep", "Glob"],  # read-only — can't accidentally modify
                model="sonnet",
            ),
            "test-runner": AgentDefinition(
                description="Runs test suites and analyzes coverage. Use for test execution.",
                prompt="""You are a test specialist. Run tests, analyze output, report failures with context.""",
                tools=["Bash", "Read", "Grep"],
            ),
        }
    )
):
    ...
```

Claude reads the `description` fields and decides which subagent to delegate to. You can also request one explicitly: *"Use the security-reviewer agent to audit auth.py."*

Three ways to define subagents:
1. **Programmatic** (above) — recommended for SDK apps
2. **Filesystem** — markdown files in `.claude/agents/` (for Claude Code projects)
3. **Built-in** — a general-purpose subagent always available via the `Task` tool

### Permission Modes

```python
ClaudeAgentOptions(permission_mode="acceptEdits")  # auto-approve file writes
ClaudeAgentOptions(permission_mode="default")       # ask before each tool use
ClaudeAgentOptions(permission_mode="bypassPermissions")  # full auto (use with care)
```

For CI/CD pipelines, `acceptEdits` or `bypassPermissions` makes sense. For interactive sessions, `default` keeps you in the loop.

### Cloud Provider Support

The SDK supports multiple backends:

```bash
# Amazon Bedrock
CLAUDE_CODE_USE_BEDROCK=1

# Google Vertex AI
CLAUDE_CODE_USE_VERTEX=1

# Microsoft Azure AI Foundry
CLAUDE_CODE_USE_FOUNDRY=1
```

Enterprise teams already on AWS/GCP/Azure can use the SDK without hitting Anthropic's API directly. Data stays in your cloud.

### When to Use the Claude Agent SDK

- Your tasks are **code-centric** (read, edit, run, test)
- You want a **batteries-included** agent with no tool implementation overhead
- You need **fast iteration** (one `query()` call and you're running)
- You want **subagent delegation** without building your own orchestration layer
- You're all-in on Claude (not model-agnostic)
- You're building **CI/CD integrations**, code review bots, dev tooling

---

## Part 3: Using Them Together

Here's the move nobody talks about: **LangGraph for the workflow skeleton, Claude Agent SDK for the heavy lifting inside nodes**.

```python
from langgraph.graph import StateGraph, START, END
from claude_agent_sdk import query, ClaudeAgentOptions

class ReviewState(TypedDict):
    pr_url: str
    security_findings: list
    test_results: str
    approved: bool

async def security_audit_node(state: ReviewState) -> dict:
    findings = []
    async for msg in query(
        prompt=f"Security audit the changes in PR: {state['pr_url']}",
        options=ClaudeAgentOptions(
            allowed_tools=["Read", "Grep", "Glob", "WebFetch"],
        )
    ):
        if hasattr(msg, "result"):
            findings.append(msg.result)
    return {"security_findings": findings}

async def test_runner_node(state: ReviewState) -> dict:
    output = ""
    async for msg in query(
        prompt="Run the test suite and report coverage",
        options=ClaudeAgentOptions(
            allowed_tools=["Bash", "Read"],
            permission_mode="bypassPermissions"
        )
    ):
        if hasattr(msg, "result"):
            output = msg.result
    return {"test_results": output}

# LangGraph orchestrates, Claude Agent SDK executes
builder = StateGraph(ReviewState)
builder.add_node("security_audit", security_audit_node)
builder.add_node("test_runner", test_runner_node)
builder.add_node("human_review", human_review_node)  # interrupt here

# run security + tests in parallel, then human review
builder.add_edge(START, "security_audit")
builder.add_edge(START, "test_runner")
builder.add_edge("security_audit", "human_review")
builder.add_edge("test_runner", "human_review")
builder.add_edge("human_review", END)

pipeline = builder.compile(checkpointer=checkpointer)
```

LangGraph gives you: parallelism, checkpointing, human approval gates, conditional routing.
Claude Agent SDK gives you: autonomous code execution inside each node with zero boilerplate.

Lethal combination.

---

## Framework Decision Matrix

```
Do you need multi-LLM support?
├── Yes → LangGraph (model-agnostic)
└── No → Either works

Are tasks primarily code/file operations?
├── Yes → Claude Agent SDK (batteries included)
└── No → LangGraph (build your own tools)

Need durable execution / checkpointing?
├── Yes → LangGraph (first-class checkpoint support)
└── No → Either works

Need human-in-the-loop pauses?
├── Yes → LangGraph (interrupt() built in)
└── No → Either works

Need to ship in < 1 day?
├── Yes → Claude Agent SDK (one query() call and you're running)
└── No → LangGraph (invest in the graph)

Building a production workflow with complex branching?
└── LangGraph + Claude Agent SDK nodes

Building a dev tool / CI integration?
└── Claude Agent SDK, probably with subagents
```

---

## The Bleeding Edge

What to watch in 2026:

**LangGraph** is moving toward **LangSmith Deployments** as a managed cloud runtime for graphs — you define the graph, LangSmith runs and scales it. Less ops, same control.

**Claude Agent SDK** just rebranded from "Claude Code" to "Claude Agent" — signaling a push beyond dev tooling into general-purpose agentic workloads. The subagents API is where the velocity is: Anthropic is clearly betting on Claude as the orchestrator AND the executor.

**MCP (Model Context Protocol)** is the common substrate emerging under all of this. Both LangGraph nodes and Claude Agent SDK subagents can be MCP servers/clients. The agent ecosystem is converging on this protocol for tool and context sharing across frameworks.

**Agent-to-agent communication** is the next frontier. When your LangGraph supervisor needs to hand off to a Claude Agent SDK executor inside a tool call that's itself an MCP server — that's where we're headed. Protocols like [ACP (Agent Context Protocol)](https://github.com/mager/acp) are emerging to standardize the handoff envelopes.

---

## Quick Start Recipes

### Claude Agent SDK — Code Review Bot in 20 lines

```typescript
import { query } from "@anthropic-ai/claude-agent-sdk";
import { execSync } from "child_process";

const diff = execSync("git diff main HEAD").toString();

for await (const message of query({
  prompt: `Review this PR diff for bugs, security issues, and style problems:\n\n${diff}`,
  options: {
    allowedTools: ["Read", "Glob", "Grep"],
    systemPrompt: "You are a senior engineer. Be specific, be harsh, be helpful."
  }
})) {
  if ("result" in message) console.log(message.result);
}
```

### LangGraph — Research Agent with Human Approval

```python
from langgraph.graph import StateGraph, MessagesState, START, END
from langgraph.checkpoint.memory import MemorySaver
from langgraph.graph import interrupt

def research_node(state):
    # run your LLM + web search tools here
    ...

def approval_node(state):
    decision = interrupt({"findings": state["findings"]})
    return {"approved": decision}

def publish_node(state):
    if state["approved"]:
        # push to CMS, Slack, wherever
        ...

graph = StateGraph(State)
graph.add_node("research", research_node)
graph.add_node("approve", approval_node)
graph.add_node("publish", publish_node)
graph.add_edge(START, "research")
graph.add_edge("research", "approve")
graph.add_conditional_edges("approve", 
    lambda s: "publish" if s["approved"] else END)

app = graph.compile(checkpointer=MemorySaver())
```

---

## TL;DR

- **LangGraph** = control plane for complex agentic workflows. Graph-based, durable, model-agnostic. Reach for it when you need to orchestrate across multiple agents, require human-in-the-loop, or need production-grade resilience.

- **Claude Agent SDK** (formerly Claude Code SDK — just renamed) = execution engine for file/code/shell tasks. One function call. Rich built-in toolset. Subagents out of the box. Reach for it when you're building dev tooling or want a Claude-powered autonomous worker.

- **Use both** when you want LangGraph's orchestration guarantees + Claude's execution power inside each node.

The multi-agent era demands frameworks, not just models. Learn the graph.

---

*For more on the emerging agent communication standards powering systems like this, check out the [ACP (Agent Context Protocol)](https://github.com/mager/acp) — a lightweight SDK for agent-to-agent context passing.*
