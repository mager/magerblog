---
title: "OpenSpec: Spec-driven development that survives a real codebase"
description: "AI agents confidently build the wrong thing when requirements live only in chat. OpenSpec adds a lightweight spec layer — explore, propose, build, archive — that keeps your agent honest and leaves a history it can read back. Here's how it works, with a real change from a skills discovery portal I've been building."
pubDate: 2026-08-19
category: tech
keyword: "OpenSpec"
draft: true
tags: [openspec, sdd, spec-driven-development, agents, ai, tooling]
---

I've been building a skills discovery portal at work, and the part that keeps biting me is the same one that bites anyone driving an agent on a real codebase: the agent confidently builds *something* off a vague prompt, and it's only halfway through — after 400 lines — that you discover it built the wrong thing. Code review gets heavier. The codebase moves faster than anyone can track. The bottleneck isn't the model. It's underspecification.

[OpenSpec](https://openspec.dev) is the tool I reached for, and the reason I'm writing this. It's an open-source spec-driven development (SDD) framework that adds a lightweight spec layer between you and your AI coding assistant, so you agree on what to build before any code is written. It's a YC W26 project (company: Fission, founder Tabish Bidiwale), ~65k GitHub stars, MIT-licensed, and it works with 30+ assistants via slash commands — Claude Code, Cursor, Copilot, Codex, the lot. No IDE lock-in.

The thing that hooked me wasn't the planning step. It was what happens *after* — the specs live in the repo, and every change leaves an archive. My agent reads back the history of every change and knows exactly what happened and what the current state is. That's the part I want to explain, because it's the part the docs undersell.

## What OpenSpec is

A lightweight agreement layer. You write down what a change should do, the AI drafts the details, you both look at the same plan, and only then does code get written. The whole idea in five words: **agree first, then build confidently.**

Two folders do the work:

```
openspec/
├── specs/              # Source of truth — how the system behaves today
│   └── <domain>/
│       └── spec.md
└── changes/            # Proposed updates — one folder per change
    └── <change-name>/
        ├── proposal.md
        ├── design.md
        ├── tasks.md
        └── specs/      # Delta specs (what's changing)
```

`specs/` is what's true right now. `changes/` is what you're proposing. When the work is done, you archive the change and its deltas merge into the main specs. The cycle closes.

The reason this matters more than it looks: other tools use requirements during planning and then throw them away. OpenSpec keeps them — checked into the repo, versioned, readable by the next session. Six months later, the spec tells you (and the next agent) *why* the system works the way it does, not just what it currently does.

## The mental model

Five ideas. Learn these and the rest is detail.

**1. Specs are the truth.** A spec describes how your system behaves *right now*, in `openspec/specs/`, organized by domain. Requirements use RFC 2119 keywords (`MUST`/`SHALL`, `SHOULD`, `MAY`) and scenarios are concrete GIVEN/WHEN/THEN:

```
### Requirement: Session Timeout
The system SHALL expire a session after 30 minutes of inactivity.

#### Scenario: Idle timeout
- GIVEN an authenticated session
- WHEN 30 minutes pass with no activity
- THEN the session is invalidated and the user must re-authenticate
```

The test for a good requirement: *could a tester who's never seen the code tell whether it passed?* If not, it needs sharpening.

**2. A change is one unit of work.** When you want to add, modify, or remove behavior, you create a change — a folder holding everything about that work in one place: a proposal, a design, a task list, and the spec edits. One change, one folder, one feature.

**3. Delta specs describe what's changing, not the whole world.** This is the trick that makes OpenSpec good on existing codebases. Inside a change, you don't rewrite the entire spec. You write a small delta:

```
## ADDED Requirements
### Requirement: ...
## MODIFIED Requirements
### Requirement: ...  (full new version; note what changed)
## REMOVED Requirements
### Requirement: ...  (with a line on why)
```

On archive, ADDED gets appended to the main spec, MODIFIED replaces the old version, REMOVED is dropped. You describe the diff, not the destination — which means you can specify a change to a large existing app without first documenting the whole thing. This is the property that makes it usable at work. Most SDD tools assume you're starting fresh.

**4. Artifacts build on each other — as enablers, not gates.**

```
proposal ──► specs ──► design ──► tasks ──► implement
   why        what       how       steps      do it
```

This phrase shows up everywhere in OpenSpec, and it's the thing that separates it from old-school spec processes. Those are waterfalls: finish planning, *then* you're allowed to implement, and going back is painful. OpenSpec refuses that. The order shows what becomes *possible* next, not what you're *forced* to do. Discover during implementation that the design was wrong? Edit `design.md` and keep going. Realize the scope should shrink? Update the proposal. Nothing locks.

The strength is honesty — real work is messy and iterative, and OpenSpec lets it be. The tradeoff is discipline: because nothing forces you forward, it's on you to keep a change focused rather than letting it sprawl.

**5. Archiving folds the change back into truth.** When the work is done, you archive the change. Its delta specs merge into your main specs, and the change folder moves to `changes/archive/` with a date stamp. Now your specs describe the new reality, and you're ready for the next change.

## The workflow, with a real change

The loop you actually run, with the slash commands typed into your AI assistant's chat:

```
/opsx:explore → /opsx:propose → /opsx:apply → /opsx:sync → /opsx:archive
  (think)        (agree)         (build)       (merge)      (record)
```

Two command surfaces, and mixing them up is the most common early stumble: `openspec ...` commands run in your terminal; `/opsx:...` commands run in your AI assistant's chat. That's it.

Here's how this went on the skills discovery portal. I wanted to add a way to search skills by tag and filter by category — fuzzy enough that I wasn't sure of the cleanest path. So I started with explore.

**`/opsx:explore` — think before you commit.** This is the move I've come to love. It's a no-stakes thinking partner: it reads your code, lays out options, and turns a fuzzy idea into a concrete plan *before any artifact or code exists*. It doesn't write a change folder, specs, or code — it just investigates and talks through tradeoffs with you.

```
You: /opsx:explore

AI:  What would you like to explore?

You: I want tag search + category filter on the skills portal,
     but I'm not sure how to do it cleanly against the existing
     catalog structure.

AI:  Let me look at your catalog setup...
     [reads the catalog index, the existing search path, the UI]

     Here's what I found. Two clean paths:
     1. Extend the existing search index to carry tags — small,
        reuses what's there, filters compose for free.
     2. Separate faceted filter layer — more flexible, but a new
        abstraction over a catalog that's already working.

     Given your catalog already indexes by name, path 1 is a
     small change with the biggest payoff. Want me to scope that?

You: Yes, let's do the index extension.
```

Twenty seconds of exploration turned "something I want but can't quite shape" into a named approach with a recommendation tied to my actual code. That's the cure for an AI that would otherwise confidently build the wrong thing from a vague prompt.

**`/opsx:propose add-tag-search` — agree before you build.** This drafts all the planning artifacts in one step:

```
AI:  Created openspec/changes/add-tag-search/
     ✓ proposal.md — why we're doing this, what's changing
     ✓ specs/       — requirements and scenarios (the deltas)
     ✓ design.md    — technical approach
     ✓ tasks.md     — implementation checklist
     Ready for implementation!
```

The delta spec it produced:

```markdown
# Delta for Catalog

## ADDED Requirements

### Requirement: Tag-based search
The system SHALL allow users to search skills by tag.

#### Scenario: Single tag filter
- GIVEN a catalog with tagged skills
- WHEN the user selects a tag
- THEN only skills with that tag are shown

#### Scenario: Multiple tag combination
- GIVEN a catalog with tagged skills
- WHEN the user selects two tags
- THEN only skills matching both tags are shown
```

Then you read it. This is the step that pays for the whole framework. Reading a one-paragraph proposal and catching a misunderstanding is free. Catching it after the AI wrote 400 lines is not. You tighten a vague `SHALL`, delete a scenario that tests nothing, add the edge case it missed. It's plain Markdown.

**`/opsx:apply` — build it.** The AI works through the task list, checking off tasks as it goes:

```
AI:  Implementing tasks...
     ✓ 1.1 Extend catalog index to carry tags
     ✓ 1.2 Add tag filter to search query
     ✓ 2.1 Wire tag chips into the UI
     All tasks complete!
```

During implementation, if you discover the design needs adjusting, you just update the artifact and continue.

**`/opsx:archive` — fold it back into truth.**

```
AI:  Archived to openspec/changes/archive/2026-08-19-add-tag-search/
     Specs updated. Ready for the next feature.
```

Your delta specs are now part of the main specs, documenting how your system works. The change folder is preserved with a date stamp.

## The part I actually love

Here's what I didn't expect to matter as much as it does. Every change leaves an archive. Which means my agent has the full history of every change — the proposal, the design decisions, the deltas, the tasks — all sitting in the repo. When I start a new session and ask the agent to work on something adjacent, it reads `openspec/specs/` to know the current state, and it can page through `changes/archive/` to know exactly what happened and why.

That's the thing the docs undersell. The planning step is the headline feature, but the persistent record is what changes how the agent behaves over time. It's not relying on chat history that evaporates when a session ends. The context is *in the codebase*. An agent — or a new developer — can browse the library and understand the system without spelunking through commits or Slack.

This is the real payoff of "specs live in your code." It's not just documentation. It's a memory the agent can read back.

## Where it shines, where it hurts

**Where it pays off:**

- **When the task is fuzzy.** The fuzzier the task, the more explore earns its keep. The clearer the task, the more you can skip straight to proposing.
- **On existing codebases.** Delta specs mean you can adopt OpenSpec without first documenting the whole system. You specify what's changing; the rest fills in over time.
- **When review is getting heavy.** A change folder is a tidy package: read the proposal, skim the deltas, check the tasks. No archaeology through chat history. It's async-review-friendly.
- **For multi-step work.** The plan-then-build rhythm catches wrong turns at the cheapest possible moment.

**Where the friction is:**

- **It adds a step.** You write a short plan before building. For a one-line typo fix, the ceremony isn't worth it — and OpenSpec's own docs say so. Match the ceremony to the stakes.
- **Discipline is on you.** Because nothing forces you forward (that's the "enablers not gates" philosophy), it's your job to keep a change focused. The most common authoring mistake isn't a badly worded requirement — it's a change that's trying to be three changes. If the proposal reads like a list of unrelated features, split it.
- **It wants high-reasoning models and clean context.** The README recommends Codex 5.5 and Opus 4.7 for both planning and implementation, and benefits from a clean context window. On a cheaper model the proposal drafts get noticeably weaker, which is fine for execution but hurts at the planning step where quality matters most.

## How it compares

- **vs nothing** — AI coding without specs means vague prompts and unpredictable results. OpenSpec brings predictability without the ceremony.
- **vs [Spec Kit](https://github.com/github/spec-kit)** (GitHub) — Thorough but heavyweight. Rigid phase gates, lots of Markdown, Python setup. OpenSpec is lighter, lets you iterate freely, and needs no Python — a few minutes to set up vs closer to thirty.
- **vs [Kiro](https://kiro.dev)** (AWS) — Powerful, but you're locked into their IDE and limited to Claude models. OpenSpec works with the tools you already use.

## When it's worth it

The honest tradeoff: OpenSpec isn't free. It's designed to be lightweight, but it adds a step. Use it where agreement matters — which turns out to be most of the time once you're working with an AI that will confidently build whatever you vaguely asked for. For trivial fixes, skip it. For anything where the wrong turn costs more than a paragraph of proposal, the overhead pays for itself fast.

For me, on the skills portal, it's become the default. Explore the change, read the spec, watch it build, archive. And next session, the agent already knows where things stand.

Source: [openspec.dev](https://openspec.dev) · [github.com/Fission-AI/OpenSpec](https://github.com/Fission-AI/OpenSpec)
