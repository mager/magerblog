---
title: "Kotsu: The Knack of Japanese"
description: "I built a Japanese learning site in a morning because I wanted something I could pull up on my phone and just look at characters. Here's how Gemini wrote the prompt and magerbot built the whole thing."
pubDate: "2026-03-21"
category: code
keyword: "building my own Japanese learning site"
tags: ["Japanese", "language", "learning", "SvelteKit", "Firebase", "open-source"]
draft: false
---

I've been studying Japanese for a few months now. My trip to Japan is coming up, and I want to be able to read signs, order food, and not embarrass myself at a konbini.

I've been using some great tools. [Kana](https://apps.apple.com/app/kana/id1454200955) on iOS is beautiful — shoutout to that app, I genuinely love it. The [Genki](https://genki3.japantimes.co.jp/en/) textbooks are the gold standard for structured learning. And [Kanshudo](https://www.kanshudo.com) is incredible for kanji lookup and study paths.

But I kept wanting something simpler. Something I could pull up on my phone in 10 seconds, see the characters in big bold type, and just... absorb them. Not a lesson. Not a quiz with a timer. Not gamification with streaks and XP and cartoon owls. A reference wall I can stare at on the train or while waiting for coffee.

So I built [Kotsu](https://kotsu.org).

![The Kotsu homepage — five columns of Japanese characters on off-white paper](https://lh3.googleusercontent.com/pw/AP1GczPtn5zs7clo3yJygE1lr40pVu_3huAAsYi_vg33P_72ILyKfYwF9YLlhQSRMPavhdSKBIpBLcI_VI74N6huxBZdbq7bDhzkHOBBIll54u0daJofeKk1Xort5WGb8L7pYvUIS-viRUNRbIeB2inrBufESQ=w2322-h1522-s-no-gm)

## The name

**コツ** (kotsu) means "the knack" — that intuitive feel for something, the moment it clicks. Not mastery through grinding, but familiarity through repetition. See a character enough times and it stops being a mystery. That's the kotsu.

## Gemini wrote the prompt

Here's the fun part. I knew what I wanted — thick black typography, five columns, immersive character view — but instead of describing it piecemeal, I asked Gemini to structure my ideas into a proper engineering spec. Think of it as an AI writing a prompt for another AI.

Here's the actual prompt that came out of that conversation, which I fed directly to [magerbot](https://github.com/mager/openclaw-brain) (my coding agent):

> **Project Goal:** Build the V1 of Kotsu.org, a Japanese learning platform.
>
> **Visual Aesthetic:** "Thick Black Typography" (High-Contrast). Think heavy borders, bold headings, and a "paper" or "off-white" background (#F9F9F9). Use Noto Sans JP (Weights 700 and 900) for a striking, modern look.
>
> **UI Architecture:**
> - 5-Column Vertical Pillar: A full-width, 5-column grid that reads top-to-bottom.
> - Col 1: Hiragana (Basics)
> - Col 2: Katakana
> - Col 3: Radicals (The "Knack" / Kotsu)
> - Col 4: Kanji (Starting with JLPT N5)
> - Col 5: Vocabulary (The "Baby-to-Pro" list: Mama, Papa, Hai, Wan-wan, Nyā-nyā, Oishi, Itai, Suki, Dame, Abunai, Konnichiwa)
>
> **Immersive Focus Mode:** Clicking a card triggers a full-screen modal/overlay. Show the character and Romaji in massive, thick black Noto Sans JP type.

One prompt. Gemini structured it. Magerbot built it. First commit to a working, deployed site in under 10 minutes.

## Five pillars

The entire UI is five vertical columns, each one a progression:

1. **ひらがな (Hiragana)** — the 46 basic phonetic characters. The alphabet.
2. **カタカナ (Katakana)** — the 46 characters for foreign/borrowed words.
3. **部首 (Radicals)** — the building blocks of kanji. This is the real *kotsu* — understand radicals and kanji stops being random squiggles. 人 is person. 心 is heart. 食 is food. Now every kanji that contains them makes a little more sense.
4. **漢字 (Kanji N5)** — starting with the JLPT N5 set. Numbers, days, basic concepts.
5. **語彙 (Vocabulary)** — the "Baby-to-Pro" list, starting with the first words a Japanese child learns: ママ, パパ, はい, ワンワン (woof), ニャーニャー (meow)... all the way to こんにちは and ごめんなさい.

Tap any character and it fills your entire screen. Arrow keys to flip through. That's the study loop.

![Immersive character view — 食 fills the screen with on and kun readings below](https://lh3.googleusercontent.com/pw/AP1GczOzpqGFFmw8QP67_avDmUkO0TqmB3sJxJBn34xHnQVLgSFsjitysf8qcoYiol2TKLIsmchzM0sAy-AdvQRJ9GVmdL8bDtvGRVFLn0dihtTxjKKhktMn5iCUwAtY8l3Yhv7Z0z8F-vtDo0u7_VQy9HACrw=w2322-h1522-s-no-gm)

## Ink over ash

When you mark a character as learned, it doesn't just check a box. Characters you haven't touched yet are **灰 (hai)** — ash gray, faded into the paper like ghosts. Once you learn them, they emerge in full **墨 (sumi)** black ink.

It's a small detail, but it transforms the grid. Gray characters you haven't learned yet. Bold black ones you have. Your progress is visible at a glance — a wall of ghosts slowly solidifying into ink.

Your profile page tracks everything — a massive percentage display, per-column breakdowns with accent-colored progress bars, and all your learned characters displayed in big beautiful type.

![Profile page — 12% complete with per-column progress and learned characters](https://lh3.googleusercontent.com/pw/AP1GczMvitdrEFRvyNG-094KGbsJPNuxfHUsH_6Kt0OoTNVi8XVARuYx2wfF7d-sK3LUehRkkkWtqYlxQ7vxr9H7oGMPSiAU4ktgsfb6fwm4l9R7Dy29flYsCG0CVVdcBMV1HmMeT50sNy1uMJR8qK24tFl7IA=w2322-h1522-s-no-gm)

## The stack

- **SvelteKit 5** with Svelte 5 runes syntax
- **Tailwind CSS v4**
- **Firebase** — Google auth + Firestore for progress tracking
- **Three fonts:** Noto Sans JP (900) for characters, Shippori Mincho for brush/calligraphy headers, Zen Old Mincho for accents
- Deployed on **Vercel** with auto-deploy on push

The aesthetic is intentionally stark. Off-white paper background (`#fafaf8`), no borders on the cards, characters floating in white space. It's supposed to feel like ink on paper — a calligraphy study wall, not a language app.

## Open source

The whole thing is open source at [github.com/mager/kotsu](https://github.com/mager/kotsu). If you spot a wrong reading, want to add more kanji, or have ideas for the UI — [send a PR](https://github.com/mager/kotsu/pulls). I'd love contributions from people who actually know Japanese better than me.

## Add your own words

The best moment when you're learning a language is when you hear a word out in the wild and want to know what it means *right now*. Someone says 温泉 (onsen) at a restaurant. You catch it. You want to lock it in before you forget.

That's why I added a custom words feature. Hit the **+** button floating in the corner of the app, type the romaji, and Kotsu does the rest — it auto-converts to kana as you type, looks up the kanji and meaning from Jisho, and saves it to your personal 私 (mine) column.

So the flow is: hear it → open Kotsu → type it → done. It's in your list, with the kanji, the reading, and the meaning, forever.

It uses [wanakana](https://wanakana.com/) for the romaji-to-kana conversion and the [Jisho API](https://jisho.org/api/v1/search/words) for live lookups. Type `onsen` and watch it resolve to おんせん → 温泉 + "hot spring". The whole thing happens in under a second.

Your custom words live in Firestore alongside your learned characters — same account, same profile.

## What's next

- Spaced repetition — surface characters you haven't reviewed recently
- Audio pronunciation
- More kanji beyond N5
- Mobile app wrapper (it's already mobile-first, just needs the shell)

But honestly, V1 already does what I needed. Pull it up. Look at the characters. Let them sink in. Come back tomorrow and do it again.

That's the kotsu. ✌️
