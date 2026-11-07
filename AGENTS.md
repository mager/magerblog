# AGENTS.md

This file provides guidance to Codex (Codex.ai/code) when working with code in this repository.

## Project Overview

This is a personal blog built with Astro v7, featuring three main content categories: Tech, Life, and Recipes. The homepage and most archives use a compact publication layout with dated rows, Space Grotesk text, and a Fraunces wordmark. The Life archive has a scoped Cefalù pixel coast and photo-led stories. Light mode is the default; readers can save a dark theme. Individual posts retain their existing reading layouts and story-specific styling.

Site URL: https://mager.co

## Development Commands

```bash
# Install dependencies
npm install

# Start dev server at localhost:4321
npm run dev

# Build production site to ./dist/
npm run build

# Preview production build locally
npm run preview

# Run Astro CLI commands
npm run astro ...
npm run astro -- --help
```

## Content System

### Blog Posts (`src/content/blog/`)

Blog posts are written in Markdown/MDX with frontmatter schema defined in `src/content.config.ts`:

- **title** (string, required): Post title
- **description** (string, required): Post description
- **pubDate** (date, required): Publication date
- **updatedDate** (date, optional): Last update date
- **heroImage** (string, optional): Hero image URL
- **category** (string, optional): One of "tech", "food", or "life"
- **prepTime** (number, optional): Recipe prep time in minutes
- **cookTime** (number, optional): Recipe cook time in minutes

File naming convention: `YYYY-MM-DD-slug.md` (e.g., `2024-12-29-mac-and-cheese.md`)

### Categories

The site organizes content into three categories, each with distinct visual themes:

1. **Tech** (`category: "tech"`) - Purple & Cyan theme
   - Route: `/tech`
   - Image border colors: Purple and Cyan with glow effects
   - Icon: 💻

2. **Recipes** (`category: "food"`) - Orange & Warm theme
   - Route: `/recipes`
   - Image border colors: Orange tones with glow effects
   - Icon: 🍳
   - Displays prepTime/cookTime metadata when present

3. **Life** (`category: "life"`) - Cefalù coast archive
   - Route: `/life`
   - Pixel coast with yellow umbrellas, blue sea, sand, the old town, and La Rocca
   - Individual stories retain their own themes

## Architecture

### Key Files

- `astro.config.mjs`: Astro configuration with MDX and sitemap integrations
- `src/content.config.ts`: Content collections schema using Zod validation
- `src/consts.ts`: Global constants (SITE_TITLE, SITE_DESCRIPTION)
- `src/styles/global.css`: CSS custom properties and global styles

### Routing

- `src/pages/index.astro`: The compact homepage is the only homepage layout. `SimpleHome.astro` combines `SimpleList.astro` with `SimpleSidebar.astro`. The visible intro is omitted; a screen-reader heading names Latest posts. The newest published entry leads, followed by dated rows from all feed collections, full-text search, and 24-row progressive loading. The homepage has no category filters; readers use the main header links to open sections. Without JavaScript, the lead and all remaining rows stay available. There is no edition view, layout toggle, or `mager-layout` preference.
- `src/lib/feed.ts`: Shared publication filtering and chronological ordering for the homepage, archives, and main RSS feed. Order uses `pubDate`; updates do not bump posts in the shared feed. Cooking applies its own `updatedDate` fallback ordering.
- `src/lib/feed-display.ts`: Shared titles, short descriptions, thumbnail sources, categories, and publication date labels. Add `description` to notes for an authored preview; the first paragraph is the fallback. Main rows show titles and dates; sidebar notes and category features use short descriptions. Full content stays on individual post pages.
- `src/pages/links/`: Link-share archive and permalinks
- `src/pages/blog/[...slug].astro`: Dynamic blog post pages using `getStaticPaths()`
- Blog drafts keep working direct preview URLs linked from `/drafts/`. They use `noindex, nofollow` and stay out of the sitemap, feeds, search, and published listings. These previews are accessible by URL, not private. `src/integrations/noindex-sitemap.mjs` excludes generated noindex pages from the sitemap.
- `src/pages/tech.astro`: This category listing uses the shared Archive layout. The newest `pubDate` entry leads with a description and optional image; plain dated rows follow. `src/pages/cooking/index.astro` uses its dedicated food magazine page, `CookingCollection.astro`, and `cooking-index.css`; it has counted multi-category filters and no notes/links sidebar.
- `src/pages/life.astro`: Standalone Life archive with `CefaluCoast.astro` and `SimpleList` in `presentation="life"`. The newest entry leads once with its complete image, four recent stories use large photos, and older entries use dated rows. No notes or shared-links sidebar. Keep published `pubDate` order and full archive search. Styles live in `src/styles/life-archive.css`.
- `src/pages/about.astro`: About page
- `src/pages/software.astro`: Selected projects (Perch, Mood Shell, Homeport, and prxps), with project sites, public source links, and build logs. `SoftwareContributions.astro` presents six selected external repositories with their project or GitHub owner icons and one sentence each, led by the Uber Direct SDK (built by Mager). Impeccable is an emerging contribution focused on helping agents build interfaces. Keep this section compact, without activity totals or an on-page archive. `src/data/contributions.json` preserves the dated GitHub evidence, exclusions, and research limits; `/software/contributions.json` remains available as a download. Exclude personal projects and inherited fork copies. The page makes no live GitHub API requests. Terminal-inspired project directory with a dark default and a light option; an explicit saved theme still wins. Styling lives in `src/styles/software.css`.

