---
title: "An OpenClaw setup for Dad"
description: "A plain-English, step-by-step walkthrough for setting up your own always-on AI assistant on a Mac mini — OpenClaw for the assistant, Google Gemini for the brain, and Tailscale so you can reach it from anywhere. Written for a first-timer."
pubDate: 2026-06-04
category: tech
draft: true
tags: ["ai", "openclaw", "tailscale", "mac", "gemini", "harness"]
---

Hi Dad. This is a walkthrough for building your own AI assistant that lives on
the Mac mini and answers you from your phone, anywhere you are. It's the
open-source cousin of the setup I run in Chicago: an assistant that's always on,
that you can text like a person, and that you fully own. We'll use **OpenClaw**
(the assistant), **Google Gemini** (its brain, free to start), and **Tailscale**
(a private tunnel so your phone and laptop can reach the Mac mini safely). Take it
one step at a time — there's no rush, and you can stop and call me whenever.

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
one of your own files. **Everything we do on the Mac mini, we do while logged
into that new account.**

### The order matters: networking first, then the assistant

We'll set up **Tailscale** first. Once it's on, your MacBook can reach the Mac
mini over SSH, and you can do the rest of the setup from the comfort of your
laptop instead of hunched over the mini. Then we install and onboard OpenClaw
**on the mini itself**, because that's where the assistant lives.

### 1. Set up Tailscale (do this at the Mac mini)

Tailscale builds a private network — called a **tailnet** — that quietly links
your own devices together.

Here's the tailnet in plain terms: think of it like a private group chat, but for
your *devices* instead of people. Once your Mac mini, your phone, and your MacBook
are all signed in, they can talk to each other directly and securely no matter
where you are — your phone at a coffee shop, the Mac mini back home — as if they
were sitting side by side on the same home WiFi. Nothing gets exposed to the
public internet; only your own signed-in devices can see each other.

