---
title: "beatbrain: 3 Seconds to 200ms"
pubDate: "2026-03-25"
description: "I rebuilt the beatbrain backend in an afternoon. Parallel fetching, Firestore caching, and a podcast discovery engine that indexes 100+ categories. Here's the whole story."
category: tech
tags: ["Go", "Music", "AI", "Performance", "Side Projects"]
keyword: "beatbrain backend rewrite"
heroImage: ""
draft: false
---

I built the first version of [beatbrain](https://beatbrain.xyz)'s backend in late 2024. It took me 2-3 months. I was stitching together Go code by hand, copy-pasting entire files into Google AI Studio, and at one point I literally uploaded a zip of the whole project because I couldn't figure out a MusicBrainz parsing issue. It worked. Barely.

This week I rewrote the whole thing in an afternoon. Track pages went from 2-3 second loads to 100-200ms. Here's what happened.

## The old backend was a waterfall

The backend service is called [occipital](https://github.com/mager/occipital) — named after the part of your brain that processes visual information. It's a Go service running on Cloud Run with [Uber FX](https://uber-go.github.io/fx/) for dependency injection.

The v1 track endpoint did everything sequentially:

1. Call Spotify for track info. Wait.
2. Call Spotify for audio features. Wait.
3. Call Spotify for audio analysis. Wait.
4. Use the ISRC to search MusicBrainz. Wait.
5. Fetch the full recording with credits. Wait.
6. Look up the associated work for songwriting credits. Wait.
7. Assemble everything. Return.

Each call is 200-500ms. Stack six of them and you're at 2-3 seconds. If MusicBrainz was having a bad day, it could be worse.

I remember staring at the Chrome devtools waterfall thinking "this is fine, I'll optimize later." Later took a year.

## The v2 endpoint fans out everything

The insight is obvious in retrospect: most of these calls don't depend on each other. The three Spotify calls can all fire at the same time. The MusicBrainz chain only needs the ISRC, which comes back from the first Spotify call.

So v2 uses goroutines and a channel:

```go
isrcCh := make(chan string, 1)

// These three fire simultaneously
go fetchTrack(ctx, spotifyId, isrcCh)    // sends ISRC when ready
go fetchAudioFeatures(ctx, spotifyId)
go fetchAudioAnalysis(ctx, spotifyId)

// This starts as soon as the ISRC arrives
go fetchMusicBrainzData(isrcCh)

wg.Wait()
```

The ISRC channel is the clever bit. The Spotify `GetTrack` goroutine sends the ISRC as soon as it has it, and the MusicBrainz goroutine is already waiting on the other end. No polling. No sleeps. Just a buffered channel connecting two concurrent pipelines.

Total wall-clock time: however long the slowest single call takes. Usually 300-500ms for a cache miss.

## Firestore caching makes it instant

But 300ms felt like a lot for tracks people look up repeatedly. So I added a Firestore cache with a 7-day TTL.

First request: fan out all the API calls, assemble the track, fire-and-forget the cache write (so it doesn't block the response), return in ~300ms.

Second request: read from Firestore, deserialize, return. Sub-50ms.

The cache write is its own goroutine — `go h.saveToCache(context.Background(), ...)` — so the user never waits for it. If it fails, no big deal, we'll just fetch fresh next time.

## Podcasts from 100+ categories

While I was in the backend, I built out podcast discovery. The scraper (called [melodex](https://github.com/mager/melodex)) already indexed music from Spotify New Releases, Reddit's [FRESH] tag, Billboard, and HotNewHipHop. I added a podcast pipeline that hits Spotify's catalog across 100+ categories.

And I mean *weird* categories. Linguistics. Cybersecurity. DJing. Philosophy. Firefighting. Spotify has a category for firefighting podcasts and I indexed all of them.

The shows land in Firestore, and the frontend has a new `/podcasts` page where you can browse by category. Same social layer as music — share your favorites, see what friends are listening to.

## Building with Claude

Here's the part that still trips me out. The v1 backend took me months. I was a solo dev with Google AI Studio and Stack Overflow. The v2 rewrite took an afternoon.

I used Claude with the [impeccable](https://github.com/pbasaus/impeccable) design skills — the same ones that are trending right now on the skills marketplace. For the backend, I described the architecture I wanted ("parallel fetcher, ISRC channel, Firestore cache with fire-and-forget writes") and iterated on the implementation. For the frontend redesign, I worked through the terminal aesthetic — dark mode, monospace type, the audio DNA visualization, loudness maps.

The difference isn't just speed. It's that I can hold the whole architecture in my head and let the agent handle the implementation details. I know what a buffered channel does. I know why the cache write should be fire-and-forget. But writing the boilerplate for Firestore serialization and goroutine synchronization? That's where an afternoon becomes a month.

## The about page

I also added an about page to beatbrain. The origin story is simple: I loved [Last.fm](https://last.fm). That site understood that music is social — the scrobbling, the charts, seeing what your friends actually listen to. Last.fm is still around but it doesn't hit the same anymore. beatbrain is my take on that idea.

The site is heavily Spotify-integrated and I'm fine with it. I worked at Spotify from 2011-2014 as their first Developer Advocate. I believe in their catalog and their APIs. But beatbrain adds what Spotify doesn't show you: who played bass, who produced it, what key it's in. That data comes from [MusicBrainz](https://musicbrainz.org), the open music encyclopedia.

Check it out at [beatbrain.xyz/about](https://beatbrain.xyz/about).

## The stack

All open source:

- [beatbrain-web](https://github.com/mager/beatbrain-web) — Next.js 14, Tailwind, Vercel
- [occipital](https://github.com/mager/occipital) — Go + Uber FX, Cloud Run
- [melodex](https://github.com/mager/melodex) — Go scraper for music + podcasts
- [musicbrainz-go](https://github.com/mager/musicbrainz-go) — MusicBrainz client library

Click any track on [beatbrain.xyz](https://beatbrain.xyz) and count the milliseconds. That used to be seconds. ✌️
