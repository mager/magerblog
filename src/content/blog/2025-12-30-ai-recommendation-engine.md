---
layout: "../../layouts/BlogPost.astro"
title: "Building a Two-Stage AI Sports Betting Recommendation Pipeline"
pubDate: "2025-12-25"
updatedDate: "2025-12-25"
description: "Learn how to use vector embeddings for retrieval and small LLMs like Gemma 3 for explanation to build features that actually understand your users."
category: "code"
draft: true
tags: ["AI", "Machine Learning"]
heroImage: "https://lh3.googleusercontent.com/pw/AP1GczONhe6BLpc1c_lnf_uvuRsf9M0SrOyLHLBoD_LOS_zz4nM9u6vB2tp38hk6-uw9zSwrmYbKtJlzS7pUlZvnfP-l2mOHop6rQBZcDDxhoN-Ztk-1iJqd2IkTGJcw_cHCEPAZZ-g7KWAiBLCoEEsQAyGc9A=w2320-h1520-s-no-gm"
---

I finally sat down and watched [Andrej Karpathy's deep dive into LLMs](https://www.youtube.com/watch?v=7xTGNNLPyMI). 

Karpathy highlights that while pre-training is where the model "learns" the internet [01:04], inference is the act of the model taking a test in real-time [26:13]. For my project, that meant moving the intelligence from my database queries into the model's forward pass.

Enter [prxps.xyz](https://prxps.xyz):

![](https://lh3.googleusercontent.com/pw/AP1GczPnBjneck6t_OVHK6UHZ94VS69Lwm3EQ077HJkOd_VnnJpcyTEjcW2b6jsIZ4asFHzcd-foQseDqSB4eqZFzW_LfyQF-4cJzv72EmNGHw9XRwe0Hmu9i1-Dyz43cilOjwUGNBIrTkKImlpYXWW3mVt2_Q=w1652-h1520-s-no-gm)

This is my side project for "social betting" where you can make picks and track ROI without real money. I wanted to test a theory: Can I use inference to build a recommendation engine that understands not just what you bet on, but how you bet?

The Flow:

```
User Profile → Embedding → User Vector
All Games → Embeddings → Game Vectors
User Vector • Game Vectors → Cosine Similarity → Top N
Top 3 → Gemma 3 → Natural Language Reasons
```

## Vibe Coding Workflow

I didn't sit down and write a math-heavy recommendation algorithm, instead I vibe engineered it with Claude Opus 4.5. I realized, the "magic" isn't in the model (which just does math); it's in the information density of the strings you feed it. 

Initially, my code was doing keyword matching. It saw a user liked the "Lakers" and a game featured the "Lakers," so it matched them. That’s boring. I wanted the AI to understand behavioral similarity.

![Boring recommendation](https://lh3.googleusercontent.com/pw/AP1GczN339JhdKcfLHQlZLKajJZ-ZY3rjUjmb8WScm0-ucRx8Ho372BfcYMgMFW_JQXRo8ZZfUiDTU7WnHfngRIM3FbCDTe6Fhn3XGUBvZqKUv-ihZTXfchovG-BbS0-DiBAa-p8WXzUL2QIfgv8ExogafIAaw=w2320-h1520-s-no-gm)

**The Prompt:** I described the UX I wanted: "I have a user who likes Lakers favorites and NFL underdogs. Show me a game starting in 2 hours that fits that energy."

**The Code:** Claude built out a sophisticated embedding-based pipeline.

**The Reverse Engineer:** This is the important part. Once it worked, I spent a few minutes pulling the code apart to understand why it worked. I asked Claude, *"Wait, why are we using cosine similarity here instead of just a keyword search?"* and *"How exactly are these vectors representing a 'close game'?"*

By the time I was done, I hadn't just "shipped a feature", I had built a mental model for how modern AI applications actually work.

## Core Concepts: Embeddings & Inference

Before looking at the code, you have to understand two things:

### Embeddings: The "Language" of AI

Computers don't understand the concept of an underdog victory. They understand numbers. An embedding is a numerical representation of data in a high-dimensional space (ours uses 384 or 768 dimensions). In this space, similar concepts are geometrically close. "Lakers" and "LeBron" are close; "Lakers" and "Toaster" are far.

### Inference: The "Action" Phase

If Training is the process of an AI "going to school" to learn patterns, Inference is the AI "taking the test." When I send a user's betting history to an embedding model, I'm running inference to get a vector that represents their "betting soul."

## From String Matching to Semantic Density

This was the breakthrough. We moved from simple team names to Feature-Rich Latent Space. We stopped feeding the AI raw data and started feeding it contextual narratives.

### The User Profile (The "Input")

Instead of just saying "User likes NBA," we now generate a dense behavioral profile:

```
RISK PROFILE: Underdog hunter, seeks value in plus-money picks.

MOMENTUM: Hot streak (4-1 last 5 picks).

STYLE: Value seeker, looks for efficient odds.

FAVORITES: Lakers (10x, profitable).
```

### The Game Context (The "Candidate")

We do the same for upcoming games, injecting "labels" that the AI can hook into:

```
NBA: Cavaliers at Knicks.

VALUE: Close matchup, slight edge to one side.

CONSENSUS: Majority of bookmakers agree on favorite.

CONTEXT: Division rivalry.

PROFILE: Suits value seekers and balanced bettors.
```

By adding "Suits value seekers" to the game text and "Value seeker" to the user text, we are essentially building a bridge for the math to cross.

## The Architecture: The Four Stages of Inference

### A. Feature Engineering

We aggregate structured Firebase data (win rates, average odds, team frequency) and "flatten" it into the descriptive narratives shown above.

### B. The Provider Pattern

We built a clean abstraction to swap between models. We use BAAI/bge-small-en-v1.5 on HuggingFace for speed (384 dimensions) and Google's text-embedding-004 on Vertex AI for high-accuracy "heavy lifting."

### C. Smart Caching & Momentum

Inference has latency. We cache game embeddings for 6 hours. However, we shortened the User Embedding cache significantly because of momentum. If you go on a 4-game winning streak, your profile changes, and the AI needs to suggest different games to keep that streak alive.

### D. Cosine Similarity

This is the "Search" part. We take the User Vector and compare it against 50 Game Vectors.

```typescript
// The math that determines the "Semantic Alignment"
const score = provider.cosineSimilarity(userVector, gameVector);
```

## Why This is Better Than Rules

A rule-based system is a prison of if/else statements.

**Rule:** "If user likes Lakers, show Lakers."

**Problem:** Lakers aren't playing.

A semantic system is "fuzzy." If a user likes Lakers favorites, the AI understands they like high-stakes, star-heavy, West Coast basketball. It can then recommend a Warriors or Suns game because those games live in the same "neighborhood" of the embedding space.

## What I Learned: Context Design is Engineering

Building this with Claude taught me that the future of development isn't about writing the algorithm—it's about curating the context.

I didn't have to learn how to train a neural network. I had to learn how to describe my data so that a pre-trained model could understand it. If you're building a feature that requires "fuzzy" logic, don't write 100 if statements. Try converting your data to text, running inference to get an embedding, and letting the geometry do the work.

The takeaway for devs: You don't need to be a data scientist to use AI. You just need to be a good storyteller for your data.

## The Pivot: Adding the "Brain" with Gemma 3

Even with great embeddings, the "Explainability" layer felt a bit mechanical. 

### Stage E: The Old Way (Mechanical Explainability)

Initially, we explained matches using hardcoded strings tied to similarity scores:

* Score 0.85+: **Strong match:** This game is very similar to what you usually like.
* Score 0.70–0.85: **Good fit:** The game shares several things with your usual picks.
* Score 0.55–0.70: **Moderate match:** There are some similarities, but it's a bit different from your normal choices.
* Score <0.55: **Discovery pick:** This is outside your usual picks—try it to discover something new.

It worked, but it didn't have soul. I wanted the site to feel like a sharp sports analyst was sitting next to you. That inspired a pivot to a Two-Stage Architecture—one where the "brain" added real flavor.

### Stage 1: The Ruler (Embeddings)

I kept the BGE/Vertex embeddings for the heavy lifting. They scan 100+ games and instantly find the top 5 matches using cosine similarity. This is lightning-fast and almost free.

### Stage 2: The Brain (Gemma 3)

Here's where Gemma 3 comes in—and why it's uniquely powerful for this task. In a typical software stack, we choose between "fast and dumb" (Redis, simple scripts) or "slow and heavy" (deep SQL queries, heavy processing). In AI, we have a similar choice.

Initially, I used a basic template to explain why a game was recommended. It was essentially a printf statement with some variables. It felt mechanical. To make the recommendations feel human, I needed a model that could reason across three distinct data points:

1. **The User's specific betting history.** (Your track record, win streaks, favorite teams)
2. **The statistical match.** (The embedding similarity score)
3. **Real-world sports context.** (Rivalries, importance of the game, stadium atmosphere)

I chose Gemma 3 (27B) as the "Brain" of the operation for three reasons:

**World Knowledge:** Unlike a basic embedding model, Gemma "knows" what a divisional rivalry is. It understands that a game between the Knicks and the Celtics carries more weight than a random mid-season matchup. It fills in the gaps that my database doesn't have.

**The "Goldilocks" Scale:** At 27 billion parameters, it hits a sweet spot. It's small enough to run with low latency (so the user isn't staring at a loading spinner), but large enough to avoid the "hallucinations" or repetitive language often found in tiny 1B-3B models.

**Contextual Fluidity:** It takes the cold math of a "0.85 similarity score" and translates it into a narrative. It doesn't just say "You like this game." It says, "You usually hunt for value on underdogs, and this Knicks game is currently mispriced by the market."

Once I have the top 5 "winning" games, I send them to [google/gemma-3-27b-it](https://huggingface.co/google/gemma-3-27b-it).

Unlike embedding models, which only know about distances, Gemma understands context. I don't just send the odds; I send the "game energy." Because Gemma was trained on the open internet, it already knows that a Knicks game at Madison Square Garden has a different energy than a Tuesday afternoon game in an empty arena.

#### The "Analyst" Prompt

I told Gemma: "You are a sharp sports betting consultant. Look at this ‘Underdog Hunter’ user and this Knicks/Celtics rivalry game. Explain why they should care."

Now, instead of a generic "Matches your style," the user experiences:

> "The Garden will be rocking for this Knicks rivalry. Since you love hunting high-value underdogs, this is the perfect spot to fade the public and grab the points in a gritty divisional matchup."

#### The Implementation: Prompting for Personality

To turn the math into a narrative, I used Gemma 3’s specific chat template. By injecting the "Match Strength" directly into the prompt, I’m giving the LLM a hint of how confident it should be in its recommendation.

```typescript
const SYSTEM_PROMPT = "You are a sharp sports betting consultant... Keep responses to 2 sentences max.";

// How we bridge the gap between Vector Math and Natural Language
function buildPrompt(userProfile: string, gameText: string, score: number): string {
  const matchStrength = score >= 0.85 ? 'excellent' : score >= 0.70 ? 'strong' : 'good';

  return `<start_of_turn>user
  ${SYSTEM_PROMPT}

  USER BETTING PROFILE:
  ${userProfile}

  GAME DETAILS:
  ${gameText}

  MATCH STRENGTH: ${matchStrength} (${(score * 100).toFixed(0)}% similarity)

  Write a punchy 2-sentence recommendation explaining why this game is perfect for this user's betting style.
  <end_of_turn>
  <start_of_turn>model
  `;
}
```

This structure is key. We aren't just asking the AI to "write something." We are providing:

- Identity: A sharp sports consultant (System Prompt).
- User Data: Their "Underdog Hunter" DNA.
- The Objective: Why these two things belong together.

By the time the model sees the <start_of_turn>model token, it has all the context it needs to generate a response like:

> "As an underdog hunter, you'll love the +130 value on the Knicks in this primetime slot. The match strength is strong because your history shows you thrive on these tight, high-profile Eastern Conference matchups."

### Why This Matters: Re-Ranking & Augmentation

This is essentially a RAG pipeline (Retrieval-Augmented Generation) where the retrieved documents are upcoming sports matches and the augmentation is the user's betting history. This is the professional way to build AI apps. Don’t use the expensive, slow reasoning model to look at every game. Use the Ruler (Embeddings) to narrow the field, then let the Brain (Gemma) perfect the presentation.

**The New Pipeline:**

- **Retrieve:** Use math (vectors) to find the best 5 games.
- **Augment:** Give those 5 games to the LLM.
- **Generate:** Let the LLM write a personalized "Hype Note" using its internal sports knowledge.

### Final Thought: The "Smart" Site Feel

By adding Gemma, the site stopped feeling like a bland database and started to feel like a service with a voice and an opinion.

The magic is in what the AI brings from outside your database—like historical rivalries, stadium hype, and cultural context. That’s the power of using nimble, pre-trained "World Models" in production code.

