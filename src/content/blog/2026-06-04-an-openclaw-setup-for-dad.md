---
title: "An OpenClaw setup for Dad"
description: "A plain-English walkthrough for setting up your own always-on AI assistant on a Mac mini — OpenClaw, Google Gemini, and Tailscale — written for a first-timer."
pubDate: 2026-06-04
category: tech
keyword: "OpenClaw"
draft: false
tags: ["ai", "openclaw", "tailscale", "mac", "gemini", "harness"]
---

Hi Dad. This is how to build your own AI assistant that lives on the Mac mini and
answers you from your phone, anywhere. It's the open-source cousin of the setup I
run in Chicago: always on, text it like a person, and you fully own it. Three
pieces — **OpenClaw** (the assistant), **Google Gemini** (its brain, free to
start), and **Tailscale** (a private tunnel so your devices can reach the mini
safely). Take it one step at a time, and call me whenever.

(Not my dad? Somebody else's dad, or just setting up your first harness? Welcome —
this works the same for you.)

### It runs in its own account — the safe part

We'll run everything under a **separate macOS user account** on the mini, not your
everyday one. macOS keeps accounts walled off from each other, so the assistant
has its own home folder and **cannot** see your personal account — your documents,
photos, Mail, Messages, and passwords all live somewhere it has no key to. If
anything ever misbehaves it's contained, and you can delete that account later
without touching a thing of your own. **Do everything on the mini while logged
into that account.**

We set up **Tailscale first** so your MacBook can reach the mini over SSH — then
you do the rest from your laptop instead of hunched over the mini.

### 1. Set up Tailscale (at the Mac mini)

Tailscale builds a private network — a **tailnet** — between your own devices.
Think of it as a private group chat, but for devices: once they're signed in, your
phone, laptop, and the mini can talk directly and securely from anywhere, as if
they were on the same home WiFi. Nothing is exposed to the public internet.

1. On the mini, install Tailscale from [tailscale.com](https://tailscale.com) and
   sign in. Give it an easy name when asked (like `dads-mac-mini`).
2. Install Tailscale on your **phone** and **MacBook** too, signed into the
   **same** account.
3. Turn on **Tailscale SSH** so your MacBook can log in without passwords or keys:

   ```
   tailscale up --ssh
   ```

   (If `tailscale` isn't found, call me — it's a one-time toggle.)

### 2. Reach the mini from your MacBook

**SSH** ("Secure Shell") lets you open a Terminal *on the mini* from another
computer — over your tailnet, so it's private and works from anywhere. Let's make
it one word. On the **MacBook**, run `open -e ~/.zshrc` and paste these two
**aliases** at the bottom (already filled in with this mini's account and name —
swap `magerbot@Mac` if yours differs):

```
alias macmini='ssh magerbot@Mac'
alias macminidash='ssh -N -L 18789:localhost:18789 magerbot@Mac'
```

Save, then run `source ~/.zshrc` (or open a new Terminal window). Now:

- **`macmini`** drops you into a Terminal on the mini. This is where you'll run the
  rest of the setup. (`exit` leaves.)
- **`macminidash`** opens a secure **tunnel** to OpenClaw's control panel: while
  it's running, open [http://localhost:18789](http://localhost:18789) in your
  browser to see the dashboard — chat, settings, logs. (Ctrl-C closes it.) The
  dashboard is admin-only, so we reach it privately through the tunnel rather than
  putting it on the internet.

### 3. Install OpenClaw (on the mini)

Type `macmini` to hop onto the mini and run OpenClaw's installer:

```
curl -fsSL https://openclaw.ai/install.sh | bash
```

That one command installs everything it needs and launches the guided setup. When
it asks for a provider, choose **Gemini** — and when it asks how to connect, pick
**Sign in with Google**. That's the easy path: no API keys to create or copy, just
your normal Google login in the browser. (If asked for a model, go with
`google/gemini-3.1-pro-preview`.)

If onboarding doesn't offer the Google sign-in, do it afterward with this — it
opens a browser to log in:

```
openclaw models auth login --provider google-gemini-cli --set-default
```

The installer also sets up a background service so the assistant keeps running on
its own, and lets you connect a channel (like Telegram) so you can text it.

When it's done, confirm it's alive:

```
openclaw gateway status
openclaw models list --provider google
```

Then try the `macminidash` tunnel and text your assistant. That's it — it's
running.

### 4. Keep the mini running

An always-on assistant needs an always-on computer:

- **Don't let it sleep.** System Settings → Lock Screen / Energy → never sleep.
- **Keep the account logged in.** Turn on **Fast User Switching** (System Settings
  → Control Center), log into the assistant's account once, then switch back to
  your own — it keeps running in the background.
- **Survive reboots.** To have it come back on its own after a power blip, see how
  I keep mine alive across restarts:
  [Keeping an always-on agent alive across reboots](https://mager.co/notes/2026-06-03-always-on-agent-across-reboots/).

### Cheat sheet

Every command, by where you type it.

**On your MacBook:**

```
macmini          # log into the mini over SSH
macminidash      # open the tunnel, then visit http://localhost:18789
exit             # leave the mini
open -e ~/.zshrc # edit your aliases
source ~/.zshrc  # reload aliases
```

**On the mini — setup:**

```
tailscale up --ssh                          # turn on Tailscale SSH
curl -fsSL https://openclaw.ai/install.sh | bash   # install OpenClaw (+ onboarding)
openclaw models auth login --provider google-gemini-cli --set-default   # sign into Gemini with Google
```

**On the mini — day to day:**

```
openclaw gateway status                  # is it running?
openclaw gateway restart                 # restart after a change
openclaw logs --follow                   # watch live logs (Ctrl-C to stop)
openclaw dashboard                       # get a one-click link to the panel
openclaw models list --provider google   # confirm Gemini is connected
```

If anything looks off or a command doesn't work, take a screenshot and call me.
