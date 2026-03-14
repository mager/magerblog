---
title: "blog-seo: I Packaged My Own SEO Audits Into a Skill"
pubDate: "2026-03-13"
description: "I kept fixing the same frontmatter issues by hand — missing keywords, empty heroImages, weak descriptions. So I turned the whole workflow into a Claude Code skill with both spec and quality evals."
category: "code"
tags: ["Claude Code", "SEO", "Skills", "Loooom", "Evals", "Astro"]
keyword: "blog seo audit skill claude code astro"
heroImage: ""
draft: false
---

I've been doing the same SEO cleanup by hand for weeks. Run a mental diff across all my posts, find the ones missing a `keyword` field, punch up three descriptions, wonder why that one post has an empty `heroImage`. Repeat.

This week I caught myself doing it for the third time and thought: *this is exactly what a skill is for.*

So I built `blog-seo` — a Claude Code skill that audits my Astro blog frontmatter, fixes issues in bulk, and runs two kinds of evals. Here's how it works and why the dual eval model is the right way to think about content quality.

---

## The Problem: SEO Debt Accumulates Fast

When you're shipping posts at pace — and I've shipped 15+ in the past month — frontmatter hygiene slips. You're focused on the content. The `keyword` field doesn't feel urgent when you're in the zone writing about LangGraph at 11 PM.

But it adds up. I ran a fresh audit this morning:

```
Total issues: 50
- 22 posts missing keyword
- 15 posts with empty heroImage
- 9 posts with bad title format
- 2 posts with descriptions under 50 chars
```

That's across ~72 posts. Roughly 70% had at least one issue. Not catastrophic, but not nothing.

---

## Two Kinds of Evals

The insight that made this skill worth building: there are two distinct types of quality checks, and conflating them is why most "SEO tools" feel wrong.

### Eval Type 1: Spec Compliance

Does the post have all required fields in the right format?

This is deterministic. Either `keyword` is present or it isn't. Either `description` is under 160 characters or it isn't. Either the title follows `<Tool>: <Headline>` or it's just words.

The skill ships a bash script that scans every `.md` file in the blog and reports grouped issues:

```bash
bash ~/.claude/skills/blog-seo/scripts/audit.sh ~/Code/magerblog/src/content/blog/
```

Category-aware too — it only enforces the `<Tool>: <Headline>` title format on `code` and `tech` posts. Recipe posts get a pass.

### Eval Type 2: Quality (LLM-as-Judge)

Does the description actually make someone want to click?

This is subjective, which means it needs a model. The skill includes a scoring rubric with three dimensions per field:

**Description:** Clarity + Keyword Density + Click Appeal (each 1–5)  
**Title:** Format Compliance + Hook Strength + Audience Clarity (each 1–5)

Output is a table — every post gets a score, bottom 3 get specific rewrite suggestions:

```
| Post                    | Desc  | Title | Top Fix                        |
|-------------------------|-------|-------|--------------------------------|
| hello-world             | 1.7   | 1.0   | Rewrite title + desc from scratch |
| go-fx-firestore-app     | 3.2   | 2.8   | Add primary keyword to desc    |
| memd-portable-human-context | 4.3 | 4.7 | ✅ Passing                    |
```

The passing threshold: **description ≥ 3.5**, **title ≥ 4.0**. Posts with both below 3.0 are "SEO debt" — fix before promoting on social.

---

## The Skill Structure

```
skills/blog-seo/
├── SKILL.md                         ← workflows, triggers, commit convention
├── references/
│   ├── magerblog-schema.md          ← full frontmatter spec + examples
│   └── quality-rubric.md            ← LLM-as-judge scoring rubric
└── scripts/
    └── audit.sh                     ← spec compliance scanner
```

Classic progressive disclosure: SKILL.md stays lean, references only load when needed. The audit script runs without ever touching the context window.

---

## Install It

The skill is live in the [Loooom catalog](https://loooom.xyz):

```bash
/plugin marketplace add mager/loooom
```

Then in any Claude Code session on your Astro blog:

> "Run an SEO audit on my posts"

It picks up the skill, runs the spec audit, and offers to batch-fix whatever it finds. Follow up with "run quality evals on the last 10 posts" and it scores them with the rubric.

---

## The Meta Move

There's something I genuinely enjoy about this: using an AI skill to audit AI-generated content. Half my posts are written with Claude Code assistance. The SEO quality of those posts is now evaluated by a skill that runs inside Claude Code.

The loop closes. The machine maintains itself.

That's the point of skills — not just to automate tasks, but to encode standards. The rubric in `quality-rubric.md` is my actual opinion on what makes a good description. Every time the skill runs, that opinion becomes policy.

Build the tool. Ship the standard.
