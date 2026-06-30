---
title: "Claude: from Skills to Agents to Agent Teams"
description: "A Skill is packaged know-how. An Agent is that know-how put to work autonomously. Agent teams are where the work scales past what any single context can hold."
pubDate: 2026-06-30
category: tech
draft: true
tags: ["tech", "ai", "claude", "agents", "skills", "workflows"]
---

Most developers using Claude have figured out that prompting works. What they haven't figured out yet is what comes next — and what comes next is a lot more interesting than better prompts.

I wrote about [Skills vs Workflows](/blog/2026-06-13-claude-skills-vs-workflows) earlier — that post is about the difference between packaged know-how and explicit pipelines. This one goes one level deeper: what it means to turn a Skill into an Agent, and what it means to run multiple Agents together.

The progression I've landed on: single-chat prompting → Skills → Agents → Agent teams → Advisor model. Most people are stuck at step one. This post is for people ready for steps two and three.

---

## What a Skill is

A Skill is packaged know-how. It's a set of instructions — and sometimes tools — that teaches Claude how to do one specific thing consistently. You define it once; Claude reaches for it when the task matches.

The key property: Skills are **model-invoked**. You don't call a Skill directly. Claude decides to pull it in when the situation calls for it. You define what the Skill is for; Claude applies it opportunistically.

A few concrete examples of what lives well as a Skill:

- A **code-review** Skill that applies your team's rubric — naming conventions, test coverage requirements, the things you'd say in every PR review.
- A **tone-check** Skill that matches your brand voice and catches the drift before a draft goes out.
- An **SEO-audit** Skill that checks frontmatter, description length, and keyword placement against your house rules.

The point of a Skill is consistency without re-explanation. You've taught Claude to do X well once. From that point on, it does X the same way — without you re-prompting the rules into every session.

Skills don't run on their own. They're invoked. They don't make decisions. They apply know-how when called.

---

## What an Agent is

An Agent is a Skill that moves.

When you give a Skill autonomy — a goal, the authority to take actions, and the ability to decide what to do next — it becomes an Agent. An Agent doesn't wait to be asked for each step. It reasons, acts, observes the result, and continues until the task is done.

The distinction is this: a Skill tells Claude *how* to do something. An Agent tells Claude *what* to accomplish and lets it figure out *how*.

A code-review Skill tells Claude: "here's the rubric, apply it." A code-review Agent tells Claude: "here's the PR — fetch the diff, apply the rubric, post findings as inline comments, and flag anything that needs a human look." The Skill is a capability. The Agent is the task completing itself.

The other difference is that Agents can span multiple steps with decision points in between. If step two depends on the result of step one, an Agent handles that branching. You define the goal and the tools; the Agent works out the path.

---

## When to use which

Use a **Skill** when:
- The task is well-defined and bounded.
- You want Claude to apply the same judgment consistently, across many different sessions.
- The output is information or a draft, not a completed action.
- You want it triggered opportunistically — "when this kind of task comes up, do it this way."

Use an **Agent** when:
- The task requires multiple steps with decisions along the way.
- Completion requires taking actions in external systems — pushing a commit, sending a message, updating a record.
- You want it to run without hand-holding.
- The task can be triggered by a schedule or event, not just a user message.

There's also a practical signal: if you find yourself re-prompting the same multi-step task repeatedly, and doing a small bit of coordination between steps yourself, that coordination wants to be an Agent. The Agent should be the one deciding whether to proceed after step two, not you.

---

## Agent teams and the principal-agent model

The single-agent pattern has a ceiling: one context window, one thread of work, one set of tools. For tasks that are large, multi-domain, or genuinely parallel, a single Agent runs into limits.

Agent teams solve this. The model is simple: one **principal agent** who understands the high-level goal, and multiple **specialist sub-agents** who each own a domain. The principal delegates; the specialists execute and report back; the principal synthesizes.

Concrete example: a research agent might have three sub-agents — one that handles web search, one that summarizes long documents, and one that fact-checks claims against trusted sources. The principal receives the task, fans the work out to the specialists, and assembles the result. None of the specialists need to know what the others are doing. Each one just gets a task and returns a result.

The sub-agents are narrow by design. Narrow means better at their domain, easier to test, and cheaper to run (they don't need the full context the principal holds). The principal's job is routing and synthesis, not execution.

What makes this pattern powerful over time is that each piece can improve independently. A specialist sub-agent can be refined — better instructions, evals, memory — without touching the principal. The principal can get better at routing — knowing which sub-agent to trust for which kind of task — without touching the specialists. The system compounds.

---

## The advisor model

The advisor model is the next step past a fixed agent team.

In a fixed team, you define the specialists upfront and they stay constant. In the advisor model, the principal agent maintains a **roster of specialists that evolve**. Each specialist develops domain expertise over time through memory, evals, and refined instructions. The principal gets better at knowing who to ask and when to trust the answer.

Think of it like a senior person with a strong network. They don't know everything, but they know who knows what — and over time they know which sources are reliable for which kinds of problems.

The operating pattern is: principal receives a task → routes to the relevant specialist(s) → reviews the results → synthesizes the answer → optionally loops back for a follow-up if the first pass doesn't close it. The principal is not a bottleneck. It's a coordinator.

This is the model I run my own tooling against. The always-on session on my Mac mini is a principal agent. The magerblog agent, the research agent, the Japanese tutor — those are specialists. The principal handles routing. The specialists handle execution. When I send a Telegram DM, the principal decides who does the work.

---

## How to actually build this

The minimal version of a Skill is a markdown file. A name, a description of what it does, and instructions. Claude loads it when the task matches. That's step one.

The minimal version of an Agent is a Skill plus: a goal statement (not just a task), tool access (what external systems can it reach), and a completion condition (how does it know it's done). Add a trigger — a schedule, an event, a webhook — and it runs without you.

The minimal version of an agent team is two files and a router. A principal Agent that reads the task and decides which sub-agent to call, and one or more specialist Agents that return structured results. You don't need a framework for this. You need clear interfaces between the agents — what goes in, what comes out, and what counts as done.

[Claude's Agents SDK](https://docs.anthropic.com/en/docs/agents) handles the plumbing for multi-agent sessions: managed handoffs, shared context where needed, tool permissions scoped per agent. For reference architectures, [mager-bench](https://github.com/mager/mager-bench) and [claude-voice](https://github.com/mager/claude-voice) are minimal examples of single agents with clear task definitions and bounded tool access.

The complexity scales from one file to a directory of Agents without breaking the mental model. The concepts stay the same; only the number of moving parts grows.

---

## The natural progression

Single-chat prompting is where everyone starts. It works until you need consistency.

Skills are where you stop re-explaining yourself. You teach Claude once, and it applies that knowledge the same way from then on.

Agents are where you stop babysitting the task. You define a goal, hand it off, and get a result — without managing the steps in between.

Agent teams are where the work scales past what any single context can hold. The principal orchestrates; the specialists execute; the system gets better over time.

Most people are still at step one. The jump to Skills is smaller than it looks. The jump from Skills to Agents is mostly a mindset shift: from "what should Claude do here" to "what should Claude be responsible for finishing." Once that shift happens, the rest follows.
