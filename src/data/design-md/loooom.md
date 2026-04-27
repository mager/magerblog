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