### Layouts

- `src/layouts/Archive.astro`: Shared layout for Writing, Tech, Notes, Seen, and Links. Cooking and Life use their own layouts. Writing and Tech include the notes/links sidebar. Notes and Seen use a single column with the newest post featured; Links uses dated rows with optional video disclosures. Keep all individual post reading layouts unchanged.
- `src/layouts/ReadingPost.astro`: Editorial layout for tech articles, with Fraunces titles, Source Serif body text, section navigation, reading progress, code-copy controls, and related posts.
- `src/layouts/Note.astro`: Compact notebook layout with a 680px reading column, Space Grotesk title and prose, quiet publication date, source link, and simple note navigation. Descriptions remain metadata and feed previews; notes omit the article deck, contents rail, and reading progress. Shared code-copy controls and Markdown styles remain available.
- `src/lib/content-meta.ts`: Category feature metadata uses reading time for articles and notes, authored recipe timing, and photo locations or screenshot labels. Missing recipe timing is omitted; partial timing is labeled explicitly.
- `src/layouts/BlogPost.astro`: Supplies tech article metadata, reading time, same-category navigation, and search to ReadingPost.
- Cooking and life articles retain their dedicated layouts.
- Life stories use `src/lib/life-themes.ts` for a named, per-story palette and one of five subject-specific openings in `LifePost.astro`. Add an explicit theme when publishing a new life story; translations share their original's theme. `lifeLayout: albums` selects `AlbumPost.astro` for music lists, with a complete `heroImage` poster, descriptive `heroImageAlt`, and numbered album notes below it.
- `src/styles/reading.css`: Detail-page typography, prose, code, tables, and mobile layout.
- Publication pages default to light mode. `ThemeToggle.astro` saves an explicit light/dark choice under `mager-theme`; `BaseHead.astro` applies it before paint. Dark publication surfaces use true black. Theme colors live in `src/styles/publication.css`; the rename from `newspaper.css` preserves the token values.

### Components

