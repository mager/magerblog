---
title: "OpenClaw + Tailscale: Your Always-On AI Agent, Accessible from Anywhere"
pubDate: "2026-02-22"
description: "How to run OpenClaw on a Mac Mini 24/7, lock it down with Tailscale, and load your agent's brain with brainpack — so your laptop can reach it from anywhere on your tailnet."
category: "code"
tags: ["AI", "OpenClaw", "Tailscale"]
heroImage: ""
keyword: "Openclaw Mac Mini setup"
draft: false
---

I wanted my AI agent to be always on. Not sleeping in a browser tab, not waiting for me to open an app — actually running, on real hardware, 24/7, accessible from my laptop no matter where I am.

A Mac Mini + Tailscale is the answer. And this post is the setup guide I wish I had.

> **For humans and agents:** This post is meant to be copy-pasted into a fresh Claude or AI session. Open a conversation, paste this whole article, and tell it your agent's name, timezone, and channel of choice. It'll walk you through every phase. Agents reading this autonomously can run every command directly.

Before diving in: if you want a battle-tested base checklist with every gotcha documented, Julian Paul's post — [How to Set Up OpenClaw on a Mac Mini: The Complete Checklist](https://julianpaul.me/blog/how-to-set-up-openclaw-on-a-mac-mini-the-complete-checklist) — is essential reading. This post layers Tailscale access, brainpack brain migration, and a morning weather heartbeat on top of that foundation.

---

## The Goal

- **Mac Mini** runs OpenClaw as a daemon, always on, even when closed (it has no lid anyway)
- **Tailscale** gives your laptop secure, zero-config access to the OpenClaw dashboard from anywhere on your tailnet — no port forwarding, no VPN config, no public exposure
- **brainpack** migrates your agent's brain from your old machine so it wakes up with full memory
- **A 5:30 AM cron** sends you a one-liner weather report every morning via Telegram

---

## Phase 1: Prepare macOS

First, make the Mac Mini actually stay on. By default, macOS will sleep and kill your agent.

### 1.1 Prevent sleep

```bash
sudo pmset -a sleep 0 disksleep 0 displaysleep 0
sudo pmset -a hibernatemode 0 powernap 0
sudo pmset -a standby 0 autopoweroff 0
sudo pmset -a autorestart 1
```

Verify — all values should be `0`:

```bash
pmset -g | grep sleep
```

### 1.2 Caffeinate on boot

This keeps the machine awake persistently across reboots:

```bash
cat > ~/Library/LaunchAgents/com.openclaw.caffeinate.plist << 'EOF'
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
  <key>Label</key>
  <string>com.openclaw.caffeinate</string>
  <key>ProgramArguments</key>
  <array>
    <string>/usr/bin/caffeinate</string>
    <string>-s</string>
  </array>
  <key>RunAtLoad</key>
  <true/>
  <key>KeepAlive</key>
  <true/>
</dict>
</plist>
EOF

launchctl load ~/Library/LaunchAgents/com.openclaw.caffeinate.plist
pgrep caffeinate  # Should return a PID
```

### 1.3 Auto-login

`System Settings → Users & Groups → Login Options → Automatic login` → set to your user.

This ensures the agent starts automatically after a power outage or reboot.

### 1.4 Firewall + stealth mode

```bash
sudo /usr/libexec/ApplicationFirewall/socketfilterfw --setglobalstate on
sudo /usr/libexec/ApplicationFirewall/socketfilterfw --setstealthmode on
```

Stealth mode drops unsolicited ping packets. Your machine won't even respond to port scans on the public network.

### 1.5 Lock down home directory

```bash
chmod 700 ~/
```

No other local users can browse your files.

---

## Phase 2: Tailscale — Secure Access Without a VPN

Tailscale is magic: it creates a private, encrypted mesh network between your devices with zero config. Your Mac Mini gets a stable hostname on your tailnet. Your laptop can reach it from home, the office, a coffee shop — anywhere.

Critically: **it never exposes anything to the public internet.** You're not opening ports. You're not running a reverse proxy. You're not managing certificates manually. Tailscale handles all of that with WireGuard under the hood.

### Install Tailscale

```bash
brew install tailscale
tailscale up
```

Follow the auth URL to join your tailnet. Verify:

```bash
tailscale status
```

> **Note:** If you have the Mac App Store version of Tailscale installed, the Homebrew CLI may conflict. Use the App Store app for GUI management, and the `brew` CLI for `tailscale serve`.

### Expose OpenClaw dashboard via Tailscale Serve

This makes your OpenClaw dashboard available at `https://[mac-mini-hostname].tail[xxxxx].ts.net` — accessible from any device on your tailnet, nowhere else.

```bash
tailscale serve --bg http://127.0.0.1:18789
```

> **Important:** Use `http://` not `https+insecure://`. The gateway serves plain HTTP on the loopback. `https+insecure://` causes 502 errors.

> **DANGER:** Use `tailscale serve`, NOT `tailscale funnel`. Serve = tailnet only (private). Funnel = public internet. Don't funnel your agent dashboard.

Verify from your laptop:

```bash
curl -k https://[mac-mini-hostname].tail[xxxxx].ts.net
```

---

## Phase 3: Install OpenClaw

```bash
# Homebrew (if needed)
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# Node 22+
brew install node@22
node -v  # Must be 22+

# OpenClaw
npm install -g openclaw@latest
```

