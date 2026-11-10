# Tech — Agent atlas

Mode: Read with an interactive editorial opening. Scope: `/tech/` only.

The user selected Agent atlas: a large interactive network, bold type, electric blue, fast SVG rendering, and a static fallback. This is a code-led surface; no raster comp or generated image is needed.

The first viewport pairs a cobalt typography field with a black network of real published articles. Six links around an Agents hub connect infrastructure, tools, skills, and evaluation. Hover and keyboard focus isolate a connection and reveal the article's title. The diagram is an editorial map, not a live activity display. Motion has a pause control, stops offscreen, and respects reduced motion. All article links work without JavaScript.

Keep the shared header, footer, fonts, explicit theme choice, chronological newest-post feature, notes/links sidebar, archive search, and progressive loading. Light remains the default. Use page-scoped blue tokens and a dark diagram in both themes. The main reading surface uses existing publication tokens. On phones the opening stacks and the network retains large HTML link targets.

Alternatives considered: a black/yellow workshop (less spatial discovery), and a 3D orbital world (greater rendering cost). The user chose the SVG atlas.

## Verification evidence

- Production build: 193 pages, passed.
- Unit tests: 31 passed. Archive, theme, and shared shell integration tests: 10 passed.
- `.impeccable/review/tech-{desktop,mobile,dark,small,tablet}.png`: complete page captures, with corresponding `-viewport.png` captures.
- `.impeccable/review/tech-qa.json`: Chromium checks at 1440, 390, 320, and 768 pixels, plus dark mode. No axe violations, horizontal overflow, or node overlaps. Search, clear, empty results, native article destinations, keyboard selection, pause/resume, reduced motion, and no-JavaScript content passed.
- Animation sample on the local desktop: 16.7ms median / 16.8ms p95 across 119 intervals. This is not a real-device phone performance test. Offscreen motion stops.
- Impeccable detector: only advisory differences from the shared publication palette/type scale, intentional for this scoped redesign.
- Independent finish review: **ship**, no required fixes.
