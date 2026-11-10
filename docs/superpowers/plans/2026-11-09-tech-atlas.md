# Tech Agent Atlas Implementation Plan

**Goal:** Give `/tech/` a bold agent atlas without breaking reading or search.
**Architecture:** A dedicated Astro page composes the shared shell and lists with a scoped SVG/HTML network component. Small TypeScript handles selection and motion controls; CSS owns presentation.
**Tech Stack:** Astro, SVG, CSS, TypeScript; no added runtime packages.
**Spec:** `.impeccable/tech-surface.md`

## Constraints and review focus

Keep publication order, search states, saved themes, static links, and the shared site shell. Verify small screens, reduced motion, keyboard focus, no JavaScript, empty search, and hidden-tab animation suspension. Do not change other archives or article layouts.

## Work

- [x] Add `src/components/tech/AgentAtlas.astro` with six published article links, a central hub, connection paths, and a pause control.
- [x] Add `src/scripts/agent-atlas.ts` for focused connection selection and motion preference/visibility handling.
- [x] Replace the shared Archive invocation in `src/pages/tech.astro` with the same shared components and page-specific opening. Preserve collection schema.
- [x] Add `src/styles/tech-archive.css`, scoped to `.tech-page`, with responsive light/dark presentation.
- [x] Build and run existing archive, search, theme, and shell checks. Inspect rendered desktop/mobile views, keyboard selection, pause, search, reduced motion, and no-JavaScript links.
- [x] Run the Impeccable detector and a separate finish review; resolve material findings and record evidence.
