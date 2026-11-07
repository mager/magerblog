---
name: Magerblog
description: A compact personal publication with distinct reading layouts.
colors:
  paper: "oklch(98% 0.006 85)"
  ink: "oklch(23% 0.016 230)"
  muted: "oklch(46% 0.018 230)"
  rule: "oklch(84% 0.012 230)"
  surface: "oklch(95% 0.009 230)"
  blue: "oklch(43% 0.085 230)"
  red: "oklch(49% 0.13 45)"
  green: "oklch(43% 0.075 140)"
  yellow: "oklch(90% 0.10 88)"
  dark-paper: "#000"
  dark-ink: "oklch(94% 0.009 85)"
  dark-muted: "oklch(72% 0.014 230)"
  dark-rule: "oklch(30% 0.009 230)"
  dark-surface: "oklch(18% 0.009 230)"
  dark-blue: "oklch(78% 0.09 230)"
  dark-red: "oklch(78% 0.11 50)"
  dark-green: "oklch(78% 0.085 140)"
  dark-yellow: "oklch(85% 0.10 88)"
  # Life archive only; these do not replace shared publication colors.
  life-coast-sky: "#087fbd"
  life-coast-sea: "#066e96"
  life-coast-rock: "#686a4c"
  life-coast-rock-light: "#91906c"
  life-coast-olive: "#515f35"
  life-coast-sand: "#e8cf9c"
  life-coast-foam: "#91d9d5"
  life-blue: "#07547b"
  life-yellow: "#ffd52a"
  life-dark-coast-sky: "#101c35"
  life-dark-coast-sea: "#12354c"
  life-dark-coast-rock: "#242d33"
  life-dark-coast-rock-light: "#384447"
  life-dark-coast-olive: "#243432"
  life-dark-coast-sand: "#847960"
  life-dark-coast-foam: "#7bafb9"
  life-dark-blue: "#86cce7"
typography:
  display:
    fontFamily: "Fraunces, Georgia, serif"
    fontSize: "27px"
    fontWeight: 800
    lineHeight: 1
    letterSpacing: "-.04em"
  row-title:
    fontFamily: "Space Grotesk, system-ui, sans-serif"
    fontSize: "17px"
    fontWeight: 500
    lineHeight: 1.4
  body:
    fontFamily: "Source Serif 4, Georgia, serif"
  label:
    fontFamily: "Space Grotesk, system-ui, sans-serif"
    fontSize: "13px"
    fontWeight: 500
    lineHeight: 1.4
  mono:
    fontFamily: "JetBrains Mono, monospace"
  life-heading:
    fontFamily: "Fraunces, Georgia, serif"
    fontSize: "clamp(64px, 8vw, 96px)"
    fontWeight: 600
    lineHeight: 0.95
    letterSpacing: "-.04em"
  life-feature-title:
    fontFamily: "Fraunces, Georgia, serif"
    fontSize: "clamp(32px, 3.7vw, 50px)"
    fontWeight: 600
    lineHeight: 1.08
    letterSpacing: "-.035em"
rounded:
  image: "2px"
  control: "3px"
spacing:
  phone-gutter: "18px"
  gutter: "24px"
  column-gap: "56px"
components:
  more-button:
    textColor: "{colors.ink}"
    rounded: "{rounded.control}"
    padding: "8px 16px"
  more-button-hover:
    textColor: "{colors.blue}"
  search-field:
    textColor: "{colors.ink}"
    padding: "8px 0"
  filter:
    textColor: "{colors.muted}"
    typography: "{typography.label}"
  filter-active:
    textColor: "{colors.ink}"
    typography: "{typography.label}"
  post-row:
    textColor: "{colors.ink}"
    padding: "12px 0"
---
# Magerblog: The compact publication

## Direction

**Creative North Star: "The compact publication"**

A quiet personal publication for software, cooking, photos, and life. The homepage and shared archives use plain dated rows, clear controls, and short supporting notes. Life has a route-specific Cefalù pixel coast and photo-led stories. These are fixed page designs, not optional modes. The newspaper edition, large masthead, layout switch, and benchmark insert are removed.

Keep the established publication palette and fonts. This change affects discovery pages; individual tech articles, recipes, life stories, notes, and link pages retain their reading layouts.

## Color system

The shared normative values above come from `src/styles/publication.css`, renamed from `newspaper.css` without token changes. Paper and ink provide the base; lake blue identifies links, focus, and active navigation. Copper supports cooking; moss supports life and Seen. Saffron marks text selection. Existing artwork and per-story palettes retain their colors.

