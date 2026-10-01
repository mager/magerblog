---
title: "Building a Rust backend for the prxps RXP calculator"
description: "Returning to Rust after one Advent of Code puzzle, then building a small reward API and connecting it to prxps through SvelteKit."
pubDate: 2026-09-30
category: tech
keyword: "learning Rust"
tags: [rust, prxps, cloud-run, sveltekit, learning]
draft: false
---

My hands-on Rust experience was essentially [one Advent of Code puzzle in 2022](/blog/2022-12-01-aoc/#day-2-rust). I used it for Day 2, wrote about the syntax, and moved on to another language. This week I came back to it with a smaller ambition than learning the whole language: build a backend component for an app I already understand, and get it running in the cloud.

The app is [prxps](https://prxps.xyz), my sports picks project. Picks are free. Winning earns RXP, an in-game reputation currency with no monetary value. The web app uses SvelteKit and TypeScript, with Firebase for authentication and Firestore for storage.

Working with Codex, I started with a local reward calculator, turned it into an HTTP service, deployed it to Cloud Run, and connected it to the reward previews on the game detail page. The running app now has a small Rust component behind its existing TypeScript backend.

## Start with a calculation I can check

The reward formula was a useful first exercise because I already knew what its outputs should look like. Positive American odds divide by 100: a winning pick at +400 earns 4 base RXP. Negative odds use 100 divided by the absolute value: -200 earns 0.5 base RXP. A daily streak can add a multiplier when the pick wins.

That gave the Rust program two inputs, odds and streak days, and a small structured result. No database, sports feed, or user account was needed to test the calculation.

The first version ran locally:

```sh
cargo run -- +400 7
```

```text
Odds: +400
Streak: 7 days (1.25x)
Base reward: 4.00 RXP
Reward if won: 5.00 RXP
```

Cargo handles building and running the program; everything after `--` goes to the calculator. The source lives under `rust/rxp-calculator/` in the existing prxps repo. Having the old and new implementations together made comparison straightforward.

The streak function is a readable piece of the Rust code:

```rust
pub fn streak_multiplier(streak_days: u32) -> f64 {
    match streak_days {
        0..=2 => 1.0,
        3..=6 => 1.1,
        7..=13 => 1.25,
        14..=29 => 1.5,
        _ => 2.0,
    }
}
```

`u32` is an unsigned 32-bit integer, so a negative streak doesn't fit the input type. `f64` is a 64-bit floating-point number. The `match` expression selects the multiplier, and the final expression supplies the return value.

The calculation returns `Result<Reward, &'static str>`: either a `Reward` struct or an error message. Zero odds produce an error. At the call site, `?` passes an error back to the caller instead of continuing with an invalid value. The [Rust book's chapter on `Result`](https://doc.rust-lang.org/book/ch09-02-recoverable-errors-with-result.html) explains this error-handling pattern in more detail.

## The rounding behavior came along too

Porting the formula exposed an existing quirk. The TypeScript helper rounds upward with:

```js
Math.ceil(value * 100) / 100
```

At +110 odds, binary floating-point arithmetic makes the intermediate value slightly larger than an exact 1.1. The current implementation returns 1.11 base RXP. The resolver rounds again after applying the streak multiplier, which produces 1.12 even at 1x. The game detail page already used that same two-stage rounding for its previews.

I wanted to learn Rust without changing the app's reward policy in the same edit, so we preserved that behavior. Fixing the arithmetic should be a separate change with coordinated updates to previews and settlement.

The comparison script runs the compiled Rust calculator against both copies of the existing TypeScript utility. It passed 624 comparisons covering representative odds, streak boundaries, rounding cases, and integer limits. That is evidence of compatibility across those cases, rather than a proof for every possible input.

## Give the calculator an HTTP interface

The next step added [Axum](https://docs.rs/axum/latest/axum/) for HTTP routing, Tokio for asynchronous execution, and Serde for JSON. The CLI and API use the same calculation library. There are two endpoints: `GET /health` and `POST /calculate-reward`.

This request:

```json
{"odds": 400, "streak_days": 7}
```

returns:

```json
{
  "odds": 400,
  "streak_days": 7,
  "base_reward": 4.0,
  "streak_multiplier": 1.25,
  "final_reward": 5.0
}
```

The input struct defines the JSON contract. Missing streak days default to zero; unknown fields and invalid types are rejected. The server also limits request bodies to 4 KiB. Those are small details, but they make the difference between a function I can run and a service another program can call predictably.

A two-stage Dockerfile compiles the Rust executable and copies it into a smaller Debian runtime image. Cloud Build builds that container, and Cloud Run runs it as `prxps-rxp-api` in `us-central1`. The container listens on Cloud Run's supplied port and handles shutdown signals.

I configured zero minimum instances, a maximum of one instance, and 256 MiB of memory. It can scale to zero when idle. That keeps the experiment small, although builds and image storage can still cost money; an instance limit is not a spending cap.

## A private service the web app can call

The deployed API requires Google authentication. Its runtime service account has no project roles, and the Rust program has no database access. For a manual test, an authorized Google account can call it with an identity token:

```sh
curl --fail-with-body -sS \
  'https://prxps-rxp-api-304376622334.us-central1.run.app/calculate-reward' \
  -H "Authorization: Bearer $(gcloud auth print-identity-token --project=prxps-dev)" \
  -H 'Content-Type: application/json' \
  -d '{"odds":400,"streak_days":7}'
```

That is a test command for an account with invocation access. Signing into an unrelated Google account doesn't grant access to my service. We verified a valid request returned 200, zero odds returned 400, and an anonymous request returned 403.

The web integration follows the same boundary:

```text
Game page in the browser
  → SvelteKit game detail endpoint on Vercel
    → Rust reward API on Cloud Run
```

SvelteKit uses the app's existing Google service account to obtain an identity token whose audience is the Cloud Run service. That account has the Cloud Run Invoker role on this service. The [service-to-service authentication documentation](https://docs.cloud.google.com/run/docs/authenticating/service-to-service) describes the token and permission checks. Credentials stay on the server; the browser receives the preview amounts.

Successful previews are cached by odds for five minutes in each web server instance. Concurrent requests for the same calculation share one request. Authentication and the Rust call together have a three-second deadline. If either fails, SvelteKit uses the existing TypeScript calculation and caches that fallback for 30 seconds.

The integration is deliberately limited to the game detail page. It requests a 1x preview, matching the page's previous behavior. Pick placement and settlement still use TypeScript, and the actual streak bonus is determined when a winning pick resolves.

For the live check, the Browns–Steelers page showed 1.24 RXP for Cleveland at +124 and 0.69 RXP for Pittsburgh at -147. Both preview fields in the production API response reported `source: "rust"`, and the page displayed those amounts. The Rust project passed 12 tests; the web integration checks passed 45 tests, including the existing reward tests.

I was surprised by how easy Codex made the deployment and integration. I asked it to put the Rust backend in the cloud, and it used my existing `gcloud` login to build the container, deploy the private service, and test an authenticated request. Once my curl request worked, I asked it to wire the service into prxps. It added the server-side call, permissions, caching, and fallback, deployed the web app, and checked a real game page. I could go from a local Rust program to a working feature in the same conversation, with code, test results, and live responses to inspect along the way.

## What I got out of this

This calculation is too small to justify a remote service as a performance improvement. A network request introduces work that a local TypeScript function avoids. I wanted a contained way to learn the path from Rust source to a running backend, using outputs I could verify against an existing app.

That gave me a practical use for structs, `match`, `Result`, Cargo, an HTTP framework, and deployment without also inventing a new product. It barely exercises the ownership problems that make Rust different, and I still have plenty to learn there.

I want to turn the Rust component into an open-source example once the repository and licensing work is ready. For now, I have a small service I can read, test, call with curl, and see working in prxps. That is enough context to make the next Rust lesson less abstract.
