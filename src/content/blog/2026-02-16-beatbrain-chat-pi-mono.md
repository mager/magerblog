---
title: "Building a Music Agent CLI with pi-mono"
pubDate: "2026-02-16"
updatedDate: "2026-02-16"
description: "How I used the pi-mono toolkit — the same engine behind OpenClaw — to build a free, terminal-based music friend that reads the beatbrain discover feed and recommends what to listen to."
category: "code"
tags: ["AI", "Agents", "pi-mono", "Music", "beatbrain", "CLI", "Temporal"]
keyword: "pi-mono agent CLI"
heroImage: "https://lh3.googleusercontent.com/pw/AP1GczPNjQCVyiuLMmCswXaUqr4zeCqPe6-mOO4DyAJoca_M-y4Ntcj5mGv86MlEucwBGb7XXgRrmpSkqni8jvTl19pRpa6MgtRvjmvSJmOmDDlvsE-64xEmZzl3eBHjByucTsY2Fz27PmZ11DcL8MWaCA8z2A=w2322-h1522-s-no-gm"
---

I've been running [OpenClaw](https://github.com/openclaw/openclaw) for a few weeks now — using it to manage my projects, write code, and keep my digital life organized. The more I used it, the more curious I got about what's under the hood. Turns out, OpenClaw is built on top of [pi-mono](https://github.com/badlogic/pi-mono), an open-source AI agent toolkit by Mario Zechner.

pi-mono is a monorepo with a few key packages:

- **`@mariozechner/pi-ai`** — A unified LLM API that works across Anthropic, OpenAI, Google, and a dozen other providers
- **`@mariozechner/pi-agent-core`** — A stateful agent runtime with tool execution, event streaming, and conversation management
- **`@mariozechner/pi-coding-agent`** — The full interactive coding agent CLI (what you get when you `npm install -g @mariozechner/pi-coding-agent` and run `pi`)

OpenClaw uses these packages as its embedded agent runtime — importing `createAgentSession` from pi-coding-agent, wiring up custom tools for messaging and browser control, and managing sessions across channels like Telegram, Discord, and WhatsApp.

But I wanted to go simpler. What would it look like to build a tiny, focused agent CLI from scratch using just `pi-ai` and `pi-agent-core`? And could I make it completely free to run?

## The Idea: A Music Friend in Your Terminal

I run [beatbrain](https://beatbrain.xyz), a music discovery app that aggregates trending tracks from Spotify New Releases, Reddit's [FRESH] tag, Billboard, Pitchfork Best New Music, and HotNewHipHop. The backend scores and ranks these tracks using a weighted algorithm.

What if I could just _talk_ to that data? Not browse a grid of album covers, but have a conversation:

> "What's hot right now?"
>
> "I'm in the mood for something indie — anything good this week?"
>
> "Tell me about that new Tyler, The Creator track."

That's **Temporal** — a music-obsessed AI agent that reads the live beatbrain discover feed and actually has opinions. (Named after the temporal lobe — the part of your brain that processes sound and music.)

## The Stack

The project is a few hundred lines of TypeScript:

- **`@mariozechner/pi-agent-core`** — The `Agent` class handles the conversation loop, tool execution, and state management
- **`@mariozechner/pi-ai`** — `getModel()` gives us a typed model handle for any provider
- **Five custom tools** — The agent's context brain: discover feed, Spotify search, deep track analysis, artist/creator profiles, and genre exploration
- **GPT-OSS 120B on Groq** — OpenAI's open-weight MoE model (Apache 2.0) running at 500 tokens/sec on [Groq](https://console.groq.com), with native tool use and configurable reasoning effort (also works with Llama, Google Gemini, Anthropic — just swap a flag)

That's it. No framework. No wrapper. Just the agent runtime and its context brain.

## Building It

### 1. The Agent

Setting up the agent is minimal:

```typescript
import { Agent } from "@mariozechner/pi-agent-core";
import { getModel } from "@mariozechner/pi-ai";

const model = getModel("groq", "openai/gpt-oss-120b");

const agent = new Agent({
  initialState: {
    systemPrompt: SYSTEM_PROMPT,
    model,
    tools: [discoverTool, searchTool, creatorTool, trackTool, genreTool],
  },
});
```

The `Agent` class manages the full conversation loop — you call `agent.prompt("what's hot?")` and it handles the LLM call, tool execution, and streaming. If the model decides to call the `beatbrain_discover` tool, pi-agent-core executes it and feeds the result back to the LLM automatically.

I'm running **GPT-OSS 120B** on [Groq](https://groq.com) — OpenAI's first open-weight language model since GPT-2, and it's a beast. It's a Mixture-of-Experts architecture (120B total parameters, 5.1B active per forward pass across 128 experts), released under Apache 2.0. On Groq's inference engine it runs at 500 tokens/sec with native tool use support and configurable reasoning effort (low/medium/high). It matches or surpasses OpenAI o4-mini on core reasoning benchmarks while fitting on a single 80GB GPU. Since `pi-ai` abstracts the provider, you can swap to Llama 4, Google Gemini, Anthropic, or any other supported model with a single flag.

### The Context Brain

The real power isn't the LLM — it's the context brain. That's the system prompt plus the tools that give the model access to real, live data. beatbrain Chat has five tools:

1. **`beatbrain_discover`** — The ranked trending feed from all five sources
2. **`beatbrain_search`** — Spotify catalog search with popularity scores
3. **`beatbrain_creator`** — Deep artist profiles: genres, origin, credits, top tracks, external links (powered by MusicBrainz + Spotify)
4. **`beatbrain_track`** — Full track analysis: who played what instruments, who produced it, songwriting credits, musical key, BPM, danceability, energy, and more
5. **`beatbrain_genre`** — Genre-based exploration: find popular tracks in any genre

The agent can chain these together — search for an artist, pull their creator profile, then deep-dive into their top track to see who played bass. The system prompt coaches the model on _when_ to use each tool and how to present the data conversationally. The context brain is what makes it feel like talking to a friend who genuinely knows music, not a search engine.

### 2. The Tool

A tool in pi-agent-core is an object with a name, description, TypeBox schema for parameters, and an `execute` function:

```typescript
import { Type } from "@sinclair/typebox";

export const discoverTool: AgentTool = {
  name: "beatbrain_discover",
  description: "Fetch the latest music discoveries from beatbrain...",
  parameters: Type.Object({
    limit: Type.Optional(Type.Number({ description: "Max tracks to return" })),
  }),
  execute: async (_toolCallId, params, _signal, _onUpdate) => {
    const res = await fetch("https://occipital-cqaymsy2sa-uc.a.run.app/discover/v2");
    const data = await res.json();
    const tracks = data.tracks.slice(0, params.limit ?? 20);

    return {
      content: [{ type: "text", text: formatTracks(tracks, data.updated) }],
      details: { trackCount: tracks.length },
    };
  },
};
```

The beatbrain API returns scored tracks from five sources. The agent gets this data and uses it to have an informed conversation about music.

### 3. Streaming

pi-agent-core has a clean event system. Subscribe to get real-time output:

```typescript
agent.subscribe((event) => {
  if (event.type === "message_update" && event.assistantMessageEvent?.type === "text_delta") {
    process.stdout.write(event.assistantMessageEvent.delta);
  }
  if (event.type === "tool_execution_start") {
    console.log(`\n🔧 Using ${event.toolName}...`);
  }
});
```

Text streams token-by-token. Tool calls show a spinner. Multi-turn conversations just work because the agent maintains state.

## Why Build Your Own?

If OpenClaw already does all this (and more), why drop down to the raw SDK?

**Domain focus.** OpenClaw is a general-purpose agent with dozens of tools — messaging, browser control, cron, sessions, memory. Temporal has a focused context brain: five tools and a system prompt tuned for music conversations. There's no overhead.

**Learning the internals.** Using a framework is different from understanding it. Building with `pi-agent-core` directly teaches you how the agent loop works — how tools get called, how context accumulates, how streaming events flow. When you go back to OpenClaw (or build something bigger), you know what's happening under the hood.

**Custom CLI experiences.** Not everything needs to be a full agent platform. Sometimes you want a focused tool that does one thing well. Temporal could live in a cron job that sends you a daily music digest, or plug into a Discord bot, or power a Raycast extension.

**It's remarkably simple.** pi-mono's API surface is clean. `getModel`, `new Agent`, `agent.prompt`. That's the core loop.

![Temporal in action](https://lh3.googleusercontent.com/pw/AP1GczPNjQCVyiuLMmCswXaUqr4zeCqPe6-mOO4DyAJoca_M-y4Ntcj5mGv86MlEucwBGb7XXgRrmpSkqni8jvTl19pRpa6MgtRvjmvSJmOmDDlvsE-64xEmZzl3eBHjByucTsY2Fz27PmZ11DcL8MWaCA8z2A=w2322-h1522-s-no-gm)

## Running It

Get a free API key at [console.groq.com](https://console.groq.com), then:

```bash
git clone https://github.com/mager/temporal.git
cd temporal
npm install && npm run build

export GROQ_API_KEY=gsk_...
npm start
```

```
🎵 Temporal
Your music-obsessed friend. Ask me anything about music.
groq/openai/gpt-oss-120b

you: what should I listen to today?
📡 Checking the feed...
temporal: Here's what's trending today! A few standouts...
```

Want to use a different provider? Just swap the flags:

```bash
temporal -p google -m gemini-2.0-flash
temporal -p anthropic -m claude-sonnet-4-20250514
```

## What's Next

Some ideas for iteration:

- **Spotify integration** — Let the agent queue tracks directly to your Spotify
- **Taste profiling** — Track what you like/skip and personalize recommendations
- **"Sounds like" chains** — Given a track, find similar ones by audio features and genre overlap
- **Voice mode** — Pipe to a TTS engine for a spoken music companion

The repo is at [github.com/mager/temporal](https://github.com/mager/temporal). It's intentionally minimal — a starting point, not a finished product.

If you're using OpenClaw or pi and want to build something domain-specific, the SDK makes it surprisingly easy. Start with `pi-agent-core`, add a tool, and see where the conversation takes you.