### Run the onboarding wizard

```bash
openclaw onboard --install-daemon
```

The wizard sets up your gateway, API key, Telegram bot, and installs the daemon. During setup, grab your Telegram bot token from [@BotFather](https://t.me/BotFather) — you'll paste it when prompted.

**Known bug:** On some versions the onboarding wizard skips the API key step entirely. If your agent is unresponsive after setup, add the key manually to `~/.openclaw/openclaw.json`:

```json
{
  "env": {
    "ANTHROPIC_API_KEY": "sk-ant-api03-YOUR_KEY_HERE"
  }
}
```

Then add model config inside `agents.defaults`:

```json
"model": {
  "primary": "anthropic/claude-sonnet-4-5",
  "fallbacks": ["anthropic/claude-opus-4-6"]
},
"heartbeat": {
  "every": "30m",
  "model": "anthropic/claude-haiku-4-5",
  "activeHours": { "start": "08:00", "end": "23:00" }
}
```

Restart and test:

```bash
openclaw gateway restart
openclaw tui
```

Type "hello" — you should get a response.

---

## Phase 4: Migrate Your Brain with brainpack

You've got a new machine. Your agent's memories, personality, and skills live on your old one. Don't start over.

[brainpack](https://github.com/mager/brainpack) is a platform-agnostic CLI that packs up your agent's brain — the workspace files that give it identity, memory, and context — and moves it to a new machine in seconds.

### On your old machine (source)

```bash
cd ~/.openclaw/workspace
npx @mager/brainpack init   # auto-detects OpenClaw, sets up git
npx @mager/brainpack push   # stages, commits, and pushes to GitHub
```

### On your Mac Mini (target)

```bash
git clone git@github.com:you/my-brain.git ~/.openclaw/workspace
cd ~/.openclaw/workspace
npx @mager/brainpack pull
```

Your agent wakes up with all its memories intact. It remembers your name, your projects, your preferences, your inside jokes.

### Secrets stay safe

brainpack automatically excludes sensitive files — `TOOLS.md`, `.env`, API tokens, private keys. The brain ships clean. On the new machine, run:

```bash
npx @mager/brainpack secrets
```

It shows exactly what needs manual setup (API keys, channel configs) and how to restore them.

---

## Phase 5: Security — Least Privilege by Design

Here's why this setup is secure by default:

**Tailscale Serve, not Funnel.** Your agent dashboard is only reachable inside your tailnet. An attacker on the public internet can't even find it, let alone reach it.

**Stealth mode on the firewall.** The Mac Mini drops unsolicited packets silently. No response means no fingerprinting.

**FileVault encryption.** Enable it: `System Settings → Privacy & Security → FileVault → Turn On`. Your drive is encrypted at rest — if the machine is ever stolen, the data is unreadable.

**Home directory permissions.** `chmod 700 ~/` means no other local users can browse your workspace.

**brainpack secret exclusions.** API keys and tokens never leave the machine in a push. You control what's manually migrated.

**Remote Login restricted.** If you enable SSH (`System Settings → Sharing → Remote Login`), restrict it to your user only. And since Tailscale gives you a Tailscale IP, you can add that to your `~/.ssh/authorized_keys` and lock SSH to tailnet-only.

No open ports. No public exposure. No root access required for daily operation. The surface area is tiny by design.

---

## Bonus: Morning Weather Cron at 5:30 AM

This is the fun part. One cron job, a free weather API, and you wake up to a one-liner in Telegram every morning.

OpenClaw's cron runs your agent on a schedule. The agent hits [wttr.in](https://wttr.in) — a free, no-auth weather API — fetches a one-line forecast, and sends it to your Telegram.

### Set it up

```bash
openclaw cron add \
  --schedule "30 5 * * *" \
  --tz "America/Chicago" \
  --model "anthropic/claude-haiku-4-5" \
  --task "Fetch the current weather for Chicago from https://wttr.in/Chicago?format=3 and send it to me via Telegram. Keep it to one line — temperature, condition, nothing else. No preamble."
```

What `wttr.in/Chicago?format=3` returns looks like:

```
Chicago: ⛅️ +28°F
```

At 5:30 AM CT, your phone gets a Telegram message with exactly that. Haiku handles it for a fraction of a cent.

Verify your cron is registered:

```bash
openclaw cron list
```

---

## The Full Stack

What you now have:

| Layer | Tool | What it does |
|---|---|---|
| Hardware | Mac Mini | Always-on, no sleep, auto-restarts |
| Network | Tailscale | Secure tailnet access, no public exposure |
| Agent | OpenClaw | Persistent AI agent with memory + skills |
| Identity | brainpack | Brain migrated from old machine |
| Comms | Telegram | Agent messages you directly |
| Morning | cron + wttr.in | 5:30 AM weather one-liner |

From my laptop, I hit `https://magerbot-mini.tail[xxxxx].ts.net` and I'm in my agent's dashboard — from a coffee shop, from the airport, from anywhere. The agent remembers everything. It's been running for days without me touching it.

This is what "always on" actually means.

---

*Reference: [Julian Paul's OpenClaw Mac Mini checklist](https://julianpaul.me/blog/how-to-set-up-openclaw-on-a-mac-mini-the-complete-checklist) — the battle-tested foundation this post builds on.*

*[brainpack](https://github.com/mager/brainpack) — open source brain migration tool.*
