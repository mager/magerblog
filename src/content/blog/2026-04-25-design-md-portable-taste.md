---
title: "DESIGN.md: Reverse Design Engineering for Portable Taste"
description: "I reverse engineered several of my own sites into DESIGN.md files to see how much of a design system can actually be described, and why writing down design intent might be more reusable than it looks."
pubDate: 2026-04-25
category: tech
draft: false
tags: [design, design-systems, ai, frontend]
---

I recently learned about [`DESIGN.md`](https://github.com/google-labs-code/design.md) and got immediately interested in the premise.

Not just design tokens. Not just a component library. The bigger idea: that design taste might be portable if you are willing to describe it concretely.

That hit me at a good time. I have also been using [Stitch](https://stitch.withgoogle.com/) at work and reading about [Claude Design](https://www.anthropic.com/news/claude-design-anthropic-labs), which gave the whole idea a little more weight for me. It is one thing to believe design can be felt. It is another thing to watch more of it become legible, structured, and usable by tools.

Lately I have been very interested in reusable judgment.

On the code side, that is part of what I like about [Impeccable](https://github.com/pbakaus/impeccable). It is not just linting or formatting. It is an attempt to encode a standard so it can travel. `DESIGN.md` felt like the design version of that idea, or at least a step in that direction.

So I tried a small experiment: I reverse engineered several of my own sites into `DESIGN.md` files.

![A collage of several of my sites that I reverse engineered into DESIGN.md files](https://lh3.googleusercontent.com/pw/AP1GczM4YEwlQWANcnK7gdmeag5bRfAna7LDMy86EjBg87qvw-lRJLsgK1rwuwrIYD2mczi08Ll3RDPGxPDQu30xlL9irbmEj5-f1VJ-hEfKVVrFMNmrzxkX7wrqXk-tI7WpoMSlB1n5olnAGqkuV7t4HhRAdg=w2218-h1454-s-no-gm)

I wanted to see whether I could capture their design systems and visual identity in a format that was reusable, not just descriptive after the fact.

I think of this as a kind of reverse design engineering.

Instead of starting with a blank spec and building a product from it, I started with finished interfaces and worked backward: what are the actual rules here? Which parts are stable? Which parts are taste? Which parts are accidental?

## What a `DESIGN.md` actually looks like

A big part of why this clicked for me is that `DESIGN.md` is structured enough to be useful without being so rigid that it collapses into a token dump.

In practice, it usually has a few layers:

- frontmatter or top-level metadata about the product
- design principles and product mood
- typography, color, spacing, and component guidance
- interaction patterns
- explicit do/do-not rules
- examples that show what the system is trying to preserve

The easy part is the token layer.

Colors, type scales, spacing systems, radii, shadows, interaction states, layout constraints. Those are all real and important, and they belong in a structured format. If a product has a strong visual system, a lot of it can be written down with reasonable precision.

A minimal example looks something like this:

```markdown
---
product: kotsu
mood: calm, studious, tactile
personality: warm precision
---

## Typography
- Headings should feel editorial, not app-default
- Body copy should optimize for long reading sessions
- Japanese character examples should feel centered and respectful, not decorative

## Color
- Use warm paper tones instead of flat gray
- Accent color should guide attention, not flood the screen
- Avoid neon unless the feature specifically needs intensity

## Interaction
- Motion should be minimal and orienting
- Hover states should clarify structure, not show off
- Dense learning screens should still feel breathable
```

That part is useful, but it was not the whole story.

## The layer above tokens

What surprised me was how much of the real system lives above variables and components.

Things like:

- mood
- restraint
- pacing
- contrast philosophy
- when glow adds clarity and when it just adds noise
- when typography should feel editorial versus utilitarian
- how serious or playful a surface should feel
- how much visual compression a screen can handle before it starts feeling claustrophobic

Those decisions are absolutely part of a design system. They just do not always show up cleanly in Figma variables or CSS custom properties.

And writing them down does something useful to your brain.

You start noticing that a lot of design taste is really vocabulary plus observation. You have to decide which words actually describe the thing. Warm is not soft. Crisp is not cold. Playful is not noisy. Minimal is not empty. The exercise makes you better at describing interfaces, but also better at describing things in general.

That was one of the most surprising parts for me.

## Reusable taste does not mean repeated style

One trap here is assuming that reusable taste means every product should inherit the same look.

I do not think that is true at all.

Different products need different atmospheres. A blog, a Japanese learning tool, a developer tool, and a predictions app should not all have the same emotional weather just because they came from the same person.

Here is [Kotsu](https://www.kotsu.app/), the latest one I did this for:

![Kotsu, my Japanese character learning site, with its own calmer and more studious atmosphere](https://lh3.googleusercontent.com/pw/AP1GczN42b4mu7VAxkEc9A5HtFuj_PdlccN-78vO8o_eUcrR67Vl9-a8m60IT-nGo85EPp33ZDeoB7DhbTXjzcrQMYSnBT-cHRYOnk2zKC8zwt6YVb-MvyRltiiXuUsa8s_lMUPiIh162XpBD8e3KiAdE56TZg=w2322-h1522-s-no-gm)

Kotsu should not feel like my blog. It should not feel like [Loooom](https://loooom.xyz) either. It needs to feel calmer, more focused, more studious, more respectful of the content.

What ends up being reusable is not one frozen visual style. It is the deeper logic underneath the style.

Things like:

- how I think about visual intensity
- when a layout should feel loose versus compressed
- whether personality should come from typography, color, texture, or motion
- how much ornament a screen can support before it starts competing with the task
- when the interface should disappear and when it should assert a point of view

That is the level I found myself wanting to preserve.

## Reverse engineering my own sites was clarifying

The best part of this exercise was not the final files. It was what happened while writing them.

I was looking at my own projects and asking: what am I actually doing repeatedly? What choices are consistent on purpose? Which ones are just habits? Which ones are worth keeping? Which ones only worked in one context?

That process exposed patterns I had not fully named before.

It also exposed where I was still relying on intuition in a way that does not transfer well. If a design decision only exists as a feeling in my head, it is hard to reuse. It is hard to teach. It is hard to hand to another designer. It is definitely hard to hand to an agent.

Once I wrote the choices down, a few things became obvious very quickly:

- some decisions were truly cross-project taste
- some were local to one product's atmosphere
- some were just habits that looked more intentional than they really were

That is useful information.

## The most practical outcome: I updated my `frontend-design` skill

This was probably the real output of the whole exercise.

I updated my own `frontend-design` skill/prompt based on the patterns I noticed across projects.

That matters because the skill is basically my taste in portable form. Not fully, obviously. But more than before.

The token layer helps, but it is not enough. If you want an agent to produce work that actually feels like you, you need to specify the decisions above the token layer too.

Not just:

- use this radius
- use this font size
- use this accent color

But also:

- avoid default SaaS symmetry when the screen benefits from tension
- let typography carry personality before adding decorative effects
- keep intensity concentrated in one or two places instead of spreading it everywhere
- prefer warmth from materials and rhythm before reaching for louder color
- make the atmosphere explicit: calm, severe, playful, technical, lush, studious, whatever it is

That is what I ended up moving into the skill.

In other words, I was not just documenting my sites. I was distilling the design judgments I want my tools to inherit.

I think that is why this feels important.

## Why this matters for AI without turning into a generic AI post

I do not think `DESIGN.md` means taste is solved.

There will always be a gap between a written principle and a good eye. That is fine. The goal is not to eliminate judgment. The goal is to make more of it portable.

That matters for human teams, but it matters even more for tools and agents.

If design intent stays entirely implicit, it does not travel well. Not between designers, not between projects, and definitely not between humans and agents. But if you can describe even part of it concretely, something useful happens: your taste becomes easier to reuse, critique, refine, and hand off.

That is what I find exciting here.

Not that `DESIGN.md` captures everything.

That it captures more than I expected.

## Try reverse design engineering on your own site

If you want to try this, the move is simple: pick a site you already shipped and work backward.

Ask an agent something like:

```markdown
Analyze this site like a design archaeologist and write a DESIGN.md for it.

I do not just want tokens. I want the visual system, product mood, typography philosophy, contrast philosophy, spacing rhythm, interaction style, and the atmosphere the product is trying to create.

Call out:
- what feels intentional
- what looks like a repeated pattern
- what should be preserved
- what seems accidental or inconsistent
- what kind of product this wants to feel like

Then produce a DESIGN.md that a designer or agent could reuse when extending the product.
```

That prompt alone gets you somewhere useful. The better part is what happens after: you read the result, disagree with it, sharpen the language, and usually learn something about your own work in the process.

## My reverse-engineered design systems

I wanted to end this post with the actual files, inline instead of hidden behind links.

These are long enough that they are better treated as artifacts than excerpts. Each file below is included as a fenced `markdown` block, so the code panels collapse, expand, copy, and fullscreen like the rest of the code on this site.

### magerblog `DESIGN.md`

```markdown
---
version: "alpha"
name: "Magerblog"
description: "Editorial personal site that mixes broadsheet warmth with category-specific subworlds for tech, food, and life."
colors:
  primary: "#1f1c17"
  secondary: "#6c6760"
  tertiary: "#2f5e9e"
  background: "#faf8f5"
  surface: "#f5f3f0"
  surface-strong: "#ffffff"
  border: "#ddd6cd"
  accent-tech: "#2f5e9e"
  accent-food: "#c76a3e"
  accent-life: "#7d8b3a"
  hero-start: "#f05a36"
  hero-mid: "#c49b00"
  hero-end: "#b07a00"
  on-primary: "#faf8f5"
  on-background: "#1f1c17"
  muted: "#8d867d"
typography:
  display-xl:
    fontFamily: "Fraunces"
    fontSize: 5rem
    fontWeight: "700"
    lineHeight: 0.92
    letterSpacing: -0.04em
  display-lg:
    fontFamily: "Source Serif 4"
    fontSize: 3rem
    fontWeight: "700"
    lineHeight: 1
    letterSpacing: -0.03em
  headline-md:
    fontFamily: "Source Serif 4"
    fontSize: 2rem
    fontWeight: "700"
    lineHeight: 1.05
    letterSpacing: -0.02em
  body-lg:
    fontFamily: "Source Serif 4"
    fontSize: 1.125rem
    fontWeight: "400"
    lineHeight: 1.65
  body-md:
    fontFamily: "Source Serif 4"
    fontSize: 1rem
    fontWeight: "400"
    lineHeight: 1.6
  label-ui:
    fontFamily: "Space Grotesk"
    fontSize: 0.75rem
    fontWeight: "700"
    lineHeight: 1.2
    letterSpacing: 0.18em
  label-mono:
    fontFamily: "JetBrains Mono"
    fontSize: 0.75rem
    fontWeight: "500"
    lineHeight: 1.4
    letterSpacing: 0.08em
rounded:
  sm: 4px
  md: 8px
  lg: 10px
  xl: 16px
  full: 9999px
spacing:
  xs: 4px
  sm: 8px
  md: 16px
  lg: 24px
  xl: 40px
  xxl: 64px
  gutter: 40px
  content-max: 1200px
elevation:
  flat: "none"
  soft: "0 8px 24px rgba(31, 28, 23, 0.08)"
  hover: "0 14px 32px rgba(31, 28, 23, 0.12)"
shadows:
  cursor-glow: "0 0 80px rgba(47, 94, 158, 0.12)"
motion:
  quick: "150ms ease"
  standard: "200ms ease"
  expressive: "700ms cubic-bezier(0.22, 1, 0.36, 1)"
components:
  page-shell:
    backgroundColor: "{colors.background}"
    textColor: "{colors.on-background}"
    padding: "{spacing.xl}"
  topbar-link:
    textColor: "{colors.secondary}"
    typography: "{typography.label-ui}"
  hero-wordmark:
    textColor: "{colors.hero-start}"
    typography: "{typography.display-xl}"
  section-label:
    textColor: "{colors.accent-tech}"
    typography: "{typography.label-ui}"
  feature-card:
    backgroundColor: "{colors.surface-strong}"
    textColor: "{colors.on-background}"
    rounded: "{rounded.lg}"
    padding: "{spacing.lg}"
  feature-card-hover:
    backgroundColor: "{colors.surface}"
---

## Overview
Magerblog should feel like a personal publication with taste. The core mood is warm editorial print on an off-white page, but each category gets enough accent color to hint at a different sub-brand without breaking the shared identity.

The homepage is the clearest expression of the system: a calm newspaper-like scaffold, a dramatic serif masthead, thin rules, compact uppercase navigation, and dense story packaging. It should feel authored rather than templated.

## Colors
The base palette stays almost entirely in paper, ink, and rule colors. Warm ivory backgrounds replace pure white so the site feels collected and lived-in. Dark ink is used heavily for headlines and long-form readability.

Accent colors are categorical, not decorative. Blue belongs to tech and information architecture. Terracotta belongs to food and warmth. Olive belongs to life and reflection. The wordmark gradient is the one intentionally loud moment and should read like a sunrise crossing the masthead.

## Typography
Typography carries the personality. Fraunces and Source Serif 4 do most of the emotional work: sharp, literary, slightly luxurious, never sterile. Space Grotesk and JetBrains Mono step in for navigation, metadata, dates, and utility labels.

Headlines should feel compressed and decisive. Body copy should stay generous and readable, with real article rhythm rather than app-style density. Monospace is a supporting voice, not the lead.

## Layout & Spacing
The layout is editorial first. Use full-bleed sections when they help a page feel like a designed spread, but keep internal rhythm disciplined with thin dividing rules and clear column thinking.

Whitespace should be intentional, not excessive. The site works best when it balances breathing room with visible content density: lists of posts, stacked cards, and category zones that invite scanning.

## Elevation & Depth
Depth is subtle. Most of the system relies on borders, paper contrast, and content grouping rather than obvious shadow stacks. Hover lift should feel like a gentle paper card rise, not a product card jump.

The one atmospheric exception is the cursor glow and occasional soft image/card hover, which can add a faint digital sheen on top of the print-inspired structure.

## Shapes
Shapes are mostly restrained: thin rectangles, light rounding on cards, pill treatments only where they help metadata or compact navigation. Nothing should feel bubbly or toy-like.

## Components
Homepage zones should look like sections of a publication, not isolated widgets. Navigation links are compact uppercase labels with tight tracking. Story cards should emphasize title hierarchy first, then description, then date.

Cards in the footer and supporting areas can use a softer modern-web treatment, but they still need to inherit the paper-and-ink discipline from the main publication shell.

## Do's and Don'ts
Do use warm paper backgrounds, serif hierarchy, and category accents with restraint.
Do keep metadata quiet and structured.
Do make the homepage feel like a designed front page.

Don't flood the interface with gradients outside the wordmark and rare atmospheric details.
Don't replace the serif-led identity with generic app typography.
Don't make spacing so loose that the editorial density disappears.
```

### Kotsu `DESIGN.md`

```markdown
---
version: "alpha"
name: "Kotsu"
description: "Japanese learning interface that mixes refined literary type with Tokyo neon accents and disciplined monochrome foundations."
colors:
  primary: "#080808"
  secondary: "#5a5a5a"
  tertiary: "#ff5f1f"
  background: "#ffffff"
  surface: "#f7f7f7"
  surface-strong: "#eeeeee"
  border: "#e4e4e4"
  on-background: "#080808"
  on-primary: "#f5f5f5"
  hiragana: "#ff5f1f"
  katakana: "#0091ff"
  radicals: "#00c070"
  kanji: "#bf4fff"
  vocabulary: "#00c8ff"
  sakura: "#ff3d9a"
  kitsune: "#ff8c00"
typography:
  display-xl:
    fontFamily: "Cormorant Garamond"
    fontSize: 4rem
    fontWeight: "700"
    lineHeight: 1
    letterSpacing: -0.03em
  display-jp:
    fontFamily: "Shippori Mincho"
    fontSize: 4.5rem
    fontWeight: "700"
    lineHeight: 1
    letterSpacing: -0.02em
  headline-md:
    fontFamily: "Cormorant Garamond"
    fontSize: 2rem
    fontWeight: "700"
    lineHeight: 1.1
  body-md:
    fontFamily: "Noto Sans JP"
    fontSize: 1rem
    fontWeight: "400"
    lineHeight: 1.6
  body-italic:
    fontFamily: "Cormorant Garamond"
    fontSize: 1.25rem
    fontWeight: "500"
    lineHeight: 1.4
  label-caps:
    fontFamily: "Noto Sans JP"
    fontSize: 0.75rem
    fontWeight: "700"
    lineHeight: 1.2
    letterSpacing: 0.2em
rounded:
  sm: 8px
  md: 12px
  lg: 16px
  xl: 24px
  full: 9999px
spacing:
  xs: 4px
  sm: 8px
  md: 16px
  lg: 24px
  xl: 40px
  xxl: 64px
  sidebar-width: 260px
elevation:
  flat: "none"
  soft: "0 4px 14px rgba(8, 8, 8, 0.05)"
  neon: "0 0 16px rgba(255, 95, 31, 0.2)"
shadows:
  glow-orange: "0 0 20px rgba(255, 95, 31, 0.25)"
  glow-blue: "0 0 20px rgba(0, 145, 255, 0.25)"
  glow-violet: "0 0 20px rgba(191, 79, 255, 0.25)"
motion:
  standard: "200ms cubic-bezier(0.25, 0.1, 0.25, 1)"
  spring: "500ms cubic-bezier(0.34, 1.56, 0.64, 1)"
  expressive: "700ms cubic-bezier(0.16, 1, 0.3, 1)"
components:
  app-shell:
    backgroundColor: "{colors.background}"
    textColor: "{colors.on-background}"
    padding: "{spacing.lg}"
  nav-surface:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.primary}"
    padding: "{spacing.lg}"
  column-chip:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.primary}"
    rounded: "{rounded.lg}"
    padding: "{spacing.md}"
  search-field:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.secondary}"
    typography: "{typography.body-md}"
    rounded: "{rounded.xl}"
    height: 60px
    padding: 0 20px
  progress-bar:
    backgroundColor: "{colors.tertiary}"
    rounded: "{rounded.full}"
---

## Overview
Kotsu should feel like disciplined Japanese study material that got dropped into a Tokyo drift poster. The base is hard white, hard black, and calm structure. The excitement comes from precise shots of neon color tied to learning categories.

It is not maximalist anime UI. It is restrained, elegant, and sharp, with flashes of speed and nightlife. That contrast is the identity.

## Colors
The foundation is almost monochrome. White paper backgrounds, black ink text, pale dividers, and subtle gray surfaces create the feeling of a serious tool. Neon accents act like highlighters or underglow, never like full-screen decoration.

Each learning column owns a distinct color. Those hues should stay stable across navigation, progress, and categorization so the product feels teachable at a glance.

## Typography
Typography is doing double duty: cultural texture and clarity. Cormorant Garamond gives the product literary elegance. Shippori Mincho gives Japanese headlines ceremonial weight. Noto Sans JP handles interface utility and long-form legibility.

The headline lockup on the home screen is the model to follow: expressive serif English, bold Japanese centerpiece, then a softer italic supporting line.

## Layout & Spacing
Use a clean split-pane learning layout on desktop and a stacked, scrollable structure on mobile. Navigation should feel like a well-organized study cabinet, while the main content can breathe more.

Spacing should be generous enough to make learning calm, but not so roomy that the interface loses momentum. Grid modules and cards should feel crisp and aligned, not floaty.

## Elevation & Depth
Depth is mostly created through contrast, not shadow. In light mode, the system should feel nearly flat. In dark mode, neon glows and scanline textures can come forward slightly to create a late-night street-tech atmosphere.

Motion can feel springy and alive, especially on hover, reveal, and progress moments, but it should never distract from the act of studying.

## Shapes
Use rounded rectangles with a modern but controlled radius. Pills and large radii are acceptable for search and progress affordances, while cards and nav items should stay structured and sturdy.

## Components
Search should feel soft and inviting. Category cards should feel collectible and color-coded. Progress bars can take on the brightest gradients because they represent momentum and reward.

The sidebar is not an admin nav. It should feel like a curated index of study tracks.

## Do's and Don'ts
Do pair monochrome structure with electric category accents.
Do let Japanese typography feel prominent and proud.
Do keep the product calm enough for repeated daily use.

Don't turn every surface into a neon object.
Don't make the layout feel like a gaming dashboard.
Don't use generic sans-serif-only hierarchy.
```

### Loooom `DESIGN.md`

```markdown
---
version: "alpha"
name: "Loooom.xyz"
description: "Human context publishing platform with machine-readable rigor, soft creator warmth, and cyan-to-indigo optimism."
colors:
  primary: "#0e7490"
  secondary: "#57534e"
  tertiary: "#6366f1"
  background: "#fafaf9"
  surface: "#ffffff"
  surface-alt: "#f5f5f4"
  border: "#e7e5e4"
  on-background: "#1c1917"
  on-primary: "#ffffff"
  accent-bright: "#06b6d4"
  accent-dim: "#155e75"
  ocean: "#06b6d4"
  indigo: "#6366f1"
  amber: "#f59e0b"
  rose: "#f43f5e"
  emerald: "#10b981"
  violet: "#8b5cf6"
typography:
  display-xl:
    fontFamily: "Outfit"
    fontSize: 4.75rem
    fontWeight: "700"
    lineHeight: 0.95
    letterSpacing: -0.05em
  headline-lg:
    fontFamily: "Playwrite IT Moderna"
    fontSize: 2.5rem
    fontWeight: "400"
    lineHeight: 1.05
  headline-md:
    fontFamily: "Outfit"
    fontSize: 2rem
    fontWeight: "600"
    lineHeight: 1.1
  body-lg:
    fontFamily: "Outfit"
    fontSize: 1.125rem
    fontWeight: "400"
    lineHeight: 1.7
  body-md:
    fontFamily: "Outfit"
    fontSize: 1rem
    fontWeight: "400"
    lineHeight: 1.65
  code-md:
    fontFamily: "Space Mono"
    fontSize: 0.9375rem
    fontWeight: "400"
    lineHeight: 1.6
  label-sm:
    fontFamily: "Space Mono"
    fontSize: 0.75rem
    fontWeight: "700"
    lineHeight: 1.3
    letterSpacing: 0.08em
rounded:
  sm: 8px
  md: 12px
  lg: 20px
  xl: 28px
  full: 9999px
spacing:
  xs: 4px
  sm: 8px
  md: 16px
  lg: 24px
  xl: 40px
  xxl: 64px
  section-gap: 96px
  content-max: 1200px
elevation:
  soft: "0 2px 16px rgba(28, 25, 23, 0.06)"
  hover: "0 8px 32px rgba(6, 182, 212, 0.12)"
shadows:
  card: "0 2px 16px rgba(28, 25, 23, 0.06)"
  accent: "0 8px 32px rgba(6, 182, 212, 0.12)"
motion:
  standard: "200ms ease"
  theme: "300ms ease"
  hover: "200ms ease"
components:
  page-shell:
    backgroundColor: "{colors.background}"
    textColor: "{colors.on-background}"
    padding: "{spacing.xl}"
  nav-link:
    textColor: "{colors.secondary}"
    typography: "{typography.label-sm}"
  code-chip:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.secondary}"
    typography: "{typography.code-md}"
    rounded: "{rounded.md}"
    padding: 12px
  button-primary:
    backgroundColor: "{colors.accent-bright}"
    textColor: "{colors.on-primary}"
    typography: "{typography.label-sm}"
    rounded: "{rounded.full}"
    height: 52px
    padding: 0 24px
  button-secondary:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.secondary}"
    typography: "{typography.label-sm}"
    rounded: "{rounded.full}"
    height: 52px
    padding: 0 24px
  info-card:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.on-background}"
    rounded: "{rounded.lg}"
    padding: "{spacing.lg}"
---

## Overview
Loooom should feel like infrastructure for the AI era that still has a human pulse. It is not cyberpunk, and it is not corporate enterprise software. The tone is optimistic, legible, and slightly playful, with machine-readable precision sitting beside creator warmth.

The homepage demonstrates the balance clearly: code snippets and endpoint language are presented with confidence, but the overall atmosphere stays bright, airy, and welcoming.

## Colors
The color system lives in a cream-and-ocean world. Cyan and indigo provide the core energy, while neutral stone backgrounds keep the product grounded. Accent color should read as clarity and momentum, not alarm.

Supporting colors like amber, rose, emerald, and violet are useful for topic differentiation, examples, and ecosystem cues, but the heart of the brand is cyan plus indigo over soft neutrals.

## Typography
Outfit is the structural backbone: clean, current, and readable. Space Mono gives code, commands, and agent-oriented UI the necessary machine credibility. Playwrite IT Moderna and the sketchier supporting handwriting family add just enough human-made texture to keep the product from feeling dry.

The result should feel like docs, product marketing, and creator tooling all agreed to speak in one voice.

## Layout & Spacing
Use broad sections with clear narrative sequencing. This is a concept-heavy product, so layout must teach: intro, quickstart, proof, format explanation, and examples. Generous spacing helps the copy breathe, but modules should stay compact enough to preserve momentum.

Code snippets, endpoint grids, and CTA rows should feel easy to scan. The page should work equally well for a curious human and an agent developer skimming for protocol details.

## Elevation & Depth
Depth is soft and modern. Cards should sit above the page with tasteful shadows and subtle hover lift. There is room for gradient energy in CTAs and hero accents, but surfaces should remain clean and readable.

The system should feel polished, not glossy. It can be expressive without looking overproduced.

## Shapes
Rounded corners are important here. They soften the technical subject matter and give the platform a maker-friendly tone. Pills are appropriate for buttons, code prompts, and badges. Cards can be noticeably rounded without feeling childish.

## Components
Code prompts and endpoint rows should feel like trustworthy interfaces for machines. Hero actions should feel optimistic and forward-moving. Informational cards should make protocol concepts feel approachable.

When choosing between a harsher terminal treatment and a softer documentation treatment, prefer the softer one unless the content is explicitly machine-facing.

## Do's and Don'ts
Do balance machine clarity with creator warmth.
Do use cyan and indigo as the signature energy.
Do let code UI and prose UI coexist naturally.

Don't make the brand feel dark, paranoid, or hacker-only.
Don't overdecorate with too many playful type treatments at once.
Don't let cards get so airy that the product loses technical confidence.
```

### prxps `DESIGN.md`

```markdown
---
version: "alpha"
name: "PRXPS"
description: "Sports prediction product with dual personalities: a dark, high-adrenaline mobile experience and a cleaner editorial desktop system."
colors:
  primary: "#00ff88"
  secondary: "#888888"
  tertiary: "#ff4444"
  background: "#0a0a0a"
  surface: "#141414"
  surface-strong: "#1a1a1a"
  border: "#2a2a2a"
  on-background: "#ffffff"
  on-primary: "#0a0a0a"
  info: "#4488ff"
  warning: "#ffaa00"
  gold: "#ffc107"
  blue-accent: "#1e90ff"
  pink-accent: "#ff1493"
  orange-accent: "#ff6400"
typography:
  display-xl:
    fontFamily: "Space Grotesk"
    fontSize: 5rem
    fontWeight: "800"
    lineHeight: 0.9
    letterSpacing: -0.03em
  display-sports:
    fontFamily: "Bebas Neue"
    fontSize: 4rem
    fontWeight: "700"
    lineHeight: 0.95
    letterSpacing: 0.01em
  headline-md:
    fontFamily: "Space Grotesk"
    fontSize: 1.5rem
    fontWeight: "700"
    lineHeight: 1.1
  body-md:
    fontFamily: "Inter"
    fontSize: 1rem
    fontWeight: "400"
    lineHeight: 1.6
  body-mono:
    fontFamily: "JetBrains Mono"
    fontSize: 0.875rem
    fontWeight: "500"
    lineHeight: 1.5
  label-xs:
    fontFamily: "JetBrains Mono"
    fontSize: 0.75rem
    fontWeight: "600"
    lineHeight: 1.2
    letterSpacing: 0.08em
rounded:
  sm: 8px
  md: 12px
  lg: 16px
  xl: 24px
  full: 9999px
spacing:
  xs: 4px
  sm: 8px
  md: 16px
  lg: 24px
  xl: 40px
  xxl: 64px
  nav-height-mobile: 80px
  content-max: 1200px
elevation:
  soft: "0 4px 16px rgba(0, 0, 0, 0.4)"
  strong: "0 8px 32px rgba(0, 0, 0, 0.5)"
  glow: "0 0 40px rgba(0, 255, 136, 0.4)"
shadows:
  accent-green: "0 4px 20px rgba(0, 255, 136, 0.3)"
  mesh: "0 0 60px rgba(255, 255, 255, 0.04)"
motion:
  fast: "150ms cubic-bezier(0.4, 0, 0.2, 1)"
  base: "250ms cubic-bezier(0.4, 0, 0.2, 1)"
  spring: "500ms cubic-bezier(0.34, 1.56, 0.64, 1)"
components:
  app-shell:
    backgroundColor: "{colors.background}"
    textColor: "{colors.on-background}"
    padding: "{spacing.lg}"
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.on-primary}"
    typography: "{typography.label-xs}"
    rounded: "{rounded.xl}"
    height: 64px
    padding: 0 32px
  button-secondary:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.on-background}"
    typography: "{typography.label-xs}"
    rounded: "{rounded.xl}"
    height: 64px
    padding: 0 32px
  card-game:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.on-background}"
    rounded: "{rounded.xl}"
    padding: "{spacing.lg}"
  status-win:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.on-primary}"
    rounded: "{rounded.sm}"
    padding: 4px
  status-loss:
    backgroundColor: "{colors.tertiary}"
    textColor: "{colors.on-background}"
    rounded: "{rounded.sm}"
    padding: 4px
---

## Overview
PRXPS is intentionally split between two modes. On mobile, it should feel like an addictive, high-contrast, always-on sports product: dark background, huge type, neon-green confidence, and full-screen decision making. On desktop and content pages, it can loosen into a cleaner editorial system, but it still needs edge and attitude.

The shared identity is speed, conviction, and risk-free adrenaline. Even when the UI is minimal, it should feel alive.

## Colors
The dark mobile palette is the emotional center of the brand: black backgrounds, white text, bright green action, and sharp supporting red, blue, orange, and gold cues. Green means momentum and confidence. Red means loss or warning. Supporting colors help differentiate modules, sports, and analysis layers.

Desktop can bring in lighter paper surfaces for certain pages, but the brand should still read as bold and sports-native rather than soft SaaS.

## Typography
PRXPS uses multiple type voices on purpose. Space Grotesk handles brand and product clarity. JetBrains Mono gives the app a betting-terminal edge. Bebas Neue appears when a moment needs sports-poster intensity. Inter supports denser data surfaces where neutrality helps.

The system works best when large hero text is unapologetically big and short labels stay crisp, monospace, and uppercase.

## Layout & Spacing
Mobile should prioritize full-screen modules, strong thumb targets, and quick gesture-friendly decisions. Desktop should preserve scanability across leagues, cards, drawers, and recommendation zones without feeling like a spreadsheet.

Spacing can be generous around hero moments, but the product overall should feel dense with action, not floaty or luxurious for its own sake.

## Elevation & Depth
Depth is cinematic and dark. Use layered blacks, mesh gradients, soft card shadows, and occasional accent glows. Hover and press interactions should feel immediate and physical.

Animated backgrounds, floating orbs, and subtle shimmer are welcome when they heighten energy. They should support the sense of live action rather than distract from picks and outcomes.

## Shapes
Use sturdy rounded rectangles with large touch-friendly radii on mobile. Avoid delicate or tiny controls. Pills and broad cards work well because they feel like decisive interactive slabs.

## Components
Primary actions should look unmistakably tappable and rewarding. Game cards should feel like immersive decision surfaces, not plain data tables. Recommendation modules can lean brighter and more stylized, especially when highlighting AI-picked content.

If a component feels polite, it probably needs more contrast, scale, or urgency.

## Do's and Don'ts
Do prioritize bold contrast, large type, and fast interaction feedback.
Do let green own the brand's winning energy.
Do make mobile feel like the hero experience.

Don't flatten everything into generic sportsbook UI.
Don't use low-contrast gray-on-gray surfaces for key actions.
Don't make sports moments feel timid.
```

### Beatbrain `DESIGN.md`

```markdown
---
version: "alpha"
name: "beatbrain-v2"
description: "Music discovery UI that blends editorial minimalism with collectible album-wall energy."
colors:
  primary: "#1a1a1a"
  secondary: "#888580"
  tertiary: "#ff3366"
  background: "#faf9f7"
  surface: "#ffffff"
  surface-muted: "#f3f1ec"
  border: "#e8e6e1"
  border-strong: "#d4d0c8"
  warm: "#ff6b35"
  cool: "#6c63ff"
  mint: "#00c9a7"
  violet: "#9d4edd"
  on-primary: "#ffffff"
  on-background: "#1a1a1a"
typography:
  display-xl:
    fontFamily: "Space Grotesk"
    fontSize: 7rem
    fontWeight: "800"
    lineHeight: 0.88
    letterSpacing: -0.04em
  headline-md:
    fontFamily: "Space Grotesk"
    fontSize: 2rem
    fontWeight: "700"
    lineHeight: 1
    letterSpacing: -0.03em
  body-md:
    fontFamily: "JetBrains Mono"
    fontSize: 1rem
    fontWeight: "400"
    lineHeight: 1.5
  label-md:
    fontFamily: "JetBrains Mono"
    fontSize: 0.75rem
    fontWeight: "600"
    lineHeight: 1.3
    letterSpacing: 0.08em
  meta-xs:
    fontFamily: "JetBrains Mono"
    fontSize: 0.6875rem
    fontWeight: "500"
    lineHeight: 1.2
rounded:
  sm: 6px
  md: 12px
  lg: 16px
  xl: 24px
  full: 9999px
spacing:
  xs: 4px
  sm: 8px
  md: 16px
  lg: 24px
  xl: 32px
  xxl: 48px
  container-padding: 32px
  max-width: 1200px
elevation:
  soft: "0 2px 20px rgba(0, 0, 0, 0.06)"
  card: "0 4px 12px rgba(0, 0, 0, 0.03)"
  hover: "0 8px 32px rgba(0, 0, 0, 0.06)"
shadows:
  glow-accent: "0 4px 24px rgba(255, 51, 102, 0.15)"
  glow-warm: "0 4px 24px rgba(255, 107, 53, 0.15)"
  glow-cool: "0 4px 24px rgba(108, 99, 255, 0.15)"
motion:
  fade-up: "500ms cubic-bezier(0.22, 1, 0.36, 1)"
  fade-in: "300ms ease-out"
  hover: "300ms ease"
components:
  app-shell:
    backgroundColor: "{colors.background}"
    textColor: "{colors.on-background}"
    padding: "{spacing.container-padding}"
  search-field:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.primary}"
    typography: "{typography.body-md}"
    rounded: "{rounded.md}"
    height: 40px
    padding: 0 16px
  filter-pill:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.secondary}"
    typography: "{typography.label-md}"
    rounded: "{rounded.full}"
    padding: 0 16px
  filter-pill-active:
    backgroundColor: "{colors.tertiary}"
    textColor: "{colors.on-primary}"
  track-tile:
    backgroundColor: "{colors.surface}"
    rounded: "{rounded.sm}"
  track-overlay:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.on-primary}"
---

## Overview
Beatbrain should feel like flipping through a beautifully stocked record wall while a sharp editor quietly tags what matters. The experience is light, airy, and restrained at the shell level so the album art can provide most of the color and visual noise.

The interface is intentionally split between two energies: editorial scaffolding and obsessive discovery. Big typographic headers, mono metadata, clean search, and capsule filters establish order. Dense cover grids create the addictive browse behavior.

## Colors
The palette is mostly neutral paper and phosphor ink. Hot pink is the signature action color, and it should stay memorable because it is used sparingly: active filters, count highlights, key emphasis. Supporting warm, cool, mint, and violet hues are there to give modules room for tasteful variation, not to turn the app into a rainbow.

Album art is a first-class design material. UI chrome should stay quiet enough that the cover grid feels rich and collectible.

## Typography
Space Grotesk handles the attitude: oversized, blunt, contemporary, energetic. JetBrains Mono handles the system voice: counts, source labels, search, metadata, and framing details.

This should feel like a music zine cleaned up by a product designer. Headlines can be huge and cropped close. Supporting text should stay compact and utilitarian.

## Layout & Spacing
Use a wide centered container with enough padding to feel premium, but keep discovery modules dense. Grids should minimize dead space and let artwork create rhythm. Filters, search, and counts should sit close to the content they control.

The homepage works best when the first screen quickly establishes brand, search, and browse density without wasting vertical real estate.

## Elevation & Depth
Depth is soft and editorial. Cards can lift slightly on hover, but the effect should be understated. Borders and paper contrast matter more than heavy shadows. Accent glow is best reserved for small emphasis moments.

## Shapes
Rounded rectangles are part of the softness, but they should never feel bubbly. Pills for filters and modest rounding on search and surfaces are enough. Album tiles can stay nearly square and sharp to preserve the library feeling.

## Components
Search should look like a calm utility bar. Filter pills should read like swappable data tags. Track tiles should prioritize imagery first, then reveal metadata through overlays and hover states.

If a surface competes with album art for attention, it is too loud. UI elements should frame discovery, not replace it.

## Do's and Don'ts
Do keep the shell quiet and let covers do the talking.
Do use oversized headlines and monospace metadata together.
Do preserve dense browse patterns and instant scanability.

Don't overuse accent colors.
Don't add bulky card chrome around artwork.
Don't turn the experience into a generic dashboard.
```

### Impeccable `DESIGN.md`

```markdown
---
name: Impeccable
description: Warm-paper editorial sanctuary — committed serif display, one decisive magenta, flat surfaces at rest.

# Colors use OKLCH per `The OKLCH-Only Rule` in §2. Stitch's linter validates
# hex sRGB only, so it will warn on these entries — deliberate trade for one
# source of truth and full wide-gamut fidelity. Our own parser accepts strings.
colors:
  editorial-magenta: "oklch(60% 0.25 350)"
  editorial-magenta-deep: "oklch(52% 0.25 350)"
  warm-ash-cream: "oklch(96% 0.005 350)"
  crisp-paper-white: "oklch(98% 0 0)"
  deep-graphite: "oklch(10% 0 0)"
  soft-charcoal: "oklch(25% 0 0)"
  mid-ash: "oklch(55% 0 0)"
  paper-mist: "oklch(92% 0 0)"
  magenta-whisper: "oklch(60% 0.25 350 / 0.15)"
  magenta-veil: "oklch(60% 0.25 350 / 0.25)"

typography:
  display:
    fontFamily: "Cormorant Garamond, Georgia, serif"
    fontSize: "clamp(2.5rem, 7vw, 4.5rem)"
    fontWeight: 300
    lineHeight: 1
  headline:
    fontFamily: "Cormorant Garamond, Georgia, serif"
    fontSize: "clamp(1.75rem, 4vw, 2.5rem)"
    fontWeight: 400
    lineHeight: 1.2
  title:
    fontFamily: "Cormorant Garamond, Georgia, serif"
    fontSize: "clamp(1.125rem, 2.5vw, 1.75rem)"
    fontWeight: 400
    lineHeight: 1.3
  body:
    fontFamily: "Instrument Sans, system-ui, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.6
  body-lead:
    fontFamily: "Instrument Sans, system-ui, sans-serif"
    fontSize: "1.0625rem"
    fontWeight: 400
    lineHeight: 1.65
  supporting:
    fontFamily: "Instrument Sans, system-ui, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 400
    lineHeight: 1.6
  label:
    fontFamily: "Instrument Sans, system-ui, sans-serif"
    fontSize: "0.9rem"
    fontWeight: 500
    letterSpacing: "0.05em"
  micro-label:
    fontFamily: "Instrument Sans, system-ui, sans-serif"
    fontSize: "0.6875rem"
    fontWeight: 500
    letterSpacing: "0.1em"
  mono:
    fontFamily: "Space Grotesk, monospace"
    fontSize: "0.75rem"
    fontWeight: 400

rounded:
  none: "0"
  sm: "4px"
  md: "8px"
  lg: "12px"
  xl: "16px"

spacing:
  xs: "8px"
  sm: "16px"
  md: "24px"
  lg: "32px"
  xl: "48px"
  "2xl": "80px"
  "3xl": "120px"

components:
  button-primary:
    backgroundColor: "{colors.deep-graphite}"
    textColor: "{colors.crisp-paper-white}"
    typography: "{typography.label}"
    rounded: "{rounded.none}"
    padding: "16px 48px"
  button-primary-hover:
    backgroundColor: "{colors.editorial-magenta}"
    textColor: "{colors.crisp-paper-white}"
  input-text:
    backgroundColor: "transparent"
    textColor: "{colors.deep-graphite}"
    rounded: "{rounded.sm}"
    padding: "8px 12px"
  card:
    backgroundColor: "{colors.warm-ash-cream}"
    textColor: "{colors.deep-graphite}"
    rounded: "{rounded.md}"
    padding: "24px"
  card-feature:
    backgroundColor: "{colors.crisp-paper-white}"
    textColor: "{colors.deep-graphite}"
    rounded: "{rounded.lg}"
    padding: "48px"
  nav-link:
    textColor: "{colors.deep-graphite}"
    typography: "{typography.body}"
  nav-link-hover:
    textColor: "{colors.editorial-magenta}"
---

# Design System: Impeccable

## 1. Overview: The Editorial Sanctuary

**Creative North Star: "The Editorial Sanctuary"**

The Impeccable site reads more like a printed design publication than a SaaS landing page. Committed typography, generous breathing room, and a single decisive accent that cuts through warm paper. The interface feels **considered, unhurried, and expert** — the work of someone who has made the calls a thousand times and has zero interest in chasing the current AI-tool aesthetic.

The aesthetic philosophy is **restraint in service of craft**. Every element earns its place. Nothing is decorative without function. The palette is dominated by warm paper tones with one vibrant voice. The typography pairs a stately italic serif with a clean neutral sans. Motion is reserved for moments that actually communicate state. The site is the demo — it must pass the same anti-pattern audit it asks its users to run on their own work.

This system explicitly rejects the AI-tool visual vocabulary that surrounds the product: dark mode with purple gradients, neon accents, glassmorphism, glowing cyan-on-black, SaaS hero-metric layouts, and identical-card feature grids. When in doubt, do less than a marketing site would, more than a portfolio would.

**Key Characteristics:**
- Warm off-white paper tones with an almost-imperceptible magenta tint for subliminal palette cohesion.
- A single decisive magenta accent used on no more than 10% of any screen. Its rarity is the point.
- Italic serif for display type; clean neutral sans for body at 1.6+ line-height.
- Sharp, uppercase, letter-tracked primary CTAs — no rounded-rectangle-with-drop-shadow defaults.
- Flat surfaces at rest. Shadows appear only as a response to state (hover, elevation, focus).
- Asymmetric magazine-scale spacing; intentionally skips the 4px step.

## 2. Colors: The Warm-Paper Palette

A two-chord palette: warm paper neutrals carrying a near-invisible magenta tint, plus one decisive accent in the same hue family. No secondary or tertiary accents in the core system — the restraint is doctrinal.

### Primary
- **Editorial Magenta** (oklch(60% 0.25 350)): The one vibrant voice. Primary CTAs, active navigation states, live-state indicators, rare editorial emphasis. Never used as a gradient, never as a background wash, never as text fill. Rarity is the design choice.

### Neutral
- **Warm Ash Cream** (oklch(96% 0.005 350)): Primary page background. Near-white with a near-imperceptible magenta tint that creates subconscious cohesion with Editorial Magenta. Used on `body` and standard surfaces.
- **Crisp Paper White** (oklch(98% 0 0)): Pure background. Used for inverted text moments (white-on-dark CTAs) and surfaces needing maximum contrast. Almost never the page background — too cold alone.
- **Deep Graphite** (oklch(10% 0 0)): Primary text for body copy and headlines. Softer than pure black, reads as confident-but-not-aggressive on warm paper. Background of the primary CTA.
- **Soft Charcoal** (oklch(25% 0 0)): Secondary text — taglines, hook paragraphs, supporting copy. Clearly subordinate to Deep Graphite without being washed out.
- **Mid Ash** (oklch(55% 0 0)): Tertiary text — micro-labels, captions, meta lines, "works with" labels. At small sizes reads as intentionally recessed metadata.
- **Paper Mist** (oklch(92% 0 0)): Hairline borders, section dividers, the barely-visible structural seams.

### Accent Alpha Variants
- **Editorial Magenta Deep** (oklch(52% 0.25 350)): Hover/active state for Editorial Magenta. Small darkening, confirms interaction without shouting.
- **Magenta Whisper** (oklch(60% 0.25 350 / 0.15)): Glow backdrop under accent elements on hover (diffuse shadows only), subtle selection highlights.
- **Magenta Veil** (oklch(60% 0.25 350 / 0.25)): Slightly stronger translucent tint for focus rings and emphasis shells.

### Command Category Tints (fenced — do not extend)
A separate six-tint vocabulary used exclusively to color-code the periodic-table visualization of impeccable's 23 commands. These tints predate the OKLCH system and live in one component. **Do not extend this vocabulary elsewhere.**

- **Create** (bg `#fdf2f8` / border `#ec4899` / text `#be185d`)
- **Evaluate** (bg `#fdf4ff` / border `#d946ef` / text `#a21caf`)
- **Refine** (bg `#eff6ff` / border `#3b82f6` / text `#1d4ed8`)
- **Simplify** (bg `#fffbeb` / border `#f59e0b` / text `#b45309`)
- **Harden** (bg `#f0fdf4` / border `#22c55e` / text `#15803d`)
- **System** (bg `#f5f5f4` / border `#78716c` / text `#44403c`)

### Named Rules

**The One Voice Rule.** Editorial Magenta is the only vibrant color in the system. No supporting accent is added, ever, no matter how much a layout "wants" a second color. If a second emphasis point is needed, use scale or weight, never a second hue.

**The Paper-Not-White Rule.** The page background is Warm Ash Cream, never Crisp Paper White. Pure white is reserved for specific inverted surfaces. Warmth is load-bearing — without it, the site reads as generic and the decisive magenta reads as abrasive rather than decisive.

**The OKLCH-Only Rule.** All new colors must be declared in OKLCH. Legacy hex values exist only in the fenced Command Category Tints. Do not introduce new hex-declared colors into the system.

## 3. Typography: The Italic-and-Ink Voice

**Display Font:** Cormorant Garamond (with Georgia fallback)
**Body Font:** Instrument Sans (with system-ui fallback)
**Label/Mono Font:** Space Grotesk (used as a geometric mono, not for code blocks)

**Character:** The display face is a refined transitional serif used in its **italic** cut — stately without being stuffy, drawing on long-form editorial headline traditions. The body face is a clean neutral sans with subtle geometric warmth, chosen to set long paragraphs without visual overhead. The "mono" is a contemporary grotesque reserved for small labels and metadata where a machine-adjacent feel reinforces the command-line product story.

### Hierarchy

- **Display** (display family, weight 300, italic, clamp(2.5rem, 7vw, 4.5rem), line-height 1): Hero title only. The light weight + italic cursive reads as an author signature rather than a marketing headline.
- **Headline** (display family, weight 400, clamp(1.75rem, 4vw, 2.5rem), line-height 1.2): Section headings. Larger editorial moments.
- **Title** (display family, weight 400, italic, clamp(1.125rem, 2.5vw, 1.75rem), line-height 1.3): Hero tagline / section leads. A quieter second display voice.
- **Body** (body family, weight 400, 1rem, line-height 1.6): Paragraph copy. Capped at 65–75ch for readability.
- **Body Lead** (body family, weight 400, 1rem–1.0625rem, line-height 1.6–1.65): The one or two "lead" paragraphs on each page. Slightly relaxed leading.
- **Supporting** (body family, weight 400, 0.875rem, line-height 1.6): Captions, footnotes, supporting context.
- **Label** (body family, weight 500, 0.9rem, `text-transform: uppercase`, `letter-spacing: 0.05em`): CTA labels. Short, declarative.
- **Micro-Label** (body family, weight 500, 0.625–0.6875rem, `text-transform: uppercase`, `letter-spacing: 0.1em`): "Works with", "What's Included", "v3.0 Changelog".
- **Monospace Meta** (mono family, weight 400–500, 0.6875–0.8125rem): Command names in inline prose, periodic-table tile labels.

### Named Rules

**The Italic-Is-Voice Rule.** Italic is used as a voice choice for display type, not as emphasis within body copy. Body emphasis is carried by weight or by swapping to the mono family (see `<em>` in command menus). Treating italic as emphasis inside paragraphs dilutes the display voice.

**The 1.6 Leading Rule.** Body line-height is 1.6 everywhere. Not 1.5, not 1.7, not "relaxed". This is the load-bearing readability decision — when the site reads as calm and editorial, it's 1.6 doing the work.

**The Fluid-Headlines-Only Rule.** Headings use `clamp()` fluid sizing. Body copy uses fixed `rem` values. Fluid body sizes look clever and feel wrong — they make line-lengths wander off spec.

## 4. Elevation

Flat by default. Depth is conveyed through **state response**, not structural shadow. Surfaces rest on a single tonal layer (Warm Ash Cream); shadows appear only when an element is hovered, deliberately lifted, or requires ambient separation from a busy area.

### Shadow Vocabulary

- **Soft Hover Lift** (`0 4px 24px -4px rgba(0,0,0,0.12), 0 1px 3px rgba(0,0,0,0.06)`): The default hover response on cards and interactive surfaces. Diffuse, offset downward.
- **Lifted Card** (`0 20px 40px rgba(0,0,0,0.08)`): Deliberately elevated content (featured cards, install blocks). Low alpha — never reads as dark.
- **Accent Glow** (`0 20px 60px var(--color-accent-dim)`): Magenta-tinted ambient shadow under the one or two moments that should feel magnetic. Used sparingly — this is the "rare ingredient" of the shadow vocabulary.
- **Tooltip / Popover** (`0 0 20px rgba(0,0,0,0.15)` or `0 2px 8px rgba(0,0,0,0.1)`): Tight shadow for small floating UI.

### Named Rules

**The Flat-By-Default Rule.** Surfaces are flat at rest. If you find yourself adding a shadow to a non-interactive, non-elevated element, stop — you're reaching for Material Design muscle memory. Use a hairline Paper Mist border instead, or no articulation at all.

**The Low-Alpha Rule.** Every shadow in the system uses ≤0.15 alpha on its strongest blur. Higher alphas read as 2014 Material Design drop shadows — an immediate tell that the design wasn't considered.

**The Tinted-Shadow-Only-For-Accent Rule.** Neutral shadows (black alpha) for structure. Colored (magenta-dim) shadows only for the deliberate accent-glow moments. Never tint shadows for decorative effect.

## 5. Components

### Buttons

- **Shape:** Flat and squared by default (`border-radius: 0`). Sharp corners are an explicit editorial choice — the site rejects the rounded-rectangle-with-drop-shadow default that marks most AI-adjacent marketing pages.
- **Primary (hero-cta-combined):** Deep Graphite background, Crisp Paper White text. Padding 16px / 48px (`--spacing-sm` / `--spacing-xl`). Uppercase, `letter-spacing: 0.05em`, weight 500. No border, no shadow at rest.
- **Hover:** `transform: translateY(-2px)` and background shifts to Editorial Magenta. Transition 200ms linear ease. A small confident step up, never a bounce.
- **Focus:** Browser-default focus ring combined with the hover treatment. Visible keyboard focus is required.
- **Secondary:** Inline text link in body copy, weight 500, hover shifts to Editorial Magenta. **No boxed secondary button exists in the system** — the site avoids the "stack of equal-weight CTAs" pattern entirely.
- **Chip (picker overlay):** Radius 3–5px, small padding, mono-family label. Used in the live-mode action selector.

### Cards & Containers

- **Corner Style:** Controlled vocabulary — 4px (chips / inline callouts), 8px (standard cards and card-CTAs), 12px (feature cards, install blocks), 16px (large content frames). No single "rounded-lg" default. Radius is picked per component weight.
- **Background:** Warm Ash Cream or Crisp Paper White depending on layering. Deeper nested surfaces may lift to Paper Mist as a near-imperceptible tone shift.
- **Shadow:** Flat at rest — see Elevation for the shadow vocabulary that applies on hover/lift.
- **Border:** Hairline 1px in Paper Mist when a surface needs articulation without shadow.
- **Internal Padding:** 16–32px for typical cards; large editorial frames 48px+. Padding matches visual weight, not applied uniformly.

### Inputs / Fields

The site is primarily editorial, so inputs are minimal:

- **Email / text field:** Radius 4–6px, hairline Paper Mist border, transparent background. Focus state shifts border to Editorial Magenta with a Magenta Whisper backdrop glow.
- **Combobox / select (filter controls):** Same stroke vocabulary, smaller padding, chevron glyph in Mid Ash.
- **No custom checkbox/radio styling** beyond what the live-mode command picker needs.

### Navigation

- **Site Header:** 62px compact bar, left-aligned brand lockup (monochrome mark + wordmark), right-aligned link cluster.
- **Typography:** Body family, weight 500, 0.9–1rem. Normal case — the header is readable prose, not a set of signals.
- **Default State:** Deep Graphite on Warm Ash Cream.
- **Hover / Active:** Smooth color transition to Editorial Magenta, 200ms. No underline bar at rest; if an active indicator is needed, a thin accent-colored underline appears.
- **Mobile:** Collapses to an icon-triggered drawer when horizontal space is insufficient.

### Periodic Table of Commands (signature component)

A distinctive custom element worth documenting: the 23 commands are laid out as a periodic-table grid of 56×64px tiles, each with a category tint background, category-colored border, atomic number in the top-left (mono family, 7px), a symbol in the center (display family, weight 500, 20px), and a command label in mono below. Hover lifts the tile 2px with a category-colored shadow. Tiles are the one place where the Category Tint vocabulary (see Colors) is used on a colored surface rather than as a text accent.

### Layout & Spacing (fold from spec-absent Layout section)

- **Max width:** Content blocks cap at 900px (`--width-content`); page-level containers at 1400px (`--width-max`). Prose further constrained to 65–75ch.
- **Spacing scale:** 8 / 16 / 24 / 32 / 48 / 80 / 120px (`--spacing-xs` through `--spacing-3xl`). The 4px step is deliberately omitted — this is an editorial scale, not an app-UI scale.
- **Rhythm:** 80–120px between top-level sections, 24–48px between content groups within a section, 6–16px inside tight clusters.
- **Grid:** No traditional column grid. Hero layouts are asymmetric two-column splits. Feature sections use `repeat(auto-fit, minmax(280px, 1fr))` rather than breakpoint-driven columns.
- **Motion:** 150ms for color/opacity, 300–400ms for transforms, 600–1200ms for orchestrated entrances. All use `--ease-out` (`cubic-bezier(0.16, 1, 0.3, 1)`) or `--ease-out-quint`. `prefers-reduced-motion` collapses every non-essential transition.

## 6. Do's and Don'ts

### Do:

- **Do** treat Warm Ash Cream (not Crisp Paper White) as the default page background. Warmth is load-bearing — see The Paper-Not-White Rule.
- **Do** use Editorial Magenta on ≤10% of any given screen. Scarcity is what makes it read as decisive rather than noisy — see The One Voice Rule.
- **Do** set all new colors in OKLCH. Hex is for the fenced Command Category Tints only.
- **Do** use italic display type as a voice, not as emphasis inside paragraphs. Body emphasis is carried by weight.
- **Do** use `clamp()` fluid sizing for headings; use fixed `rem` for body — see The Fluid-Headlines-Only Rule.
- **Do** keep the primary CTA sharp and squared. `border-radius: 0`, uppercase, letter-tracked. This is the editorial signature.
- **Do** use `--ease-out` (`cubic-bezier(0.16, 1, 0.3, 1)`) or `--ease-out-quint` on transitions. Expo-out only.
- **Do** leave surfaces flat at rest. Reach for shadows only on hover or for deliberate elevation — see The Flat-By-Default Rule.
- **Do** respect `prefers-reduced-motion` on every animation.
- **Do** cap body line length at 65–75ch via `max-width`.

### Don't:

- **Don't** use pure black (#000) or pure white (#fff). Always the tinted neutrals (Deep Graphite / Warm Ash Cream / Crisp Paper White).
- **Don't** use `border-left` or `border-right` greater than 1px as a colored stripe on cards, list items, callouts, or alerts. Ever. This is the single most recognizable AI-dashboard tell.
- **Don't** use `background-clip: text` with a gradient. Gradient text is banned across the site. If you want emphasis, use weight or size, never gradient fill.
- **Don't** default to dark mode. The site is light mode because editorial reading is a light-mode activity. Dark mode with glowing accents is the AI-tool aesthetic Impeccable exists to replace.
- **Don't** use glassmorphism (blurred translucent cards, glass borders, glow backgrounds as decoration). It is on PRODUCT.md's explicit anti-reference list.
- **Don't** add a second accent color. If a layout "needs" a second emphasis point, use scale or weight, not hue.
- **Don't** use rounded rectangles with generic drop shadows. That's the "could be any AI output" fingerprint.
- **Don't** use bounce or elastic easing. Real objects decelerate smoothly — expo-out is the signature.
- **Don't** animate layout properties (`width`, `height`, `padding`, `margin`). Use `transform` and `opacity` only.
- **Don't** nest cards inside cards. Flatten the hierarchy.
- **Don't** use identical card grids (same-sized cards with icon + heading + text, repeated endlessly).
- **Don't** use the hero-metric layout template (big number + small label + supporting stats + gradient accent). SaaS cliché.
- **Don't** extend the Command Category Tints vocabulary. Those hex tints are scoped to the periodic-table viz.
- **Don't** hedge in UI copy. "Maybe consider" and "could be helpful" are banned in-product — match PRODUCT.md's expert-decisive voice.
- **Don't** introduce a new spacing token outside the 8/16/24/32/48/80/120 scale. If you need a specific pixel gap, use a literal value rather than polluting the token scale.
```
