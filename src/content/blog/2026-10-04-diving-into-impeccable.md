---
title: "Diving into Impeccable: design verbs, slop detection, and learning to contribute"
description: "One of my favorite plugins turns design direction into something I can ask for by name. Exploring its skills, browser tools, and static analyzer made me want to help build it."
pubDate: "2026-10-04"
category: tech
keyword: "design skills"
tags: ["open source", "Impeccable", "Codex", "design", "static analysis", "evals"]
draft: false
---

[Impeccable](https://impeccable.style/) is one of my favorite plugins. I can't live without it at work. This is pretty much how I use it:

> Use my Impeccable design skills to make this bolder. Delight on overdrive.

That's an actual way I ask for design work, and it captures what I love about the tool. Once you learn the verbs, you can describe the change you want. You start feeling like a designer. Cue heaven music.

I recently got a ChatGPT Pro account and wanted to put some of my tokens toward contributing to Impeccable. Exploring the repository with Codex and Astra has turned into a lesson in how much the tool does beyond the few skills I already used. I'm still reproducing bugs and finding the best way to contribute, including ideas for new slop detection checks.

## What Impeccable does

Impeccable is an open-source design toolkit for AI coding agents, created by Paul Bakaus. It gives the agent guidance on typography, layout, color, motion, UX, and the repetitive design habits that make generated pages look interchangeable. You use it inside your coding tool, where it can work with your actual project.

A skill is a set of instructions and supporting resources the agent loads for a task. Impeccable packages its design workflows as commands under one main skill. I tend to call them my design skills; the useful part is the vocabulary they give me.

That vocabulary covers more than making a page prettier. You can plan an interface, critique it, simplify it, improve its copy, check accessibility, or prepare it for real-world content. The [command reference](https://github.com/pbakaus/impeccable#24-commands) is a good place to see the range.

## Learn the verbs

Here are the ones that make the idea click:

| What I want to change | Verb | What it asks the agent to focus on |
| --- | --- | --- |
| This feels timid | `bolder` | Stronger hierarchy and visual character |
| This works, but feels lifeless | `delight` | Personality, feedback, and moments of joy |
| Push the implementation further | `overdrive` | Ambitious effects and interactions suited to the interface |
| There's too much going on | `distill` | Remove complexity and keep the essential parts |
| The text feels off | `typeset` | Typography, hierarchy, sizing, and readability |
| Something feels wrong, but I can't name it | `critique` | Evaluate the design and explain what needs attention |
| Check the implementation | `audit` | Accessibility, performance, responsiveness, and other technical concerns |
| It's almost ready | `polish` | Alignment, spacing, consistency, and finishing details |

My “delight on overdrive” prompt is conversational direction. The named workflows also give you a more explicit way to ask. In Codex, for example:

```text
$impeccable bolder the hero section
$impeccable delight the empty state
$impeccable audit this page
```

Most other supported agents use `/impeccable` as the prefix. The target matters: a hero, an empty state, and a settings form need different kinds of attention.

The best part is learning to recognize those differences myself. Is the page missing hierarchy? Is the copy unclear? Does it need more personality, or less decoration? Having names for those decisions helps me give better direction and evaluate what comes back.

Even `overdrive` is about context. Its guidance distinguishes a creative portfolio from a settings page. A dramatic visual effect might belong in one; fast saves and carefully handled state transitions might be the impressive part of the other. I still choose the direction and judge the result.

## More than a prompt library

As I [posted on X](https://x.com/mager/status/2106168543419285586), discovering features has been the best part of trying to contribute. I'd started using `audit` on a personal site and at work, and learned that the browser extension could scan a page.

These features do different jobs. `audit` asks the agent to investigate technical quality and produce a report. `critique` looks at the design experience: hierarchy, clarity, and whether the interface makes sense. The browser extension runs detector checks against a page and shows findings. Those deterministic checks don't need an LLM or an API key.

[Live mode](https://impeccable.style/docs/live/) adds another workflow: pick an element in a running page, describe a change, compare variants, and accept the one you want back into the source. That gives you something concrete to react to while exploring a direction.

There's project context, too. `init` records what the product is for in `PRODUCT.md`; `document` captures an existing visual system in `DESIGN.md`. That helps later work stay connected to the audience and the design already in the code.

Then I discovered the static analyzer.

## Static analysis is fun, actually

Static analysis inspects code without running the application. In Impeccable's case, the static HTML engine reads markup and supported CSS, including local linked stylesheets and CSS variables. It can report certain problems before you open a browser.

We tried a small experiment using a local build of the [Rust engine](https://github.com/pbakaus/impeccable/blob/e103efe779e2dd01274dabae83531fef00bf2563/docs/ENGINE.md). An HTML page linked to a stylesheet, and a paragraph got its color from a variable:

```css
:root { --ink: #aaa; }
body { background: #fafafa; color: #222; font: 16px/1.6 Georgia, serif; }
.message { color: var(--ink); }
```

Then we scanned the file:

```sh
impeccable detect --no-config --json index.html
```

The analyzer followed the stylesheet, resolved the variable, and reported **2.2:1 contrast where 4.5:1 was needed**. Changing `--ink` to `#222` cleared the finding. Same input, same check, repeatable result. I think that's awesome: a specific design problem becomes something I can measure and verify.

`detect` is an engine command, which helped clear up my earlier confusion about asking for a skill named “detect.” The engine is written in Rust, and shared rules also compile to WebAssembly for browser use. You don't need to write Rust to use Impeccable, but investigating a detector can take you into that code.

Static analysis has limits. It doesn't execute the page's JavaScript or establish its actual painted layout. A browser scan has access to different evidence, such as rendered geometry and visibility. Neither a clean scan nor an empty findings array proves the whole interface is good.

## Why this reminds me of AI evals

I keep noticing this connection while working on AI tools and [evals](/notes/2026-06-26-skill-evals/): some questions can become explicit checks. Does the output have the required structure? Does the generated code pass its tests? Is this text below a contrast threshold?

Those aren't all static analysis. Running a test executes code; checking a rendered page uses a browser. What they share is a defined condition that can be checked repeatedly, alongside the judgments that still need context.

For a UI evaluation, I could imagine combining source checks, browser interaction tests, and a human or model review of whether the result fits the brief. The contrast finding is one useful signal. It can't tell me whether the page has personality or whether its hierarchy serves the user.

The checks need evaluation too. A detector that complains about every page is easy to build and exhausting to use. You need examples it should flag and examples it should leave alone.

## Learning to contribute by reproducing bugs

A [mobile menu bug](https://github.com/pbakaus/impeccable/issues/882) made that lesson concrete. Links inside a closed `<details>` element retained layout rectangles even though Chrome wasn't painting them. The detector reported collisions with invisible links.

With agent-browser and a small mobile fixture, we got five false warnings with the menu closed, none when it was open with enough space, and five real warnings when we deliberately covered the open menu. That last case matters: the fix needs to preserve detection of real problems.

We also reproduced a [Firefox extension failure](https://github.com/pbakaus/impeccable/issues/847) on my local prxps app. The scanner tried to use a Chrome-specific background API. Our local patch gives Firefox another way to host the rule core, and we tested scanning and rescanning in both browsers.

Other investigations took us through [gradient contrast](https://github.com/pbakaus/impeccable/issues/881), [React source selection](https://github.com/pbakaus/impeccable/issues/875), and [file timestamps being mistaken for content changes](https://github.com/pbakaus/impeccable/issues/846). Some fixes were already underway with the maintainers. I'm learning to check ownership, describe exactly what we verified, and get approval before opening a PR. A small, reliable reproduction is useful work in itself.

## Suggesting new slop checks

I'm also developing a proposal around hard offset shadows, such as `box-shadow: 4px 4px 0 #333`. Impeccable's design guidance discourages them outside an intentional neobrutalist direction, but our synthetic examples didn't trigger a detector finding.

The exception is the interesting part. On [neobrutalism.dev](https://www.neobrutalism.dev/), hard shadows belong to the chosen style. Detecting the CSS shape is easier than deciding whether it belongs on a particular page.

I'm exploring an advisory check that could flag the pattern for review without treating every use as a failure. The proposal is still a draft. It needs examples where the effect conflicts with the intended design, plus controls that should pass.

That's where I am: using a plugin I love, learning how it works, and trying to contribute something useful. If you're new to it, start with the [installation guide](https://impeccable.style/docs/), pick a page you know well, and learn a few verbs. For me, `bolder`, `delight`, and `overdrive` opened the door. I'm still finding out how much is behind it.
