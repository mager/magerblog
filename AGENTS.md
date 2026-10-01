# AGENTS.md

This file provides guidance to Codex (Codex.ai/code) when working with code in this repository.

## Project Overview

This is a personal blog built with Astro v5, featuring three main content categories: Tech, Life, and Recipes. The site uses a dark, terminal-inspired design theme reminiscent of code editors like Codex, with category-specific color schemes applied to images and navigation elements.

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

- `src/pages/index.astro`: Two-column homepage: a chronological feed of tech articles, notes, photos/screenshots, and link shares on the left; recent cooking and life articles on the right. Stacks feed-first on mobile. Updates do not bump entries. Filters and progressive loading enhance the complete static stream.
- `src/lib/feed.ts`: Shared publication filtering and chronological ordering for the homepage and main RSS feed
- Homepage articles and notes show only a short description and a read link. Add `description` to notes for an authored preview; a brief first-paragraph excerpt is the fallback. Keep full text on the post pages, while Seen captions and link embeds remain inline.
- `src/pages/links/`: Link-share archive and permalinks
- `src/pages/blog/[...slug].astro`: Dynamic blog post pages using `getStaticPaths()`
- `src/pages/tech.astro`, `recipes.astro`, `life.astro`: Category listing pages
- `src/pages/about.astro`: About page

### Layouts

- `src/layouts/ReadingPost.astro`: Shared editorial layout for tech articles and notes, with Fraunces titles, Source Serif body text, section navigation, reading progress, code-copy controls, and related posts.
- `src/layouts/BlogPost.astro`: Supplies tech article metadata, reading time, same-category navigation, and search to ReadingPost.
- Cooking and life articles retain their dedicated layouts.
- `src/styles/reading.css`: Detail-page typography, prose, code, tables, and mobile layout.
- Publication pages default to light mode. `ThemeToggle.astro` saves an explicit light/dark choice under `mager-theme`; `BaseHead.astro` applies it before paint. Dark publication surfaces use true black. Theme colors live in `newspaper.css`.

### Components

- `BaseHead.astro`: SEO meta tags and Open Graph data
- `Header.astro`: Site navigation with category links
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

- The site uses Astro 5's content loader API with `glob()` loader
- All pages are statically generated at build time
- The homepage's `BenchWidget.astro` takes a dated build snapshot from
  `https://bench.mager.co/api/summary`, then refreshes it in the browser on each
  visit. Keep scores and model names out of the component source. Failed live
  requests retain the labeled snapshot and the leaderboard link.
- Hero images are external URLs (Vercel Blob for new posts; Google Photos links in older posts)
- Tech articles and notes use a compact shared header and footer; an optional hero image follows the title without a full-screen placeholder.
