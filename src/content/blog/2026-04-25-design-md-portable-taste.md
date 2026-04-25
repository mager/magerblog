---
title: "DESIGN.md: Can taste be made portable?"
description: "I reverse engineered several of my own sites into DESIGN.md files to see how much of a design system can actually be described, and what happens when you try to write down taste instead of just relying on instinct."
pubDate: 2026-04-25
category: code
draft: false
tags: [design, design-systems, ai, frontend]
---

I recently learned about `DESIGN.md` and got immediately interested in the premise.

Not just design tokens. Not just a component library. The bigger idea: that design taste might be portable if you are willing to describe it clearly enough.

That hit me at a good time. I have also been using Stitch at work, which gave the whole concept a little more weight for me. It is one thing to believe design can be felt. It is another thing to watch more of it become legible, structured, and usable by tools.

Lately I have been a little obsessed with reusable judgment.

On the code side, that is part of what I like about Impeccable. It is not just linting or formatting. It is an attempt to encode a standard so it can travel. `DESIGN.md` felt like the design version of that idea, or at least a step in that direction.

So I tried a small experiment: I reverse engineered several of my own sites into `DESIGN.md` files.

I wanted to see whether I could capture their design systems and visual identity in a format that was reusable, not just descriptive after the fact.

## The easy part: tokens

Some of this is straightforward.

Colors, type scales, spacing systems, radii, shadows, interaction states, layout constraints. Those are all real and important, and they belong in a structured format. If a product has a strong visual system, a lot of it can be written down with reasonable precision.

That part was useful, but it was not the interesting part.

## The interesting part: taste above the token layer

What surprised me was how much of the real system lives above tokens.

Things like:

- mood
- restraint
- pacing
- density
- contrast philosophy
- when glow helps and when it turns into noise
- when typography should feel editorial versus utilitarian
- how much visual tension a product can carry before it feels busy
- when a surface should feel soft, technical, playful, or severe

Those decisions are absolutely part of a design system. They just do not always show up cleanly in Figma variables or CSS custom properties.

When I started writing them down, the exercise got more interesting.

I was not just documenting colors and spacing. I was trying to describe judgment.

That meant writing things like: this product should feel warm but not cute; dense but not cramped; polished but not glossy. Use glow sparingly, mostly as emphasis, not as atmosphere. Prefer contrast through hierarchy and material separation before reaching for more saturation. Let typography do more of the work than decoration.

That is a different kind of specification.

It is fuzzier than a token file, but it is also closer to the thing I actually want to preserve.

## Different products need different atmospheres

One thing I liked about this exercise is that it pushed against a trap I see a lot in design-system discussions.

Reusable taste does not mean every product should look the same.

Quite the opposite. Different products need different atmospheres. A music product, a blog, a developer tool, and a consumer app should not all inherit the same emotional weather just because they came from the same person.

What should be reusable is not one frozen style. It is the deeper logic behind the style.

The questions underneath the surface are often more portable than the surface itself:

- How do I think about density?
- What kind of contrast feels elegant versus loud?
- Where should ornament live?
- When should the interface feel invisible, and when should it have a point of view?
- How much novelty can a screen carry before it starts fighting the task?

That is the layer I found myself wanting to encode.

## Reverse engineering myself was weirdly clarifying

There is something mildly strange about turning your own work back into a spec.

Usually a design system is something you create on the way in. This felt more like archaeology on the way out.

I was looking at my own projects and asking: what am I actually doing repeatedly? What choices are consistent on purpose? Which ones are just habits? Which ones are good enough to keep? Which ones only worked in one context?

That process exposed patterns I had not fully named before.

It also exposed where I was being too implicit. A lot of design judgment lives as internal taste until you force yourself to make it legible. Once you do that, you start noticing which parts are robust and which parts were just vibes plus momentum.

## This changed how I think about tooling

The side effect of the exercise is that I updated my own `frontend-design` skill/prompt based on the patterns I noticed across projects.

That was probably the most practical output.

If you want agents or tools to produce work that actually feels like you, tokens are necessary but not sufficient. The missing layer is often intent written at the right altitude.

Not "use 16px radius and slate-200 borders."

More like:

- avoid generic SaaS symmetry when the product benefits from tension
- let typography carry personality before adding decoration
- default away from visual noise
- choose one or two places for intensity, then keep the rest calm
- make warmth, sharpness, softness, or drama an explicit decision, not an accidental byproduct

That is the kind of guidance I increasingly want in prompts, specs, and design documents.

Not because I think taste can be fully mechanized.

Mostly because I think more of it can be transferred than I used to believe.

## The real point

I do not think `DESIGN.md` means design becomes fully systematized.

There will always be a gap between a written principle and a good eye. And that is fine. The goal is not to eliminate taste. The goal is to make more of it portable, discussable, and reusable.

That matters for teams, and it matters even more for tools.

If design intent stays entirely implicit, it does not travel well. Not between designers, not between projects, and definitely not between humans and agents.

But if you can describe even part of it concretely, something interesting happens. Taste stops being this mystical internal thing and starts becoming a system other people, and other tools, can actually work with.

That was the part of `DESIGN.md` that stuck with me.

Not that it captured everything.

That it captured more than I expected.
