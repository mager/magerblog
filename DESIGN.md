# Magerblog: The Chicago edition

## Direction

A personal newspaper by mager. A reader opens it on a bright Chicago kitchen table, coffee nearby, curious about software and what to cook next. Warm paper and firm ink carry the reading experience; purposeful section colors make it easy to explore. Reference objects: a Sunday broadsheet, the four stars of the Chicago flag, and a yellow newspaper insert.

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

The homepage uses a 1320px shell with 24px gutters (18px on phones), a large masthead, and a complete edition of roughly 30 distinct stories. A lead spread and compact dispatch column open the page; varied workbench columns, a horizontal photo strip, cooking and life sections, a compact artifact list, and shared links provide different reading rhythms. Selection follows publication order within each section and never repeats an entry within the edition.

Front page and All updates are plain-text view controls. The chronological view starts with 24 entries and keeps a native content filter and progressive loading. Without JavaScript, the entire edition remains available and a disclosure opens the complete static stream. Feed rows use compact titles and brief previews, without repeated dates or permalink buttons. One quiet metadata line adds reading time, recipe timing, or photo location where available. Link-share titles open their sources directly.

Every public page uses one shared sticky header and one fixed footer. The header contains the home wordmark and visible Tech, Cooking, Life, Notes, Seen, Links, and Artifacts links. There is no More dropdown. About, Archive, Bench, GitHub, X, and RSS live only in the footer, beside a small Chicago flag and “Built with agents in Chicago.” The footer uses one row on desktop and two compact rows on phones; measured header/footer heights reserve content and anchor space. On phones the header uses two compact rows. The homepage's large masthead scrolls normally. Cooking and Life use these same components rather than custom site footers. Recipe section controls sit beneath the global header. At 800px the edition stacks its main columns while retaining compact story groupings.

Artifacts use a centered 860px document column with left-aligned title, filename, description, and metadata. Space Grotesk prose and section headings keep references compact; Fraunces remains on the document title. A native contents disclosure keeps the body close to the opening. Tables fill their containers and scroll within keyboard-accessible regions on small screens. Code has compact copy controls; explicit Markdown downloads remain available. These are working documents rather than long-form blog posts.

Notes use a compact 680px notebook column with Space Grotesk headings and prose. The title leads directly into the note, with a quiet date and optional source link. Omit article summaries, contents rails, progress bars, and large related-story blocks; retain readable code, tables, and simple older/newer navigation.

## Imagery

Use existing author-owned images. Front-page food photo selections prioritize permanent hosted images and leave older Google Photos URLs unchanged in source posts. Broken remote images fall back to a readable story link or photo description. Hero images load eagerly with reserved dimensions; supporting images load lazily. No photos are committed to the repository.

## Interaction and accessibility

- Wordmark punctuation lifts slightly on hover.
- Photography scales subtly inside fixed frames.
- Front-page view changes use a short crossfade where View Transitions are available, with an immediate fallback and reduced-motion support.
- Category and archive links provide a complete route through all content.
- New animation uses transform and opacity with an exponential ease-out curve, and respects reduced motion.
- Clear focus states, a homepage skip link, semantic section headings, explicit image descriptions, and 44px main navigation targets.
- Date-only publication values render in UTC so the displayed day does not shift with the build server's timezone.

## Avoid

Repetitive cards, fake live benchmark scores, torn-paper decoration, simulated printing noise, ornamental gradients, and effects that compete with reading. Newspaper structure should feel precise and useful, never like a costume.

## Recipe detail pages

Recipes use the publication palette and fonts, with vermilion for navigation and step numbers. The default layout is ready to cook from: a compact title/photo opening, sticky Ingredients / Method / Print navigation, a two-column ingredient spread on desktop, and a single column on phones. Ingredient text is 24–28px and method text is 26–30px. Each numbered step has enough space to read at counter distance. There is no Cook Mode.

`src/lib/recipe.ts` normalizes both plain Markdown and legacy recipe wrappers at build time. Semantic sections and ordered steps work without JavaScript; ingredient checks, copy/reset, completion feedback, and print controls enhance them. Ingredient checks persist per recipe. Print restores checked ingredients and uses compact black-on-white output. New recipes can use Ingredients and Method headings without hand-written HTML wrappers.

Blog drafts remain available through the dev server but do not generate production permalink pages. Recipe drafts display a clear untested label. `recipeYield` supplies the optional yield beside prep and cook times.

## About page

Use the shared publication palette and typography, with an open two-column introduction and square portrait. The Hot Dougs avatar by @hopperdraws links to the artist’s X profile. Mouse hover reveals the hosted human photo; touch and keyboard activation toggle it. Keep both portraits at the same aspect ratio, honor reduced motion, and retain the avatar if the photo fails to load.

## Life stories

Life has a shared masthead and reading foundation, with art direction assigned to each story in `src/lib/life-themes.ts`. Travel opens with a photographic spread, sports with a headline and event photograph, gardening with a botanical field-note opening, and personal entries at the intimate scale of a letter. Music memorabilia preserves the full artifact. Use each story's palette and display face; translated versions share the same identity. Keep photographs uncropped, avoid empty hero space, and preserve true-black reading surfaces when the reader chooses dark mode.

The nine-album post uses `lifeLayout: albums` and a dedicated `AlbumPost.astro` layout. Its complete my9albums poster leads on a deep plum surface, sized to fit a desktop opening and the width of a phone. Warm paper, burnt orange, geometric headings, and a headphone illustration accompany the notes below. The semantic ordered list pairs each record's cover, artist, title, release year, personal memory, and Spotify link. Keep the canonical memories and links in the content file, not in layout code.
