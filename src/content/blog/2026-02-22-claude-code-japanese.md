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

## Bonus Skill: Kana ASCII

Here's something I built while working through Hiragana — a companion skill called `kana-ascii`. Claude Code runs in a terminal, so you can't render images or fonts. But you *can* draw characters as ASCII art, with stroke order and mnemonics baked in.

```bash
npx loooom add mager/kana-ascii
```

Then ask:
```
Draw あ for me. Show me the stroke order.
```

And you get something like:

```
  ─────①─────
  ╭──②──╮
  │  ③   │
  ╰──∫───╯
      ④⌒
```

With a mnemonic: *"あ looks like someone tied the letter 'a' into a knot."*

Weird? Yes. Memorable? Extremely.

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

## The Real Power: Continuity

Because this is Claude Code, you can keep a `notes.md` in your Japanese directory and have it track what you've learned, what you struggled with, and what to review next. The plugin already tells Claude to do this.

After each session, run:
```
Summarize what we covered today and add it to notes.md
```

Two months from now, you'll have a complete log of your learning journey. And when you land in Tokyo, you'll have a tutor you can pull up on your phone via the Claude mobile app.

## Try It Yourself

Plugin: [loooom.xyz/p/mager/beginner-japanese](https://loooom.xyz/p/mager/beginner-japanese)

```bash
npx loooom add mager/beginner-japanese
```

Skills are free. Forkable. You can edit any SKILL.md to customize the teaching style. If you improve it, [publish it back to Loooom](https://loooom.xyz) so others can use your version.

---

*I'll post an update from Tokyo. Looking forward to ordering ramen without pointing.*

*[Follow along on X](https://x.com/mager) for the trip.*
