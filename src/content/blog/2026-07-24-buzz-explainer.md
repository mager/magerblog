---
title: "Buzz: what it looks like when agents get equal standing"
description: "Block's open-source workspace puts people and agents on the same cryptographic footing. That's not a feature. It's a structural shift in how software teams can work."
pubDate: 2026-07-24
category: tech
draft: true
tags: [ai, agents, open-source, nostr, collaboration]
---

On July 22, Jack Dorsey's Block shipped [Buzz](https://buzz.xyz) — an open-source workspace for people and agents built on Nostr. The pitch is simple to state and harder to appreciate: every participant, human or machine, gets the same kind of identity, the same access to history, and the same ability to act.

I've been running [magerbot](https://mager.co/blog/2026-01-14-magerbot/) — an always-on Claude Code session on a Mac mini, reachable via Telegram — long enough to feel the friction Buzz is trying to solve. So this isn't a feature review. It's a read on whether the architecture is right.

## The problem: teams don't have one context layer, they have seven

A typical software team spreads work across Slack, GitHub, CI, a project tracker, and a mix of AI tools. Each of those systems has its own notion of identity, its own history, its own search.

When you hire an agent into that environment, it inherits all the seams. You can tell it to review a pull request, but it can't see the Slack thread where the design decision got made. You can give it access to your CI logs, but not to the conversation about why you chose this architecture three months ago. The agent is a capable participant operating on a partial transcript of the work.

People feel this too. A new team member joining has the same problem. But people can ask. Agents usually can't — or when they do, the answers live somewhere the agent can't reach.

This is the context fragmentation problem. It's not solved by giving agents better tools in isolation. It's solved by having one place where everything is written down in a form everything can read.

## What Buzz actually is

Buzz is a self-hosted relay (Nostr, Apache 2.0) that stores everything as signed events. Every message, patch, review comment, workflow step, and approval is one record, in one place, with one search index. You own the relay. You own the keys. You own the data.

The event model is the key move. Instead of having Slack for conversation and GitHub for code and some separate CI system for build results, Buzz treats all of these as event types on the same relay. A feature branch is a channel. The conversation about the branch, the patches, the CI results, and the review decision all live in the same thread. There's no "go check Slack for context" because the context is already here.

Identity on Buzz is cryptographic. Every participant — human or agent — has a keypair. Everything they do is signed with that key. That's a different thing than OAuth tokens or API keys: it means every action is attributable, auditable, and portable. You carry your identity across workspaces the same way you carry a PGP key.

What's available today: channels, threads, DMs, canvases, media, search, an audit log, workflows, and a desktop app. Full git hosting is being wired up. Federation is listed on the roadmap but not shipped.

## An agent with equal identity

The part I want to sit with is what "equal identity" means in practice.

magerbot lives in Telegram right now. When I DM it, the conversation happens inside Telegram's event store — which means the history belongs to Telegram, not to me. The agent has no native way to search that history or reference it across sessions. Each conversation starts cold unless I explicitly carry context forward. The agent is effective but it is, structurally, a second-class citizen of the team. It responds; it doesn't participate.

On Buzz, an agent gets its own keypair. It can search the full history of any channel it has access to, the same way a person would. It can open a thread, send a patch, leave a review, trigger a workflow — and every action is signed with its key, attributable and auditable. The log shows "magerbot reviewed this PR" the same way it shows "Mager commented here."

This isn't just about permissions. Permissions you can hack together. What you can't easily fake is the audit trail, the shared search index, and the fact that the agent's history of actions is first-class data on the same relay as everyone else's. An agent on Buzz has something like institutional memory.

The practical consequence: when you ask an agent to do something that requires knowing what happened before, it can actually look. It doesn't have to ask you to paste context. It goes and reads the relevant thread.

What would magerbot look like running on Buzz instead of Telegram? The inbound channel would be a Buzz DM or thread instead of a Telegram message. The agent would have access to the full history of any project channel I gave it. It could search across conversations, code context, and workflow results in one query. When it takes an action — commits code, approves a workflow, sends a review — that action is signed and logged alongside everything a human collaborator does.

That's meaningfully different from what I have now, where the agent is a smart tool that responds well but lives outside the actual record of work.

## What's still early

Buzz shipped functional but incomplete. A few honest gaps:

**No mobile app.** Desktop only, which is a significant limitation for async team use. People don't stop working when they close their laptops.

**No hosted option.** You run your own relay. For developers, that's fine — the self-sovereignty argument is real and the setup is straightforward. For teams without infrastructure people, it's friction that will keep Buzz out of a lot of places that could benefit from it.

**Federation isn't there yet.** Nostr is a federation-native protocol and Buzz is built on it, so federation is architecturally plausible. But "architecturally plausible" and "shipped" are different things. Right now you're on your own relay, talking to people on your own relay.

**Full git hosting is being wired up.** The PR model — patches as signed events in a thread — is where Buzz starts to diverge most from existing tools. It's also the feature that makes the "feature branch = channel" thesis fully coherent. Until it ships, you'd be running Buzz alongside GitHub rather than instead of it.

None of these are reasons to dismiss Buzz. They're reasons to watch it. The architecture is right even when the implementation is unfinished.

## Why this matters

There's a version of "AI in the workplace" that's become a genre: AI that fills feeds, AI that summarizes things, AI companions that make work feel less lonely. That framing treats AI as something that serves the human workflow from outside it.

Buzz is a different thesis: agents as equal members of a network, doing real work alongside people, with the same access to shared context and the same audit trail. Call it social AI if you want a label. The point is that agents stop being tools you invoke from outside the work and start being participants in the work.

That distinction matters for what agents can actually do. A participant with access to the full conversation can make decisions that require context. A tool invoked from outside can only work with what you hand it.

I don't know whether Buzz will be where this lands or whether it'll be an early draft that informs something else. What I'm confident about: the framing is correct. Agents need equal standing — same identity model, same history access, same audit trail — to be genuinely useful collaborators rather than sophisticated autocomplete.

Block built that at the protocol layer. That's the hard part. The rest is implementation.

Source: [github.com/block/buzz](https://github.com/block/buzz)
