---
title: "Diving into Impeccable"
description: "Going from occasional design commands to reproducing bugs in Impeccable, with Codex, Astra, and a mobile browser."
pubDate: "2026-10-01"
link: "https://github.com/pbakaus/impeccable"
linkText: "Impeccable on GitHub"
category: tech
tags: ["open source", "Impeccable", "Codex", "testing"]
draft: false
---

I usually use [Impeccable](https://github.com/pbakaus/impeccable) a few commands at a time to improve the design of my web pages. Tonight I cloned the repository and started looking for a first contribution with Codex and Astra. I wanted a bug I could reproduce and a fix I could actually verify.

I hadn't used `audit` before, and I learned that the skill workflow and CLI are different entry points. The skill guides an agent through a review; `impeccable detect <URL>` runs automated checks. Following a finding back into the Rust engine was a new side of a tool I already used.

The most interesting report was [a closed mobile menu producing text-overlap warnings](https://github.com/pbakaus/impeccable/issues/882). Its hidden links still had layout rectangles, even though the browser wasn't painting them. The detector treated those rectangles as visible content and reported collisions with the page behind the menu.

We reproduced it with agent-browser and a small HTML fixture: five false warnings with the menu closed, none when it was open with enough space, and five legitimate warnings when we deliberately covered the open menu. That last case matters. A fix has to remove the false alarms while preserving the real ones.

Two other agents prepared local fixes for [contrast warnings on pale gradients](https://github.com/pbakaus/impeccable/issues/881) and [Live selecting too much React source around an input](https://github.com/pbakaus/impeccable/issues/875). Focused tests passed; broader suites had failures we also reproduced on unchanged code, so those limitations are documented.

We posted reproduction details and asked whether the maintainers wanted PRs for all three issues. No PRs are open yet, and the mobile-menu fix still needs implementation. I came in wanting to contribute code; the first useful contribution was a small page that made the bug easy for someone else to check.
