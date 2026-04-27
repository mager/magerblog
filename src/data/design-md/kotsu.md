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