The wordmark uses one ink color, including its dot. Light mode uses paper; dark mode uses true black with softer text and accent colors. Use rules and spacing to separate rows. No decorative gradients, glass, blinking cursors, or cursor-following effects.

## Typography

Space Grotesk carries listing headings, titles, dates, navigation, search, and sidebar copy. Fraunces retains the upright header wordmark and established editorial display. Source Serif 4 remains the story body face; JetBrains Mono remains available for code and existing metadata. Preserve individual post typography. Listing titles use the row-title role above; at 540px and below, row titles use 16px and feature titles use 24px. The wordmark uses the display role above, reduced to 25px at 1000px and 22px at 360px. Feature descriptions stay within 65 characters where possible.

## Layout

The homepage and archives share a 1080px shell with 24px gutters, reduced to 18px at 540px. The homepage has no visible intro sentence; a screen-reader heading names Latest posts. It features the newest entry and lists the remaining published entries in `pubDate` order. Edits do not bump posts. Inline search precedes the list. The homepage has no category filter row; the main header links open each section. Cooking retains its recipe filters. JavaScript shows 24 rows at a time; without it, the complete static list remains available.

Writing, Tech, and Cooking use the newest entry as a compact feature, followed by the remaining dated rows. Notes and Seen also feature their newest entry in a single column. Links uses dated rows and native video disclosures. Features show a short description, publication date, relevant metadata, and an optional image. Category and cooking subcategory filters feature the newest matching entry and omit it from the rows. Search hides the feature and includes that entry in ranked results; clearing search restores the matching feature.

The homepage and Writing/Tech/Cooking archives have a 252px sidebar with the two newest notes and up to four newest links. Notes show short previews and dates; links show short commentary and source domains. The sidebar also links to the author’s profiles. At 900px it narrows to 220px and dates move below row titles. At 700px it follows the main list. Shared Archive pages without a sidebar use a column up to 780px wide. Life uses the full 1080px shell without a sidebar.

Every public page uses one shared sticky header and one fixed footer. The wordmark is always visible. Direct header links appear in this order: Writing, Software, Tech, Cooking, Life, Notes, Seen, Links. Search uses an icon button with an accessible name; the theme control is separate. At 1000px and below, the wordmark and tools occupy the top row, with horizontally scrolling direct links below. Links remain reachable by keyboard. About, Bench, and RSS remain in the footer beside the Chicago credit. Measured header and footer heights reserve content and anchor space.

Notes retain a compact 680px reading column with Space Grotesk headings and prose. The title leads directly into the note, with a quiet date and optional source link. Omit article summaries, contents rails, progress bars, and large related-story blocks; retain readable code, tables, and simple older/newer navigation.

## Components

### List rows and sidebars

Flat rows use a thin rule, a small optional thumbnail, a title, and a quiet publication date. Links open their sources directly. Hover underlines the title and uses lake blue; focus has a visible outline. Sidebar sections use the same rules and text roles, with two-line previews. There are no card shadows or raised panels. Images have slight corner rounding; controls remain nearly square.

### Life archive — Cefalù coast

**The Life Scope Rule.** This exception applies only to `/life/`, through `src/styles/life-archive.css`. Shared publication tokens and individual story themes remain unchanged. The `life-*` frontmatter colors describe this route; `life-coast-*` maps to its `--coast-*` properties, and `life-dark-*` supplies the saved dark-theme overrides. The yellow umbrellas use muted gold shades at night. Blue marks the Life heading and story-link hover; the heading dot uses shared copper.

Use the supplied Cefalù beach photo as the fixed reference for native pixel SVG: yellow umbrellas, vivid blue sea, warm sand, old-town buildings, and La Rocca. `src/components/life/CefaluCoast.astro` renders without JavaScript; it is not a raster asset or a new photo post. The scene has square pixel edges and no raised frame. Waves move six pixels in six steps over six seconds; the boat moves one pixel in two steps over four seconds. Both alternate automatically and remain still with reduced motion. The user explicitly requested no pause control. Day mode shows a pixel sun. Night mode shows a crescent moon, stars, reflected light, lit windows, and cooler buildings and beach furniture. Three people rest on towels in both views. The shared theme control uses a sun for the current light theme and a moon for the current dark theme, with a 44px target and an accessible action label.

