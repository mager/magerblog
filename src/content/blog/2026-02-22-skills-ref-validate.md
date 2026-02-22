---
title: "skills-ref: The Official Way to Validate Your Claude Code Plugins"
description: "Anthropic quietly shipped a reference SDK for validating Agent Skills. Here's how to use it — and what we found when we ran it against all of our Loooom plugins."
pubDate: 2026-02-22
category: tech
draft: true
---

You built a Claude Code plugin. It works on your machine. But is it actually spec-compliant?

Anthropic ships an official reference library for validating Agent Skills — `skills-ref`. It's part of the [`agentskills/agentskills`](https://github.com/agentskills/agentskills) repo and it does three things: validates your `SKILL.md`, reads its properties, and generates the `<available_skills>` XML block that gets injected into an agent's system prompt.

We ran it against all six [Loooom](https://loooom.xyz) plugins. Every single one failed. Here's what we learned.

---

## What `skills-ref` Does

The `skills-ref` SDK is the reference implementation of the [Agent Skills spec](https://agentskills.io). It's the source of truth for what a valid skill looks like.

Three commands:

```bash
# Check if your skill is spec-compliant
skills-ref validate path/to/your-skill

# Read the parsed properties as JSON
skills-ref read-properties path/to/your-skill

# Generate the <available_skills> XML block for agent prompts
skills-ref to-prompt path/to/skill-a path/to/skill-b
```

## Install It

Requires Python 3.x. Use `uv` if you have it:

```bash
git clone https://github.com/agentskills/agentskills.git
cd agentskills/skills-ref

uv sync
source .venv/bin/activate

# or with plain pip:
python -m venv .venv
source .venv/bin/activate
pip install -e .
```

The `skills-ref` binary is now on your PATH inside the virtual env.

---

## What a Valid SKILL.md Looks Like

The spec requires YAML frontmatter at the top of your `SKILL.md`. Only these fields are allowed:

| Field | Required | Description |
|---|---|---|
| `name` | ✅ | kebab-case, must match directory name |
| `description` | ✅ | 1024 char max, shown in agent system prompt |
| `license` | ❌ | e.g. `MIT`, `Apache-2.0` |
| `compatibility` | ❌ | model or platform constraints |
| `allowed-tools` | ❌ | experimental — tool access hints |
| `metadata` | ❌ | key-value bag for anything else |

A minimal valid skill:

```markdown
---
name: my-skill
description: What this skill does and when to use it.
---

# My Skill

Instructions here...
```

---

## What We Found in Our Skills

We ran validation against all six [Loooom](https://loooom.xyz) plugins. Every one failed with:

```
Unexpected fields in frontmatter: author, version.
Only ['allowed-tools', 'compatibility', 'description', 'license', 'metadata', 'name'] are allowed.
```

We had been writing our frontmatter like this:

```yaml
---
name: beginner-japanese
description: Learn conversational Japanese for traveling in Japan.
author: mager        # ❌ not a spec field
version: 2.1.0       # ❌ not a spec field
---
```

The fix: move custom fields into the `metadata` block.

```yaml
---
name: beginner-japanese
description: Learn conversational Japanese for traveling in Japan.
metadata:
  author: mager
  version: 2.1.0
---
```

We also had name-directory mismatches — the spec requires the directory name to exactly match the `name` field. So a skill named `persuasive-writing` must live in a folder called `persuasive-writing/`, not `persuasive/`.

---

## The `to-prompt` Command

This one is underrated. The `to-prompt` command generates the exact XML that platforms like Claude Code and [OpenClaw](https://openclaw.ai) inject into an agent's system prompt to make skills discoverable:

```bash
skills-ref to-prompt plugins/beginner-japanese/skills/beginner-japanese
```

Output:

```xml
<available_skills>
<skill>
<name>
beginner-japanese
</name>
<description>
Learn conversational Japanese for traveling in Japan. Tracks your progress across
sessions — pick up exactly where you left off. Supports local file or mem0 cloud memory.
</description>
<location>
/path/to/beginner-japanese/SKILL.md
</location>
</skill>
</available_skills>
```

This is exactly how Claude knows which skills exist and when to load them. The `<location>` tells the agent where to read the full instructions.

---

## Adding Validation to CI

Drop this in a GitHub Action to gate every PR:

```yaml
# .github/workflows/validate-skills.yml
name: Validate Skills

on: [push, pull_request]

jobs:
  validate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: astral-sh/setup-uv@v3
      - name: Install skills-ref
        run: |
          cd agentskills/skills-ref  # or however you vendor it
          uv sync
      - name: Validate all skills
        run: |
          source .venv/bin/activate
          for skill_dir in plugins/*/skills/*/; do
            echo "Validating $skill_dir"
            skills-ref validate "$skill_dir"
          done
```

Every push now tells you whether your skills pass the Anthropic spec before they go live.

---

## Why This Matters for Loooom

[Loooom](https://loooom.xyz) is a marketplace for Claude Code plugins — skills that give your AI agent new capabilities. The whole value prop is that you install once and it works everywhere.

"Works everywhere" only holds if skills are spec-compliant. A skill that passes `skills-ref validate` is guaranteed to be loadable by any Agent Skills-compatible platform — Claude Code, OpenClaw, or anything else built on the spec.

We're adding `skills-ref validate` to the Loooom CI pipeline. Before a plugin ships, it passes validation. That's the bar.

---

## TL;DR

- `skills-ref` is Anthropic's official CLI for validating Agent Skills
- Only 6 frontmatter fields are allowed — `author` and `version` are not among them
- Move custom fields into `metadata: {}`
- Directory name must match the skill `name` exactly
- `skills-ref to-prompt` generates the XML that agents use to discover skills
- Add it to CI so bad skills never ship

Install it: `git clone https://github.com/agentskills/agentskills && cd agentskills/skills-ref && uv sync`

Browse validated Loooom plugins: [loooom.xyz](https://loooom.xyz)
