---
title: "beatbrain v2: From 3-Second Loads to 200ms — A Backend Rewrite"
pubDate: "2026-03-25"
description: "How I rebuilt the beatbrain backend with parallel fetching, Firestore caching, and Claude's impeccable design skills. What used to take 2-3 months now takes an afternoon."
category: "code"
tags: ["Go", "Music", "AI", "Performance", "Side Projects"]
keyword: "beatbrain v2 backend rewrite"
heroImage: ""
draft: false
---

I built the first version of [beatbrain](https://beatbrain.xyz) the hard way. Three months of stitching together Go code, copying and pasting into Google AI Studio, uploading entire zip files to get help with debugging. The backend worked, but it was slow — track pages took 2-3 seconds to load as I made sequential API calls to Spotify and MusicBrainz.

This week I rewrote the backend from scratch. Track pages now load in 100-200ms. That's not a typo. Here's how it happened.

## The Old Way: Sequential and Painful

The v1 backend was straightforward but naive:

1. Call Spotify API for track info
2. Wait for response
3. Call Spotify API for audio features
4. Wait for response
5. Call Spotify API for audio analysis
6. Wait for response
7. Call MusicBrainz API for credits and genres
8. Wait for response
9. Call MusicBrainz API for work info
10. Wait for response
11. Assemble and return

Each API call was 200-500ms. Stack them sequentially and you're looking at 2-3 seconds before the user sees anything. And if MusicBrainz was having a slow day? Forget about it.

The code was also brittle — I remember spending entire weekends debugging why a particular track wouldn't load, tracing through chains of API calls that would fail silently halfway through.

## The New Way: Parallel, Cached, and Fast

The v2 backend is a completely different beast. Same APIs, radically different approach:

**Parallel fetching.** All three Spotify calls (track info, audio features, audio analysis) fire simultaneously. The MusicBrainz calls start as soon as the ISRC comes back from Spotify. What used to be a waterfall is now a fan-out that completes in the time of the slowest single call.

**Intelligent caching.** Every track gets cached in Firestore for 7 days. The cache key is the Spotify ID, so repeated visits are served instantly without hitting any external APIs. Cache hits are sub-50ms.

**Graceful degradation.** If MusicBrainz is down, you still get the Spotify data. If audio analysis isn't available, you get everything else. No more broken pages.

The result: 100-200ms for cache misses, sub-50ms for cache hits. A 10-20x speedup.

## The Architecture

I kept the Go + Uber FX stack — it's solid for dependency injection and modular handlers. But I rewrote the track handler from the ground up:

```go
// v2: Parallel fetch with goroutines and channels
func (h *GetTrackV2Handler) fetchParallel(ctx context.Context, spotifyId string) occipital.Track {
    // isrcCh carries ISRC from GetTrack to MB goroutine
    isrcCh := make(chan string, 1)
    
    var wg sync.WaitGroup
    
    // Spotify calls — all concurrent
    wg.Add(1)
    go fetchTrack(ctx, spotifyId, isrcCh)
    
    wg.Add(1)
    go fetchAudioFeatures(ctx, spotifyId)
    
    wg.Add(1)
    go fetchAudioAnalysis(ctx, spotifyId)
    
    // MB calls — starts when ISRC arrives
    wg.Add(1)
    go fetchMusicBrainzData(isrcCh)
    
    wg.Wait()
    // Assemble track from concurrent results
}
```

The key insight: the ISRC is the bridge between Spotify and MusicBrainz. As soon as we have it, the MB goroutine starts. Everything else runs in parallel. No blocking until the final assembly.

## Building Faster with AI

Here's what surprised me most: the rewrite took one afternoon. Not weeks. One afternoon.

I used Claude Code with the impeccable design skills I've been developing. Instead of copy-pasting into Google AI Studio like I did for v1, I worked directly in the codebase with an agent that understands Go concurrency, Uber FX, and the existing patterns.

The workflow looked like this:

1. "Build a parallel track fetcher that starts MB calls as soon as ISRC is available"
2. "Add Firestore caching with a 7-day TTL"
3. "Make sure cache writes are fire-and-forget so they don't block the response"

Each request was a conversation. I'd review the code, ask for tweaks, and iterate. The agent understood context — it knew the existing Spotify client, the MusicBrainz types, the response format the frontend expected. No need to explain the codebase from scratch each time.

## The Design Refresh

While the backend was getting faster, the frontend got a redesign. I used the same impeccable skills approach — instead of spending days tweaking CSS, I described what I wanted:

- "Dark terminal aesthetic like a music production DAW"
- "Audio DNA section showing the track's characteristics"
- "Loudness map visualizing the dynamic range"
- "Credits that look like liner notes"

The result is a site that feels intentional. Every section has purpose. The typography is tight, the spacing is consistent, and the color palette (deep blacks, phosphor greens, warm accents) matches the music-tech vibe.

## Podcast Discovery

The redesign included a new feature: podcast discovery. beatbrain now indexes shows from 100+ categories — everything from Linguistics and Philosophy to Cybersecurity and DJing to Firefighting.

The podcast scraper runs on the same backend, feeding a dedicated page where you can browse by category or see what's trending. It's the same social approach as music: share your favorite shows, see what friends are listening to, discover something new.

## What I Learned

**Sequential API calls are a performance killer.** Even if each call is "fast," stacking them kills user experience. Parallel fetch with proper synchronization is worth the complexity.

**Caching is non-negotiable.** Most tracks are looked up repeatedly. Serving from Firestore instead of hitting external APIs is the difference between 200ms and 50ms — and it saves you from rate limits.

**AI-assisted development changes the timeline.** What took 2-3 months in 2024 took an afternoon in 2025. The key is having clear architectural vision and working with tools that understand your codebase.

**Design is easier with constraints.** The terminal aesthetic gave me a framework: monospace fonts, limited color palette, clear hierarchy. Instead of endless tweaking, I made decisions and moved on.

## The Stack

- **Frontend:** Next.js 14, Tailwind, Prisma, Vercel
- **Backend:** Go + Uber FX, Cloud Run
- **Databases:** Firestore (caching + social data), Postgres (user data)
- **APIs:** Spotify, MusicBrainz, Cover Art Archive
- **AI:** Claude Code with impeccable design skills

All open source:

- [beatbrain-web](https://github.com/mager/beatbrain-web) — Frontend
- [occipital](https://github.com/mager/occipital) — Backend API (v2 is live!)
- [melodex](https://github.com/mager/melodex) — Music scraper
- [musicbrainz-go](https://github.com/mager/musicbrainz-go) — MusicBrainz client

## Try It

Visit [beatbrain.xyz](https://beatbrain.xyz), click any track, and watch how fast the page loads. Check the "Audio DNA" section to see the track's characteristics. Browse the podcast discovery page. Save a track to your profile.

And if you're building something similar: parallelize your API calls, cache aggressively, and don't be afraid to let AI handle the implementation while you focus on the architecture.

Follow along at [@beatbrainxyz](https://x.com/beatbrainxyz) or [@mager](https://x.com/mager) for updates.
