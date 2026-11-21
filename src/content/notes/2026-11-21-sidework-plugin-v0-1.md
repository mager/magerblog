---
title: "What’s next on my open source PRs?"
description: "The Sidework plugin reads GitHub review comments and helps me pick up where I left off."
pubDate: "2026-11-21"
link: "https://github.com/mager/sidework/releases/tag/plugin-v0.1.1"
linkText: "Sidework plugin v0.1.1"
category: tech
tags: [Sidework, GitHub, open source, agents]
---

When I get back to an open source project, I ask my coding agent, “What’s next for us?” I want to know whether a reviewer asked for a change, replied to a thread, or is still waiting on me.

I built the Sidework plugin for Claude Code, Codex, and OpenCode. It uses my GitHub CLI sign-in and has two skills.

- `sidework-init` keeps a local list of my public projects and lets me pick which upstream pull requests to watch.
- `sidework-pr-watch` reads the review threads and gives me the next action with a link to the comment. On a schedule, it reports changes and failed checks.

I tried it on a PR I opened in Impeccable. The check showed that the PR had merged. Its review thread was still there for reference. The plugin reads GitHub, and I decide when to make a change or reply. [The Impeccable PR](https://github.com/pbakaus/impeccable/pull/1213)

To try it, pick one upstream PR and ask, “What’s next on my open source PRs?” [Install Sidework and set up the review loop](https://github.com/mager/sidework/blob/plugin-v0.1.1/plugins/sidework/README.md).
