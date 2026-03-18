---
title: "prxps: I Let AI Analyze Every First-Round March Madness Matchup"
description: "12 hours before my bracket was due, I used Gemma-3-27b to generate unique insights for all 32 first-round games. Here's what the AI found — and what it got wrong."
date: 2026-03-18
category: code
tags: [ai, sports, march-madness, prxps, gemma]
draft: false
---

It's 5 PM on bracket submission day. I have 12 hours.

My bracket is still blank. And I have an AI model sitting idle.

So I did what any reasonable person building a sports predictions app would do: I fed the entire 2026 NCAA Tournament first-round bracket into my AI pipeline and asked it to do what ESPN analysts do — but without the narrative bias.

## The Setup

[prxps](https://prxps.app) has had a Gemma-3-27b integration running for a few months. The original idea was behavioral embeddings → game recommendations. Think Spotify Discover Weekly, but for sports bets.

But for March Madness, I wanted something different. I wanted:

1. **A Chaos Index** — a 0–100 score for how likely each game is to go sideways
2. **A Key Edge** — one specific, non-obvious reason the outcome might surprise you
3. **Upset picks** — where the AI actually picks the lower seed
4. **An Insight Type** — categorical labels like `coin_flip`, `trap_game`, `pace_mismatch`, `upset_alert`

Not "Duke is really good." That's useless. I wanted *why* a specific game has a structural mismatch that could change the outcome.

## What the AI Found

### The Most Dangerous Upsets

The model flagged **Saint Louis over Georgia** as its most confident upset call. At 28-5, Saint Louis is legitimately underseeded — a 9-seed with a record that screams 6 or 7. The selection committee undervalued the Atlantic 10 this year and the Billikens are paying for it in seeding. Georgia at 22-10 in the SEC is good, but not dominant.

**Santa Clara over Kentucky** was the second upset pick. This one is wilder — Santa Clara beat Gonzaga this season. A program that beats a 30-win Gonzaga squad has already proven it can compete at this level. Kentucky at 21-13 is having a down year by their standards. The Wildcats' pedigree is real, but pedigree doesn't score points.

**UCF over UCLA** rounds out the top upset picks. UCF joined the Big 12 and survived the season. That's preparation. UCLA's schedule had soft spots. The 10-seed edge in the 7/10 matchup is real — those games go to the underdog ~40% of the time.

### The Chaos Index Results

The model scores each game 0–100 for "chaos potential" — a composite of seed differential, conference strength gap, recent form, and system matchup.

The highest chaos games:
- **Utah State vs Villanova** (58) — Utah State at 28-6 is massively underseeded as a 9
- **TCU vs Ohio State** (55) — True coin flip, neither team is significantly better
- **Saint Louis vs Georgia** (54) — A-10 vs SEC, record says upset
- **Iowa vs Clemson** (53) — Big Ten experience edge

The lowest:
- **Arizona vs LIU** (4) — #2 overall seed vs NEC
- **Duke vs Siena** (4) — #1 overall vs MAAC

### The Insight Type System

I created eight categories to classify each matchup:

| Type | What It Means |
|------|---------------|
| 🔥 `upset_alert` | AI picks the lower seed. High conviction. |
| 🪙 `coin_flip` | True 50/50. No edge either way. |
| 💀 `trap_game` | Favorite has a specific vulnerability. Watch out. |
| ⚡ `pace_mismatch` | One team needs pace, the other controls it. |
| 🥊 `style_clash` | Defensive/offensive system exploits exist. |
| 🧊 `dominant` | Expected result. Ice cold. |
| 🚀 `momentum_play` | A team is hot right now. First Four energy. |
| 🆕 `first_timer` | Tournament debut pressure factor. |

The `pace_mismatch` category caught some interesting games. **Saint Mary's vs Texas A&M** is a classic: the Gaels will slow this to 58 possessions. A&M needs pace to win. If Saint Mary's controls tempo, the SEC athleticism advantage gets neutralized.

## What I Built

Everything lives at [prxps.app/bracket-2026](https://prxps.app/bracket-2026).

The technical stack:

- **Data layer:** TypeScript types for `Matchup`, `InsightType`, with region filtering and upset picker utilities
- **AI pipeline:** Gemma-3-27b analyzed seed differentials, conference strength, records, and system matchups
- **UI:** Region tabs, expandable "deep dive" analysis, chaos bar coloring, confidence indicators
- **Integration:** Linked directly from the main prxps feed via the March Madness banner

The whole thing — data, analysis, page — was built in about 2 hours. The AI did the research; I built the frame.

## What I Actually Think

A few things struck me building this:

**The model doesn't have recency bias.** When I think about Kansas, I think about their history, their brand, their Final Four appearances. The model just sees 23-10 and asks: is this record convincing? At the 4-seed line, the answer is *usually*. It doesn't carry the weight of the brand.

**Conference quality signals matter more than record.** The model consistently flagged teams with strong records in weak conferences as risk factors — not because they're bad, but because the gap in competition level creates unknown variables. Cal Baptist at 25-8 in the WAC is a different data point than Kansas at 23-10 in the Big 12.

**The chaos index reveals structural upsets before they happen.** VCU's HAVOC defense gets a 46 on the chaos index against North Carolina. That's the model identifying that 27-7 VCU with elite turnover-forcing stats is a structural threat to a UNC team that's been inconsistent. Not just "the upset feels right" vibes — an actual defensive stat profile that suggests vulnerability.

## What's Next

This is a v1 experiment. The Chaos Index weights are educated guesses right now. What I want to build:

- **Historical backtesting** — how does Chaos Index correlate with actual upset frequency?
- **Live updates** — as games are played, update the model's "read" on remaining matchups
- **Bracket scoring integration** — connect to prxps picks so users can see how their choices compare to AI picks

The sports predictions space is full of "predictions" that are just syndicated lines with a different UI. The interesting work is finding the *structural edges* — the pace mismatches, the style clashes, the first-timer pressure factors — that don't show up in a simple spread.

That's what I'm trying to build at prxps.

---

*Bracket analysis live at [prxps.app/bracket-2026](https://prxps.app/bracket-2026). Built with SvelteKit + Gemma-3-27b. Chaos is a feature, not a bug.*
