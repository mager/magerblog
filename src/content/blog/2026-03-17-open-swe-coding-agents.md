---
title: "Open SWE: Build Your Own Internal Coding Agent in 10 Minutes"
pubDate: 2026-03-17
draft: false
category: tech
keyword: OpenSWE from Langchain
tags: [ai, agents, langchain, coding-agents, open-source]
description: "LangChain just dropped Open SWE — an open-source framework for building internal coding agents like Stripe's Minions, Ramp's Inspect, and Coinbase's Cloudbot. Here's what it is, how it works, and how to customize it."
---

Today LangChain dropped [Open SWE](https://github.com/langchain-ai/open-swe) — an open-source framework that distills how elite engineering orgs (Stripe, Ramp, Coinbase) are building internal coding agents. This isn't a toy. These are production systems that spin up cloud sandboxes, read Linear issues, write code, and open PRs — all from a Slack mention.

Let me break it down and show you how to customize one.

---

## The Big Idea

Three of the best engineering orgs in the world all independently built internal coding agents. And they all converged on the same architecture:

- **Isolated cloud sandboxes** — every task gets its own Linux box, full permissions, zero blast radius to prod
- **Curated toolsets** — Stripe has ~500 tools, but they're *curated*, not accumulated
- **Slack-first invocation** — meet engineers where they already live
- **Rich context at startup** — read the Linear issue/Slack thread *before* the agent starts working
- **Subagent orchestration** — decompose complex work into child agents with isolated context

Open SWE packages all of that into an MIT-licensed, customizable framework built on [LangGraph](https://github.com/langchain-ai/langgraph) and [Deep Agents](https://github.com/langchain-ai/deepagents).

---

## 10-Minute Tour

### 1. The Core Agent

The heart of Open SWE is a single `create_deep_agent` call:

```python
from deepagents import create_deep_agent
from open_swe.tools import (
    http_request,
    fetch_url,
    commit_and_open_pr,
    linear_comment,
    slack_thread_reply,
)
from open_swe.middleware import (
    ToolErrorMiddleware,
    check_message_queue_before_model,
    open_pr_if_needed,
)

agent = create_deep_agent(
    model="anthropic:claude-opus-4-6",
    system_prompt=construct_system_prompt(repo_dir, agents_md_content),
    tools=[
        http_request,
        fetch_url,
        commit_and_open_pr,
        linear_comment,
        slack_thread_reply,
    ],
    backend=sandbox_backend,  # Modal, Daytona, Runloop, or LangSmith
    middleware=[
        ToolErrorMiddleware(),
        check_message_queue_before_model,
        open_pr_if_needed,
    ],
)
```

Deep Agents handles the plumbing: file-based memory to avoid context overflow, built-in `write_todos` for planning, and a `task` tool for spawning child agents. You focus on your org's specific tools and context.

### 2. Pick a Sandbox

Every task runs in an isolated cloud sandbox — clone the repo in, let the agent run, contain the blast radius. Open SWE supports four providers out of the box:

```python
# Modal
from open_swe.sandboxes.modal import ModalSandboxBackend
sandbox_backend = ModalSandboxBackend()

# Daytona
from open_swe.sandboxes.daytona import DaytonaSandboxBackend
sandbox_backend = DaytonaSandboxBackend()

# LangSmith (great for debugging — full traces)
from open_swe.sandboxes.langsmith import LangSmithSandboxBackend
sandbox_backend = LangSmithSandboxBackend()
```

Each conversation thread gets a **persistent sandbox** — follow-up messages reuse it. Sandboxes auto-recreate if they die. Multiple tasks run in parallel, each isolated.

### 3. Add Your Own Tools

This is where you make it yours. Need to hit your internal deployment API? Integrate with your monitoring stack? Add a tool:

```python
from langchain_core.tools import tool

@tool
def deploy_to_staging(branch: str, service: str) -> str:
    """Deploy a branch to the staging environment."""
    response = requests.post(
        "https://deploy.internal/api/staging",
        json={"branch": branch, "service": service},
        headers={"Authorization": f"Bearer {DEPLOY_TOKEN}"},
    )
    return f"Deployed {branch} to staging: {response.json()['url']}"

@tool
def run_integration_tests(service: str) -> str:
    """Run integration tests for a service and return results."""
    result = subprocess.run(
        ["pytest", f"tests/integration/{service}/", "-v", "--tb=short"],
        capture_output=True, text=True, cwd=REPO_DIR
    )
    return result.stdout + result.stderr

# Add to your agent
agent = create_deep_agent(
    ...
    tools=[
        *default_tools,
        deploy_to_staging,
        run_integration_tests,
    ],
)
```

Stripe's lesson: curate intentionally. More tools = more surface area for hallucinations and errors. Start small, add only what you need.

### 4. The AGENTS.md Pattern

Drop an `AGENTS.md` at your repo root. Open SWE reads it from the sandbox and injects it into every agent run — this is your repo-level rulebook:

```markdown
# AGENTS.md

## Architecture
- This is a SvelteKit 5 app. Use runes ($state, $derived, $effect), not stores.
- Database queries go through src/lib/db.ts — never import drizzle directly in components.
- Always run `npm run typecheck` before committing.

## Testing
- Unit tests live in src/__tests__/. Use vitest.
- Run `npm test` before every PR. Zero tolerance for test failures.
- Integration tests in tests/integration/ require a running Neon branch.

## Conventions
- Components are PascalCase. Files are kebab-case.
- Prefer +page.server.ts for data loading. Use +page.ts only for client-side fetches.
- Commit format: feat(scope):, fix(scope):, chore(scope):
```

No extra config needed — just a file at the root of your repo. Every agent run respects your conventions automatically.

### 5. Middleware for Reliability

The middleware system is how Open SWE handles the "what if the LLM forgets to open a PR" problem — deterministic safety nets around the agentic loop:

```python
from deepagents.middleware import Middleware
from open_swe.github import commit_and_push

class RequireTestsBeforePR(Middleware):
    """Ensure tests pass before the agent can open a PR."""
    
    async def after_tool_call(self, tool_name: str, result: str, context):
        if tool_name == "commit_and_open_pr":
            # Intercept PR creation — run tests first
            test_result = await context.sandbox.run("npm test")
            if test_result.exit_code != 0:
                raise ToolError(
                    f"Tests failed. Fix before opening PR:\n{test_result.stdout}"
                )
        return result

# open_pr_if_needed is a built-in safety net:
# if the agent finishes without opening a PR, middleware does it automatically
agent = create_deep_agent(
    ...
    middleware=[
        ToolErrorMiddleware(),
        RequireTestsBeforePR(),       # your custom gate
        check_message_queue_before_model,
        open_pr_if_needed,            # built-in backstop
    ],
)
```

The separation matters: agentic (model-driven) + deterministic (middleware-driven). The model handles the creative work; middleware handles the critical steps that *must* happen.

---

## How Invocation Works

Trigger it from where you already work:

**Slack:**
```
@openswe repo:myorg/myapp fix the race condition in the payment processor
```

**Linear:**
```
@openswe please implement this
```
→ Agent reads the full issue, reacts 👀, writes code, opens a PR, comments with the link.

**GitHub PR:**
```
@openswe address the review feedback on lines 45-67
```
→ Agent pushes fixes to the same branch.

Each invocation creates a deterministic thread ID — follow-up messages route to the same running agent.

---

## How It Compares

| | Open SWE | Stripe Minions | Ramp Inspect | Coinbase Cloudbot |
|---|---|---|---|---|
| **Harness** | Deep Agents/LangGraph | Forked (Goose) | Composed (OpenCode) | Built from scratch |
| **Sandbox** | Modal, Daytona, Runloop | AWS EC2 devboxes | Modal containers | In-house |
| **Tools** | ~15, curated | ~500, curated | OpenCode SDK | MCPs + Skills |
| **Invocation** | Slack, Linear, GitHub | Slack + buttons | Slack + web + Chrome | Slack-native |
| **Validation** | Prompt + PR safety net | 3-layer + retry | Visual DOM verification | Agent councils |

The core patterns are identical. The differences are org-specific integrations — exactly what you'd customize Open SWE for.

---

## Why This Matters

A year ago, building a coding agent that could actually ship production code required significant infrastructure work. Now the patterns are proven, the open-source tooling exists, and the entry cost is a weekend project.

The AGENTS.md pattern is particularly underrated — it's the simplest form of "context engineering." Drop a file in your repo, encode your conventions, and every agent run automatically respects them. No extra config, no special integration.

I'm going to wire this up to my own projects. The idea of mentioning @openswe on a Linear issue and getting a draft PR back is exactly the workflow I want.

---

## Get Started

```bash
git clone https://github.com/langchain-ai/open-swe
cd open-swe
# Follow INSTALLATION.md — GitHub App, sandbox provider, Slack/Linear setup
```

- [GitHub](https://github.com/langchain-ai/open-swe)
- [Installation Guide](https://github.com/langchain-ai/open-swe/blob/main/INSTALLATION.md)
- [Customization Guide](https://github.com/langchain-ai/open-swe/blob/main/CUSTOMIZATION.md)
- [Deep Agents docs](https://docs.langchain.com/oss/python/deepagents)
