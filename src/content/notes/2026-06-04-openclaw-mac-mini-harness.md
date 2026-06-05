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

### First, the part that matters most: it runs in its own account

We're going to run all of this under a **separate macOS user account** on the Mac
mini — not your everyday one. This is the safe way to do it, and it's worth a
minute to understand why.

macOS keeps each user account walled off from the others. The assistant's account
has its own home folder and can only see its own files. It **cannot** reach into
your personal account — your documents, photos, Mail, Messages, or saved
passwords all live in a different account that macOS keeps separate. Think of it
like a guest room with its own door: the assistant has its own room to work in,
but no key to the rest of the house.

So if anything ever misbehaves, it's contained. You can log back into your own
account and everything is exactly as you left it — and if you ever want to start
over, you can delete the assistant's account entirely without touching a single
one of your own files. Do all the steps below **while logged into that new
account.**

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
3. Turn on **Tailscale SSH** — this is the bit that makes the next step easy. On
   the Mac mini, run `tailscale up --ssh` (or flip it on from the Tailscale menu
   bar icon). It lets your other devices log into the mini without you having to
   fuss with passwords or keys — Tailscale handles that part for you.

### 7. Log into the Mac mini from your MacBook

You'll want to check on the assistant now and then — read its logs, restart it,
or open its control panel — without walking over to the Mac mini. That's what
**SSH** is for.

SSH ("Secure Shell") is just a safe way to open a Terminal *on the Mac mini* from
another computer — like reaching across the room and typing on it, except it can
be from anywhere. Because we're going over your Tailscale tailnet, it's both
private and reachable wherever you are.

To make this effortless, we'll set up two **aliases** on your MacBook — short
nicknames for longer commands, so you can type `mini` instead of remembering the
whole thing. On the **MacBook**, open Terminal and run:

```
open -e ~/.zshrc
```

That opens your shell's settings file in TextEdit. Paste these two lines at the
bottom (swap in the assistant's account name and your Mac mini's Tailscale name):

```
alias mini='ssh dad@dads-mac-mini'
alias minidash='ssh -N -L 18789:localhost:18789 dad@dads-mac-mini'
```

Save, close, and run `source ~/.zshrc` (or just open a fresh Terminal window) so
the nicknames load. Now:

- Type **`mini`** to drop into a Terminal on the Mac mini. You're now "on" the
  mini — you can run things like `openclaw start --detach` or check that it's
  alive. Type `exit` to leave.
- Type **`minidash`** to open a secure **tunnel** to the assistant's control
  panel. A tunnel quietly pipes one private page from the mini over to your
  MacBook: while `minidash` is running, open
  [http://localhost:18789](http://localhost:18789) in your MacBook's browser and
  you'll see OpenClaw's dashboard — its chat, settings, and logs. (If it asks you
  to sign in, run `openclaw dashboard` on the mini to get a one-click link.) This
  dashboard is admin-only and should never be put on the public internet, which is
  exactly why we reach it through the private tunnel instead. Press Ctrl-C to close
  the tunnel when you're done.

### 8. Keep the Mac mini up all the time

An always-on assistant needs an always-on computer, and there are two parts to
that:

- **Don't let it sleep.** In **System Settings → Lock Screen** (and
  **Battery / Energy**), set the Mac mini to never sleep, so it's always awake and
  reachable. This one's easy to forget, and it'll quietly take your assistant
  offline if you miss it.
- **Keep the assistant's account logged in.** Because the assistant runs in its
  own account, that account needs to stay signed in for it to keep working. The
  easy way: turn on **Fast User Switching** (System Settings → Control Center →
  show in menu bar), log into the assistant's account once, then switch back to
  your own — the assistant keeps humming along in the background. (To have it log
  in by itself after a power outage, see the post linked below.)
- **Bring it back after a reboot or crash.** If the power blips or the Mac
  restarts, you'll want the assistant to come back on its own. I wrote up exactly
  how I keep mine alive through reboots, crashes, and updates here:
  [Keeping an always-on agent alive across reboots](https://mager.co/notes/2026-06-03-always-on-agent-across-reboots/).
  It's a touch more technical — call me and we'll set it up together.

That's it — you can now text your own assistant from your phone, wherever you
are. If anything looks confusing or a command doesn't work, take a screenshot
and call me. We'll get it sorted together.
