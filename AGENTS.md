# AGENTS.md

This file provides guidance to Codex (Codex.ai/code) when working with code in this repository.

## Project Overview

This is a personal blog built with Astro v7, featuring three main content categories: Tech, Life, and Recipes. The site uses a dark, terminal-inspired design theme reminiscent of code editors like Codex, with category-specific color schemes applied to images and navigation elements.

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

3. **Life** (`category: "life"`) - Green & Natural theme
   - Route: `/life`
   - Image border colors: Green tones with glow effects
   - Icon: 🌆

## Architecture

### Key Files

- `astro.config.mjs`: Astro configuration with MDX and sitemap integrations
- `src/content.config.ts`: Content collections schema using Zod validation
- `src/consts.ts`: Global constants (SITE_TITLE, SITE_DESCRIPTION)
- `src/styles/global.css`: CSS custom properties and global styles

### Routing

- `src/pages/index.astro`: Chicago edition homepage with about 30 distinct entries across a lead spread, dispatches, workbench, Seen strip, cooking, life, artifacts, and links. `src/lib/edition.ts` selects each section from publication order without duplicates. A Front page / All updates switch opens the chronological stream, with a native content filter and 24-entry progressive loading. Without JavaScript, the edition and a disclosure containing the full stream remain available. Updates do not bump entries. Homepage rows omit visible dates and redundant read/permalink actions; link-share titles go directly to the source.
- `src/lib/feed.ts`: Shared publication filtering and chronological ordering for the homepage and main RSS feed
- Homepage articles and notes show only a short description and a read link. Add `description` to notes for an authored preview; a brief first-paragraph excerpt is the fallback. Keep full text on the post pages, while Seen captions and link embeds remain inline.
- `src/pages/links/`: Link-share archive and permalinks
- `src/pages/blog/[...slug].astro`: Dynamic blog post pages using `getStaticPaths()`
- `src/pages/tech.astro`, `recipes.astro`, `life.astro`: Category listing pages
- `src/pages/about.astro`: About page

### Layouts

- `src/layouts/ReadingPost.astro`: Editorial layout for tech articles, with Fraunces titles, Source Serif body text, section navigation, reading progress, code-copy controls, and related posts.
- `src/layouts/Note.astro`: Compact notebook layout with a 680px reading column, Space Grotesk title and prose, quiet publication date, source link, and simple note navigation. Descriptions remain metadata and feed previews; notes omit the article deck, contents rail, and reading progress. Shared code-copy controls and Markdown styles remain available.
- `src/lib/content-meta.ts`: Homepage metadata uses reading time for articles and notes, authored recipe timing, and photo locations or screenshot labels. Missing recipe timing is omitted; partial timing is labeled explicitly.
- `src/layouts/Artifact.astro`: Compact 860px document column with left-aligned heading, filename, Markdown download, and a numbered contents disclosure. Native tables fill keyboard-accessible scroll containers; artifact prose uses the publication UI font.
- `src/layouts/BlogPost.astro`: Supplies tech article metadata, reading time, same-category navigation, and search to ReadingPost.
- Cooking and life articles retain their dedicated layouts.
- `src/styles/reading.css`: Detail-page typography, prose, code, tables, and mobile layout.
- Publication pages default to light mode. `ThemeToggle.astro` saves an explicit light/dark choice under `mager-theme`; `BaseHead.astro` applies it before paint. Dark publication surfaces use true black. Theme colors live in `newspaper.css`.

### Components

- `BaseHead.astro`: SEO meta tags and Open Graph data
- `Header.astro`: Primary links for Tech, Cooking, Life, and Artifacts. A native More disclosure contains Notes, Seen, Links, About, and RSS.
- `Footer.astro`: Site footer
- `Card.astro`: Blog post card for grid layouts
- `FormattedDate.astro`: Date formatting component

### Design System

The site uses a dark terminal theme with CSS custom properties in `global.css`:

**Colors:**
- Background: `--editor-bg` (#0a0a0a), `--terminal-black` (#000000)
- Text: `--text-primary`, `--text-secondary`, `--text-muted`
- Syntax highlighting: `--cyan`, `--purple`, `--green`, `--yellow`, `--orange`, `--red`

**Typography:**
- Primary font: JetBrains Mono (monospace)
- Fallback font: Atkinson (custom web font)

**Category-specific image styling:**
Images in blog posts receive category-specific border colors applied via `body[data-category="..."]` selectors in `BlogPost.astro`. The styling includes double borders (border + outline) with glow effects and hover transforms.

## Content Workflows

### Adding a New Blog Post

1. Create new `.md` or `.mdx` file in `src/content/blog/` with date-slug naming
2. Add required frontmatter: title, description, pubDate, category
3. For recipes, include prepTime and cookTime
4. Optionally add heroImage URL
5. Write content in Markdown/MDX
6. Do a tone pass before shipping

### Sharing a Link

Create `src/content/links/YYYY-MM-DD-slug.md` with required `title`, `url`
(HTTP/HTTPS), and `pubDate`. Optional fields: `description`, `author`, `tags`,
and `draft`. Add personal commentary as Markdown below the frontmatter when
needed. Use the sharing date for `pubDate`, not the linked source's original
publication date. YouTube watch, live, short, embed, and youtu.be URLs embed
inline automatically; other links display a source link. Shares appear in the
homepage feed, `/links/`, their own permalink, and `/rss.xml`.

`LinkPost.astro` renders link shares in the feed, archive, and permalink: keep
the outbound title, source domain, and arrow primary. Keep commentary compact; omit the sharing-date/permalink footer from feeds and archives. Dates appear only on the standalone page. Use publication typography and theme tokens, and
preserve inline YouTube playback.
### Publishing an Artifact

Artifacts are working Markdown documents (audits, specs, plans, research, checklists), distinct from blog articles. Add `src/content/artifacts/YYYY-MM-DD-slug.md` with required `title`, `description`, and `pubDate`; optional `updatedDate`, `tags`, and `draft`. Use `##` for body sections; the page and Markdown download supply the title. Use site-root or absolute links so they work from the permalink and the downloaded file.

Artifacts appear in the homepage stream and its Artifacts filter, `/artifacts/`, `/artifacts/<slug>/`, the main RSS feed, and `llms.txt`. `/artifacts/<slug>.md` provides the portable title and Markdown body. Drafts are excluded from every public artifact surface. Edits do not bump publication order. Keep one canonical document in the collection; if moving an existing report, leave a pointer at its old path.

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

Category pages filter posts using `getCollection('blog')` and filter by category field, then sort by pubDate descending.

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
- The homepage's `BenchWidget.astro` takes a dated build snapshot from
  `https://bench.mager.co/api/summary`, then refreshes it in the browser on each
  visit. Keep scores and model names out of the component source. Failed live
  requests retain the labeled snapshot and the leaderboard link.
- Hero images are external URLs (Vercel Blob for new posts; Google Photos links in older posts)
- Tech articles and notes use a compact shared header and footer; an optional hero image follows the title without a full-screen placeholder.