- `BaseHead.astro`: SEO meta tags and Open Graph data
- `Header.astro`: The sticky header always shows the home wordmark and direct links in this order: Writing, Software, Tech, Cooking, Life, Notes, Seen, Links. Search is an icon button with an accessible name; theme selection is separate. There is no Browse panel, layout toggle, or wordmark reveal script. At 1000px and below, the wordmark and tools occupy the top row, with horizontally scrolling navigation below. Links have a minimum height of 44px and remain reachable through native keyboard navigation.
- `Footer.astro`: The single global fixed footer, with the Chicago credit and utility links: About, Bench, and RSS. The header’s Writing link opens the archive. Do not add page-specific site footers or duplicate header destinations here. The shared sidebar has a Find me elsewhere link to bio.link/mager.
- `PostRow.astro`: Shared dated list row with an optional thumbnail. Link-share titles open the source directly. `SimpleList.astro` adds filtering, search, the optional latest-post feature, and progressive loading; behavior lives in `src/scripts/simple-home.ts`, with styling in `src/styles/simple.css`.
- `SimpleSidebar.astro`: Shows the two newest notes and up to four newest shared links. Empty sections are omitted. It follows the list at 700px and below.
- `Card.astro`: Blog post card for remaining grid layouts
- `FormattedDate.astro`: Date formatting component
- `Search.astro`: Shared search dialog, included once through `Header.astro`; the Search icon and `/` open it. Inline listing search and the dialog share one lazy request through `src/scripts/search-data.ts`. `src/pages/search-index.json.ts` supplies published titles, descriptions, body text, tags, and photo locations from every feed collection. `src/lib/search.ts` ranks title matches first, ignores accents, supports prefixes, and accepts one-edit spelling errors for words of at least four characters. Shared text-node rendering highlights matches and supplies excerpts. Inline search stays within the current listing and saves `q` and `type` in its URL. Keep loading, retry, clear, and empty states, keyboard access, and the dialog controls above the scrolling results.

### Design System

The shared publication system lives in `src/styles/publication.css`; compact listing styles live in `src/styles/simple.css`. `global.css` retains general styles and legacy tokens used by other surfaces.

**Colors:** Paper and ink surfaces, lake-blue links and focus, copper cooking accents, and moss life accents. Dark publication surfaces use true black. Reuse the `--news-*` tokens rather than adding a separate listing palette.

**Life archive exception:** Only `.life-page` uses the coastal tokens in `src/styles/life-archive.css`. Keep shared paper, ink, navigation, search, footer, and saved themes. `src/components/life/CefaluCoast.astro` draws the supplied Cefalù photo reference as native pixel SVG; do not publish the reference as a photo post. Preserve the yellow umbrellas, blue sea, warm sand, old town, and La Rocca. Small stepped wave and boat motion runs automatically and stops for reduced motion. Do not add a pause control. The shared theme control shows a sun in light mode and a moon in dark mode. The coast changes to a starry night with a crescent moon, reflected light, lit windows, and dimmed beach colors; people rest on towels in both views. See `DESIGN.md` and `.impeccable/life-surface.md` for this scoped exception.

**Typography:** Space Grotesk for listing titles, rows, controls, and dates; Fraunces for the header wordmark and established editorial display; Source Serif 4 for existing story prose; JetBrains Mono for existing code and compact metadata. Preserve the fonts and image treatments of individual post layouts.

## Content Workflows

### Adding a New Blog Post

1. Create new `.md` or `.mdx` file in `src/content/blog/` with date-slug naming
2. Add required frontmatter: title, description, pubDate, category
3. For recipes, include prepTime and cookTime when known, and a `recipeCategories` array from `src/lib/cooking.ts`. Choose categories from the ingredients and method; use the first value as `subcategory`.
4. Optionally add heroImage URL
5. Write content in Markdown/MDX
6. Do a tone pass before shipping

When writing or editing recipes, repeat ingredient measurements in the method where they are added so readers do not need to scroll back to the ingredient list. For divided ingredients, state the amount used in that step, including the measured remainder, rather than just saying "the remaining sugar." Keep cup/spoon measurements alongside any gram weights, and check that the step amounts add up to the ingredient-list totals.

### Sharing a Link

Create `src/content/links/YYYY-MM-DD-slug.md` with required `title`, `url`
(HTTP/HTTPS), and `pubDate`. Optional fields: `description`, `author`, `tags`,
and `draft`. Add personal commentary as Markdown below the frontmatter when
needed. Use the sharing date for `pubDate`, not the linked source's original
publication date. YouTube watch, live, short, embed, and youtu.be URLs embed
inline automatically; other links display a source link. Shares appear in the
homepage feed, `/links/`, their own permalink, and `/rss.xml`.