Sitting at the Mac mini (logged into the assistant's account):

1. Install Tailscale from [tailscale.com](https://tailscale.com) or the Mac App
   Store, and sign in. That creates your tailnet. Give this machine an easy name
   when asked (something like `dads-mac-mini`).
2. On your **phone** and your **MacBook**, install the Tailscale app and sign in
   with the **same** account. Now all three devices are on the same tailnet.
3. Turn on **Tailscale SSH** so your MacBook can log into the mini without
   passwords or keys — Tailscale handles that for you. In the mini's Terminal run:

   ```
   tailscale up --ssh
   ```

   (If Terminal says `tailscale` isn't found, don't worry — call me and we'll
   enable it together; it's a one-time toggle.)

### 2. Set up your MacBook to reach the mini

You'll want to check on the assistant now and then — read its logs, restart it,
or open its control panel — without walking over to the Mac mini. That's what
**SSH** is for.

SSH ("Secure Shell") is just a safe way to open a Terminal *on the Mac mini* from
another computer — like reaching across the room and typing on it, except it can
be from anywhere. Because we're going over your Tailscale tailnet, it's both
private and reachable wherever you are.

To make this effortless, we'll set up two **aliases** on your MacBook — short
nicknames for longer commands, so you can type `macmini` instead of remembering the
whole thing. On the **MacBook**, open Terminal and run:

```
open -e ~/.zshrc
```

That opens your shell's settings file in TextEdit. Paste these two lines at the
bottom — they're already filled in with this mini's account and Tailscale name
(`magerbot@Mac`); if you named yours differently, swap that part to match:

```
alias macmini='ssh magerbot@Mac'
alias macminidash='ssh -N -L 18789:localhost:18789 magerbot@Mac'
```

Save, close, and run `source ~/.zshrc` (or just open a fresh Terminal window) so
the nicknames load. Now:

- Type **`macmini`** to drop into a Terminal *on the Mac mini* — right from your
  MacBook. You're now "on" the mini, in the assistant's account. This is where
  you'll run the rest of the setup. Type `exit` to leave.
- Type **`macminidash`** to open a secure **tunnel** to the assistant's control
  panel (we'll use this after OpenClaw is installed). A tunnel quietly pipes one
  private page from the mini over to your MacBook: while `macminidash` is running,
  open [http://localhost:18789](http://localhost:18789) in your MacBook's browser
  and you'll see OpenClaw's dashboard — its chat, settings, and logs. (If it asks
  you to sign in, run `openclaw dashboard` on the mini to get a one-click link.)
  This dashboard is admin-only and should never be put on the public internet,
  which is exactly why we reach it through the private tunnel instead. Press Ctrl-C
  to close the tunnel when you're done.

From here on, type **`macmini`** on your MacBook to hop onto the Mac mini, and run
every command below in that session. (You can also just sit at the mini if you
prefer — either way, these commands run *on the mini*, since that's where the
assistant lives.)

### 3. Install Homebrew (on the mini)

Homebrew is a tool that lets you install other tools from the Terminal — think of
it as an App Store for command-line software. In your `macmini` session, paste this
in:

```
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
```

It'll ask for the account's password (you won't see anything as you type it —
that's normal) and take a few minutes. When it finishes, it prints two extra
commands to "add Homebrew to your PATH" — copy and paste **those two lines** too,
so the mini can find `brew` from now on.

### 4. Install Node

OpenClaw runs on Node (the engine it's built on). Now that Homebrew is set up:

```
brew install node
```

(You could also download it from [nodejs.org](https://nodejs.org) — get Node 24 —
but the command above is easier now that you have Homebrew.)

### 5. Install OpenClaw

Still in your `macmini` session, run:

```
npm install -g openclaw@latest
```

### 6. Get a free Gemini key

In your MacBook's browser, go to
[aistudio.google.com](https://aistudio.google.com), sign in with your Google
account, and create an API key. Copy it — you'll paste it into the setup in the
next step. OpenClaw reads it from an environment variable called `GEMINI_API_KEY`.

### 7. Run the guided setup (on the mini)

This is the friendly part — OpenClaw walks you through everything. In your `macmini`
session run:

```
openclaw onboard
```

When it asks for a provider, choose **Gemini** and paste your API key. It'll set
up the workspace, let you connect a messaging channel (like Telegram, so you can
text your assistant), and install a background service so it keeps running on its
own — onboarding starts it for you.

Confirm everything's wired:

```
openclaw gateway status
openclaw models list --provider google
```

`gateway status` should say it's running. Now try the `macminidash` tunnel from
step 2 to peek at the dashboard, and text your assistant on whatever channel you
connected. It's alive.

### 8. Keep the Mac mini up all the time

An always-on assistant needs an always-on computer, and there are three parts to
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

### Cheat sheet

Keep this handy — every command we ran, grouped by where you type it.

**On your MacBook** (Terminal):

```
macmini          # log into the Mac mini over SSH (you're now "on" the mini)
macminidash      # open the secure tunnel, then visit http://localhost:18789
exit             # leave the mini, back to your MacBook
open -e ~/.zshrc # edit your aliases
source ~/.zshrc  # reload aliases after editing (or just open a new window)
```

**On the Mac mini** — one-time setup (run after `macmini`, or sitting at it):

```
tailscale up --ssh                       # turn on Tailscale SSH
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"   # install Homebrew
brew install node                        # install Node
npm install -g openclaw@latest           # install OpenClaw
openclaw onboard                         # the guided setup
```

**On the Mac mini** — day to day:

```
openclaw gateway status                  # is the assistant running?
openclaw gateway restart                 # restart it (e.g. after a settings change)
openclaw gateway stop                    # stop it
openclaw gateway start                   # start it again
openclaw logs --follow                   # watch live logs (Ctrl-C to stop)
openclaw dashboard                       # get a one-click link to the control panel
openclaw models list --provider google   # confirm Gemini is connected
```

That's it — you can now text your own assistant from your phone, wherever you
are. If anything looks confusing or a command doesn't work, take a screenshot
and call me. We'll get it sorted together.
