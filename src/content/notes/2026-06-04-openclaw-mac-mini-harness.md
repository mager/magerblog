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

(And if you're reading this and you're *not* my dad — if you're somebody else's
dad, or just someone setting up your first harness — hi, welcome. This works the
same for you.)

### 1. Install Homebrew

Homebrew is a tool that lets you install other tools from the Terminal — think of
it as an App Store for command-line software. Open the **Terminal** app
(press Cmd-Space, type "Terminal", hit Return) and paste this in:

```
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
```

It'll ask for your Mac password (you won't see anything as you type it — that's
normal) and take a few minutes. When it finishes, it prints two extra commands to
"add Homebrew to your PATH" — copy and paste **those two lines** too, so your Mac
can find `brew` from now on.

### 2. Install Node

OpenClaw runs on Node (the engine it's built on). Now that Homebrew is set up:

```
brew install node
```

(You could also download it from [nodejs.org](https://nodejs.org) — get Node 24 —
but the command above is easier now that you have Homebrew.)

### 3. Install OpenClaw

Still in Terminal, run:

```
npm install -g openclaw@latest
```

### 4. Get a free Gemini key

Go to [aistudio.google.com](https://aistudio.google.com), sign in with your
Google account, and create an API key. Copy it somewhere safe. OpenClaw reads it
from an environment variable called `GEMINI_API_KEY`.

### 5. Run the guided setup

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

### 6. Reach it from anywhere with Tailscale

Tailscale builds a private network — called a **tailnet** — that quietly links
your own devices together.

Here's the tailnet in plain terms: think of it like a private group chat, but for
your *devices* instead of people. Once your Mac mini and your phone are both
signed in, they can talk to each other directly and securely no matter where you
are — your phone at a coffee shop, the Mac mini back home — as if they were
sitting side by side on the same home WiFi. Nothing gets exposed to the public
internet; only your own signed-in devices can see each other. That's what lets
you text your assistant from anywhere without leaving the Mac mini open to
strangers.

1. On the Mac mini, install Tailscale from [tailscale.com](https://tailscale.com)
   or the Mac App Store, and sign in. That creates your tailnet.
2. On your phone, install the Tailscale app and sign in with the **same**
   account. Now both devices are on the same tailnet.
3. Optional: turn on **Tailscale SSH** so you (or I) can log in to the Mac mini
   remotely to check on it.

### 7. Keep the Mac mini up all the time

An always-on assistant needs an always-on computer, and there are two parts to
that:

- **Don't let it sleep.** In **System Settings → Lock Screen** (and
  **Battery / Energy**), set the Mac mini to never sleep, so it's always awake and
  reachable. This one's easy to forget, and it'll quietly take your assistant
  offline if you miss it.
- **Bring it back after a reboot or crash.** If the power blips or the Mac
  restarts, you'll want the assistant to come back on its own. I wrote up exactly
  how I keep mine alive through reboots, crashes, and updates here:
  [Keeping an always-on agent alive across reboots](https://mager.co/notes/2026-06-03-always-on-agent-across-reboots/).
  It's a touch more technical — call me and we'll set it up together.

That's it — you can now text your own assistant from your phone, wherever you
are. If anything looks confusing or a command doesn't work, take a screenshot
and call me. We'll get it sorted together.
