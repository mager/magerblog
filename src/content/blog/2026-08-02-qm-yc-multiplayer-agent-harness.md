---
title: "qm: YC's multiplayer agent harness and the identity problem"
description: "YC open-sourced qm, a multiplayer agent harness for startups. I run the single-player version — what's real, what's hard, and what enterprises should watch."
pubDate: 2026-08-02
category: tech
keyword: "qm"
heroImage: ""
draft: false
tags: [ai, agents, open-source, qm, yc, infrastructure]
---

Y Combinator open-sourced [qm](https://github.com/yc-software/qm) this week — an MIT-licensed "multiplayer agent harness" that's sitting at around 7,100 stars and 740 forks as I write this. The pitch: unlike personal-assistant-style agents, qm is designed for startups. Every employee gets their own isolated agent workspace, and everyone can also collaborate with the agent in channels, group messages, and projects.

I have an unusual vantage point on this one. For most of this year I've been running the single-player version of exactly this architecture: an always-on Claude Code harness on a Mac mini in Chicago, reachable over Telegram, with a subagent per product, [gbrain](/blog/2026-05-20-gbrain-brain-migration/) as the semantic memory layer, and a self-hosted [Buzz relay](/blog/2026-07-24-buzz-explainer/) as the collaboration log. qm is what happens when someone takes that shape and asks: what if it were a company's, not one person's?

So rather than review it from the outside, I want to do two things: say which parts of the design I can vouch for from living in it, and be honest about the parts the [Hacker News thread](https://news.ycombinator.com/item?id=49126604) is right to poke at.

## What qm actually is

The core is a headless Node.js/Fastify service. Postgres holds sessions, memory, and queues. Each scope — a person, a channel, a project — gets its own isolated sandbox where installed tools persist between runs. Slack integration and the web UI (Vite + Lit) are plugins over an HTTP API, not the product itself.

Two design decisions stand out.

First, it's harness-agnostic. The thing that talks to the model is swappable — Pi, OpenCode, Codex, or Claude Code can all drive the same core. Your org's scopes, memory, and security posture don't change when you swap the engine underneath.

Second, security is a three-tier dial. **Strict** pauses every tool call for human approval. The middle tier runs a classifier that screens external data before the model processes it. **Dangerous** turns off screening entirely. The name is doing honest work — more on this below.

Beyond that: background automation via crons and watches, custom internal web apps with per-user access control, and shared skills that are owned by a scope, with promotion to org level gated behind an admin. Install is one command:

```bash
npm exec --yes --package=@yc-software/qm@latest -- qm init . --org <slug> --target <fly-or-aws>
```

Orgs keep private forks and put their customizations in `deploy/layers/`, so pulling upstream doesn't clobber your local changes. That's a small detail that matters a lot in practice, and I'll come back to it.

## The parts I can vouch for

Three design calls in qm match what I learned the hard way running my own setup.

**Isolated workspaces are the actual product.** My harness runs one subagent per product — magerblog, beatbrain, prxps, kotsu — precisely because a single shared context bleeds. When everything lands in one session, context from one project contaminates another, and the only defense is discipline. Isolation by structure beats isolation by discipline every time. qm making per-scope sandboxes the default unit, with persistent installed tools per sandbox, is the right call and it's the part that's hardest to retrofit later.

**Memory has to be a system, not a file.** I moved my agent's brain from @-imported flat markdown into gbrain's Postgres-backed semantic memory, and the difference is not subtle — structured write-back, queryable context, no hand-curation. qm putting memory in Postgres from day one, per scope, skips the flat-file phase entirely, which is the right order of operations.

**Harness-agnostic is the right bet.** I flagged this pattern in the Buzz post: the seam between "the coordination layer" and "the agent that does the work" is standardizing, and any system that welds itself to one model vendor is making a bet it doesn't need to make. qm treating Claude Code, Codex, Pi, and OpenCode as interchangeable engines under a stable core is the same instinct, and it's correct.

There's also a lineage here worth naming. YC has been iterating toward this in public: [gstack](/blog/2026-03-28-gstack-garry-tan-claude-plugin/) was Garry Tan's opinionated skill set for one developer, gbrain was memory as infrastructure, and qm is the org-scale composition of both ideas. I've adopted the first two into my daily setup, so I'm predisposed to take the third seriously.

## The skepticism, taken seriously

The HN thread breaks into three camps: people excited about the architecture, people asking what's actually new here, and people who think YC shipping over-engineered open source is a symptom of the accelerator having a crisis of meaning post-AI. The third camp is a vibes argument and I'll leave it alone. The second deserves a real answer.

**"What does multiplayer even mean?"** The sharpest version of the critique: this feels like existing agent tools plus concurrent access — Claude Code with more users, Hermes with a Slack plugin. If "multiplayer" just means multiple people can hit the same endpoint, it's marketing.

My take: concurrent access is not multiplayer, and the difference is three specific things — scoping, shared memory, and an audit trail. Multiplayer means my workspace and your workspace are structurally isolated but the org's knowledge accumulates somewhere both of us (and the agent) can draw on, and every action is attributable after the fact. That combination is genuinely different from N people sharing an agent, in the same way Google Docs is different from emailing a file around. Whether qm *delivers* all three cleanly is an empirical question — it's weakest on the attribution leg, which is the next section. But the category is real. I know because the lack of it is the wall my single-player setup hits: my subagents can't see each other's work, and I've been assembling the multiplayer layer myself out of a Buzz relay and shell scripts.

**The anti-slop skill.** qm ships a house-style skill with rules like a total ban on em-dashes, and HN roasted it — one commenter compared the rule-chasing to "the breathless faddishness of celebrity news," another pointed out the README itself uses em-dashes. The critics are right on the substance: banning surface features of AI writing creates tells that expire the moment models stop producing them, and you can't rule your way into taste. But it's a skill, in a system where skills are explicitly meant to be replaced per-org. Judging the harness by its default style guide is judging the frame by the demo photo. Fair hit, wrong target.

**"If the agent is acting as me, it can do anything I can do."** This is the best comment in the thread, and it's not really a critique of qm — it's the unsolved problem of the whole category.

## Identity is the real problem

qm's security tiers manage *what the agent is allowed to do*. They don't answer *who the agent is when it does it*. Those are different problems, and the second one is harder.

I've felt this concretely. My setup has an allowlist on the Telegram channel, and when the harness mirrors work into the Buzz relay, it signs with a dedicated bridge key — never my key, never the agent's own — so the audit log permanently shows bridged traffic as bridged. That rule exists because early on I realized an unattributed action in a log is worse than no log: it manufactures false confidence. Buzz solves this with per-participant keypairs; every agent action is signed as the agent.

For an enterprise, this is the central question. An agent that acts *as an employee* — their Slack identity, their credentials, their permissions — inherits the employee's entire blast radius, and the audit trail reads as if the human did everything. What enterprises actually need is agents as first-class principals: their own scoped credentials, their own entries in the audit log, permissions granted to the agent rather than borrowed from a person. qm's per-scope sandboxes are a step in that direction. Signed, per-agent identity is the destination, and nothing in this category — qm included — has fully shipped it.

## If you're evaluating this at a big company

qm is startup-shaped today. That's not a dismissal — it's a description of where the defaults sit. Here's how I'd read it from inside a large org:

- **Strict mode is your default.** Every tool call paused for human approval sounds unusable until you remember it's exactly the maker-checker pattern your finance systems already run on. Start Strict, loosen per-scope with evidence. The fact that qm names its permissive tier "Dangerous" instead of "Advanced" is a small sign the authors are being straight with you.
- **The `deploy/layers/` fork model is more enterprise-friendly than it looks.** A private fork with customizations isolated in layers means you can track upstream without a standing merge war. This is the pattern that makes MIT + self-host real rather than theoretical.
- **MIT license, your own AWS account, Postgres you operate.** That's a compliance story your security team can actually evaluate — no vendor data processing agreement, no SOC 2 report to chase, because the data never leaves your infrastructure. The tradeoff is equally plain: you're the operator now, and "npm exec into prod" needs to become a real deployment pipeline before this touches anything regulated.
- **Admin-gated skill promotion is a governance primitive.** Skills born in personal scopes, promoted to org level only through an admin, is a review boundary for agent capabilities — the same shape as a package approval process. It's the beginning of an answer to "how do we control what our agents can learn to do," which is a question your risk team is going to ask.
- **What to watch for:** SSO/SCIM integration, retention and legal-hold on the Postgres event history, and above all the identity question from the previous section. If your compliance regime requires knowing whether a human or an agent performed an action, qm's current model will need work before it satisfies an auditor. Ask that question first; it's the one the category hasn't answered.

## Where this lands

The honest summary: qm's architecture matches what I independently converged on by building the single-player version — isolated scopes, real memory, swappable harness — which makes me think the shape is right, not just fashionable. The multiplayer claim is more than concurrent access, but only if the scoping, shared memory, and attribution legs all hold, and the attribution leg is the industry's open problem, not qm's solved one.

I'm not migrating my Mac mini to it. One person doesn't need multiplayer, and my Telegram-plus-subagents setup already does the single-player job. But if I were starting a ten-person company on Monday, this is the first thing I'd deploy — in Strict mode — and I'd be watching one thing: whether the agents get their own names in the log.

Source: [github.com/yc-software/qm](https://github.com/yc-software/qm) · Discussion: [Hacker News](https://news.ycombinator.com/item?id=49126604)
