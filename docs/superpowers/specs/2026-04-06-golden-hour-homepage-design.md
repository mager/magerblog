# Golden Hour Homepage Color Refresh

**Date:** 2026-04-06
**Scope:** Homepage hero letters, zone accents, cursor glow

## Context

Easter has passed — swap the pastel Easter egg letter colors on the homepage for a warm "golden hour" palette that transitions into spring/summer. Keep the cream paper background and overall layout unchanged.

## Changes

All changes are in `src/components/NewspaperHero.astro`.

### 1. Hero Letter Colors

| Letter | Easter (old) | Golden Hour (new) |
|--------|-------------|-------------------|
| **m** | `#f9a8d4` soft pink | `#f4845f` warm coral |
| **a** | `#a5f3c0` mint green | `#f7b267` amber |
| **g** | `#bfdbfe` powder blue | `#f5d76e` honey gold |
| **e** | `#fde68a` buttercup | `#f2a65a` peach-orange |
| **r** | `#ddd6fe` lavender | `#e8856c` dusty rose |
| **.co** | `#f0abfc` lilac | `#d4a04a` warm gold |

### 2. Zone Accents

| Zone | Old | New |
|------|-----|-----|
| **Tech** | `oklch(29% 0.18 260)` deep indigo | `oklch(32% 0.14 250)` warm navy |
| **Food** | `oklch(50% 0.14 38)` terracotta | No change |
| **Life** | `oklch(40% 0.12 148)` forest | `oklch(42% 0.10 90)` warm olive |

### 3. Cursor Glow

| | Old | New |
|--|-----|-----|
| Glow | `oklch(65% 0.16 38 / 0.12)` | `oklch(68% 0.14 65 / 0.12)` |

## Non-changes

- Paper background color (`oklch(98.5% 0.008 80)`) — unchanged
- Rule/border colors — unchanged
- Typography — unchanged
- Layout — unchanged
- Image filters — unchanged
- Global CSS (`src/styles/global.css`) — unchanged
