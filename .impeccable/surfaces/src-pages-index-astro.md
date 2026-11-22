---
version: 1
slug: "src-pages-index-astro"
primary_target: "src/pages/index.astro"
related_targets: ["src/components/SimpleHome.astro","src/styles/timeline.css"]
---

# Homepage timeline

Mode: Experience. Scope: the homepage and its sky viewer. Readers come here for the writing, recipes, notes, photos, screenshots, and links in publication order.

## Direction contract

**Thesis.** Scroll through a personal archive as the solar system travels backward through its recorded dates.

**Own world.** A deep midnight star field, pale lavender light, warm planetary highlights, and a single vertical route. Pictures keep their authored colors. Each content type has a named marker.

**Story.** Read a post, scroll to an older date, then look around the sky as seen from Earth on that date. The same date produces the same positions.

**First viewport.** The Timeline title and date range share the opening with Earth, its daylight boundary, a small satellite, and a UTC clock. The globe opens at the current UTC minute and follows the current post once the reader reaches the archive. The newest real post leads the path below. An orbital diagram tracks the post in view. Native scrolling, keyboard access, saved themes, and static content survive the effects.

**Form.** seed: none (pinned). “the website canvas is the universe” and “no jumps”. Horizontal drag and arrow keys pan the Earth-based sky.

**Finish.** unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance.

## Verification

The production build generated 198 pages. All 39 unit tests and 30 integration tests passed, including checks for the Earth globe and UTC clock. Browser checks covered the 1440px desktop, 390px phone, and 320px narrow layout. The review found small date labels and development controls in the initial captures. The phone now uses 12px dates, and the final captures use the production server.

Scrolling to the Mars Cheese Castle photo and to the last post on December 29, 2008 set the orbital map and sky viewer to the matching dates. The viewer restores keyboard focus on close. Both themes passed the automated accessibility check at desktop and phone widths. All 169 entries were available with JavaScript disabled.
