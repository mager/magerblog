---
title: "Claude Skills vs Workflows: when Claude decides vs when you do"
description: "A Skill is reusable know-how Claude reaches for on its own. A Workflow is an explicit pipeline you wire up and control. Here's the difference, what you can build with each, and when to reach for which."
pubDate: 2026-06-12
category: tech
tags: ["ai", "claude", "skills", "workflows", "automation", "agents"]
keyword: "AI agents"
---

If you've spent any time around Claude or Claude Code lately, you've probably bumped into two words that sound like they mean the same thing: **Skills** and **Workflows**. They don't. And the difference is the whole game once you start using Claude for real work instead of one-off questions.

The short version: a Skill is something Claude *knows how* to do. A Workflow is a *process you run*. One is reached for; the other is wired up.

Let me unpack that, because the distinction changes what you build.

---

## What a Skill is

A Skill is a packaged, reusable capability. It's a bundle of instructions — and sometimes tools — that teaches Claude how to do one specific thing well, every time.

The key property is that Skills are **model-invoked**. You don't call a Skill. Claude decides to pull it in when the task in front of it matches. You describe what the Skill is for, and Claude loads it on demand when it's relevant.

A few concrete examples:

- A **design-critique** Skill that knows your rubric — hierarchy, spacing, contrast — and applies it consistently whenever you paste in a UI.
- An **SEO-audit** Skill that checks a post's frontmatter, description length, and keyword placement against your house rules.
- A **commit-message** Skill that writes messages in your team's exact convention, every time, without you re-explaining the format.

The point of a Skill is consistency. You've taught Claude to do X well once, and now it does X the same way forever — without you re-prompting the rules into every conversation. It's a tool in the belt. Claude reaches for it when the moment calls for it.

---

## What a Workflow is

A Workflow is the opposite posture. Instead of letting Claude decide, *you* define an explicit, multi-step sequence and Claude runs it.

A Workflow is orchestration. You wire together steps in order. You add conditions and branching. You pass data from one step to the next. You can schedule it, or trigger it off an event. The emphasis shifts from "Claude figures out what to do" to "this is the exact pipeline I want executed."

Think of the difference like this. A Skill is a single capability Claude might use. A Workflow is the assembly line — a defined route that inputs travel down, hitting each station in a known order, producing a known output.

And here's the part that ties it together: **Workflows can call Skills as steps.** A weekly-digest Workflow might use your summarization Skill at one stage and your SEO-audit Skill at another. The two concepts compose. You're not choosing between them so much as deciding which layer you're operating at.

---

## The core difference, in one line

- **Skill** = reusable know-how Claude reaches for opportunistically.
- **Workflow** = explicit orchestration you define and control.

Skills are about *capability*. Workflows are about *process*. Skills answer "can Claude do this well?" Workflows answer "will this run the same way every time, whether or not I'm watching?"

---

## What you can actually build with Workflows

This is where Workflows earn their keep. Because you control the orchestration, you get all the machinery you'd expect from a real pipeline:

- **Chain steps** — output of one feeds the input of the next.
- **Branch on conditions** — if the audit fails, route to a fix step; if it passes, publish.
- **Pass data between steps** — structured handoffs, not "remember what we said earlier."
- **Schedule or trigger** — run on a cron, fire on a webhook, kick off when an email lands.
- **Human-in-the-loop** — pause for an approval before anything ships.
- **Fan out to subagents** — split a big job across parallel agents and collect the results.
- **Integrate external tools and MCP servers** — pull from your calendar, your repo, your database.
- **Repeatable and auditable** — same run, same shape, with a record of what happened.

That last point is the quiet one that matters most. A Workflow runs the same way every time, and you can see what it did. That's a property a freeform chat session simply doesn't have.

---

## Why you'd want this — personal use

For personal use, Workflows are the cure for the chores you keep re-prompting.

I have a handful of recurring jobs that used to start with me re-explaining the task: a weekly digest of what shipped, an inbox triage pass, an SEO audit on new blog posts, a scrape-and-summarize on a few sources I follow. Every one of those was the same prompt, retyped, with slightly different wording each time — which meant slightly different results each time.

A Workflow fixes that. You define it once. It runs the same way on Monday as it did last Monday. You stop being the glue between steps, and you stop introducing drift just by phrasing the request a little differently than last week.

The rule of thumb: if it's a task you find yourself re-prompting, and you want it to come out the same every time, it wants to be a Workflow.

---

## Why you'd want this — enterprise use

At a company, the case gets stronger, because the problems Workflows solve are exactly the problems teams have.

A team needs **standardized, governed, repeatable** processes — not five engineers each prompting Claude their own way and getting five different results. Workflows let you encode a vetted pipeline once: an onboarding runbook, a release checklist, a compliance review that produces an audit trail you can actually hand to someone.

They also solve **prompt drift**, which is a real and underrated tax. When the "right way" to do something lives in a prompt that everyone reinvents, quality slides quietly. A Workflow pins it down.

And they lower the bar for who can run a process. A non-expert can trigger a vetted Workflow and get the same vetted result an expert would — without needing to know the prompt engineering underneath. The expertise lives in the pipeline, not in the person typing.

---

## When to reach for which

Here's the rule of thumb I'd give anyone starting out:

> If you want Claude to **know how** to do something well, build a **Skill**.
> If you want a **repeatable, controlled process**, build a **Workflow**.

And honestly, most of the time you want both. You build Skills for the capabilities — the things Claude should do consistently well — and you build Workflows for the processes that string those capabilities into something that runs on its own.

Skills make Claude better at the work. Workflows make sure the work actually gets done, the same way, every time. Once that clicks, you stop thinking about Claude as a thing you chat with and start treating it as something you can build on.
