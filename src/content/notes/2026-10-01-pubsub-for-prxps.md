---
title: "Pub/Sub for prxps"
description: "A small event pipeline for pick settlements, with a Firestore outbox and duplicate-safe recommendation invalidation."
pubDate: "2026-10-01T20:46:19-05:00"
category: tech
tags: ["prxps", "Google Cloud", "Pub/Sub", "Firestore"]
---

Cloudflare's [K2 announcement](https://blog.cloudflare.com/cloudflare-k2-streams/) got me thinking about events in [prxps](https://www.prxps.xyz), my sports picks app. A resolved pick changes a user's rewards and betting history. Recommendations should respond to that change without waiting for a six-hour cache to expire.

I added Google Cloud Pub/Sub because prxps already uses Firestore and Cloud Run. The first consumer invalidates recommendations. Notifications and analytics can get their own subscriptions later.

The useful detail is the **outbox**: settlement writes a `pick.resolved` event in the same Firestore transaction as the reward. A scheduled Cloud Run handler publishes pending events to Pub/Sub. If publishing fails, the event stays available for retry. Each event has a stable ID, and the consumer records a receipt so duplicate deliveries don't repeat its work.

I also added a cache version per user. If a recommendation request starts before settlement and finishes afterward, its result keeps the old version and won't be reused as fresh. Settlement itself now rechecks the pick inside the transaction so overlapping runs can't award RXP twice.

Pub/Sub's [first 10 GiB of standard messaging throughput per billing account are free each month](https://cloud.google.com/pubsub/pricing). Firestore operations and compute are separate. For this first use case, handling retries correctly matters more than the messaging bill.
