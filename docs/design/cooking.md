# Cooking collection

The cooking landing page is a modern food magazine inside mager.co. Its purpose is to help readers find a recipe by dish, main ingredient, or full-text search.

Use the publication paper, ink, copper, and dark-mode tokens. Space Grotesk carries bold page and recipe headings, controls, and descriptions. Fraunces appears selectively in the soup, baking, and breakfast worlds. Keep the shared header and footer.

A large title and short introduction lead into counted text filters and search. Recipes sort by `updatedDate` when present, otherwise `pubDate`, newest first. Date labels use that same date and mark updates. The newest matching recipe appears once in a large photo-and-text spread. Two large recipe stories open the desktop index, followed by three-column browsing. Tablets use two columns; phones use one. On phones, filters scroll horizontally and remain reachable by keyboard. Recipes without photos use a text treatment. Failed images fall back to that treatment.

The controls use the existing full-text search and list script. Search and filters combine; `q` and `type` persist in the URL. Search includes the featured recipe. Clearing it restores the newest matching feature. Counts include the feature. Show more adds 24 recipes. Without JavaScript, all published recipes remain available.

## Category rules

`recipeCategories` is the source of filter membership. The content schema requires it for every cooking post, including drafts. Values and labels live in `src/lib/cooking.ts`. A recipe can have several categories. The first is its primary group, also recorded in the legacy `subcategory` field. General `tags` stay available to search, with lowercase, hyphenated values.

Assign categories from the ingredients and method, not title keywords alone. Orzo is pasta. Tortillas and zucchini used as lasagna layers are not pasta. A chicken soup belongs to both soups and chicken. A dressing belongs to sauces and can also belong to sides and salads when the post includes the salad. Do not infer a protein from an unspecified sausage or a passing substitution. An explicit variation with measured ingredients and cooking instructions can add its protein category. Avoid dietary claims when the recipe permits conflicting ingredients.

Reviewed on November 7, 2026: all 46 cooking posts, including 41 published recipes and five drafts. Draft flags and original publication dates are preserved. The Cottage Pie post adds a measured turkey variation and an update date; the orzo post uses a revised hosted image. Drafts do not contribute to filter counts or results.

## Verification

`npm test` checks content classification regressions. `npm run test:build` checks each filter, counts, newest-first features, combined full-text search, saved URLs, and the static fallback. Review `/cooking/` in light and dark themes at desktop and phone widths.

## Category worlds and kitchen light

The selected filter sets `data-cooking-world` on the collection. Each category has an authored introduction from `src/lib/cooking.ts`. Soups use green, a wide photograph, and serif recipe titles. Pasta and rice use saffron paper with a reversed opening spread. Baking and breakfast use copper-tinted paper and serif titles. Sides and seasonings use green. Curries, casseroles, and meat use a stronger copper tint. All colors derive from publication tokens and adapt to dark mode.

Search keeps the selected world; clearing the category restores the main magazine. The heading and introduction sit below the persistent filters. Layout changes do not change recipe order or membership. Phones stack every world into one column.

Cooking pages and recipe detail pages use a small kitchen pendant light instead of visible Light/Dark text. Its bulb and rays show whether the light is on. The action label remains available to screen readers; saved-theme and cross-tab behavior are unchanged.

The magazine title uses 56–96px Space Grotesk, with a 52–64px phone size. Recipe features use 30–50px; category headings use 32–52px. Recipe-grid titles use 24–30px and metadata uses 11–14px. These local roles do not change the compact archive scale.

Recipe detail pages show linked category tags in the Ingredients / Method / Print bar. The tags are plain comma-separated links without borders. The tags replace the repeated title in that bar; omit the category label above the main recipe title. On phones, the tags occupy a second row and remain available while the bar is sticky.

Recipe sections have separate Copy ingredients and Copy instructions buttons directly below their headings. Copies preserve ingredient groups and numbered method steps, omit controls and images, and report success or manual recovery when clipboard access fails.

All category result sections use the full collection width. Align category headings and recipe grids with the filter bar at every screen width; do not add horizontal padding to the category panel.
