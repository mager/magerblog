---
title: "Building a Music Agent CLI with pi-mono"
pubDate: "2026-02-14"
description: "How I used the pi-mono toolkit — the same engine behind OpenClaw — to build a free, terminal-based music friend that reads the BeatBrain discover feed and recommends what to listen to."
category: "code"
tags: ["AI", "Agents", "pi-mono", "Music", "BeatBrain", "CLI"]
keyword: "pi-mono agent CLI"
heroImage: ""
---

I've been running [OpenClaw](https://github.com/openclaw/openclaw) for a few weeks now — using it to manage my projects, write code, and keep my digital life organized. The more I used it, the more curious I got about what's under the hood. Turns out, OpenClaw is built on top of [pi-mono](https://github.com/badlogic/pi-mono), an open-source AI agent toolkit by Mario Zechner.

pi-mono is a monorepo with a few key packages:

- **`@mariozechner/pi-ai`** — A unified LLM API that works across Anthropic, OpenAI, Google, and a dozen other providers
- **`@mariozechner/pi-agent-core`** — A stateful agent runtime with tool execution, event streaming, and conversation management
- **`@mariozechner/pi-coding-agent`** — The full interactive coding agent CLI (what you get when you `npm install -g @mariozechner/pi-coding-agent` and run `pi`)

OpenClaw uses these packages as its embedded agent runtime — importing `createAgentSession` from pi-coding-agent, wiring up custom tools for messaging and browser control, and managing sessions across channels like Telegram, Discord, and WhatsApp.

But I wanted to go simpler. What would it look like to build a tiny, focused agent CLI from scratch using just `pi-ai` and `pi-agent-core`? And could I make it completely free to run?

## The Idea: A Music Friend in Your Terminal

I run [BeatBrain](https://beatbrain.xyz), a music discovery app that aggregates trending tracks from Spotify New Releases, Reddit's [FRESH] tag, Billboard, Pitchfork Best New Music, and HotNewHipHop. The backend scores and ranks these tracks using a weighted algorithm.

What if I could just _talk_ to that data? Not browse a grid of album covers, but have a conversation:

> "What's hot right now?"
>
> "I'm in the mood for something indie — anything good this week?"
>
> "Tell me about that new Tyler, The Creator track."

That's **BeatBrain Chat** — a music-obsessed AI friend that reads the live BeatBrain discover feed and actually has opinions.

## The Stack

The project is a few hundred lines of TypeScript:

- **`@mariozechner/pi-agent-core`** — The `Agent` class handles the conversation loop, tool execution, and state management
- **`@mariozechner/pi-ai`** — `getModel()` gives us a typed model handle for any provider
- **Five custom tools** — The agent's context brain: discover feed, Spotify search, deep track analysis, artist/creator profiles, and genre exploration
- **Groq + Llama 3.3 70B** — Free inference via [Groq](https://console.groq.com), no paid API keys required

That's it. No framework. No wrapper. Just the agent runtime and its context brain.

## Building It

### 1. The Agent

Setting up the agent is minimal:

```typescript
import { Agent } from "@mariozechner/pi-agent-core";
import { getModel } from "@mariozechner/pi-ai";

const model = getModel("groq", "llama-3.3-70b-versatile");

const agent = new Agent({
  initialState: {
    systemPrompt: SYSTEM_PROMPT,
    model,
    tools: [discoverTool, searchTool],
  },
});
```

The `Agent` class manages the full conversation loop — you call `agent.prompt("what's hot?")` and it handles the LLM call, tool execution, and streaming. If the model decides to call the `beatbrain_discover` tool, pi-agent-core executes it and feeds the result back to the LLM automatically.

I'm using [Groq](https://groq.com) as the inference provider — their free tier runs Llama 3.3 70B with absurdly fast inference. Since `pi-ai` abstracts the provider, switching between Groq, Anthropic, or OpenAI is a one-line change. But for a project I want anyone to be able to run without a credit card, free matters.

### The Context Brain

The real power isn't the LLM — it's the context brain. That's the system prompt plus the tools that give the model access to real, live data. BeatBrain Chat has five tools:

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
  description: "Fetch the latest music discoveries from BeatBrain...",
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

The BeatBrain API returns scored tracks from five sources. The agent gets this data and uses it to have an informed conversation about music.

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

**Domain focus.** OpenClaw is a general-purpose agent with dozens of tools — messaging, browser control, cron, sessions, memory. BeatBrain Chat has a focused context brain: five tools and a system prompt tuned for music conversations. There's no overhead.

**Learning the internals.** Using a framework is different from understanding it. Building with `pi-agent-core` directly teaches you how the agent loop works — how tools get called, how context accumulates, how streaming events flow. When you go back to OpenClaw (or build something bigger), you know what's happening under the hood.

**Custom CLI experiences.** Not everything needs to be a full agent platform. Sometimes you want a focused tool that does one thing well. BeatBrain Chat could live in a cron job that sends you a daily music digest, or plug into a Discord bot, or power a Raycast extension.

**Zero cost to run.** By defaulting to Groq's free tier, anyone can clone the repo, grab a key in 30 seconds, and start chatting. No credit card, no usage fees. That was important to me — open source should be runnable, not just readable.

**It's remarkably simple.** pi-mono's API surface is clean. `getModel`, `new Agent`, `agent.prompt`. That's the core loop.

## Running It

Get a free API key at [console.groq.com](https://console.groq.com), then:

```bash
git clone https://github.com/mager/beatbrain-chat.git
cd beatbrain-chat
npm install && npm run build

export GROQ_API_KEY=gsk_...
npm start
```

```
🎵 BeatBrain Chat
Your music-obsessed friend. Ask me anything about music.
groq/llama-3.3-70b-versatile

you: what should I listen to today?
📡 Checking the feed...
beatbrain: Here's what's trending today! A few standouts...
```

Want to use a different provider? Just swap the flags:

```bash
beatbrain-chat -p anthropic -m claude-sonnet-4-20250514
beatbrain-chat -p openai -m gpt-4o
```

## What's Next

Some ideas for iteration:

- **Spotify integration** — Let the agent queue tracks directly to your Spotify
- **Taste profiling** — Track what you like/skip and personalize recommendations
- **"Sounds like" chains** — Given a track, find similar ones by audio features and genre overlap
- **Voice mode** — Pipe to a TTS engine for a spoken music companion

The repo is at [github.com/mager/beatbrain-chat](https://github.com/mager/beatbrain-chat). It's intentionally minimal — a starting point, not a finished product.

If you're using OpenClaw or pi and want to build something domain-specific, the SDK makes it surprisingly easy. Start with `pi-agent-core`, add a tool, and see where the conversation takes you.
