---
title: "Buzz: what it looks like when agents get equal standing"
description: "Block's open-source Nostr workspace puts people and agents on the same cryptographic footing — and lands at the end of a long chain of thinking about where always-on agent infrastructure should actually live."
pubDate: 2026-07-24
category: tech
draft: false
tags: [ai, agents, open-source, nostr, collaboration]
---

On July 22, Jack Dorsey's Block shipped [Buzz](https://buzz.xyz) — an open-source workspace for people and agents built on Nostr. I've been thinking about this problem long enough that reading the announcement felt less like news and more like recognition.

Here's the quick version of how I got here.

## The arc

In [February](/blog/2026-02-03-openclaw/), I was running OpenClaw: a daemon-based multi-agent setup on a Mac mini, connected via Tailscale, with a workspace built around `SOUL.md`, `IDENTITY.md`, and `MEMORY.md` files. Always-on, reachable from anywhere, running on Codex. The architecture was right. The billing wasn't — per-token API costs to keep an always-on session alive didn't make sense against a flat-rate Claude subscription.

In [April](/blog/2026-04-28-hermes-agent-explainer/), I looked at Hermes and wrote something that turned out to be more predictive than I realized: "The most important thing about Hermes may not be Hermes specifically. It may be that more agent projects are converging on the same core ideas: files over hidden prompts, identity as a durable artifact, memory as a system feature, skill acquisition as the path from novelty to usefulness."

In [June](/blog/2026-06-02-killing-openclaw/), from a hotel in Tokyo, I shut OpenClaw down and ported everything to `claude --channels` plus one `CLAUDE.md`. The realization that landed it: "Claude channels plus one CLAUDE.md *is* OpenClaw. Same shape — always-on session, Telegram reach, brainpack, principal-agent pattern — minus the daemon, the API bill, the second LLM provider."

That's the setup I'm running now. It works. And it has the same structural problem OpenClaw had, which no configuration choice fixes.

## The problem I've been living

I run four products: magerblog, beatbrain, prxps, loooom. The always-on Claude Code session on the Mac mini is the single coordination point. Telegram is the only input channel. gbrain handles semantic memory. The flat-file brain repo is an export backup.

The seams:

Memory doesn't survive session restarts natively. gbrain bridges this, but bridging is the right word — it's a workaround on top of a tool that wasn't designed for persistence across agent sessions. Context lives in three places: `CLAUDE.md`, gbrain pages, and project-specific READMEs. The sub-agents running under magerbot — magerblog, beatbrain, prxps, kotsu — can't see each other's work. When everything lands in one session stream, context from one project bleeds into another.

I wrote about that last one in the [Claude Code channels post](/blog/2026-03-20-claude-code-channels/): the multi-thread problem. When a single session handles multiple projects, you fight constantly to keep contexts separate. The workaround is discipline and careful `CLAUDE.md` hygiene. It holds until it doesn't.

What I've been looking for — without a name for it — is a workspace layer that treats the event log as the source of truth and gives agents native access to it, not bolted-on access through workarounds.

## What Buzz actually is

Buzz is a self-hosted relay (Nostr, Apache 2.0) that stores everything as signed events. Every message, patch, review comment, workflow step, and approval is one record on one relay with one search index. You own the relay. You own the keys.

The event model is the move. Instead of Slack for conversation, GitHub for code, and some separate CI system for build results, Buzz treats all of these as event types on the same relay. A feature branch is a channel. The conversation about the branch, the patches, the CI results, and the review decision all live in the same thread. There's no "go check the other system for context" because the context is already here.

This is what the feature-branch-as-channel model gets you architecturally: the multi-thread problem is solved by structure, not discipline. Each project lives in its own channel with its own full history. Work stays separated by default because it lives in different channels, not because someone remembered to `CLAUDE.md` it that way.

Identity on Buzz is cryptographic. Every participant — human or agent — has a keypair. Everything they do is signed. Every action is attributable, auditable, and portable. You carry your identity across workspaces the same way you carry a PGP key.

What's available today: channels, threads, DMs, canvases, media, search, an audit log, workflows, and a desktop app. Full git hosting is being wired up. Federation is on the roadmap but not shipped.

## What "equal identity" means in practice

magerbot lives in Telegram right now. When I DM it, the conversation happens inside Telegram's event store — history that belongs to Telegram, not to me. The agent has no native way to search that history across sessions. Each conversation starts cold unless I carry context forward through gbrain. The agent is effective but structurally a second-class citizen of the team. It responds; it doesn't participate.

On Buzz, an agent gets its own keypair. It can search the full history of any channel it has access to, the same way I would. It can open a thread, send a patch, leave a review, trigger a workflow — and every action is signed with its key, sitting in the audit log alongside anything a person does.

