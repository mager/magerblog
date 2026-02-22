---
title: "Claude Code: My Free Japanese Sensei (Japan in 2 Months)"
pubDate: "2026-02-22"
description: "I'm going to Japan in 60 days. Instead of paying for another app, I built a Japanese learning plugin for Claude Code and used it to learn conversational Japanese for free — using Claude Pro I already pay for."
category: "life"
tags: ["AI", "Japanese", "Claude Code", "Loooom", "Learning"]
heroImage: ""
keyword: "claude code japanese teacher"
draft: true
---

I booked a trip to Japan. Two months out. My Japanese vocabulary: ありがとう and すみません (thank you and excuse me). That's it.

I'm not paying for another app. I already have Claude Pro. So I built a Japanese learning plugin, published it on [Loooom](https://loooom.xyz), and I've been using Claude Code as my daily sensei. Here's how to do the same thing.

## The Problem with Language Apps

Duolingo teaches you to translate sentences. Rosetta Stone drills vocabulary in isolation. Both are fine for building a base — but they won't teach you *how to think* in Japanese or give you a real conversation partner who can explain *why* a particle works the way it does.

Claude can. And if you have Claude Pro, you already have access to one of the best language tutors on the planet. You just need to give it the right instructions.

That's what the plugin does.

## What Is a Claude Code Plugin?

Claude Code is Anthropic's official CLI — a terminal-based AI coding agent. But it can do a lot more than code. When you drop a `SKILL.md` file into `.claude/skills/`, Claude Code picks it up and follows those instructions in every session in that directory.

A plugin is just a well-crafted system prompt, stored as a file, installable with one command.

## The Beginner Japanese Plugin

