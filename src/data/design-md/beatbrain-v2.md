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
