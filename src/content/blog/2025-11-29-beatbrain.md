---
title: "beatbrain: A Social Music Discovery App"
pubDate: "2025-11-29"
description: "A weekend project for discovering new music, sharing favorites, and seeing what your friends are listening to."
category: "code"
tags: ["Go", "Music", "Side Projects"]
keyword: "beatbrain"
heroImage: "https://lh3.googleusercontent.com/pw/AP1GczMhwXmrQNmmwG95sOSC8arAaiOnt2Jpk5VH41jODORoq-5avO7I7J3RC67DIE9vYRCkToBHG4Q1bBw0vkq-c1tr3no29yo9iv0ARKHZEBjwHW8wgWPxFBlbOL2ORv3dwc81TjUbQXrtpt4ZsC_uk-0f4A=w2320-h1520-s-no-gm"
---

[beatbrain](https://beatbrain.xyz) is a social music discovery app I've been building. It's a place where you can check out hot and new releases, share your favorite songs, and see what your friends are listening to. Think of it as a social layer on top of music discovery.

The home page shows popular songs scraped from a few different music sites. I built a backend service called **melodex** using Go Fx that scrapes these sites and builds an index in Firestore. The service runs continuously, keeping the home page fresh with what's trending.

![Home](https://lh3.googleusercontent.com/pw/AP1GczMhwXmrQNmmwG95sOSC8arAaiOnt2Jpk5VH41jODORoq-5avO7I7J3RC67DIE9vYRCkToBHG4Q1bBw0vkq-c1tr3no29yo9iv0ARKHZEBjwHW8wgWPxFBlbOL2ORv3dwc81TjUbQXrtpt4ZsC_uk-0f4A=w2320-h1520-s-no-gm)

For release information—things like production credits, recording details, and instrumentation—I pull data from MusicBrainz. To make this easier, I built a minimal Go library called [musicbrainz-go](https://github.com/mager/musicbrainz-go) to interact with the MusicBrainz API. It's fascinating to see who produced a track or what instruments were used, and I wanted to surface that information in a way that's easy to explore.

![Release](https://lh3.googleusercontent.com/pw/AP1GczOl55faybp1WBChNCd1GTN3oAfrUHVTjs7m4rAya0_dO4UFusRJa0ODlp1gOPMxWGX1Oh2ppItawRqcDFxBBr0wZdkxJIdUJM9leMKvSe5uMb5HrYnbCe0Q2_Dig2YeJobUh3waxXvkNEYvZv3NEBVIXQ=w2320-h1520-s-no-gm)

The feed page is where the social aspect comes in. Users can share their favorite songs with comments, and you can see what your friends are listening to. I'm storing all of this in Firestore, and there's a profile page in the works. The feed will get better over time as I refine the experience.

![Feed](https://lh3.googleusercontent.com/pw/AP1GczMQHK2yQD-uZ8JM9dfxB_xW27qXqU6ilW6TwApZTgsnCy98JtCHY1PREXv_y7URPl4407XChao1XQFjtGw5Ney23GHFQQc6piyED1ZtccbWVN_9UL3ifu3xKu_j0vo3R6_cKeuagv8Rbb_DFakN-Gcbzg=w2320-h1520-s-no-gm)

I use Spotify's API for search functionality, though it's currently disabled while I work on other features. There's another Go Fx backend service called **occipital** that handles all the backend requests, keeping things modular and organized.

The frontend is hosted on Vercel, which makes deployment seamless. I've used AI a bit to help build this—before Cursor and Claude were widely available, I was copying and pasting code into Google AI Studio, which somehow gave me great access to pro models. It's been helpful for working through some of the trickier parts.

I'm building a new site now, so beatbrain might not get updated for a while, but it's still a project that's near and dear to my heart. There's something special about building a tool that helps people discover music and share what they love.

You can check it out at [beatbrain.xyz](https://beatbrain.xyz), and I'm on X at [@beatbrainxyz](https://x.com/beatbrainxyz) if you want to follow along.

All the code is open source:

- **[beatbrain-web](https://github.com/mager/beatbrain-web)** - The frontend web app
- **[melodex](https://github.com/mager/melodex)** - The Go Fx service that scrapes music sites and builds the index
- **[occipital](https://github.com/mager/occipital)** - The Go Fx backend service that handles API requests
- **[musicbrainz-go](https://github.com/mager/musicbrainz-go)** - A minimal Go library for the MusicBrainz API

