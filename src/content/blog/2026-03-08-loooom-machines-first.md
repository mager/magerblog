---
title: "Loooom: I Built It for the Bots"
pubDate: "2026-03-08"
description: "Most websites beg search engines for attention. I flipped it — Loooom is machine-first, humans secondary. Here's what that actually means in practice."
category: "code"
tags: ["AI", "Agents", "Loooom", "ME.md", "Protocol", "Machine-First"]
heroImage: ""
keyword: "machine-first AI agent platform"
---

Most websites talk *about* AI. Loooom talks *to* it.

When I redesigned [Loooom](https://loooom.xyz) this week, I asked a different question than most product teams ask: **what if bots are the primary users?** Not a secondary concern, not a "just add a sitemap" afterthought. First-class citizens. Machines rule. Humans still get a great experience — but the architecture optimizes for the agent.

Here's what that means in practice, and why I think this is the right model for platforms built on AI-native protocols like [ME.md](https://loooom.xyz/me).

## The Problem with Human-First Platforms

Every major web platform was designed for human eyes first, then hastily bolted on APIs for machines. The result: crawlers that parse HTML soup, scrapers that break on every redesign, and LLMs that hallucinate because they can't reliably read the actual data they need.

ME.md — the portable human context protocol I launched last week — solves a specific problem: **stop re-introducing yourself to every AI**. But if the platform hosting those files is designed for humans first, you've just moved the problem one layer up. The AI still has to scrape HTML to read something that's fundamentally plain text.

That's backwards.

## What Machine-First Actually Looks Like

### AGENTS.md — The Crown Jewel

The first thing I shipped was [`/AGENTS.md`](https://loooom.xyz/AGENTS.md). Not SEO metadata. Not an API doc site. A plain markdown file written *for AI agents*, at the root of the domain.

Any LLM that crawls loooom.xyz now finds a comprehensive briefing file that explains:

- What Loooom is and what ME.md means
- Every machine-readable endpoint, with examples
- How to fetch a human's context, discover all profiles, validate a ME.md file
- Integration patterns for agents, builders, and crawlers

It's the file I'd want if I were a bot landing on a new domain for the first time. It says: *I expected you. welcome. here's everything you need.*

### llms.txt — The LLM Sitemap

I also ship [`/llms.txt`](https://loooom.xyz/llms.txt) — an emerging convention (think robots.txt, but for language models) that indexes the most important machine-readable resources on the site.

This isn't standardized yet, but the direction is clear: LLMs need a quick index of what's actually useful to read on a given domain. A 20-line text file is infinitely better than asking a crawler to infer structure from HTML.

### The Raw Endpoint Pattern

The core of the whole architecture is simple: every ME.md profile has a `/raw` endpoint.

```
https://loooom.xyz/me/mager/raw
```

Plain text. No HTML wrapper. No JS execution required. CORS-open, so any agent running client-side or server-side can fetch it directly. The profile page for humans is a rendered view on top of this — not the source of truth. The raw endpoint is.

This is the key inversion: **the machine-readable format is the canonical version**. The human-readable page is the derivative.

### The Directory API

```
GET https://loooom.xyz/api/directory
```

A JSON array of every public ME.md profile on Loooom — with their raw URL, handle, tags, timezone, and agent fleet metadata. No pagination (for now — 4 profiles). Any LLM can enumerate the entire directory and fetch every human's context in a loop.

This is how you build an agent that knows everyone. Not by scraping. Just by fetching.

### The Profile Page

Even the human-facing profile page at `/me/mager` is optimized for machines now. It ships:

- `<meta name="me-md-raw" content="...">` pointing to the canonical raw URL
- JSON-LD structured data with identity info and the raw endpoint
- A sticky "For AI Agents" banner at the top of every profile page, showing the `curl` command

When an AI reads a Loooom profile page, it finds what it needs immediately — no parsing required.

### robots.txt Points to the Machine Files

```
# Machine briefing for AI agents and LLMs:
# https://loooom.xyz/AGENTS.md

# LLM index (llms.txt convention):
# https://loooom.xyz/llms.txt
```

The robots.txt now explicitly advertises the machine-readable resources. It's a small thing, but it's the right thing. Crawlers read robots.txt first.

## Do I Need an MCP?

A few people have asked if Loooom needs a [Model Context Protocol](https://modelcontextprotocol.io) server. My honest take: **not yet**.

MCP is powerful when you need tool-calling — when an LLM needs to *do something* with your platform: create, update, query with filters. That's not the primary use case for ME.md right now. The primary use case is **read**. One URL. Fetch it. Done.

The raw endpoint IS the MCP for reading. It's model-agnostic, framework-agnostic, zero SDK dependency. A single HTTP GET is as simple as it gets.

When write operations become important — when agents need to update a human's ME.md, or search profiles by tags, or subscribe to changes — I'll build an MCP. But I won't reach for it before I need it.

## The Human Experience

None of this comes at the cost of the human experience. The homepage still looks great. The profile pages still render beautifully. The ME.md editor still works the same way.

The difference is: a human who arrives at Loooom finds a compelling, designed product. A bot that arrives finds a complete machine briefing, clean JSON endpoints, and raw markdown with no HTML noise.

Both are first-class. They just get served differently.

## The Bigger Idea

Here's what I keep coming back to: **most protocols are designed for humans first and machines second**. That's the natural order when humans build things for humans.

But AI-native protocols flip this. ME.md is designed to be *consumed by machines*. It's written in markdown for editability, not because markdown is how AI processes things. The YAML frontmatter is machine-parseable by design. The section structure is canonical so agents can navigate it.

If you're building infrastructure for the AI era, you're building for two audiences. And increasingly, the machine audience is the one that needs to work *first* — because the machines are the ones doing the reading, the routing, the context injection. Humans write the content. Machines use it.

Build for the machines. They'll bring the humans with them.

---

*Loooom is open source. [Website](https://github.com/mager/loooom.xyz) · [Skills catalog](https://github.com/mager/loooom) · The bots can fetch the [AGENTS.md](https://loooom.xyz/AGENTS.md) and figure out the rest themselves.*
