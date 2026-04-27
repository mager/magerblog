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
