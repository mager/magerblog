---
title: "Claude: How prompt caching actually works"
description: "A practical explainer for developers who want to spend fewer tokens with Claude: what gets cached, what does not, why stable prefixes matter, and how to avoid the common cache-killers in long sessions."
pubDate: 2026-04-27
category: code
draft: true
tags: [claude, anthropic, prompt-caching, ai, llms, developer-tools]
---

I think prompt caching is one of those features that people hear about early and understand vaguely for a long time.

The loose mental model is usually something like: *Claude remembers stuff, so later turns are cheaper.*

That is directionally right, but it hides the part that actually matters.

Prompt caching is not about Claude vaguely remembering your whole conversation. It is about Claude being able to reuse a **stable prefix** of the prompt instead of recomputing it from scratch.

Once I started thinking about it that way, a lot of workflow decisions got clearer.

If you use Claude a lot — especially Claude Code, long API sessions, or any agent workflow with big context — this is worth understanding. It affects cost, latency, and how you should structure instructions.

## The core idea

Anthropic's prompt caching works on a prefix.

That means Claude can reuse the beginning of a request **if that beginning is identical to a previously cached version**.

The important word there is **identical**.

The cache is not semantic. It is not thinking, "this is basically the same." It is much closer to: "have I already seen this same prefix in this shape?"

In Anthropic's docs, the cached prefix includes content in this order:

1. `tools`
2. `system`
3. `messages`

up to the cache breakpoint.

So when caching helps, it helps because a large front section of your request did not change.

## What this means in normal human terms

If you are chatting with Claude and each turn keeps the same setup — same tool definitions, same system instructions, same early conversation history, same big background doc — then Claude can often reuse that prefix.

If you keep rewriting the setup, changing tool definitions, pasting slightly different versions of the same context, or moving things around, you make cache reuse much less likely.

That is the big idea.

Caching rewards stability.

## The simplest mental model

I think the cleanest way to picture it is this:

```txt
[stable prefix][new tail]
```

Where:

- **stable prefix** = the part you want Claude to be able to reuse
- **new tail** = the current turn, the latest message, the new tool result, the new ask

Good Claude workflows keep the prefix stable and only grow the tail.

Bad Claude workflows keep mutating the prefix.

## What is usually cached

At a high level, the things that tend to be good cache candidates are:

- long-lived system instructions
- stable tool definitions
- large reference docs that do not change between turns
- earlier conversation history that stays untouched
- repository guidance that gets included consistently

This is why a file like `CLAUDE.md` is often so useful.

Not because the filename itself is magic.

It is useful because it moves recurring guidance out of ad hoc chat messages and into a stable source of truth. If Claude keeps seeing the same durable project instructions instead of a freshly retyped version every few turns, you get a cleaner prefix and fewer wasted tokens.

That is also why repo docs, design rules, architectural notes, and agent instructions usually belong in files instead of being re-explained in chat every session.

## What is not cached, or is frequently the uncached part

The freshest part of the conversation is usually the expensive part.

In practice, that means you should assume you are still paying for:

- your latest message
- the most recent assistant response
- newly added tool results
- any newly attached images or files
- any part of the prompt that changed shape
- Claude's new output

Caching is not a coupon for the whole request. It is a discount on the stable front section.

## A concrete example

Say I am using Claude Code inside a repo.

My session may have:

- tool definitions
- a system prompt
- repo instructions
- `CLAUDE.md`
- earlier conversation history
- my newest request

If the first five items stay stable, Claude can reuse a lot.

If instead I keep doing things like this:

- rewriting the project brief every turn
- changing the tool set midstream
- pasting a new version of the architecture summary each time
- reordering instructions
- attaching a different pile of files every message

then I keep forcing more of the prompt back into the uncached bucket.

That is the difference between a session that gets cheaper over time and a session that keeps paying first-turn prices on too much of its context.

## Automatic caching vs explicit breakpoints

Anthropic supports two broad modes in the API:

### 1. Automatic caching

You add a top-level `cache_control` setting, and Anthropic automatically applies the cache breakpoint to the last cacheable block.

This is the easier mode for multi-turn conversations. The cache point effectively moves forward as the conversation grows.

That makes it a good fit for chat-style interactions where you want the accumulated conversation to become the stable prefix.

### 2. Explicit cache breakpoints

You place `cache_control` directly on specific blocks.

This is more manual, but it gives you control. It is useful when you know exactly which large block should be treated as the reusable prefix.

For example, if you are sending a 50-page legal agreement, a huge schema, or a long codebase summary, you can mark that specific block as the thing worth caching.

I think of automatic caching as the default, and explicit breakpoints as the power-user move when you have one very expensive chunk you want to anchor.

## The detail that surprised me

One subtle but important detail from Anthropic's docs: prompt caching references the full prefix across `tools`, `system`, and `messages` in that order.

That means cache behavior is not just about your latest user message.

It also means changes to the surrounding scaffold matter.

If you modify tool definitions, change extended thinking settings, add or remove images, or otherwise alter earlier prompt structure, you can invalidate part of the prefix even if your actual user request is similar.

That is one reason some long sessions feel weirdly expensive. The user thinks they are asking "one more small thing," but the runtime has quietly changed the shape of the prompt in a way that hurts reuse.

