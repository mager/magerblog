---
title: "Claude Is Unhobbled. Your Context Engineering Is Not."
description: "Anthropic deleted 80% of Claude Code's system prompt for Opus 5 with no measurable loss. They called it unhobbling. Here's what that means for your harness."
pubDate: 2026-07-24
category: tech
keyword: "context engineering"
draft: false
tags: [ai, agents, claude, claude-code, context-engineering]
---

Thariq from Anthropic published something this week that deserves more attention than it's getting. [The new rules of context engineering for Claude 5 models](https://x.com/trq212/status/2080710971228918066) documents what happened when Anthropic audited their own Claude Code system prompt for Opus 5 and Fable 5: they deleted over 80% of it with no measurable loss on coding evaluations.

That's not a small tweak. That's a signal that the way we've been talking to agents needs to change.

## What "unhobbling" actually means

Anthropic's word for it is "unhobbling." The short version: many of the constraints they baked into Claude Code's system prompt were guardrails for older model behavior that Claude 5 no longer needs. Instead of helping, those guardrails were creating friction — conflicting instructions, over-specified rules that were wrong in edge cases, and context that crowded out the model's own judgment.

The specific example they give is sharp. The old system prompt said:

> In code: default to writing no comments. Never write multi-paragraph docstrings or multi-line comment blocks — one short line max.

That rule exists because older models would write excessive, often wrong comments. It solved a real problem. But it also fired in cases where multi-line documentation was exactly right — complex algorithms, public APIs, code that would genuinely confuse a future reader.

The new instruction: **"Write code that reads like the surrounding code: match its comment density, naming, and idiom."**

Same goal. Half the words. Trusts the model to read the room instead of following a rigid rule.

If you've been writing rules in your CLAUDE.md, there's a good chance some of them have the same problem.

## The then vs. now breakdown

Thariq lays out six shifts. The ones that matter most for anyone who's been building agent infrastructure:

**Rules → Judgment.** Stop writing "never do X" unless you have a specific, demonstrable failure mode that the model can't reason its way out of. Claude 5 can read context and match conventions. Let it.

**Examples → Interface design.** This one is counterintuitive. The old rule was: give Claude examples of how to use your tools. The new finding: examples constrain the model to a narrow exploration space. Instead, design your tool interfaces to be self-describing. If a parameter takes one of three states — `pending`, `in_progress`, `completed` — make it an enum. The type signature tells Claude more than an example does, and doesn't box it in.

**Everything upfront → Progressive disclosure.** You don't need every instruction in the system prompt or CLAUDE.md. Claude Code now supports skills that load at the right time and deferred tools that only expand their full schema when the agent searches for them. A verification workflow, a code review checklist, a specific deployment procedure — these don't need to sit in CLAUDE.md taking up context on every request. Put them in a skill and let the model load them when it needs them.

**Repeated instructions → Simple tool descriptions.** Older models sometimes needed reinforcement — the same guidance in the system prompt and the tool description. That's no longer necessary. Put instructions where they belong: in the tool description. Cut the duplicates.

**Manual memory → Auto-memory.** Claude Code now saves memories automatically when they're relevant. You don't need to design CLAUDE.md as a memory store. Keep it lightweight.

**Simple specs → Rich references.** Claude can handle increasingly complex references. Instead of a markdown spec, try an HTML mockup. Instead of a description of an expected output, write a test suite. A rubric — a structured description of what "good" looks like in a particular domain — is a better reference than a prose explanation.

## What this means if you've already built a harness

This is the enterprise problem. Engineering teams that invested in detailed CLAUDE.md files, comprehensive skill definitions, and tightly specified agent configurations now have technical debt — not in their product code, but in their context engineering.

The patterns that were right six months ago:

- Long CLAUDE.md files with every team convention documented
- Skills with detailed step-by-step instructions and examples for each use case
- Tool descriptions that mirror system prompt guidance as reinforcement
- Explicit rules for things Claude should figure out from the codebase

These aren't wrong exactly. They worked. But they're carrying weight the model no longer needs, and that weight creates the conflicting-instruction problem Anthropic describes: when your system prompt, your CLAUDE.md, your skill, and the user's request all have opinions on the same thing, Claude has to spend context resolving the conflict before doing the work.

The refactor looks like this:

- **CLAUDE.md**: Strip it to repo purpose + genuine gotchas. A gotcha is something Claude cannot infer from reading the codebase — a non-obvious architectural decision, a dependency quirk, a team convention that looks wrong until you know the reason. "We keep all types in `types.go` and nowhere else" is a gotcha. "Write clean code" is not.
- **Skills**: Move anything procedural out of CLAUDE.md and into skills. Each skill should encode one specific opinion or workflow — not a general reference for everything you might ever need.
- **Tool descriptions**: Move tool-specific instructions into the tool description and delete the mirror copy from wherever else it lives.
- **Rules**: For each explicit rule in your context, ask: would Claude get this right by reading the surrounding code and understanding the user's intent? If yes, delete the rule.

Anthropic ships `/doctor` in Claude Code to help automate some of this. Run it and see what it flags.

## The broader pattern

Every six months or so, the right amount of hand-holding decreases. The model gets better at reading context, matching conventions, and exercising judgment in ambiguous cases. The harness that was necessary last year is friction this year.

This doesn't mean context engineering gets less important — it means the skill shifts. The high-value work moves from writing guardrails to designing interfaces: building tools with expressive parameter schemas, structuring skills for progressive disclosure, creating rubrics and references that give Claude a clear target rather than a set of constraints.

The agents and skills you've built are still valuable. The underlying work — figuring out what your team's workflow looks like, what "good" means for your specific use cases, what context Claude actually needs — that investment carries forward. What you're refactoring is the encoding, not the knowledge.

Thariq's post is the starting point. The field guide for Fable 5 has more detail on model-specific prompting. And `/doctor` is the fastest way to see what in your current setup no longer needs to be there.

Source: [@trq212 on X](https://x.com/trq212/status/2080710971228918066)
