---
title: "Loooom: I Built a Skill to Teach Claude to Hear Music"
description: "I used Gemini to write a Loooom skill, installed it in Claude Code, and got a full audio analysis report on a 37-second piano recording of Espresso. Turns out AIs teaching AIs new senses is a surprisingly powerful pattern."
pubDate: 2026-03-26
draft: false
category: "code"
keyword: "AI audio analysis"
heroImage: "https://lh3.googleusercontent.com/pw/AP1GczMxHSCBe_reyB_IDhxVpKeeg6m2Uf7N7sL8rJUYC2iOS8H8TgeHoZGgX26YrepJKhMTAkbtyH7BwbOyPBzINxPgt8XYv7oY3NuzSJbJHioEtR9TVhN8UmwOs1bKbe1T6fJd44v2XERAz8fN2X1N9DE77Q=w2322-h1522-s-no-gm"
tags: ["loooom", "claude-code", "skills", "audio", "gemini", "music"]
---

I've never created a skill on [Loooom](https://loooom.xyz) through the web UI before. I always did it by editing the catalog repo directly. So last night I tried it the "normal" way — describe what you want, let an AI write it, publish it, and see what happens.

The result was genuinely impressive. I'm still thinking about what it could be used for.

## The Setup

I play piano badly. I've been messing around with Sabrina Carpenter's *Espresso* on an MPK Mini, and I had a 37-second SoundCloud clip of me fumbling through it:

![SoundCloud page showing "espresso taste" by andrew — 37 seconds of me attempting Espresso on piano](https://lh3.googleusercontent.com/pw/AP1GczMxHSCBe_reyB_IDhxVpKeeg6m2Uf7N7sL8rJUYC2iOS8H8TgeHoZGgX26YrepJKhMTAkbtyH7BwbOyPBzINxPgt8XYv7oY3NuzSJbJHioEtR9TVhN8UmwOs1bKbe1T6fJd44v2XERAz8fN2X1N9DE77Q=w2322-h1522-s-no-gm)

[→ Listen on SoundCloud](https://soundcloud.com/andrew/espresso-taste)

I wanted to see if I could teach Claude Code to analyze audio — identify BPM, structure, frequency brackets, stems. Not because I needed this to be perfect, but because I wanted to see how far you could get with a well-written skill and no special plugins.

I went to [loooom.xyz/s/mager/how-to-identify-parts-of-a-song](https://www.loooom.xyz/s/mager/how-to-identify-parts-of-a-song), used Gemini to draft the skill description and instructions, and hit publish.

## What Claude Did With It

Inside Claude Code, I just asked:

```
can you identify parts of a song
```

It loaded the skill automatically, asked for an audio source, and I pointed it at a local MP3 file. It didn't have `ffmpeg` or `librosa` installed — so it installed them. Mid-session. No fuss.

Then it ran a Python PCM analysis pipeline and produced this:

---

**ListenIdentifyParts — Analysis Report**

| Property | Value |
|---|---|
| BPM | ~91 (onset-estimated; canonical: ~104) |
| Meter | 4/4 |
| Key | B major |
| Beat Count | 50 |
| Transients | 50 strong onsets |

**Structure Timeline:**

| # | Section | Start | End | Notes |
|---|---|---|---|---|
| 1 | INTRO | 0:00 | 0:04 | Pre-beat, rising |
| 2 | VERSE | 0:04 | 0:12 | Onsets begin, energy climbs |
| 3 | CHORUS | 0:12 | 0:30 | Sustained peak RMS |
| 4 | OUTRO | 0:30 | 0:37 | Hard energy cliff |

**Stems identified:** Kick, Bass/Sub, Lead Vocal, Guitar/Keys, Hi-Hat, Overhead/Air.

---

Here's what it actually looked like in the terminal:

![Phase A and B output — BPM, meter, key, transient map, and section timeline in the terminal](https://lh3.googleusercontent.com/pw/AP1GczMx2LmVGVWSR5wrV-rkWyYuGKVD_rlXKEj4kSDrYVowJL6S_q6EL3M-SychCbvJpFT3B2WkdcRfXSSvO2sLk4qXSRS5byg9gmPY_ylmLXk13O4pJ7VLISXmZbP4e9hpXSCwjD0jDdVTSMO8FL_xZMtyGg=w2322-h1522-s-no-gm)

![Phase C output — frequency brackets, ASCII energy curve, and stem index](https://lh3.googleusercontent.com/pw/AP1GczOtuKtHn96GOt_cPE8tX1cNIdyecI7IcikZI1MbI6l2xi84DlyYaCuxErPcgDFls7R2ngrnRToDgkdJbC80FeKKYxNLX4FDEdz_1OulQjS99uMytV-GZVSELSijjM-baD4AbnZj2gm2SvzQjziLIIjM7g=w2322-h1522-s-no-gm)

From a 37-second amateur piano recording. No tags, no metadata, no prior knowledge besides the filename.

## What's Wild About This

The skill was written by Gemini. Published by me via a web form. Loaded by Claude Code. Then Claude installed its own dependencies, wrote its own analysis pipeline, and produced a publication-quality report.

Three different AIs — one wrote the instructions, one executed them, one (arguably) composed the source material. I was mostly just the person who pointed at the file.

That's not a workflow I planned. It just... emerged.

## What Could This Actually Be Used For?

I'm still working through it. Some possibilities:

- **Music education** — "here's my practice recording, what sections need work?"
- **Production feedback** — fast structural analysis before a mix session
- **Podcast editing** — identify energy drops, silence zones, segment boundaries
- **Sample digging** — find the chorus in a long track, map the beat grid

None of these require perfect accuracy. They require *useful signal* fast. And that's what it delivered.

## The Real Insight

I built this mostly to test skill creation via the UI. But what I got back was a reminder that the value of a skill isn't the code — it's the *framing*. The skill told Claude what to look for, what format to report in, what to do when tools are missing. The analysis itself was Claude improvising with standard Unix tools.

That's the Loooom pattern at its best: a skill teaches the agent a new way to see. In this case, a way to *hear*.

The skill is live at [loooom.xyz/s/mager/how-to-identify-parts-of-a-song](https://www.loooom.xyz/s/mager/how-to-identify-parts-of-a-song) if you want to try it.

---

*My terrible 37-second piano cover that started all this — [espresso taste on SoundCloud](https://soundcloud.com/andrew/espresso-taste).*
