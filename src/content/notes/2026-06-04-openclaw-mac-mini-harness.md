---
title: "Setting up an always-on AI assistant on a Mac mini"
pubDate: "2026-06-04"
tags: ["ai", "openclaw", "tailscale", "mac"]
category: tech
draft: true
---

Hi Dad. This is a walkthrough for building your own AI assistant that lives on
the Mac mini and answers you from your phone, anywhere you are. It's the
open-source cousin of the setup I run in Chicago: an assistant that's always on,
that you can text like a person, and that you fully own. We'll use **OpenClaw**
(the assistant), **Google Gemini** (its brain, free to start), and **Tailscale**
(a private tunnel so your phone can reach the Mac mini safely). Take it one step
at a time — there's no rush, and you can stop and call me whenever.

### 1. Install Node

OpenClaw runs on Node. Go to [nodejs.org](https://nodejs.org) and download the
recommended version (Node 24). If you already have Homebrew, you can instead run:

```
brew install node
```

### 2. Install OpenClaw

Open the Terminal app and run:

```
npm install -g openclaw@latest
```

### 3. Get a free Gemini key

Go to [aistudio.google.com](https://aistudio.google.com), sign in with your
Google account, and create an API key. Copy it somewhere safe. OpenClaw reads it
from an environment variable called `GEMINI_API_KEY`.

### 4. Run the guided setup

This is the friendly part — OpenClaw walks you through everything:

```
openclaw onboard
```

When it asks for a provider, choose **Gemini** and paste your API key. It'll set
up the workspace, let you connect a messaging channel (like Telegram, so you can
text your assistant), and install a background service so it keeps running on its
own. Set the default model to `google/gemini-3.1-pro-preview`.

Then start it up and confirm everything's wired:

```
openclaw start --detach
openclaw models list --provider google
```

### 5. Reach it from anywhere with Tailscale

Tailscale builds a private network between your devices, so your phone can talk
to the Mac mini securely from anywhere — without opening anything to the public
internet or exposing it to strangers.

1. On the Mac mini, install Tailscale from [tailscale.com](https://tailscale.com)
   or the Mac App Store, and sign in. That creates your private network.
2. On your phone, install the Tailscale app and sign in with the **same**
   account. Now both devices are on the same private network.
3. Optional: turn on **Tailscale SSH** so you (or I) can log in to the Mac mini
   remotely to check on it.

### 6. Keep the Mac mini awake

An always-on assistant needs an always-on computer. In **System Settings →
Lock Screen / Energy**, set the Mac mini to never sleep. This one's easy to
forget and it'll quietly take your assistant offline if you miss it.

That's it — you can now text your own assistant from your phone, wherever you
are. If anything looks confusing or a command doesn't work, take a screenshot
and call me. We'll get it sorted together.
