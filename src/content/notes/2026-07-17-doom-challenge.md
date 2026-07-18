---
title: "mager-bench: the doom challenge"
pubDate: "2026-07-17"
link: "https://bench.mager.co"
linkText: "bench.mager.co"
tags: ["AI", "benchmarks", "evals", "LLM", "WebGL", "JavaScript", "Doom"]
category: tech
---

Simon Willison's pelican benchmark is one prompt — "Generate an SVG of a pelican riding a bicycle" — and the quality gap between models is immediately obvious when you look at the output. I wanted mager-bench to have its equivalent: one iconic, hard prompt where runnable output makes the difference self-evident.

The new **doom** challenge asks a model to build a Doom-style first-person raycasting FPS engine in a single HTML file, no external libraries. Open the file, play it.

The raycaster is not a Doom-themed prompt — it is literally Doom's engine. DDA raycasting, fish-eye correction, perspective-correct texture mapping, distance shading, a 16×16 map with rooms and dead ends, WASD + Pointer Lock mouse-look, AABB collision detection, a door that opens on E, an exit with a LEVEL COMPLETE timer, Z-buffer, minimap, FPS counter. All procedural — no images, no canvas assets loaded at runtime.

I grew up playing Doom. The technical core — casting rays through a 2D grid to fake a 3D world on underpowered hardware — is one of the most elegant ideas in the history of games. Models that actually understand the math produce something you can walk through. Models that fake it produce a gray box or a broken canvas.

The gap is instant and obvious. That's the benchmark.

All challenges are on [GitHub](https://github.com/mager/mager-bench).
