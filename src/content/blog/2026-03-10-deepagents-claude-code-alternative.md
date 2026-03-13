---
title: "DeepAgents: The Claude Code Alternative That Works With Any LLM"
pubDate: 2026-03-10
description: "LangChain just shipped DeepAgents — a batteries-included agent harness that brings Claude Code's magic to any model. Here's your 10-minute deep dive."
category: code
---

LangChain dropped [DeepAgents](https://github.com/langchain-ai/deepagents) last week, and it's already my favorite way to spin up a capable agent without wiring prompts together like it's 2024.

Think of it as **Claude Code's architecture, decoupled from Claude.** Planning, filesystem access, sub-agents, context management — all available as a pip-installable harness that works with any tool-calling LLM.

Here's everything you need to know.

---

## What You Get Out of the Box

```bash
pip install deepagents
```

That's it. You now have an agent that can:

- **Plan** — `write_todos` breaks down tasks and tracks progress
- **Work with files** — `read_file`, `write_file`, `edit_file`, `ls`, `glob`, `grep`
- **Run commands** — `execute` with sandboxing
- **Spawn sub-agents** — `task` delegates work with isolated context windows
- **Manage context** — Auto-summarization when conversations get long

The philosophy is simple: **trust the LLM, enforce boundaries at the tool level.** Don't expect the model to self-police — sandbox what it can touch.

---

## 30-Second Quickstart

```python
from deepagents import create_deep_agent

agent = create_deep_agent()
result = agent.invoke({
    "messages": [{"role": "user", "content": "Research LangGraph and write a summary"}]
})
```

The agent plans, reads files, and manages its own context. No prompt engineering required.

---

## Swap Models, Add Tools, Customize

DeepAgents is just a compiled LangGraph graph. Customize it like any other:

```python
from langchain.chat_models import init_chat_model

agent = create_deep_agent(
    model=init_chat_model("openai:gpt-4o"),
    tools=[my_custom_tool],
    system_prompt="You are a research assistant.",
)
```

MCP support? [langchain-mcp-adapters](https://github.com/langchain-ai/langchain-mcp-adapters) has you covered.

---

## The CLI (Optional but Nice)

```bash
curl -LsSf https://raw.githubusercontent.com/langchain-ai/deepagents/main/libs/cli/scripts/install.sh | bash
```

Gets you web search, remote sandboxes, persistent memory, and human-in-the-loop approval flows.

---

## When to Reach for It

| Use Case | DeepAgents | Claude Code |
|----------|-----------|-------------|
| Quick research task | ✅ | ✅ |
| Long-running workflow | ✅ | ✅ |
| Custom model (local/enterprise) | ✅ | ❌ |
| Built-in IDE integration | ❌ | ✅ |
| Need full control over prompts | ✅ | ⚠️ |

If you're building agents into *your* product, DeepAgents is the move. If you want the best terminal experience for *yourself*, Claude Code still wins.

---

## The Bottom Line

LangChain extracted the agent harness pattern from Claude Code and made it **model-agnostic, open-source, and production-ready.**

It's not trying to replace Claude Code. It's trying to give you Claude Code's *architecture* for your own agents.

And for that, it nails it.

---

**Next up:** Try swapping in a local model with Ollama and see how the same agent behaves with different brains. The results might surprise you.
