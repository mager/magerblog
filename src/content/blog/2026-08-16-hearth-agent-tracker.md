---
title: "Hearth: the agent sits beside the tracker"
description: "Hearth started as a house-hunting workspace: an Eve agent sitting next to a live shortlist. v0.1 already beats tabs and spreadsheets; real research over Zillow/Redfin and per-user persistence are next."
pubDate: 2026-08-16
category: tech
keyword: "Hearth"
draft: true
tags: [hearth, eve, agents, ai, workspace, product, tooling]
---

The AI Gateway + Eve stack post was about plumbing: routing, billing, durable sessions, and an agent reachable over HTTP.

This is about the first thing I built on that plumbing that has a product shape.

The magerbot Eve agent needed a home beyond the phone harness, and the house hunt gave it one. It's called Hearth, and the working hypothesis is simple: an agent is useful when it sits beside the thing you're actually tracking, not when it floats in its own tab.

Hearth started as a house-hunting workspace. The search area is Forest Park, IL, the budget is $500k–$800k, and the UI is one screen split into two panels.

On the left, the agent conversation. On the right, the tracker: a shortlist of homes with price, beds, baths, yard size, source, notes, and a listing URL.

The conversation is where the thinking happens. The tracker is where the facts live. Neither one tries to do both.

## Why this already beats tabs and spreadsheets

My old workflow was browser tabs, saved searches, and a spreadsheet I maintained by hand.

The spreadsheet was always out of date. The tabs were always lost. Nothing became structured until I typed it in myself.

Hearth's v0.1 tracker has a simple lifecycle:

`New → Maybe → Tour → Pass`

A home moves along the pipeline with one click. Source tabs filter by Zillow, Redfin, or Other. Search covers addresses and notes. Each listing can include the facts that matter, a link back to the original source, and a short note about why it caught my eye.

There is also a CSV export with:

`Address, Price, Beds, Baths, Backyard size`

I still like spreadsheets. Hearth just makes the spreadsheet the export instead of the center of the workflow.

The useful part is that the agent can reason about the same list I'm looking at. A chat is a terrible database. A grid is a terrible thinking tool. Hearth keeps the messy reasoning in the conversation and the clean facts in the tracker.

## Why the agent belongs here

The agent is the same magerbot Eve agent from the AI Gateway stack: `zai/glm-5.2` routed through AI Gateway, with connections to gbrain and GitHub through MCP.

In Hearth it gets its first UI where I'm not asking it about code or infrastructure. I'm asking:

- Which home is the best value?
- What should I ask at a tour?
- What tradeoffs am I making?
- Is this listing worth saving?

The agent is not the tracker. It is the part of the workspace that helps me decide what the tracker should say.

## What is not implemented yet

The honest limitation is that the current data is still local.

The starter listings are seeded in the client. New listings persist in the browser for now, but there is no production identity provider or database-backed workspace yet. Switch devices and the data does not follow you.

There is also no Zillow or Redfin ingestion yet. Right now I still paste or type listings in.

That is the next important step: give the agent the ability to research a listing, extract the facts, and add a structured entry to the tracker.

The goal is not just an agent that talks about my shortlist. It is an agent that builds the shortlist.

## The road ahead

Hearth needs two layers next.

First: research capabilities over Zillow, Redfin, and other sources. The agent should be able to read a listing, extract the relevant facts, compare homes across sources, and answer questions using live information instead of starter data.

Second: authenticated per-user workspaces and persistence. "Your workspace, your shortlist" should mean that your saved homes survive refreshes, devices, and weeks of searching.

The first version already feels meaningfully better than juggling tabs and a spreadsheet. That is enough proof to keep building.

Hearth is open source at [mager/hearth](https://github.com/mager/hearth). The workspace is live at [hearth.mager.co](https://hearth.mager.co).

The next version should know more about houses than I do.
