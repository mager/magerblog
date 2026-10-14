---
title: "Kotsu: Choose Your Path Through Japanese"
description: "I rebuilt my Japanese learning app around a branching course map: 23 stops, five chapters, and short recall sessions. Pick your route, then come back to connect the rest."
pubDate: "2026-10-14"
category: tech
tags: ["Kotsu", "Japanese", "SvelteKit", "Design", "AI", "open-source"]
keyword: "learning Japanese"
heroImage: "https://sdld3v8bpzf3snqo.public.blob.vercel-storage.com/blog/2026-10-14-kotsu-choose-your-path/journey.jpg"
heroImageAlt: "Kotsu's new journey page, with five chapters, a branching map, and the First light lesson selected."
heroImageCaption: "The new Kotsu: a course you can see, with a choice of where to go next."
draft: true
---

When I [first built Kotsu](/blog/2026-03-21-kotsu-the-knack-for-japanese/), I wanted a wall of Japanese characters. Open it on my phone, tap something, and look at it until the shape starts to feel familiar. That was useful, but it left a question open: what should I learn next?

I rebuilt [Kotsu](https://kotsu.vercel.app/) with Codex around that question. It now has a branching adventure map, short practice sessions, and checkpoints that connect the course. I wanted some choose-your-own-adventure freedom, with the expectation that I would eventually complete the whole thing.

The reference library is still there. The front door is now a journey.

## Choose the order, complete the whole map

The map starts with **First light**: あ, い, う, え, お. Learn those five vowels and two routes open. One continues through hiragana; the other starts katakana. I can choose which to do first, but both routes lead to the same checkpoint. That checkpoint waits until I finish both.

![The sound trail splits from First light into hiragana and katakana paths, with a lesson preview on the right.](https://sdld3v8bpzf3snqo.public.blob.vercel-storage.com/blog/2026-10-14-kotsu-choose-your-path/branches.jpg)

Underneath, this is a **directed acyclic graph**, or DAG. Each stop has prerequisites. The connections point forward, and there are no circular dependencies. A fork gives me a choice of order. A join brings the routes back together.

I like that as a learning model. I can follow my interest without quietly skipping half the material. The map also makes the dependencies visible: I can see what is available, what is complete, and what still needs work before it opens.

There are **23 stops across five chapters**, covering **1,009 study entries**:

- **The sound trail:** hiragana, katakana, and their sound variations.
- **The radical forest:** the parts that help me recognize and understand kanji.
- **The kanji crossing:** numbers, nature, places, and the rest of the N5 set.
- **The word village:** greetings, travel, food, shopping, and conversation.
- **Beyond the horizon:** the N4 and N3 kanji sets.

Those are entries in the current collection, not a promise of 1,009 unique characters or a complete Japanese course. Some characters appear in more than one set. Finishing the map means working through this material; it does not mean I have mastered Japanese.

## A small practice loop

Each session has up to five pieces. First I see a large character, its reading, and a short explanation. Then I hide the answer and try to recall it from four choices.

![The First light recall exercise shows あ beside four possible readings, with no timer and an option to look at the piece again.](https://sdld3v8bpzf3snqo.public.blob.vercel-storage.com/blog/2026-10-14-kotsu-choose-your-path/recall.jpg)

A correct answer saves progress. A wrong answer lets me try again, and I can return to the study card. There is no timer, no lost life, and no streak to protect. I wanted a reason to practice, without making a missed day feel like a penalty.

That is the biggest change from the original version. Looking at a character is still part of the app, but now there is a small step between recognizing it on a card and moving forward: can I remember it when the reading is gone?

## The field guide stays open

I did not want the course map to make quick lookup harder. The [field guide](https://kotsu.vercel.app/library) keeps the character collections, search, and recipes available outside the journey. Signed-in users can still use their custom vocabulary. A lesson also links directly to its character's reference page.

The new interface uses blue for the main actions, coral for the selected map stop, and green for completed stops. Labels, lock icons, and checkpoint shapes carry meaning alongside the colors. [Niko, the logo with the hidden smile](/blog/2026-06-06-kotsu-logo/), is still there too.

On a phone, the map comes before the selected lesson details. On a larger screen, the chapter list, map, and lesson preview sit beside each other. It feels closer to a course atlas than the old wall of cards.

## What the graph made me test

Building this with an agent made the visual changes fast. The course rules needed more care. A nice-looking path is not enough if a checkpoint never opens or a group of characters disappears between branches.

The regression tests check the graph structure, prerequisites, and course coverage. Every source entry must belong to one learning stop, and the graph must let the learner reach the end. I also checked the first lesson in the browser: wrong-answer retry, completion, both routes unlocking, and progress surviving a reload.

One current limit matters: **new adventure answers are saved in this browser on this device**. They are not yet synced through Firebase. The journey can recognize existing learned-character progress, but starting on my laptop and continuing the new adventure on my phone is still work to do.

The [redesign is merged](https://github.com/mager/kotsu/pull/2), and [the source is open](https://github.com/mager/kotsu). If you want to try the change, [start with the five vowels](https://kotsu.vercel.app/journey/first-sounds). That first fork is the clearest example of what I wanted: a little freedom about what comes next, and a map that keeps the rest in view.
