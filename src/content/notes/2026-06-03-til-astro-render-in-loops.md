---
title: "TIL: rendering many Astro entries on one page"
pubDate: "2026-06-03"
tags: ["TIL", "Astro"]
---

To render the body of every entry in a collection inline on one page, `render()`
returns a promise per entry, so resolve them together before mapping:

```ts
const items = await Promise.all(
  notes.map(async (note) => ({ note, Content: (await render(note)).Content }))
);
```

Then `{items.map(({ Content }) => <Content />)}` in the template. Calling
`render()` directly inside the JSX map doesn't work — it's async and the
template won't await it.
