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

```md
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

```md
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

I wanted to end this post with the actual files.

### Public `DESIGN.md` links

- [Kotsu `DESIGN.md`](https://github.com/mager/kotsu/blob/main/DESIGN.md)

### Products I reverse engineered

- [magerblog](https://www.mager.co/)
- [Kotsu](https://www.kotsu.app/)
- [Loooom](https://www.loooom.xyz/)
- [prxps](https://www.prxps.com/)

I will add the other direct `DESIGN.md` links here as I publish them.
