---
title: "I Turned My Design Taste Into a Claude Code Skill"
pubDate: "2026-02-08"
description: "I analyzed three of my projects, interviewed myself about what makes a UI hot, and packaged it all into a reusable skill for Claude Code."
category: "code"
tags: ["AI", "Design", "Claude Code", "Skills"]
keyword: "agent skill design"
---

I wanted to experiment with skill design and see the process end to end. Skills feel like where the whole industry is heading — reusable chunks of knowledge that AI agents can load up on demand — and I wanted to build one myself.

I'm not a designer by trade. But honestly? We're all designers now. When you have skills and very smart computers to help you execute, the bottleneck isn't technical ability — it's taste. Dark backgrounds, neon accents, monospace fonts, hover effects that feel satisfying to click — the whole terminal-hacker-but-make-it-hot vibe.

So I packaged my taste into a skill.

## What's a Skill?

Skills are reusable capabilities for AI agents. Think of them as outsourced chunks of your brain — procedural knowledge that Claude can load up whenever it's relevant. The [skills.sh](https://skills.sh) community has a bunch of them, including Anthropic's own `frontend-design` skill. I wanted one that was specifically *mine*.

## How I Built It

I pointed Claude Code at three of my projects — this blog ([mager-astro-blog](https://github.com/mager/mager-astro-blog)), [prxps](https://prxps.com) (a sports picks app built with SvelteKit), and [beatbrain](https://beatbrain.xyz) (a music discovery app built with Next.js) — and had it analyze my design patterns across all of them.

<figure>
  <img src="https://lh3.googleusercontent.com/pw/AP1GczNymICZ0G7Xfv17vgifdiMWMBoupkUE36NmSyUHt1Z08KqzZ5gLgavYi4itZKBx9L47nNs5e4iqMYrOXh6ZoB31RvtI49wQXh7p6qylQCwSOQvLCCZ8ol-ramyTSTbggOQGfD_P_D712rrRsKuGqI6pig=w1798-h1522-s-no-gm" alt="prxps" />
  <figcaption>prxps — neon green branding, thick-bordered game cards, dark mode everything</figcaption>
</figure>

<figure>
  <img src="https://lh3.googleusercontent.com/pw/AP1GczONLbh1c24d3AC_5QiKYe1HRzOg6jBcO3OeMeTEHWRGtUe__XZu9Ku3f89RF-XlfYMmbz989oS5pQLIJvtS-tWw6vTbACkto6aWcnDPg5l3EwG3LUp81qjmuvx-besqqz3A2UCmdN0Ig7HUzpsN34F_TA=w1798-h1522-s-no-gm" alt="beatbrain" />
  <figcaption>beatbrain — album art discovery wall, warm gold accents, masonry grid</figcaption>
</figure>

It picked up on everything:

- **Dark mode everywhere** — rich blacks in the `#0a-#15` range, never washed-out grays
- **JetBrains Mono + Space Grotesk** as my go-to font pairing across all three projects
- **Neon accent colors** — cyan, purple, lime green, gold — used for glows, badges, and category theming
- **CSS custom properties** for swappable color contexts (blog categories, team colors, warm/cool palettes)
- **Hover micro-interactions** — the `translateY(-2px)` lift, scale transforms, border color transitions
- **Visual discovery layouts** — beatbrain's album art wall, prxps' game card grids, this blog's bento layout

Then it interviewed me. What makes a UI addictive? (Visual discovery — always something new to scroll through.) Should the skill enforce specific tokens or describe a philosophy? (Philosophy — I want flexibility, not a straitjacket.) Any frameworks to blacklist? (Bootstrap, forever and always.)

## What the Skill Does

The skill works three ways:

1. **Generate new UI** — describe what you want and it builds components in my aesthetic
2. **Restyle existing code** — point it at frontend code and it applies the dark-neon-tactile treatment
3. **Design guidance** — ask it for feedback and it responds in terms of feel: hot, sleek, addictive, satisfying

It's adaptive to whatever framework you're using but has opinions when starting from scratch (Astro, SvelteKit, or Next.js). It suggests signature patterns like thick-bordered cards, glassmorphic navbars, and masonry discovery walls — but doesn't force them.

## Try It

```bash
npx skills add mager/mager-frontend-design
```

The repo is public: [github.com/mager/mager-frontend-design](https://github.com/mager/mager-frontend-design)

If you've got a design style you keep repeating, I'd recommend building your own skill. It's like having a design system that lives inside your AI tools instead of a Figma file nobody reads.
