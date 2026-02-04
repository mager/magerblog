---
layout: "../../layouts/BlogPost.astro"
title: "Building an AI Sports Betting Recommendation Engine with Gemma"
pubDate: "2025-12-25"
updatedDate: "2025-12-25"
description: "A practical guide to building two-stage AI recommendations: use embeddings for fast retrieval, then small LLMs like Gemma 3 for natural language explanations. The real skill? Curating context, not writing algorithms."
category: "code"
tags: ["AI", "Machine Learning"]
keyword: "AI sports recommendations"
heroImage: "https://lh3.googleusercontent.com/pw/AP1GczNRO_l1rRTXPq8oFH_QgGdPOqIDMJWyPDO2NWy8sJytTGpuQzhTcEqk5cv-1N-dFZxMCUTNFeqwXq0vzHm7PrE-EicraqoKOQ3wZMlSOWn_ScXXvDda9P6tKZGbtamsYT_JsIfSj_nmofuphTgt9AQPUA=w2320-h1520-s-no-gm"
---

I finally sat down and watched [Andrej Karpathy's deep dive into LLMs](https://www.youtube.com/watch?v=7xTGNNLPyMI).

Karpathy highlights that while pre-training is where the model "learns" the internet [01:04], inference is the act of the model taking a test in real-time [26:13]. For my project, that meant moving the intelligence from my database queries into the model's forward pass.

Inspired by this, I realized my sports recommendation engine was stuck in the pre-training mindset of static lookups, rather than the inference mindset of real-time reasoning. Enter [prxps.xyz](https://prxps.xyz):

![](https://lh3.googleusercontent.com/pw/AP1GczOJZn12YkGMgtivB2YsZMuciSJh8f8QU7rzCyEravWQdfmCGXGCqTFtmb8aArePtS78x_WF26lITEERaTqbFhZKLLR9xvUqtlkVrzYfNK6OLnwdgHmw7KZo1stMzEokuN3KLPc15tg56uARdl97zXjEIA=w2320-h1520-s-no-gm)

prxps is my side project for "social betting" where you can make picks and track ROI without real money. I wanted to explore a bigger question: could I use inference to recommend not just the kinds of games someone bets on, but the way they like to bet?

## The Problem

Initially, my recommendation system was doing keyword matching. It saw a user liked the "Warriors" and a game featured the "Warriors," so it matched them. That's boring. 

![Boring](https://lh3.googleusercontent.com/pw/AP1GczPlM3hD4qDJcFSo3YOigIVOMS37gpI92e3dimHtlZ4YZy771gZl5pvIvk2iuwh-aDKRmSB26Q_3SfTTTfHrfdqZaC3mGBbMb0CFe_uJt9NDukWcCEKgqsfmdVCid_0GxF7CDkq2-wTcHg1Rda5XUJmN3w=w2320-h1520-s-no-gm)

I wanted the AI to understand behavioral similarity—if someone likes Lakers favorites and NFL underdogs, show them games that match that energy, not just games with those teams.

The challenge: How do you encode "betting style" into a system that can match it against 100+ upcoming games in real-time?

## Vibe Coding the Solution

I didn't sit down and write a math-heavy recommendation algorithm. Instead, I vibe engineered it with [Claude Opus 4.5](https://www.anthropic.com/news/claude-opus-4-5). I described the UX I wanted: "I have a user who likes Lakers favorites and NFL underdogs. Show me a game starting in 2 hours that fits that energy." Claude built out a sophisticated embedding-based pipeline, and it worked.

Then came the important part—reverse engineering. I spent a few minutes pulling the code apart to understand why it worked. I asked Claude, *"Wait, why are we using cosine similarity here instead of just a keyword search?"* and *"How exactly are these vectors representing a 'close game'?"*

By the time I was done, I hadn't just "shipped a feature", I had built a mental model for how modern AI applications actually work.

I realized the "magic" isn't in the model (which just does math); it's in the *information density* of the strings you feed it.

## How It Works: A Two-Stage RAG Pipeline

The system works in two stages:

1. **Stage 1: The Ruler (Embeddings)** - Fast vector similarity search to find the top 5 matches
2. **Stage 2: The Brain (Gemma 3)** - Natural language generation to explain why those matches fit

This is essentially a RAG pipeline where the retrieved documents are upcoming sports matches and the augmentation is the user's betting history.

### Stage 1: From Data to Vectors

The key insight: we don't feed the AI raw data. We feed it contextual narratives that capture behavioral patterns.

#### Building the User Profile

First, we analyze the user's betting history to extract behavioral patterns:

```typescript
function analyzeUserProfile(prefs: UserPreferences, recentPicks: { wins: number; losses: number }): UserProfile {
  const bp = prefs.betting_patterns;
  const totalPicks = bp?.total_picks || 0;

  // Risk appetite based on average odds across all sports
  let totalOddsSum = 0;
  let sportCount = 0;
  
  for (const [sport, data] of Object.entries(prefs.sport_preferences || {})) {
    if (data && data.picks_count > 0) {
      totalOddsSum += data.avg_odds_selected * data.picks_count;
      sportCount += data.picks_count;
    }
  }

  const avgOdds = sportCount > 0 ? totalOddsSum / sportCount : 0;
  let riskAppetite: UserProfile['riskAppetite'];
  if (avgOdds < -200) riskAppetite = 'heavy-favorite';
  else if (avgOdds < -100) riskAppetite = 'slight-favorite';
  else if (avgOdds <= 100) riskAppetite = 'balanced';
  else if (avgOdds <= 200) riskAppetite = 'underdog-hunter';
  else riskAppetite = 'longshot-specialist';

  // Recent momentum
  const { wins, losses } = recentPicks;
  let momentumLabel: string;
  if (wins >= 4) momentumLabel = `Hot streak (${wins}-${losses})`;
  else if (losses >= 4) momentumLabel = `Cold streak (${wins}-${losses})`;
  // ... more logic

  return { riskAppetite, marketDensity, recentMomentum, bettingStyle, hotTeams, coldTeams };
}
```

Then we convert this structured profile into a dense text description:

```typescript
function generateUserProfileText(prefs: UserPreferences, profile: UserProfile): string {
  const sections: string[] = [];

  // RISK PROFILE - How the user approaches odds
  const riskLabels: Record<UserProfile['riskAppetite'], string> = {
    'heavy-favorite': 'Heavy favorite bettor, prefers safe picks with low payouts',
    'underdog-hunter': 'Underdog hunter, seeks value in plus-money picks',
    'longshot-specialist': 'Longshot specialist, chases high-payout underdogs'
  };
  sections.push(`RISK PROFILE: ${riskLabels[profile.riskAppetite]}`);

  // MARKET FOCUS - Which sports they bet on
  sections.push(`MARKET FOCUS: Heavy NBA (60%), Active NFL (30%)`);

  // MOMENTUM - Recent performance
  sections.push(`MOMENTUM: ${profile.recentMomentum.label}`);

  // FAVORITES - Top teams with performance
  const topTeams = Object.entries(prefs.favorite_teams || {})
    .sort((a, b) => b[1].picks_count - a[1].picks_count)
    .slice(0, 5)
    .map(([name, data]) => {
      const winRate = Math.round((data.wins / data.picks_count) * 100);
      const performance = winRate >= 60 ? 'profitable' : 'mixed';
      return `${name} (${data.picks_count}x, ${performance})`;
    });
  sections.push(`FAVORITES: ${topTeams.join(', ')}`);

  return sections.join('. ');
}
```

Even though this part is hard-coded, it’s done to standardize the vocabulary for the embedding model. This produces text like:

```
RISK PROFILE: Underdog hunter, seeks value in plus-money picks. 
MARKET FOCUS: Heavy NBA (60%), Active NFL (30%). 
MOMENTUM: Hot streak (4-1). 
FAVORITES: Lakers (10x, profitable), Knicks (8x, profitable)
```

#### Building the Game Context

We do the same for upcoming games, injecting labels that the AI can hook into:

```typescript
function generateGameText(event: UpcomingEvent): string {
  const sections: string[] = [];
  const homeOdds = event.home_odds || 0;
  const awayOdds = event.away_odds || 0;
  const oddsDiff = Math.abs(homeOdds - awayOdds);

  // MATCHUP - Basic game info
  sections.push(`NBA: ${event.away_team} at ${event.home_team}`);

  // VALUE SIGNAL - Odds spread analysis
  let valueSignal: string;
  if (oddsDiff < 30) {
    valueSignal = 'Toss-up, virtually even odds';
  } else if (oddsDiff < 80) {
    valueSignal = 'Close matchup, slight edge to one side';
  } else if (oddsDiff < 150) {
    valueSignal = 'Clear favorite, moderate value on underdog';
  } else {
    valueSignal = 'Heavy favorite, high-risk underdog value';
  }
  sections.push(`VALUE: ${valueSignal}`);

  // ODDS BREAKDOWN
  const homeLabel = homeOdds > 0 ? `+${homeOdds} underdog` : `${homeOdds} favorite`;
  sections.push(`ODDS: Home ${homeLabel}, Away ${awayOdds > 0 ? `+${awayOdds} underdog` : `${awayOdds} favorite`}`);

  // CONTEXT - Rivalry and special matchups
  const rivalryLabel = getRivalryLabel(event.home_team, event.away_team);
  if (rivalryLabel) {
    sections.push(`CONTEXT: ${rivalryLabel}, high-stakes matchup`);
  }

  // RISK PROFILE - What type of bettor this game suits
  let suitableFor: string;
  if (oddsDiff < 50) {
    suitableFor = 'Suits value seekers and balanced bettors';
  } else if (homeOdds > 150 || awayOdds > 150) {
    suitableFor = 'Suits underdog hunters and high-variance bettors';
  } else {
    suitableFor = 'Suits risk-averse and favorite bettors';
  }
  sections.push(`PROFILE: ${suitableFor}`);

  return sections.join('. ');
}
```

This produces text like:

```
NBA: Cavaliers at Knicks. 
VALUE: Close matchup, slight edge to one side. 
ODDS: Home -120 favorite, Away +100 underdog. 
CONTEXT: Division rivalry, high-stakes matchup. 
PROFILE: Suits value seekers and balanced bettors
```

By adding "Suits underdog hunters" to the game text and "Underdog hunter" to the user text, we're building a bridge for the math to cross.

#### The Embedding Process

Now we convert both texts into vectors using an embedding model (we use BAAI/bge-small-en-v1.5 on HuggingFace for speed):

```typescript
// Get embeddings provider
const provider = getDefaultProvider();

// Generate user profile text
const userText = generateUserProfileText(prefs, userProfile);

// Check cache first
let userEmbedding = await embeddingsCacheService.getUserEmbedding(user.uid, prefsUpdatedAt);

// If not cached, generate embedding
if (!userEmbedding) {
  userEmbedding = await provider.getEmbeddings([userText])[0];
  await embeddingsCacheService.setUserEmbedding(user.uid, userText, userEmbedding);
}

// Same for games
const cachedGameEmbeddings = await embeddingsCacheService.getGameEmbeddingsBatch(allEvents.map((e) => e.id));

for (const event of allEvents) {
  if (!cachedGameEmbeddings.has(event.id)) {
    const gameText = generateGameText(event);
    const embedding = await provider.getEmbeddings([gameText])[0];
    cachedGameEmbeddings.set(event.id, embedding);
    await embeddingsCacheService.setGameEmbedding(event.id, gameText, embedding);
  }
}
```

An embedding is a numerical representation of text as an array of floating-point numbers in a high-dimensional space (ours uses 384 dimensions). Similar concepts end up close together in this space—for example, "Underdog hunter" and "Suits underdog hunters" are nearby, while "Underdog hunter" and "Heavy favorite bettor" are far apart.

Stored embeddings just look like this:

```
[0: -0.028000328689813614,
 1: -0.04409006983041763,
 2: -0.0758199393749237,
 3: -0.017545605078339577,
 4: 0.020441239699721336,
 ... (380 more numbers)]
```

Imagine a map, but in 384 dimensions: related sports terms ("Lakers", "LeBron") cluster together, and unrelated ones ("Lakers", "Knitting") are distant. 

When we compare two arrays with cosine similarity, we're measuring how close their underlying meanings are. The "magic" is how the model learned to turn concepts into these numbers—not in the numbers themselves.



#### Finding Matches with Cosine Similarity

Once we have vectors for the user profile and all games, we calculate similarity:

```typescript
// Calculate similarity scores
const scoredEvents: RecommendedGame[] = allEvents.map((event) => {
  const gameEmbedding = cachedGameEmbeddings.get(event.id)!;
  const score = provider.cosineSimilarity(userEmbedding!, gameEmbedding);
  return { event, score };
});

// Sort by score and take top N
scoredEvents.sort((a, b) => b.score - a.score);
const recommendations = scoredEvents.slice(0, 5);
```

Cosine similarity measures the angle between two vectors. A score of 1.0 means identical, 0.0 means orthogonal. In practice, scores above 0.70 indicate strong matches.

### Stage 2: Adding Personality with Gemma 3

Even with great embeddings, the explanation layer felt mechanical. I wanted recommendations that felt like a sharp sports analyst was sitting next to you.

That's where [Gemma 3 (27b)](https://huggingface.co/google/gemma-3-27b-it) comes in. Unlike embedding models, which only know about distances, Gemma understands context. It knows that a Knicks game at Madison Square Garden has different energy than a Tuesday afternoon game in an empty arena.

We take the top 5 games from Stage 1 and send them to Gemma:

```typescript
// Enhance top 5 with Gemma-generated sports analyst recommendations
if (isGemmaAvailable() && recommendations.length > 0) {
  const topN = Math.min(5, recommendations.length);
  const gamesToEnhance = recommendations.slice(0, topN).map((rec) => ({
    id: rec.event.id,
    gameText: generateGameText(rec.event),
    score: rec.score
  }));

  const gemmaReasons = await generateGemmaRecommendations(userText, gamesToEnhance);

  // Replace reasons for games that got Gemma responses
  for (const rec of recommendations.slice(0, topN)) {
    const gemmaReason = gemmaReasons.get(rec.event.id);
    if (gemmaReason) {
      rec.reasons = [gemmaReason];
    }
  }
}
```

#### Sport-Specific Personas

The key insight: different sports need different analytical lenses. An NBA game in December (back-to-backs piling up, holiday road trips) requires different context than an NFL game in January (playoff football, one-and-done pressure).

I built sport-specific personas that change based on the league:

```typescript
const SPORT_PROMPTS: Record<string, string> = {
  nba: "NBA Insider focused on rest spots, 'scheduled losses,' and rotation depth.",
  nfl: "NFL Beat Reporter scouting divisional revenge and 'sandwich' spots.",
  soccer: "Tactical Analyst tracking fixture congestion and form swings.",
  ncaaf: "CFB Analyst spotting emotional letdowns and rivalry edges.",
  ncaab: "Hoops Junkie tracking tempo mismatches and road-venue shock.",
  default: 'Sharp Sports Analyst finding situational edges.'
};
```

#### Temporal Context

The system also injects month-specific context. In December, NBA games get: *"December grind: Back-to-backs pile up, holiday road trips, fatigue factor."* In January, NFL games get: *"Playoff football, Wild Card chaos, one-and-done pressure."*

This temporal awareness means Gemma understands that a Tuesday night game in December hits differently than a Saturday primetime game in January.

#### The Two-Sentence Structure

The prompt asks for exactly two sentences:

```typescript
const SYSTEM_PROMPT_SUFFIX = `
Rule: Write exactly 2 short, punchy sentences. 
Sentence 1: The Matchup context (rest, news, or travel). Use active analyst verbs like 'ambush,' 'clash,' or 'hit a wall.'
Sentence 2: The 'Secret Sauce'—connect the user's focus on {USER_PROFILE} to why this pick builds their credibility. 
Tone: Professional sports analyst who is also a bookie. Avoid gambling terms like 'fade,' 'payout,' or 'bet.'`;
```

This structure forces Gemma to lead with situational analysis, then connect it to the user's betting style. The result reads like insider analysis, not generic AI fluff.

Now instead of verbose analysis, users get something like:

> "Lakers hit a wall on this back-to-back after last night's OT thriller. You've been crushing underdog tickets all month—this spot has your name on it."

Or with real context Gemma knows:

> "Mavs are banged up and you love fading injured squads—easy spot."

The key insight: don't explain your app's mechanics to the LLM. Gemma doesn't need to know about "RXP" or "reputation points." Just tell it to be a sharp friend with the right persona and temporal awareness, and let it do what it's good at—sports analysis with personality.

## What I Learned

Building this with Claude taught me that the future of development isn't about writing the algorithm—it's about curating the context.

I didn't have to learn how to train a neural network. I had to learn how to describe my data so that a pre-trained model could understand it. If you're building a feature that requires "fuzzy" logic, don't write 100 if statements. Try converting your data to text, running inference to get an embedding, and letting the geometry do the work.

The takeaway for devs: You don't need to be a data scientist to use AI. You just need to be a good storyteller for your data.

This two-stage, retrieval + generation pipeline transformed my project from a static database into a dynamic, opinionated assistant. Here's a glimpse at the recommendations it produces:

![](https://lh3.googleusercontent.com/pw/AP1GczOZDEeU4nTwJimQsKoZw_dkOKvvAm4D5zQekjyx4zu4g8tGnkCr1Z2RA7BxVHiv8cx0zPvdXsLQLG_scXjEPWdkxp5sU4Jq6NtLegPvUJYCQ4dBf63hj7iMawc3uQh3klw6v8UDDmJ3IMirwJMK6FOYSA=w2320-h1520-s-no-gm)

![](https://lh3.googleusercontent.com/pw/AP1GczPikHQ-F4tkHpCjKAwKscdi2xYO2JU1BaJ8arR-lWxQPrG9s6fu-qtwXL0uEQS_b899hseD_WgP36QHyZk2cy1ls3ZP--IFiayC1dnGVoN5fH3aFrfxiZabL1-piCyWyIGb9w3dLD5w9_Np97WP2acssA=w2320-h1520-s-no-gm)

![](https://lh3.googleusercontent.com/pw/AP1GczN6m_hMsw1Ehj6lnOkRAsUpAzio-kkWuOn9iKGO0_NtlmHekXHuMYAIRHdbtTgDT7A6d5kWK8mqdYZdtaKtI15-EPLEfb2oDibxUemHPEWS8RZSiOKMTvBavM9dtCi-DdbBjDD8fkjNavgJd34QOd9BMw=w2320-h1520-s-no-gm)

![](https://lh3.googleusercontent.com/pw/AP1GczNatVL49pB7r5elMAjGcAD-HUxs_IG49VpDc8zqF_o4FtuvgJAarkRlAfp42EF-satEorc2Xs_Xm_VA8c0a6Cno72yFYO8u4dvHIjjx_FakI56GfqHc2FAMo0-FgXrXO1zaJg4EdfGbL8rC5eGNEUvGfw=w2320-h1520-s-no-gm)

Gemma brought personality and context that a traditional app simply can't match—tapping into knowledge of rivalries, storylines, and the pulse of the sports world. The result: recommendations that feel tailored, timely, and a little bit hype.

_prxps is in private beta, sign up here: [https://prxps.xyz](https://prxps.xyz) and follow on X [@prxpsxyz](https://x.com/prxpsxyz)._