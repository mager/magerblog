# AGENTS.md

This file provides guidance to Codex (Codex.ai/code) when working with code in this repository.

## Project Overview

This is a personal blog built with Astro v5, featuring three main content categories: Code, Life, and Recipes. The site uses a dark, terminal-inspired design theme reminiscent of code editors like Codex, with category-specific color schemes applied to images and navigation elements.

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
- **category** (string, optional): One of "code", "food", or "life"
- **prepTime** (number, optional): Recipe prep time in minutes
- **cookTime** (number, optional): Recipe cook time in minutes

File naming convention: `YYYY-MM-DD-slug.md` (e.g., `2024-12-29-mac-and-cheese.md`)

### Categories

The site organizes content into three categories, each with distinct visual themes:

1. **Code** (`category: "code"`) - Purple & Cyan theme
   - Route: `/code`
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

- `src/pages/index.astro`: Homepage displaying latest post from each category
- `src/pages/blog/[...slug].astro`: Dynamic blog post pages using `getStaticPaths()`
- `src/pages/code.astro`, `recipes.astro`, `life.astro`: Category listing pages
- `src/pages/about.astro`: About page

### Layouts

- `src/layouts/BlogPost.astro`: Main blog post layout with:
  - Hero image or terminal window placeholder
  - Sticky header that appears on scroll
  - Category-specific image border styling via `data-category` attribute
  - Prev/Next navigation within the same category
  - Recipe metadata display (prep/cook times)
  - Article footer with publication info

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

## Notes

- The site uses Astro 5's content loader API with `glob()` loader
- All pages are statically generated at build time
- Hero images are external URLs (Google Photos links in existing posts)
- The sticky header appears after scrolling 300px down the page
- Terminal-style placeholders display when no hero image is provided