`PostRow.astro` renders dated archive and homepage rows with outbound link titles. The Links archive preserves YouTube playback inside a native Watch video disclosure. `SimpleSidebar.astro` shows compact commentary and the source domain. `LinkPost.astro` retains the standalone share page and its inline embed. Use publication typography and theme tokens.
### Photos and Screenshots

Both belong in `src/content/seen/`. Set `mediaType: screenshot` for screen
captures; existing posts default to `photo`. Required fields are `title`,
`photo` (the hosted image URL), and `pubDate`. `location` is optional. Include
descriptive `alt` text and a short Markdown caption. Use a timezone-qualified
timestamp when ordering multiple posts on the same day; timestamps display in
Chicago time, while date-only frontmatter keeps its written calendar date.

### Writing Voice for magerblog

This is a personal technical blog. Write in first person, but keep the tone smart, calm, and specific.

Target something closer to Karpathy or Simon Willison than startup-founder thread voice.

Prefer:
- clear explanations
- technical specificity
- concrete examples
- section headings that name the content directly, such as "Software and development" or "Photos and screenshots", without slogans or decorative taglines
- honest tradeoffs
- earned insight

Avoid:
- bro-y lines like "That felt right" or "That's the bar"
- dramatic one-line paragraphs used only for swagger
- generic claims about AI, creativity, or the future
- self-congratulatory narration
- "vibes" in place of argument

If a sentence sounds like it is trying to be quoted on X, it is probably making the draft worse.

### Category Pages

Category pages filter the published entries from `getFeed()` by collection and category. Keep `pubDate` order, show the newest entry once as the lead, then show the remaining dated rows. Life shows four photo-led stories before older dated rows. Category filters feature the newest matching entry and omit it from the rows. Cooking sorts by `updatedDate` when present, otherwise `pubDate`, newest first, with a large feature and recipe photo grid. Cooking date labels show the same effective date. Its `recipeCategories` array allows a recipe to match several top filters; `src/lib/cooking.ts` defines the allowed values and labels. All cooking posts, including drafts, need at least one category. Counts include the feature. Each category selects its own introduction, palette, and feature composition through `data-cooking-world`; search preserves that world. Cooking headers use a pendant-light theme button without visible Light/Dark text. See `docs/design/cooking.md` for category rules. Search hides the lead and includes that entry in ranked rows; clearing search restores the matching lead.

### Navigation

BlogPost layout includes prev/next navigation that:
- Filters posts to same category
- Sorts by pubDate descending
- Finds current post index
- Links to adjacent posts in chronological order

## Integrations

- **@astrojs/mdx**: MDX support for blog posts
- **@astrojs/sitemap**: Automatic sitemap generation
- **@astrojs/rss**: RSS feed support (configured via astro.config.mjs site URL)
- **@vercel/analytics**: Vercel Analytics integration
- **@astro-community/astro-embed-twitter**: Twitter embed support

## Image Hosting (Vercel Blob)

Blog images are hosted in the `magerblog-images` Vercel Blob store (public,
free tier). Do NOT commit photos to the repo and do NOT use Google Photos
links for new posts (older posts still have `lh3.googleusercontent.com`
URLs — leave those alone).

To add an image to a post, upload it first:

```bash
scripts/upload-photo.sh <image-file> <post-slug> [basename]
# e.g. scripts/upload-photo.sh ~/photo.heic 2026-07-18-montrose-sunset hero
```

The script compresses to a max-1600px JPEG (~200-400KB), uploads to
`blog/<post-slug>/<basename>.jpg`, and prints the public URL — use that URL
as `heroImage` or in inline markdown images. Requires `.env.local` with
`BLOB_READ_WRITE_TOKEN` (restore with `vercel env pull .env.local`).

## Notes

- The site uses Astro's content loader API with `glob()` loader
- All pages are statically generated at build time
- The homepage has no benchmark widget or live benchmark request. Bench remains a footer link.
- Hero images are external URLs (Vercel Blob for new posts; Google Photos links in older posts)
- Tech articles and notes use a compact shared header and footer; an optional hero image follows the title without a full-screen placeholder.
