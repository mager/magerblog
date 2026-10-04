---
title: "Diving into Impeccable: finding my way from user to contributor"
description: "Impeccable is one of my favorite plugins. With a new ChatGPT Pro account, I'm reproducing bugs, exploring its static analyzer, and working on ideas for detecting design slop."
pubDate: "2026-10-04"
link: "https://github.com/pbakaus/impeccable"
linkText: "Impeccable on GitHub"
category: tech
tags: ["open source", "Impeccable", "Codex", "testing", "static analysis"]
draft: false
---

[Impeccable](https://github.com/pbakaus/impeccable) is one of my favorite plugins. I can't live without it at work. I love that it detects design slop, but I'd mostly been using a few skills to improve my web pages. Digging into the project has shown me how much I'd been missing.

I recently got a ChatGPT Pro account and wanted to put some of my tokens toward contributing. I've been exploring the repository with Codex and Astra, reproducing bugs and figuring out where I can help most. As I [posted on X](https://x.com/mager/status/2106168543419285586), discovering more of the tool has been the best part: `audit`, the browser extension, and an entire static analyzer I didn't know existed.

## Underneath the skills

The skills guide an AI agent through design work. Underneath them is a [Rust engine](https://github.com/pbakaus/impeccable/blob/e103efe779e2dd01274dabae83531fef00bf2563/docs/ENGINE.md) with executable checks, exposed through CLI commands such as `impeccable detect`. Shared rules also compile to WebAssembly for the browser extension and Live overlay. You don't need to know Rust to use it, but that's where investigating a detector can take you.

The static analyzer can read HTML and supported CSS without opening a browser. To try it, we made an HTML file with a linked stylesheet and a paragraph whose color came from a variable:

```css
:root { --ink: #aaa; }
body { background: #fafafa; color: #222; font: 16px/1.6 Georgia, serif; }
.message { color: var(--ink); }
```

Then we scanned it with a local engine build:

```sh
impeccable detect --no-config --json index.html
```

The analyzer followed the stylesheet, resolved the variable, and reported **2.2:1 contrast where 4.5:1 was needed**. Changing `--ink` to `#222` cleared the finding. No model judgment was involved; we could rerun the same check and get the same result.

That doesn't replace testing a rendered page. Static analysis doesn't execute its JavaScript or establish its actual painted layout. Browser scans supply different evidence, including geometry and visibility.

## Learning through reproduction

A [mobile menu bug](https://github.com/pbakaus/impeccable/issues/882) made that distinction concrete. Links inside a closed `<details>` element retained layout rectangles even though Chrome wasn't painting them. The detector reported collisions with invisible links.

With agent-browser and a small mobile fixture, we got five false warnings with the menu closed, none when it was open with enough space, and five real warnings when we deliberately covered the open menu. That last test matters: removing false alarms is only half the job. Real problems still need to be caught.

We also reproduced a [Firefox extension failure](https://github.com/pbakaus/impeccable/issues/847) on my local prxps app. The scanner tried to use a Chrome-specific background API. Our local patch gives Firefox another way to host the rule core, and we tested scanning and rescanning in both browsers.

Other investigations took us through [gradient contrast](https://github.com/pbakaus/impeccable/issues/881), [React source selection](https://github.com/pbakaus/impeccable/issues/875), and [file timestamps being mistaken for content changes](https://github.com/pbakaus/impeccable/issues/846). Some fixes were already underway with the maintainers. I'm learning to check ownership, describe exactly what we verified, and get approval before opening a PR. A small, reliable reproduction is useful work in itself.

## What counts as slop?

I'm also developing suggestions for slop detection. One candidate is hard offset shadows, such as `box-shadow: 4px 4px 0 #333`. Impeccable's design guidance discourages them outside an intentional neobrutalist direction, but our synthetic examples didn't trigger a detector finding.

The exception is the interesting part. On [neobrutalism.dev](https://www.neobrutalism.dev/), hard shadows belong to the chosen style. Detecting the CSS shape is easier than deciding whether it belongs on a particular page.

I'm exploring an advisory check that could flag the pattern for review without treating every use as a failure. The proposal is still a draft. It needs examples where the effect conflicts with the intended design, plus controls that should pass. Reading how existing rules were developed has made me appreciate that evidence matters for taste-related checks too.

I'm still working toward a first PR and finding the best way to contribute. Meanwhile, a plugin I already depended on keeps teaching me new things about design, testing, and the tools underneath the skills.
