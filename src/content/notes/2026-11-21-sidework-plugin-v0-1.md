---
title: "Sidework plugin v0.1: Monitor open source projects"
description: "The Sidework plugin reads GitHub review comments and helps me pick up where I left off."
pubDate: "2026-11-21"
link: "https://github.com/mager/sidework/releases/latest"
linkText: "Get the Sidework plugin"
category: tech
tags: [Sidework, GitHub, open source, agents]
---

When I get back to an open source project, I want to know which pull request needs my attention and why. Did a reviewer ask for a change? Is a thread still open? Am I waiting for another review?

I built the Sidework plugin for Claude Code, Codex, and OpenCode around two tasks.

- **Import a project.** Ask your agent to add the current repository to Sidework. It gives you a link to review. Confirm the import on the website to save the project to your private workbench.
- **Check your PRs.** Choose the upstream pull requests you want to watch. The plugin reads GitHub reviews, comments, and thread status, then links you to the evidence for each next action. You can run a check on demand or schedule it to report changes.

I tried the watcher on my Impeccable pull request. It showed the merged status and kept the review thread available for context. A merged PR drops out of the action queue even if its review comments are still visible. [Impeccable pull request](https://github.com/pbakaus/impeccable/pull/1213)

Install Sidework in your agent and try “Import this repository into Sidework” or “What’s next on my open source PRs?” The install guide covers the tools you need for PR checks. [Install Sidework](https://github.com/mager/sidework/tree/main/plugins/sidework)
