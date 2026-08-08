---
title: "OpenCode Go + Buzz: killing Claude Code for a $10 harness"
description: "Second harness migration in two months. The always-on agent on my Mac mini now runs OpenCode on $10/mo open models instead of Claude Code, reachable from my phone over my own Buzz relay instead of Telegram. The interesting part: the swap was one line, because the protocol — not the model — is the actual seam."
pubDate: 2026-08-08
category: tech
keyword: "OpenCode Go"
draft: true
tags: [opencode, buzz, acp, agents, harness, mac-mini, gbrain, migration]
---

<!-- TODO before publish (after Go credits reset and kimi-k3 proves out end-to-end):
     - update the "day one, honest edition" section with how the flip-back went
     - confirm final model (kimi-k3 principal + deepseek-v4-flash subagents, or whatever wins)
     - run blog-seo, tone pass, npm run build, then flip draft: false -->

Two months ago I [killed OpenClaw for a native Claude Code setup](/blog/2026-06-02-killing-openclaw/): `claude --channels`, one `CLAUDE.md`, Telegram in and out, always-on on a Mac mini in Chicago. Yesterday I killed that too. The always-on agent now runs [OpenCode](https://opencode.ai) on OpenCode Go — $10/month for open models — and I reach it through [Buzz](/blog/2026-07-24-buzz-explainer/), the Nostr workspace, instead of Telegram.

This is the third harness the brain has lived in. The migrations keep getting cheaper, and the reason why is the actual point of this post.

## How it all works

The shape, end to end:

```
[Phone: Buzz app over Tailscale]
        │  Nostr events, signed
        ▼
[Buzz relay]  ws://100.85.174.76:3000   (tmux: buzzrelay)
        │  websocket subscription
        ▼
[buzz-acp]  mention filter, owner gate   (tmux: buzzacp)
        │  ACP over stdio
        ▼
[opencode acp]  the agent process
        │  OpenCode Go API
        ▼
[kimi-k3]  $10/mo flat, no per-token bill
        │
        └── MCP: gbrain (memory) ── ~/.gbrain/brain.pglite
```

A message's full life:

1. I @mention `magerbot` in a Buzz channel on my phone. The app signs the event with my Nostr key and publishes it to my self-hosted relay.
2. `buzz-acp` — a small Rust bridge — subscribes to every channel, filters for events that p-tag magerbot's pubkey, and checks the sender against an owner gate: my pubkey, plus one allowlisted bridge key. Everyone else is ignored.
3. On a match, buzz-acp spawns (or reuses) an ACP session: `opencode acp` running as a child process, speaking the [Agent Client Protocol](https://agentclientprotocol.com) over stdio. One session per channel, so each product — magerblog, beatbrain, prxps, loooom, kotsu — gets its own context for free. No more `/clear` between unrelated jobs; the separation is structural.
4. OpenCode loads the brain: a global `AGENTS.md` (ported from my `CLAUDE.md`), seven subagent definitions, and gbrain — my semantic memory layer — as a local MCP server. It calls kimi-k3 on OpenCode Go, does the work, streams the answer back.
5. buzz-acp signs the reply as magerbot and posts it to the same channel. Round trip on a trivial prompt: about six seconds.

The Telegram harness is still running in parallel as a fallback. Cutover is a decision for after the new stack proves itself, not before.

## The swap was one line

Here's the part that matters. The old harness and the new harness are the *same binary*:

```diff
 exec ./target/release/buzz-acp \
-  --agent-command claude-agent-acp \
-  --agent-args "" \
+  --agent-command "$HOME/.opencode/bin/opencode" \
+  --agent-args "acp" \
   --respond-to allowlist \
   --respond-to-allowlist "$BRIDGE_PUBKEY"
```

Same relay, same identity, same owner gate, same supervision. The only thing that changed is which process sits behind the protocol. Claude Code and OpenCode both speak ACP, so the harness doesn't care which one it drives. When Anthropic shipped [channels](/blog/2026-03-20-claude-code-channels/), the win was that Telegram became someone else's problem. ACP is the same move one layer down: the model and agent runtime become someone else's problem.

That's the lesson after three harnesses: the durable assets are the brain (files and memory you own), the identity (keys you hold), and the protocol seams. The thing in the middle — the agent runtime, the model — is a cartridge. It should swap in an afternoon, and now it does.

## The unattended config

An always-on agent can't ask permission. OpenCode's equivalent of `--dangerously-skip-permissions`, with one deliberate exception:

```jsonc
{
  "model": "opencode-go/kimi-k3",
  "permission": {
    "*": "allow",
    "read": {
      "*": "allow",
      "*.env": "deny",
      "*.env.*": "deny"
    }
  },
  "mcp": {
    "gbrain": {
      "type": "local",
      "command": ["bun", "run", "/Users/magerbot/Code/gbrain/src/cli.ts", "serve"]
    }
  }
}
```

buzz-acp also auto-approves ACP permission requests on its own, so the belt-and-suspenders version is: config says allow, the bridge says allow, and `.env` files stay unread either way.

## Supervision: prove reachability, not liveness

Same pattern as the Telegram harness — tmux plus a launchd watchdog that recreates the session every 120 seconds if it's gone — with one upgrade earned from experience. The old harness once died *silently*: process alive, network path dead, bot deaf. A liveness check would have reported green.

So the new healthcheck is a canary, not a heartbeat. Every ten minutes a script signs an @magerbot mention from the allowlisted bridge key, waits up to five minutes for a reply, and restarts the session after two consecutive misses. It tests the whole path — relay, bridge, agent, model API — because it *is* the whole path.

One caveat I'm writing down so future-me doesn't learn it the hard way: a canary costs one agent turn per run. On a free model that's nothing. On kimi-k3's daily request budget, 144 probes a day would eat the entire allowance. When the harness flips back to Go models, the canary drops to every six hours.

## Day one, honest edition

The migration took an afternoon and immediately produced a real finding: I hit OpenCode Go's 5-hour usage cap on kimi-k3 during verification. The harness, gbrain, subagent dispatch, the watchdog, and the canary all proved out — on `opencode/big-pickle`, a free model, while the Go quota resets. That's either a footnote (rate limits happen; the architecture absorbed it without a code change — I edited one model string in three files) or a preview of life inside a $10/month request budget. I'll know which after a few weeks of real usage, and I'll update this post when the flip-back proves out.

Also wrong in my plan: I assumed Buzz's web UI would be the phone client. It isn't — it's a repos viewer. The phone answer turned out to be the native Buzz app, paired to my relay over Tailscale through a `buzz://connect` deep link. Fine outcome, wrong assumption.

## What's the same

Everything that made the last setup good survived: the brain (now `AGENTS.md` instead of `CLAUDE.md` — same file, new name), the seven product subagents, gbrain memory, the Mac mini, Tailscale, tmux + launchd, the principal-agent pattern where one session dispatches narrow work and keeps control.

What's different: Telegram is no longer the transport (my relay, my keys, my logs), Claude is no longer the runtime (for now — the seam is one line if that changes), and the marginal cost of the agent existing is $10 a month flat.

The brain doesn't care what body it wears. Increasingly, neither do I.
