---
title: "Loooom MCP: Let Any AI Discover and Install Skills Mid-Conversation"
description: "I built an MCP server for Loooom so AI agents can search, explore, and install Claude Code skills without ever leaving their context."
pubDate: 2026-03-14
category: "code"
keyword: "loooom MCP"
draft: false
tags: ["mcp", "claude", "ai", "loooom", "tools", "skills", "model-context-protocol"]
---

Here's something that bugged me: I built [Loooom](https://loooom.xyz) as a marketplace for Claude Code skills — a place where real people publish reusable AI plugins you can install in seconds. But to actually *find* a skill, you had to leave your Claude session, visit the site, search around, copy a command, then come back. That's a lot of context-switching for what should be a two-second thing.

So I fixed it. I built [`@mager/loooom-mcp`](https://github.com/mager/loooom-mcp) — an MCP server that lets any AI agent browse and install Loooom skills without ever leaving the conversation.

---

## What Loooom Is (Quick Version)

[Loooom](https://loooom.xyz) is a skill marketplace for Claude Code. Skills are essentially plugins — small, focused capabilities you can add to Claude's context. Things like a Japanese language tutor, a git workflow helper, a code review assistant. They're built by humans, free to use, and the whole [catalog is on GitHub](https://github.com/mager/loooom) so you can fork anything you want.

Think of it like npm, but for AI agent behaviors.

---

## What MCP Is (Even Quicker Version)

[Model Context Protocol](https://modelcontextprotocol.io) is Anthropic's open standard for giving AI agents access to external tools and data. Instead of hardcoding capabilities into a model, MCP lets you plug in servers that expose functions the AI can call — search an API, read a file, hit a database. It's how you extend what an agent can *do* without retraining anything.

---

## What `@mager/loooom-mcp` Does

The MCP server exposes five tools that map directly onto the Loooom catalog:

**`list_skills`** — Pull the full catalog. Every skill, every author. Good for browsing when you're not sure what you're looking for.

**`search_skills`** — Find skills by keyword or category. Pass in `"japanese"` or `"git"` and get back matching results with descriptions.

**`get_skill`** — Deep-dive on a specific skill. Returns the full metadata: what it does, who built it, how to configure it.

**`list_categories`** — See what buckets exist in the catalog. Useful when you want to explore a domain without a specific query in mind.

**`get_install_command`** — This is the one that closes the loop. Give it a skill name and it hands back the exact Claude Code install command. No copy-paste from a website. Just run it.

Together these five tools turn Loooom from a website you visit into a capability your AI agent *has*.

---

## How to Install

Two ways, depending on your setup.

### Claude Desktop

Add this to your `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "loooom": {
      "command": "npx",
      "args": ["-y", "@mager/loooom-mcp"]
    }
  }
}
```

Restart Claude Desktop and the tools are live.

### npx (Quick Test)

If you just want to try it:

```bash
npx @mager/loooom-mcp
```

That'll spin up the MCP server locally. Point any MCP-compatible client at it and you're good.

---

## A Real Example

Here's what this actually looks like in practice.

You're mid-conversation with Claude, working on something, and you remember you wanted a skill for learning Japanese vocabulary. Old flow: stop what you're doing, go to loooom.xyz, search, find it, copy the install command, come back.

New flow — you just ask:

> "Hey Claude, find me a skill for learning Japanese."

Claude calls `search_skills` with `"japanese"`. Gets back a result: `beginner-japanese` — a skill that drills vocab and grammar in conversation. Claude surfaces the description, the author, what it does.

You say: "Nice, how do I install that?"

Claude calls `get_install_command` for `beginner-japanese`. Hands you back:

```bash
claude mcp add beginner-japanese
```

You run it. Done. Back to what you were doing, but now Claude knows how to teach you Japanese.

That's the whole thing. No tab-switching, no breaking flow. The AI found the tool, the AI told you how to install it, you were never more than a command away.

---

## What's Next

A few things I'm working on:

- **Publishing to npm** — right now you're running it off GitHub. Getting it properly published so the npx install path is clean and fast.
- **More skills in the catalog** — the MCP server is only as useful as the skills it can find. I'm adding more, and the [catalog is open](https://github.com/mager/loooom) if you want to contribute one.
- **Richer metadata** — better filtering, tags, ratings. Make search smarter.

The broader idea here is interesting to me: agents should be able to discover and extend their own capabilities dynamically. Today that's "here are five tools to browse a skill catalog." But the direction is toward agents that can identify gaps in what they can do and go find solutions themselves. This is a small step in that direction.

---

If you want to dig in, the code is at [github.com/mager/loooom-mcp](https://github.com/mager/loooom-mcp) and the skill catalog is at [github.com/mager/loooom](https://github.com/mager/loooom). Issues and PRs welcome. And if you build a skill worth adding to Loooom, let me know.
