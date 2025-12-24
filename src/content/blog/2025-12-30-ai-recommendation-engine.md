---
layout: "../../layouts/BlogPost.astro"
title: "Vibing with Claude: Building an AI Sports Betting Recommendation Engine"
pubDate: "2025-12-24"
updatedDate: "2025-12-24"
description: "How I vibed with Claude to build a semantic recommendation system using text embeddings, cosine similarity, and an iterative 'code-first' learning approach."
category: "code"
draft: true
tags: ["AI", "Machine Learning"]
heroImage: "https://lh3.googleusercontent.com/pw/AP1GczONhe6BLpc1c_lnf_uvuRsf9M0SrOyLHLBoD_LOS_zz4nM9u6vB2tp38hk6-uw9zSwrmYbKtJlzS7pUlZvnfP-l2mOHop6rQBZcDDxhoN-Ztk-1iJqd2IkTGJcw_cHCEPAZZ-g7KWAiBLCoEEsQAyGc9A=w2320-h1520-s-no-gm"
---

I finally sat down and watched [Andrej Karpathy's deep dive into LLMs](https://www.youtube.com/watch?v=7xTGNNLPyMI). If you haven't seen it, it's basically the "red pill" for understanding how these models actually tick. While most people are busy arguing about prompts, Karpathy got me obsessed with **inference**—the actual moment a model takes a bunch of weights and turns them into a prediction.

I didn't want to just read about it; I wanted to play with it.

Enter [prxps.xyz](https://prxps.xyz):

![](https://lh3.googleusercontent.com/pw/AP1GczPnBjneck6t_OVHK6UHZ94VS69Lwm3EQ077HJkOd_VnnJpcyTEjcW2b6jsIZ4asFHzcd-foQseDqSB4eqZFzW_LfyQF-4cJzv72EmNGHw9XRwe0Hmu9i1-Dyz43cilOjwUGNBIrTkKImlpYXWW3mVt2_Q=w1652-h1520-s-no-gm)

It's a side project of mine, a no-money, "social betting" site where you can make picks, track your ROI, and just see the leaderboard to compare against other users. It was the perfect playground to test a theory: Can I use inference to build a recommendation engine that actually feels personal?


## The "Vibe Coding" Workflow

I'll be honest: I didn't sit down and write a math-heavy recommendation algorithm from scratch. I "vibe coded" it with Claude.

**The Prompt:** I described the vibe I wanted: "I have a user who likes Lakers favorites and NFL underdogs. Show me a game starting in 2 hours that fits that energy."

**The Code:** Claude spit out a sophisticated embedding-based pipeline.

**The Reverse Engineer:** This is the important part. Once it worked, I spent hours pulling the code apart to understand why it worked. I asked Claude, *"Wait, why are we using cosine similarity here instead of just a keyword search?"* and *"How exactly are these vectors representing a 'close game'?"*

By the time I was done, I hadn't just "shipped a feature", I had built a mental model for how modern AI applications actually work.

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

### Inference in Action

After watching Karpathy's video, I realized that what I'm doing here is **inference**, running a pre-trained embedding model to transform text into numerical vectors. Unlike training (where you adjust model weights), inference is a forward pass: feed text in, get embeddings out.

The embedding models I'm using (like `bge-small-en-v1.5` or `text-embedding-004`) were already trained on massive text corpora. They learned to encode semantic meaning into dense vector representations. When I call `getEmbeddings("Lakers vs Warriors")`, I'm performing inference; the model processes the input through its neural network layers and outputs a 384-dimensional (or 768-dimensional) vector that captures the semantic essence of that text.

Each dimension in that vector represents a "direction" in semantic space. One dimension might lean toward "Basketball," another toward "High Risk," another toward "West Coast teams," and so on. The model learned these directions during training by analyzing patterns across billions of text examples. This is what enables the "fuzzy logic", when I calculate cosine similarity between two vectors, I'm measuring how aligned they are across all these semantic directions simultaneously, not just checking if they match on a single rigid rule.

This is the beauty of modern ML: I don't need to train a model from scratch. I can leverage pre-trained embeddings and focus on the application layer, the text generation, caching, and similarity calculations that make the recommendation system work.

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

This was a major "vibe coding" win. Initially, I hardcoded a call to HuggingFace. When I wanted to add Google Vertex AI (since I'm already in the GCP ecosystem), Claude suggested a clean Provider Pattern.

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

With this provider abstraction, we can quickly swap between embedding models like [BAAI/bge-small-en-v1.5](https://huggingface.co/BAAI/bge-small-en-v1.5) (via HuggingFace) and [text-embedding-004](https://ai.google.dev/gemini-api/docs/embeddings) (via Google Vertex AI or Gemini API), just by changing an environment variable. See [Gemini Embeddings documentation](https://ai.google.dev/gemini-api/docs/embeddings) for details on the Google model.

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

### The Inference Mindset

Karpathy's video helped me understand that inference is everywhere in modern AI applications. Every time I call an embedding API, I'm performing inference. Every time I calculate cosine similarity between vectors, I'm using the semantic knowledge that was baked into those embeddings during training.

The key insight: **You don't need to train models to use AI effectively**. Pre-trained embedding models are inference-ready. Your job is to:
1. Convert your domain data into text
2. Run inference to get embeddings
3. Use vector math (like cosine similarity) to find patterns

If you're building a feature that requires "fuzzy" logic, don't write 100 if statements. Try converting your data to text, embedding it, and letting math do the heavy lifting.
