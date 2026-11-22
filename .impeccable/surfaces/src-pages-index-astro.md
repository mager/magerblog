---
version: 1
slug: "src-pages-index-astro"
primary_target: "src/pages/index.astro"
related_targets: ["src/components/SimpleHome.astro","src/styles/timeline.css"]
---

# Homepage timeline

The homepage uses Experience mode. Readers can find a post by date or search across writing, recipes, notes, photos, screenshots, and shared links.

## Direction contract

**Reading order.** Search posts appears above the newest entry. Use Latest posts as the screen-reader heading. Give the first screen to the posts and their images.

**Appearance.** A deep midnight star field surrounds a single vertical path. Preserve photo colors. Use a short name and color for each content type. Dates and space between entries mark the passage of time.

**Earth.** The globe and satellite stay in view as the reader scrolls. Place them to the right of the feed on desktop and beside the wordmark on phones. At the top, the clock shows current UTC time. Each post in the reading area sets the date and daylight on Earth. Returning to the top restores the clock.

**Interaction.** Native scrolling sets the direction and speed of travel through the stars. Fast movement sends nearby stars past the reader. Reverse movement reverses their travel. Earth stays fixed, and reduced motion keeps the star field still. Preserve the older-posts button, keyboard access, and saved themes. Post links open the published content.

## Verification

Check the globe and satellite at a desktop width and on a narrow phone. Scroll to a photo, then return to the top and check the clock. Search for a word from a recipe body. Clear the search and confirm the newest post returns to the top. With JavaScript disabled, every published entry must be available as a link.
