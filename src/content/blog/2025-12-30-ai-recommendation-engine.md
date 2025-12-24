---
layout: "../../layouts/BlogPost.astro"
title: "Vibing with Claude: Building an AI Sports Betting Recommendation Engine"
pubDate: "2025-12-24"
description: "How I vibed with Claude to build a semantic recommendation system using text embeddings, cosine similarity, and an iterative 'code-first' learning approach."
category: "code"
draft: true
tags: ["AI", "Machine Learning"]
heroImage: "https://lh3.googleusercontent.com/pw/AP1GczONhe6BLpc1c_lnf_uvuRsf9M0SrOyLHLBoD_LOS_zz4nM9u6vB2tp38hk6-uw9zSwrmYbKtJlzS7pUlZvnfP-l2mOHop6rQBZcDDxhoN-Ztk-1iJqd2IkTGJcw_cHCEPAZZ-g7KWAiBLCoEEsQAyGc9A=w2320-h1520-s-no-gm"
---

I've been deep-diving into recommendation systems, so I built a platform called [prxps.xyz](https://prxps.xyz) (currently in private beta) to experiment with these concepts. It's a no-money social betting site where people can flex their best picks, track their stats, and compete on leaderboards.

![](https://lh3.googleusercontent.com/pw/AP1GczPnBjneck6t_OVHK6UHZ94VS69Lwm3EQ077HJkOd_VnnJpcyTEjcW2b6jsIZ4asFHzcd-foQseDqSB4eqZFzW_LfyQF-4cJzv72EmNGHw9XRwe0Hmu9i1-Dyz43cilOjwUGNBIrTkKImlpYXWW3mVt2_Q=w1652-h1520-s-no-gm)

The most interesting technical challenge? Building the engine that suggests upcoming games to users based on their betting history.

## The "Vibe Coding" Philosophy

This project represents a shift in my learning style. Before AI assistants, I would study the theory of a skill first, then attempt to code it. 

Now, I "vibe code" with Claude. I describe the outcome, we build the implementation together, and then I **reverse engineer** the code to understand the underlying principles. I often find myself asking Claude, *"Wait, why did we do it that way?"* or reading through the lines we wrote to grasp the logic. It's an exploratory, hands-on approach that has accelerated my learning curve massively.

## The Problem: Beyond Simple Filters

When a user opens the app, I want to show them personalized game recommendations.

![](https://lh3.googleusercontent.com/pw/AP1GczONhe6BLpc1c_lnf_uvuRsf9M0SrOyLHLBoD_LOS_zz4nM9u6vB2tp38hk6-uw9zSwrmYbKtJlzS7pUlZvnfP-l2mOHop6rQBZcDDxhoN-Ztk-1iJqd2IkTGJcw_cHCEPAZZ-g7KWAiBLCoEEsQAyGc9A=w2320-h1520-s-no-gm)

The naive approach is to filter by rigid rules:
*   *User likes the Lakers?* Show Lakers games.
*   *User likes Underdogs?* Show positive odds.

But this is brittle. What if the Lakers aren't playing today? What if the user loves *underdogs* specifically in *high-scoring NBA games*? I needed a system that understands the **semantic context** of a user's preferences, not just their raw stats.

## The Solution: Text Embeddings

I decided to use **text embeddings**. By converting both user betting histories and upcoming game descriptions into vectors, we can use **Cosine Similarity** to find matches. 

This allows for "fuzzy" matching. If a user bets heavily on the Warriors and the Lakers, the system understands they like "Western Conference NBA teams" or "Star-heavy lineups" and can recommend a Suns game, even if they've never bet on Phoenix before.

## The Architecture

The system pipeline consists of five distinct stages:

### 1. Text Generation (The "Prompt Engineering")

Embeddings are only as good as the text you feed them. We needed to convert structured database rows into descriptive natural language.

**The User Profile Text:**
We aggregate the user's pick history into a narrative string.

```typescript
// Actual input text generated from user stats
Favorite teams: Lakers (15 picks, 60% win rate)
Warriors (12 picks, 58% win rate)
Sport preferences: NBA (30 picks, prefers favorites)
Overall: 50 picks, 62% win rate
Current winning streak: 3 games
```

![](https://lh3.googleusercontent.com/pw/AP1GczPzycQeIP1XSzic9TnQ_TtFlonjqsPxq36s4X19SoeoILR7mjp_0WfzP2BAkPFM4hdJM1GokhoN651C-JwE3ZUveAckR79_8pAZryVhcOP-ab3yXqr5GCxSNZZsYvgCfS0CHix7xos5RR0jY8uFKZrz7w=w2320-h1520-s-no-gm)

**The Game Text:**
We convert upcoming event data into a similar format.

```typescript
// Actual input text generated for a game
NBA game. Warriors (underdog) at Lakers (favorite)
Close matchup. Game starts in 2h 30m
```

Note: We explicitly inject concepts like "close matchup" (calculated based on odds spread) so the model can capture the "excitement" factor of a game.

### 2. The Provider Abstraction

This was a major "vibe coding" win. Initially, I hardcoded a fetch to HuggingFace. When I wanted to add Google Vertex AI (since I'm already in the GCP ecosystem), Claude suggested a clean Provider Pattern.

Instead of if/else spaghetti, we built an interface:

```typescript
interface EmbeddingProvider {
  getEmbeddings(texts: string[]): Promise<number[][]>;
  cosineSimilarity(a: number[], b: number[]): number;
  getModelName(): string;
}

class HuggingFaceProvider implements EmbeddingProvider { ... }
class VertexAIProvider implements EmbeddingProvider { ... }
```

Now, switching between BAAI/bge-small-en-v1.5 (HuggingFace) and text-embedding-004 (Vertex) is just an environment variable change.

### 3. Smart Caching Strategy

Generating embeddings isn't free (in terms of latency or money). We implemented a 3-layer cache:

*   **User Embeddings (30 Days)**: Invalidated only if prefsUpdatedAt timestamp changes.
*   **Game Embeddings (6 Hours)**: Cached by Event ID.
*   **Response Cache (6 Hours)**: The final ranked list of recommendations.

We also use **Batch Processing**. If there are 50 games and 45 are cached, we bundle the 5 missing games + the user profile into a single API call to the embedding provider.

### 4. Similarity & Ranking

We calculate the Cosine Similarity (0 to 1) between the User Vector and every Game Vector.

```typescript
// A simplified look at the math
cosineSimilarity(a: number[], b: number[]): number {
  const dotProduct = a.reduce((sum, val, i) => sum + val * b[i], 0);
  // ... divide by magnitude of vectors
  return dotProduct / (magnitudeA * magnitudeB);
}
```

Any score above 0.7 is usually a strong match. We sort descending and pick the top 5.

### 5. Explainability

An AI black box isn't user-friendly. We added a logic layer to generate human-readable reasons based on the match data:

*   "You've picked Lakers 15 times"
*   "Matches your preference for Underdogs (+180)"
*   "Similar to other NBA games you've bet on"

## Why It's Better Than Rules

The results have been surprisingly nuanced.

*   **Graceful Degradation**: If a user has zero history, the fallback text "Sports fan looking for exciting games" matches them with "Close matchups" automatically.
*   **Cross-Pollination**: It successfully recommends NFL games to NBA fans if the betting style (e.g., hunting deep underdogs) matches, because the semantic vector captures the "risk profile" encoded in the text.
*   **Context Awareness**: It balances timing (games starting soon), odds, and team loyalty all at once, rather than in a linear filter chain.

## What I Learned

Building this with Claude highlighted the power of iterative AI development. We started with a simple HuggingFace API call. We broke it. We refactored it into a Provider pattern. We optimized it with caching.

The recommendation system isn't perfect: I still need to A/B test it against a random baseline, but the architecture is solid.

If you're building a feature that requires "fuzzy" logic, don't write 100 if statements. Try converting your data to text, embedding it, and letting math do the heavy lifting.