The `life-heading` and `life-feature-title` roles above use Fraunces. Supporting copy and photo-story titles use Space Grotesk; story descriptions use Source Serif 4. The newest story appears once with its complete image beside the title. Four recent stories follow in two columns with 3:2 cropped photos, descriptions, and dates; older stories use dated rows. There is no notes or shared-links sidebar. At 540px and below, the feature and stories stack, the feature title is 34px, and the 180px-high coast frames the town and foreground umbrella. Images have square corners. Search includes all Life entries and keeps the shared URL, loading, retry, empty, clear, and keyboard behavior. See `.impeccable/life-surface.md` for the surface brief.

### Search and filters

Filters are plain text with an underlined selected state and 44px minimum height. The search field sits on a rule with a clear control. Inline search and the global dialog use the same lazy-loaded full-text index and ranking: title matches first, accent-insensitive text, prefixes, and limited spelling correction. Results show highlighted text and short matching excerpts. Inline queries and filters persist in the URL as `q` and `type`; archive search stays within its archive. Retain loading, retry, empty, and clear states. Escape clears an inline query; Arrow Down focuses its first result. Show more posts adds 24 rows and moves focus to the first new row.

## Imagery

Use existing hosted images. Features preserve the complete image; small row thumbnails may crop within a square. Feature images load eagerly and row thumbnails load lazily. Image failures leave readable titles and links. Leave older Google Photos URLs unchanged in source posts. No photos are committed to the repository. This listing change adds no raster assets.

## Interaction and accessibility

- The complete header wordmark dims slightly on hover; punctuation remains the same color.
- Category and archive links provide a complete route through all content.
- New animation uses transform and opacity with an exponential ease-out curve, and respects reduced motion. The Life pixel coast uses the scoped stepped motion described above.
- Clear focus states, a homepage skip link, semantic section headings, explicit image descriptions, and 44px main navigation targets.
- Date-only publication values render in UTC so the displayed day does not shift with the build server's timezone.

## Avoid

Repetitive cards, fake live benchmark scores, torn-paper decoration, simulated printing noise, ornamental gradients, and effects that compete with reading. Keep listing pages quiet and useful; retain the established art direction of individual posts.

## Recipe detail pages

Recipes use the publication palette and fonts, with copper for navigation and step numbers. The default layout is ready to cook from: a compact title/photo opening, sticky Ingredients / Method / Print navigation, a two-column ingredient spread on desktop, and a single column on phones. Ingredient text is 24–28px and method text is 26–30px. Each numbered step has enough space to read at counter distance. There is no Cook Mode.

`src/lib/recipe.ts` normalizes both plain Markdown and legacy recipe wrappers at build time. Semantic sections and ordered steps work without JavaScript; ingredient checks, copy/reset, completion feedback, and print controls enhance them. Ingredient checks persist per recipe. Print restores checked ingredients and uses compact black-on-white output. New recipes can use Ingredients and Method headings without hand-written HTML wrappers.

Blog drafts remain available through the dev server but do not generate production permalink pages. Recipe drafts display a clear untested label. `recipeYield` supplies the optional yield beside prep and cook times.

## About page

Use the shared publication palette and typography, with an open two-column introduction and square portrait. The Hot Dougs avatar by @hopperdraws links to the artist’s X profile. Mouse hover reveals the hosted human photo; touch and keyboard activation toggle it. Keep both portraits at the same aspect ratio, honor reduced motion, and retain the avatar if the photo fails to load.

## Life stories

Life has a shared masthead and reading foundation, with art direction assigned to each story in `src/lib/life-themes.ts`. Travel opens with a photographic spread, sports with a headline and event photograph, gardening with a botanical field-note opening, and personal entries at the intimate scale of a letter. Music memorabilia preserves the full artifact. Use each story's palette and display face; translated versions share the same identity. Keep photographs uncropped, avoid empty hero space, and preserve true-black reading surfaces when the reader chooses dark mode.

The nine-album post uses `lifeLayout: albums` and a dedicated `AlbumPost.astro` layout. Its complete my9albums poster leads on a deep plum surface, sized to fit a desktop opening and the width of a phone. Warm paper, burnt orange, geometric headings, and a headphone illustration accompany the notes below. The semantic ordered list pairs each record's cover, artist, title, release year, personal memory, and Spotify link. Keep the canonical memories and links in the content file, not in layout code.

## Article screenshots

Tech articles can opt into `heroImageLayout: wide` for a workspace screenshot. The title and deck share the desktop opening, followed by the complete 16:10 screenshot across the article grid; phones stack title, deck, and image. Keep the screenshot uncropped, supply `heroImageAlt` and `heroImageCaption`, and link to the full-size hosted image. Other articles retain the existing split hero layout. Homeport uses this treatment for its October 11 terminal workspace refresh.