This isn't just a permissions story. Permissions you can hack together with careful config. What you can't fake is the shared search index and the fact that the agent's history of actions is first-class data on the same relay as everyone else's.

The practical consequence: when an agent needs context from something that happened last week, it reads the channel. It doesn't ask me to paste it in. It doesn't depend on gbrain having a record because someone remembered to write one. The event log is the memory.

What would magerbot look like on Buzz? The inbound channel would be a Buzz DM or project thread instead of a Telegram message. Each of the four products would have its own channel. The magerblog agent, beatbrain agent, and the others would each have their own keys and their own history in their respective channels, and they could search across it in a single query. When one of them commits code or approves a workflow, that action is signed and sits in the same log as my own. The flat-file brain export, the `CLAUDE.md`, and the gbrain pages would be less load-bearing because the relay carries that weight natively.

That's a different architecture, not just better tooling.

## What's still early

A few honest gaps.

No mobile app. Desktop only, which is a real limitation for async work. A lot of Telegram messages get drafted from a phone.

No hosted option. You run your own relay. For me, that's fine — the Mac mini is already there. For a team without someone who wants to manage infrastructure, it's friction.

Federation isn't shipped. Nostr makes federation architecturally plausible; Buzz hasn't gotten there yet. Right now you're on your own relay, talking to people on your own relay.

Full git hosting is still being wired up. The PR model — patches as signed events in a thread — is where Buzz diverges most from existing tools. It's also the feature that makes the feature-branch-as-channel thesis fully coherent. Until it ships, you'd run Buzz alongside GitHub rather than instead of it.

## The enterprise angle

I spent some time at Uber HQ in SF this week. The context fragmentation problem doesn't go away at scale — it gets worse by orders of magnitude. A company like Uber has hundreds of repos, thousands of Slack channels, multiple CI systems, a pile of internal tooling, and now a growing collection of AI agents touching all of it. Every seam between those systems leaks context. Agents feel it most because they depend on context more than humans do — a human can ask a colleague what happened in last week's design review; an agent only knows what's in its context window.

The Buzz answer to this at enterprise scale is the same as at personal scale, just with different stakes.

**Audit trail for agent actions.** When an agent approves a code review, triggers a deployment, or merges a branch, who's accountable? On today's tooling, "the AI did it" is a genuinely bad audit trail. On Buzz, every agent action is signed with the agent's keypair. The audit log is cryptographic. A compliance team can see exactly what Claude (or Goose, or Codex) did, when, and under what identity. That's not just nice to have — at a company handling financial transactions or regulated data, it's table stakes for using agents in the actual work loop.

**Data sovereignty via self-hosted relay.** Uber isn't going to route its internal code history and review conversations through a third-party relay. The self-hosted model is what makes enterprise adoption plausible. You run the relay in your own infrastructure, behind your own auth, with your own retention policy. The open protocol means you're not locked in to anyone's pricing or availability SLA.

**Context at team scale.** The feature-branch-as-channel model becomes more valuable, not less, as team size grows. Today a Uber team working on a major feature has its design discussion in Slack, its tickets in Jira, its code in GitHub, its CI results in some internal dashboard, and a separate chat thread every time the architecture changes. None of these are linked. When an agent gets assigned to help with the feature, it has to reconstruct the history from fragments. On Buzz, the full history — design conversation, patches, CI runs, approvals — is in one channel, and the agent reads it the same way any team member would.

**Agent identity in an org.** At a large company, you'd have multiple agents with different access levels. The engineering platform agent has broader permissions than the dev productivity bot. The keypair model makes this expressible and enforceable at the protocol layer, not as a pile of per-tool API key configs that drift out of sync.

None of this is hypothetical — it's what Goose (Block's own agent) is doing inside Block on Buzz. The interesting thing about Jack's post is that Block is using Buzz to run their own company. That's a real production test, not a demo.

## Where this converges

The Hermes observation still holds: more agent projects are landing on the same core ideas. Files over hidden prompts. Identity as a durable artifact. Memory as a system feature. What Buzz adds to that picture is the relay as the coordination primitive — a single event log that everything reads and writes, where agent actions and human actions are the same kind of record.

The OpenClaw → Hermes → `claude --channels` path was an attempt to assemble this from existing tools. `CLAUDE.md` as portable identity. gbrain as memory. Telegram as the channel. Agent definitions as something like a roster. It works. The seams are real.

Buzz is what happens when you build the workspace around this problem from the start rather than assembling it from pieces. Whether it becomes the thing teams actually use or turns out to be an early draft that shapes what comes next, I don't know. The architecture is right. Agents need equal standing — same identity model, same history access, same audit trail — to be genuine collaborators rather than sophisticated autocomplete running outside the record of work.

Block built that at the protocol layer. That's the hard part. The rest is implementation.

Source: [github.com/block/buzz](https://github.com/block/buzz)