## Bad cache situations to watch for

These are the patterns I would actively look out for.

### 1. Re-pasting the same context with tiny wording changes

This is the classic one.

If every turn includes a newly typed version of:

- project goals
- design rules
- architecture notes
- coding preferences

then you are paying to reintroduce instability into the prefix.

Better move: put it in a stable file or use a consistent system block.

### 2. Letting the session thrash directionally

If the thread keeps changing jobs — architecture discussion, then copywriting, then debugging, then a design brainstorm, then a shell script review — the conversation history becomes a messy prefix.

Even if some of it is technically cached, it may not be useful cached context anymore.

That is a separate but related failure mode: **cacheable does not always mean valuable**.

Long sessions need periodic compression.

### 3. Changing tool definitions during the session

Anthropic explicitly documents that `tools` are part of the cached prefix.

So if your tool list changes, your cache picture changes.

If you have a stable agent harness, keep its tool surface stable when possible.

### 4. Changing thinking settings

Anthropic also documents that changing extended thinking settings affects message blocks.

So if you enable or disable thinking, or change the thinking budget, do not assume your cache situation is unchanged.

That can be a hidden source of churn.

### 5. Constantly attaching new images or files

Adding or removing images changes message blocks. Same basic idea for other large attachments.

If you are repeatedly sending slightly different payloads, do not expect the same cache efficiency as a text-only session with a stable prefix.

### 6. Rewriting the brief instead of extending it

There is a difference between:

```txt
Keep going. Now implement the mobile version.
```

and:

```txt
Here is the full project again, rewritten slightly differently, plus a new framing of the same task.
```

The second one often feels safer to humans, but it is usually worse for cache health.

## Why `CLAUDE.md` helps so much

I think people sometimes describe `CLAUDE.md` as if it were a mystical Claude power-up.

It is more practical than that.

`CLAUDE.md` is useful because it does three things at once:

1. it keeps repeated context out of chat
2. it makes project guidance more stable turn to turn
3. it reduces the temptation to restate the same instructions in slightly different words

That is exactly the kind of structure prompt caching likes.

So yes, I do think prompt caching is part of why `CLAUDE.md` feels disproportionately valuable.

Again: not because the file itself gets magical treatment, but because durable context beats chat churn.

## The part most developers miss

A cached session can still be expensive.

This matters.

If you have a giant cached prefix but keep appending:

- large tool outputs
- verbose assistant replies
- giant diffs
- long wandering follow-ups

then your uncached tail can still get big enough to hurt.

Caching helps most when you pair it with disciplined session design:

- stable instructions
- short incremental asks
- durable context in files
- occasional resets or summaries
- minimal prompt churn

It is not enough to have caching on. You also need to stop feeding the session garbage.

## How I would optimize for caching in practice

If I wanted to get serious about Claude token efficiency, I would do this:

### Put stable context in files

Use `CLAUDE.md`, `README.md`, architecture notes, design docs, and task briefs.

Do not keep re-pasting your worldview into the chat box.

### Keep tool surfaces stable

If your harness can avoid changing tools every turn, do that.

### Stop rewriting the brief

Add deltas. Do not restate the whole thing unless the thread is genuinely broken.

### Summarize and reset when the thread gets muddy

A bad long thread can become both expensive and low-signal.

At some point, a clean summary is better than dragging dead context forever.

### Watch for hidden churn

If costs feel off, look at:

- changing system prompts
- changing tool definitions
- different attachments
- new thinking settings
- huge tool outputs

Usually the answer is there.

## A good heuristic for conversation turns

When I am about to send a message to Claude, I think the useful question is not:

> Is this message short?

It is:

> Does this preserve the stable prefix, or does it unnecessarily mutate it?

That is the caching question.

A short message can still be cache-hostile if it forces upstream changes.

A longer message can be cache-friendly if it only extends the tail.

## The pricing angle

Anthropic's docs are also worth reading on pricing, because caching is not free in a simplistic sense.

There is a difference between:

- cache writes
- cache reads
- normal input tokens
- output tokens

The notable part is that cache reads are much cheaper than base input tokens, while cache writes cost more than a normal input pass. That makes sense: you pay to establish the reusable prefix, then benefit when you reuse it.

So the payoff gets better when the same expensive prefix is used multiple times.

That is another reason stable multi-turn work benefits more than chaotic one-off prompting.

## The short version

If I had to reduce all of this to one rule, it would be this:

**Claude caching rewards stable prefixes, not messy conversations.**

And if I had to reduce it to a checklist:

- keep recurring instructions in files
- treat `CLAUDE.md` as stable context, not chat filler
- avoid re-pasting background with tiny wording changes
- keep tool definitions stable when possible
- do not casually change thinking settings midstream
- avoid stuffing the thread with giant unnecessary outputs
- summarize and reset when the conversation becomes bloated

That is the practical mental model I wanted.

Not "Claude remembers stuff."

More like: **Claude can cheaply reuse what you stop needlessly changing.**

That is a much more useful way to work.

---

### Notes

I wrote this using Anthropic's prompt caching docs as the reference point, especially the parts covering automatic caching, explicit cache breakpoints, cached prefix order (`tools`, `system`, `messages`), cache lifetimes, and the documented ways images, tool definitions, and thinking settings can affect cache validity.
