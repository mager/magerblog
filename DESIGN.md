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