I built a 5-skill curriculum on [Loooom](https://loooom.xyz/p/mager/beginner-japanese), my open skills marketplace. Each skill is a focused lesson module:

1. 🔤 **Learn Hiragana & Katakana** — the two phonetic alphabets, 46 chars each, with mnemonics
2. 📐 **Learn Radicals** — the building blocks of kanji (~50 most common)
3. 🈁 **Learn Easy Kanji** — your first 50 kanji (numbers, days, basic nouns)
4. 💬 **Learn Basic Conversation** — greetings, survival phrases, particles
5. 🔥 **Level Up** — casual forms, te-form, compound sentences

<!-- SCREENSHOT: loooom.xyz/p/mager/beginner-japanese plugin page -->

## Setup in 60 Seconds

You need [Claude Code](https://claude.ai/code) installed and a Claude Pro subscription.

**Step 1: Create a Japanese learning directory**

```bash
mkdir ~/japanese && cd ~/japanese
```

**Step 2: Add the plugin**

```bash
npx loooom add mager/beginner-japanese
```

This pulls all 5 skill files from Loooom and writes them to `.claude/skills/`. No account needed.

<!-- SCREENSHOT: Terminal running npx loooom add mager/beginner-japanese -->

**Step 3: Verify the install**

```bash
ls .claude/skills/
```

You should see all 5 skill files sitting there.

<!-- SCREENSHOT: .claude/skills/ directory listing -->

**Step 4: Start learning**

```bash
claude
```

Claude Code picks up the skills automatically. Tell it which module you want to start with:

```
Let's start with Hiragana. Teach me the first row.
```

<!-- SCREENSHOT: Claude Code session showing hiragana lesson -->

## How to Trigger Each Skill

Once installed, each module is a conversation starter. Here are the prompts that work best for each:

| Module | What to say |
|--------|------------|
| 🔤 Hiragana & Katakana | `"Teach me the あいうえお row. Draw each character."` |
| 📐 Radicals | `"Show me the 10 most important radicals with visuals."` |
| 🈁 Easy Kanji | `"Teach me the kanji for numbers 1–5. One at a time."` |
| 💬 Basic Conversation | `"I just walked into a restaurant in Tokyo. What do I say?"` |
| 🔥 Level Up | `"Teach me te-form with examples I'd actually use in Japan."` |

The pattern: **put yourself in a scenario**. Claude plays along. You learn in context, not in a vacuum.

## Bonus: Kana ASCII

While working through Hiragana I built a companion tool — `kana-ascii`. Claude Code runs in a terminal, so you can't render images or fancy fonts. But you *can* draw characters as ASCII art with stroke order baked in.

It exists as both an npm package and a Loooom skill.

**CLI:**
```bash
npx kana-ascii あ
npx kana-ascii aiueo       # renders あいうえお in sequence
npx kana-ascii konnichiwa  # shows こんにちわ, notes unsupported chars
npx kana-ascii AIUEO       # katakana mode
```

**Or as a Claude Code skill** (Claude draws them in-session):
```bash
npx loooom add mager/kana-ascii
```
Then: `Draw あ for me. Show me the stroke order.`

Output uses a locked dot-grid canvas — guaranteed monospace across all terminals:

```
あ (a) — ah as in father

. . . . . . . . . . . . .
. . - - - [1] - - - . . .
. . . . | . . | . . . . .
. . . . | [2] | . . . . .
. . . . - - - - . . . . .
. . . . . | . . . . . . .
. . . . ( . ) [3] . . . .
. . . . . . \ . . . . . .
. . . . . . ~[4] . . . . .

Strokes:
  [1] horizontal bar — left to right across top
  [2] box enclosure  — down, across, up (open top-left)
  [3] drop + loop    — down, curves into circle
  [4] hook sweep     — sweeps right, flicks up

Mnemonic: Someone tied the letter 'a' into a knot. Messy — but it IS an 'a' in there.
```

Weird? Yes. Memorable? Extremely. That's the whole point.

## What a Lesson Actually Looks Like

Here's a real exchange from my first session using the Conversation module:

---

**Me:** Teach me how to introduce myself at a restaurant in Japan.

**Claude:** Let's start with the basics and build up.

When you walk into a restaurant, you'll typically hear:

> **いらっしゃいませ！** (*Irasshaimase!*) — "Welcome!"

You don't need to respond to that — it's a greeting, not a question.

When you're seated, a server will ask:
> **何名様ですか？** (*Nan-mei-sama desu ka?*) — "How many people?"

If you're alone: **一人です。** (*Hitori desu.*) — "Just one."
Two people: **二人です。** (*Futari desu.*) — "Two people."

The key pattern here is **〜です (desu)** — it's the polite "to be." You'll use it constantly.

**Try it:** How would you say "three people"?

---

**Me:** 三人です？

**Claude:** ✅ 三人 (*san-nin*) — perfect! You remembered 三 from kanji! The counter 人 (*nin/hito*) changes with the number — 一人 is *hitori*, 二人 is *futari*, but from 3 onward it's just *[number] + nin*. Native pattern, not a mistake.

---

That's what $0 extra and a SKILL.md gets you: a patient, context-aware tutor who remembers you just learned 三 from the kanji module and connects the dots.

## The Real Power: It Remembers You

The biggest problem with AI tutors: every session starts from zero. You explain your level, your goals, what you already know — and then next time, same thing.

The v2.0.0 update fixes this with a progress file.

At the end of every session, Claude writes your state to `.claude/japanese-progress.md`:

```markdown
# Japanese Learning Progress

**Last session:** 2026-02-22
**Total sessions:** 1
**Trip date:** ~2 months from 2026-02-22
**Destination:** Tokyo / Kyoto

## Current Module
Module 1: Kana Foundations — in progress

## Kana Covered
### Hiragana
- あ (a) ✓ confident
- い (i) ✓ confident
- う (u) ~ learning
- え (e) ~ learning
- お (o) ~ learning

## Vocab Bank
- すみません — excuse me / sorry ✓

## Next Session
- Review: う (u), え (e), お (o)
- Continue: か row (ka ki ku ke ko)
```

Next session, Claude reads that file first. No recap. No re-explaining your level. You say "let's continue" and it says "Welcome back — last time you got through the vowel row. Today we're doing か."

That's a stateful tutor on your own filesystem. No account, no server, no subscription beyond what you already pay for.

Two months of sessions and you'll have a complete log of exactly what you learned, what stuck, and what to review before you land.

## Level Up: Cloud Memory with mem0

The file approach has one limitation: it's stuck on one machine.

If you want to study at your desk tonight and continue on your phone on the train in Japan — you need cloud memory. That's where [mem0](https://mem0.ai) comes in.

Mem0 is a managed memory layer for AI apps. Free tier gives you 10,000 memories and 1,000 retrieval calls per month. A 2-month Japanese journey is maybe 600 total operations. You won't get close to the limit.

**Setup (2 minutes):**

1. Sign up at [app.mem0.ai](https://app.mem0.ai)
2. Grab your API key from the dashboard
3. Add it to your environment:

```bash
export MEM0_API_KEY=your-key-here
```

That's it. The skill detects the key automatically and switches to cloud mode.

**What changes:** Instead of writing a markdown file, Claude calls the mem0 API at the end of every session. It passes a summary of what you covered, and mem0's AI extracts and stores what matters — kana confidence, upcoming goals, your trip date, what you struggled with. Next session, it retrieves those memories semantically and resumes exactly where you left off.

No different from your perspective. But now it works from every device where you've set `MEM0_API_KEY` — including the Claude mobile app when you're already in Japan.

## Try It Yourself

Plugin: [loooom.xyz/p/mager/beginner-japanese](https://loooom.xyz/p/mager/beginner-japanese)

```bash
npx loooom add mager/beginner-japanese
```

Skills are free. Forkable. You can edit any SKILL.md to customize the teaching style. If you improve it, [publish it back to Loooom](https://loooom.xyz) so others can use your version.

---

*I'll post an update from Tokyo. Looking forward to ordering ramen without pointing.*

*[Follow along on X](https://x.com/mager) for the trip.*
