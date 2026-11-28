# Kitchen collection

The Kitchen at `/kitchen/` is a dense recipe index inside mager.co. Its purpose is to help readers find recipes by dish, main ingredient, authored tag, or full-text search. The photo-led browsing takes inspiration from [Bon Appétit](https://www.bonappetit.com/recipes); counted taxonomy takes inspiration from [Smitten Kitchen](https://smittenkitchen.com/recipes/).

Use the publication paper, ink, and copper tokens. Kitchen and recipe pages override dark-mode surface tokens with deep forest green, not black. Space Grotesk carries the page title, recipe headings, controls, and descriptions. Fraunces carries the short masthead introduction, search label, and recipe-box heading; it also appears selectively in soup, baking, and breakfast features. Keep the shared header and footer, light default, saved dark theme, and reduced-motion support.

A compact copper masthead pairs the title and factual recipe count with an illustrated kitchen counter. `KitchenCounter.astro` draws a tiled backsplash, copper pot, basil, wooden board, hanging utensils, and checked tea towel in native SVG. Its colors derive from publication tokens and adapt to the forest-green dark theme. The illustration is decorative and hidden from assistive technology. Steam moves once for four seconds; hovering the illustration lifts the lid. Both effects stop with reduced motion. On phones, the illustration sits beside the introduction below the title.

Search sits in a softly tinted field. Counted category buttons pair readable labels with decorative line icons from `KitchenIcon.astro`; the selected category has a solid accent fill. A complete tag selector and popular tag shortcuts follow. Recipes sort by `updatedDate` when present, otherwise `pubDate`, newest first. Date labels use that same date and mark updates. The newest matching recipe occupies two columns within a four-column grid; every recipe appears once. Tablets and phones use two columns, with one column below 360px. On phones, categories and popular tags scroll horizontally and remain reachable by keyboard. Recipes without photos use a warm recipe-card treatment. Failed images fall back to that treatment. These styles are scoped to Kitchen; recipe reading layouts and shared navigation remain unchanged.

The controls use the existing full-text search and list script. Search, category, and exact tag membership intersect; `q`, `type`, and `tag` persist in the URL. Category counts respect the current search and tag; tag counts respect the current search and category. Disable zero-result choices, keeping All recipes and Any tag available and the selected category or tag shortcut clearable. A saved empty combination shows an honest zero, a No matching recipes heading, and no category prose. Clear tag preserves category and search. Search and tag filters hide the feature and include it in regular results. Clearing both restores the newest matching feature. Reset clears all three controls. Show more adds 24 recipes. Without JavaScript, all published recipes remain available.

`/cooking/` and `/recipes/` redirect directly to `/kitchen/`. Vercel supplies permanent redirects; static fallback pages preserve the query and fragment with JavaScript and provide a canonical link and meta refresh. Legacy pages are noindex and excluded from the sitemap. Recipe permalinks stay under `/blog/`.

## Category rules

`recipeCategories` is the source of category membership. The content schema requires it for every recipe, including drafts. Values and labels live in `src/lib/cooking.ts`. A recipe can have several categories. The first is its primary group, also recorded in the legacy `subcategory` field. Authored `tags` supply the exact tag filter as well as full-text search; the index normalizes case and whitespace without changing source content. Tag options and counts come only from published recipes.

Assign categories from the ingredients and method, not title keywords alone. Orzo is pasta. Tortillas and zucchini used as lasagna layers are not pasta. A chicken soup belongs to both soups and chicken. A dressing belongs to sauces and can also belong to sides and salads when the post includes the salad. Do not infer a protein from an unspecified sausage or a passing substitution. An explicit variation with measured ingredients and cooking instructions can add its protein category. Avoid dietary claims when the recipe permits conflicting ingredients.

Reviewed on November 7, 2026: all 46 cooking posts, including 41 published recipes and five drafts. Draft flags and original publication dates are preserved. The Cottage Pie post adds a measured turkey variation and an update date; the orzo post uses a revised hosted image. Drafts do not contribute to filter counts or results.

## Verification

`npm test` checks content classification regressions. `npm run test:build` checks categories, tags, counts, newest-first features, combined full-text search, reset, retry, saved URLs, redirects, and the static fallback. Review `/kitchen/` in light and dark themes at desktop and phone widths.

## Category worlds and kitchen light

The selected category sets `data-kitchen-world` on the collection. Each category has an authored introduction from `src/lib/cooking.ts`. Soups, sides, and seasonings use green; pasta and rice use saffron paper. Baking and breakfast use copper-tinted paper and serif feature titles. All colors derive from publication tokens and adapt to dark mode. The compact grid stays consistent across categories.

Search keeps the selected category palette; clearing the category restores the main index. The heading and introduction sit below the controls. Hide the introduction when searching, filtering by tag, or showing no results. Category changes preserve the selected tag and query.

Kitchen and recipe detail pages use a small pendant light instead of visible Light/Dark text. Its bulb and rays show whether the light is on. The action label remains available to screen readers; saved-theme and cross-tab behavior are unchanged.

The Kitchen title uses 68–104px Space Grotesk and 72px on phones. Features use 25–44px headings; regular grid titles use 18–23px. Photo-less cards have larger headings and more description space. These local roles do not change other archives.

Recipe detail pages show linked category tags in the Ingredients / Method / Print bar. The tags are plain comma-separated links without borders. The tags replace the repeated title in that bar; omit the category label above the main recipe title. On phones, the tags occupy a second row and remain available while the bar is sticky.

Recipe sections have separate Copy ingredients and Copy instructions buttons directly below their headings. Copies preserve ingredient groups and numbered method steps, omit controls and images, and report success or manual recovery when clipboard access fails.

All category result sections use the full collection width. Align category headings and recipe grids with the filter bar at every screen width; do not add horizontal padding to the category panel.
