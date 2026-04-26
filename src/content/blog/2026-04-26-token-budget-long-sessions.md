---
title: "How I make tokens last longer"
description: "A simple set of habits I use to keep long AI coding sessions from getting bloated: better one-shot prompts, matching model and thinking level to the job, understanding cache behavior, and using cheaper orchestrators when it makes sense."
pubDate: 2026-04-26
category: code
draft: true
tags: [ai, prompting, llms, productivity]
---

I have been thinking a lot about token preservation lately.

Once you start using coding agents for real work, token burn stops being an abstract pricing detail and starts becoming part of interface design. A session that keeps re-explaining the same project, re-litigating the same intent, or using the heaviest possible model for every tiny step gets expensive fast.

The good news is that most of the waste is avoidable.

These are the habits I keep coming back to.

## 1. Get better at the one-shot prompt

The cheapest turn is often the one you do not need to have twice.

A lot of wasted tokens come from under-specifying the first ask, then spending five follow-up messages correcting the shape of the work.

When I want a strong first pass, I try to include:

- the exact thing I want built
- relevant constraints
- the intent behind it
- the context it needs
- why this change exists
- what good looks like

In practice that usually looks more like this:

```txt
Build a settings page for the predictions app.
Use SvelteKit 5 and the existing design tokens.
Do not introduce a new component library.
The goal is to make account, notification, and billing settings feel faster to scan on mobile.
Prefer inline editing over modal-heavy flows.
Keep copy short.
If there is a tradeoff, optimize for clarity over density.
```

And less like this:

```txt
make a settings page
```

This is not about writing huge prompts. It is about writing complete prompts.

There is a difference.

A compact prompt with clear intent, boundaries, and success criteria is often much cheaper than a vague prompt followed by six repair turns.

## 2. Put stable context in files, not in chat

If some context keeps coming up, it probably does not belong in the message thread.

Project conventions, design rules, architecture notes, preferred commands, writing voice, domain assumptions, and recurring constraints are all better stored in durable files than retyped every session.

Things like:

- `AGENTS.md`
- `README.md`
- `DESIGN.md`
- project-specific docs
- short task briefs checked into the repo

That helps in two ways:

1. I do not have to keep restating the same context.
2. The agent can read the source of truth instead of relying on a lossy restatement.

This is one of the easiest wins. Repetition in chat is expensive. Reusable context in files is cheap.

## 3. Match thinking level to the job

Not every task deserves maximum reasoning.

This sounds obvious, but I think people still underuse it. If I am doing a large redesign, a tricky architecture decision, a migration plan, or a debugging problem with multiple possible root causes, I want high thinking.

If I am making a small copy edit, wiring a simple commit, cleaning up a typo, or doing a low-risk mechanical change, low thinking is often enough.

My rough rule is:

- **High thinking** for ambiguity, architecture, redesigns, novel debugging, and anything expensive to get wrong
- **Medium thinking** for normal feature work
- **Low thinking** for obvious edits, formatting, tiny fixes, and straightforward execution

The same model can behave very differently depending on how much reasoning budget you give it. If you overspend reasoning on simple tasks, you are paying for thought you did not need.

## 4. Match the model to the job too

I think about model choice the same way.

The biggest or most expensive model is not automatically the right default for every turn. Sometimes it is. Often it is not.

If I want:

- deep design exploration
- architectural judgment
- long-horizon planning
- subtle writing or editing
- hard debugging

then I will gladly use a stronger model.

If I want:

- a small commit
- a quick refactor
- a file move
- a simple summary
- a known pattern applied cleanly

then a lighter model can be the better tool.

This matters even more if you use agents in long sessions. The difference between using a premium model for every minor turn and saving it for high-leverage decisions adds up quickly.

## 5. Understand how caching actually helps

A lot of people hear "prompt caching" and assume it means the whole session is magically cheap after the first turn.

That is not really how I think about it.

Caching helps most when a large prefix stays stable.

For example:

- system instructions that do not change
- stable project context
- long docs that are included the same way
- conversation history that remains unchanged at the front of the prompt

If the early part of the prompt is identical across turns, some platforms can reuse work on that prefix instead of recomputing everything from scratch.

That is good, but it does **not** mean new turns are free.

You are still paying for:

- the new user message
- the growing uncached tail
- the assistant's new output
- any changed or reordered context

So the practical lesson is simple: keep the stable part stable.

If you keep rewriting large blocks of context, shuffling instructions around, or pasting slightly different versions of the same background every turn, you reduce the chance that caching helps much.

The best setup is usually:

- stable instructions up front
- durable context in files
- small incremental asks
- minimal churn in the prompt prefix

## 6. Avoid conversational thrash

A lot of token waste is not technical. It is workflow.

Examples:

- asking for a solution before deciding the constraints
- changing direction every turn without resetting the brief
- mixing strategy, implementation, and polish in one wandering thread
- asking the agent to guess what matters instead of stating it

When a session gets muddy, I like to pause and restate the job in one clean message.

Something like:

```txt
Reset: the real task is to ship the mobile nav redesign.
Keep the current information architecture.
Do not touch desktop.
The bug to solve is that users cannot reach saved items quickly on smaller screens.
Please propose the smallest change that fixes that.
```

One reset message is usually cheaper than twenty confused turns.

## 7. Use an orchestrator pattern when it makes sense

One pattern I like is using a cheaper, lower-token agent as the orchestrator and only bringing in higher-cost agents for the parts that actually need them.

For example, the orchestrator might:

- keep the thread moving
- gather context
- break work into subproblems
- decide which tasks are routine
- escalate only the hard parts

Then the stronger agent gets used for things like:

- architecture
- difficult debugging
- major design exploration
- high-stakes review

That can be a very efficient setup because you are not using premium reasoning for every coordination turn.

You are reserving expensive intelligence for expensive problems.

I think this becomes more useful as agent workflows get more modular. The person or agent managing the work does not have to be the same one doing every piece of deep thinking.

## 8. Summarize before the thread gets unwieldy

Long sessions accumulate residue.

If a thread has gone on for a while, it is often worth compressing the state into a fresh summary:

- what we are building
- what decisions are already made
- what constraints still matter
- what remains to do
- what should be ignored from earlier dead ends

That summary can become the starting point for the next phase or even for a fresh session.

This is useful for humans too. Good summaries are token compression for the whole team.

## 9. Spend tokens where they change outcomes

This is the main principle underneath all of this.

I do not actually want the fewest tokens possible. I want the best outcome per token.

Sometimes the right move is a very detailed prompt because it prevents a bad branch. Sometimes the right move is a stronger model because the cheap one will miss the subtle bug. Sometimes the right move is high thinking because the redesign problem is genuinely fuzzy.

The goal is not austerity for its own sake.

The goal is to stop wasting expensive cognition on work that did not need it, while still spending aggressively where judgment matters.

## The short version

If I had to reduce this to a checklist, it would be:

- write better one-shot prompts with intent, constraints, context, and success criteria
- store stable context in files instead of repeating it in chat
- use the right amount of thinking for the task
- use the right model for the task
- keep prompt prefixes stable so caching can help
- reset muddy threads instead of letting them thrash
- use low-cost orchestrators and escalate selectively
- summarize long sessions before they bloat beyond usefulness

That is the whole game.

Token preservation is not mostly about clever tricks. It is about operating the session with more discipline.

And in practice, that usually overlaps with better engineering anyway.
