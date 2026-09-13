# Magerblog: The Chicago edition

## Direction

A personal newspaper by Andrew Mager. A reader opens it on a bright Chicago kitchen table, coffee nearby, curious about software and what to cook next. Warm paper and firm ink carry the reading experience; purposeful section colors make it easy to explore. Reference objects: a Sunday broadsheet, the four stars of the Chicago flag, and a yellow newspaper insert.

The front page prioritizes technology, then food. Notes are a compact notebook alongside the lead. Seen is a photographic journal; Life is the quieter weekend column. The mager-bench project gets a prominent permanent insert rather than competing with dated posts.

## Color system

Full palette with four named roles, defined in `src/styles/newspaper.css` using OKLCH:

- Paper: `oklch(97.5% 0.009 85)`
- Ink: `oklch(23% 0.016 260)`
- Secondary text: `oklch(46% 0.016 260)`
- Rules: `oklch(80% 0.016 85)`
- Cobalt: `oklch(43% 0.19 265)`, technology, notes, information
- Vermilion: `oklch(48% 0.17 30)`, food, Chicago stars, wordmark punctuation
- Park green: `oklch(39% 0.075 155)`, seen and life
- Insert yellow: `oklch(89% 0.14 93)`, mager-bench and archive discovery

The shared header and footer have matching light and dark variants for the existing category and article worlds. The homepage uses paper throughout. No decorative gradients, glass, blinking cursors, or cursor-following effects.

## Typography

Preserve the established fonts: Fraunces for the masthead and section display, Source Serif 4 for stories and body copy, Space Grotesk for navigation, JetBrains Mono for compact metadata. Monospace supports the writing rather than dominating it. Headlines have tight tracking and confident scale; paragraphs stay within 67 characters where possible. The masthead is upright, solid ink with a vermilion dot.

## Layout

The shared shell is 1240px plus 24px gutters (18px on phones). Thin rules organize the publication, with stronger rules at navigation and section boundaries. The lead and notebook use a wide/narrow column split; supporting tech stories form two rows of three. The food spread has one large story and two smaller stories on a warm tint. Seen uses a horizontally scrollable photo strip with visible continuation and native keyboard support. Life sits alongside it as a compact reading column.

Below 700px, the main spreads become one column, food becomes one lead plus two smaller stories, and Seen retains its swipeable journal. Every main navigation link remains visible in two rows on phones. There is no fixed bottom navigation.

## Imagery

Use existing author-owned images. Front-page food photo selections prioritize permanent hosted images and leave older Google Photos URLs unchanged in source posts. Broken remote images fall back to a readable story link or photo description. Hero images load eagerly with reserved dimensions; supporting images load lazily. No photos are committed to the repository.

## Interaction and accessibility

- Wordmark punctuation lifts slightly on hover.
- Photography scales subtly inside fixed frames.
- The back page previews an older story; Another story changes the preview without navigating unexpectedly and announces the update politely. A normal story link works without JavaScript.
- Category and archive links provide a complete route through all content.
- New animation uses transform and opacity with an exponential ease-out curve, and respects reduced motion.
- Clear focus states, a homepage skip link, semantic section headings, explicit image descriptions, and 44px main navigation targets.
- Date-only publication values render in UTC so the displayed day does not shift with the build server's timezone.

## Avoid

Repetitive cards, fake live benchmark scores, torn-paper decoration, simulated printing noise, ornamental gradients, and effects that compete with reading. Newspaper structure should feel precise and useful, never like a costume.
