---
title: "Jev: a decision model"
description: "Testing TypeSafe's Jev through Vercel AI Gateway, putting it inside a decision-heavy skill, and building a matchup reader for my reputation-based sports picks app."
pubDate: 2026-09-19
category: tech
heroImage: "https://sdld3v8bpzf3snqo.public.blob.vercel-storage.com/blog/2026-09-19-jev-decision-model/hero.jpg"
keyword: "decision models"
tags: [ai, jev, typesafe, vercel, aigateway, agents, prxps]
draft: false
---

I tried Jev at work this week inside a skill with a lot of decision points. The workflow already knew what it could do next; it needed help choosing. I plugged Jev into those branches, and the prototype ran faster and used fewer tokens overall.

That is an observation from an early prototype, not a benchmark. I haven't measured the quality tradeoff across a representative set of tasks yet. But it was enough to make me want to build something with it outside work.

[Jev](https://typesafe.ai/blog/introducing-system-one-models-and-jev) is TypeSafe AI's first public System One model. I find **decision model** the most useful way to think about it. You supply the state of a problem, define the questions and possible answers, and get structured decisions with probabilities back.

## What changes when the model doesn't write text

A typical generative LLM can write a function, explain an error, or compose a reply. It can also choose a tool or return JSON. Those are all useful capabilities, but sometimes the entire job is choosing one of four branches in a program.

Jev gives up arbitrary text generation. Its interface is built around bounded questions: a choice among defined options, a score against a rubric, or the probability that a statement is true. TypeSafe describes an architecture that evaluates outputs in parallel, with training focused on calibrated decisions. That's the architectural claim; the practical difference is the API contract.

For a tool selector, I can define `search`, `read_file`, `run_tests`, and `ask_user`. The application receives values from that answer space and decides what to execute. It doesn't need a paragraph explaining which tool sounded best, followed by a parser that tries to recover the choice.

LLMs with structured output can also enforce a schema. Jev's appeal is specializing the model and interface around this narrower job. Whether that specialization improves a particular workflow still needs testing.

Type safety also has a specific limit: returning a valid option doesn't make that option correct. A decision model can choose the wrong tool or favor the losing team. I want to measure the decisions, not just check that the response parses.

## Where I would put it

The immediate uses are the places where an application already has a small set of possible next steps:

- **Skill or tool selection.** Given the request, available capabilities, and current state, choose which skill to load or tool to call. Include an option for insufficient information.
- **Model routing.** Decide whether a task can go to a cheaper model, needs stronger reasoning, or should go back to the user for clarification. Compare total workflow cost, including the routing call and any retries.
- **Computer use decisions.** Given a textual description of the current UI and the controls an agent has identified, choose whether to click a known control, wait, retry, or stop. Perception and execution still belong to the surrounding system; this isn't a claim that Jev can independently operate a desktop from screenshots.
- **Verification.** Check whether a tool result satisfies the requested condition before advancing the workflow.

My work prototype used this pattern within a skill. The larger workflow still did the work; Jev handled some of the choices along the way. A proper evaluation would check completion quality, branch errors, latency, and total token usage together. Saving tokens isn't useful if the workflow takes the wrong branch more often.

## Trying it through AI Gateway

I already use [Vercel AI Gateway](/blog/2026-08-16-ai-gateway-eve-stack/), so I tested Jev from my Mac mini with the existing Gateway key. No separate TypeSafe account was needed for these calls.

My first assumption was that I could select it in OpenCode. OpenCode 1.18.30 did list `vercel/typesafe-ai/jev`, but trying to run it produced a useful error: Jev is an evaluation model and needs the evaluation API. It can't take over as the coding model for the session.

The working route was AI SDK's experimental `evaluate` API. This is the small smoke test, using `ai@7.0.107` and an `AI_GATEWAY_API_KEY` environment variable:

```js
import { experimental_evaluate as evaluate } from 'ai';

const result = await evaluate({
  model: 'typesafe-ai/jev',
  state: 'The support agent issued a full refund to the customer.',
  questions: {
    refunded: {
      type: 'boolean',
      instructions: 'Was a refund actually issued?',
    },
  },
  maxRetries: 0,
  abortSignal: AbortSignal.timeout(30_000),
});

console.log(result.answers.refunded);
// { type: 'boolean', probability: 0.92 }
```

I also tried a negative case: the customer requested a refund, but the agent declined it and no refund was issued.

| Input | Probability a refund was issued | End-to-end time |
| --- | --- | --- |
| Agent issued a full refund | 92% | 1.2 seconds |
| Agent declined the refund | 2% | 1.5 seconds |

Those are two synthetic examples, not an accuracy or latency benchmark. The timings include the trip from my Mac mini through Gateway. Both requests succeeded, and Gateway reported zero billed cost.

As of September 19, [Vercel's Jev model page](https://vercel.com/ai-gateway/models/jev) lists free promotional usage ending September 25, 2026. That covers this weekend's experiments. It doesn't make free usage a permanent assumption for an app.

## A weekend project: prxps Pick

[prxps](https://prxps.xyz) is my sports picks app. There is no money at stake: you make picks and earn RXP when they win. It's about reputation, and it gives me a useful place to test a model's judgment against outcomes that eventually become observable.

The app already has matchup information: home and away teams, start times, bookmaker moneylines, and agreement or disagreement across books. It also has integrations for injury reports and NFL weather. Availability varies, so missing context needs to stay missing.

The feature is **prxps Pick**: given the information prxps has for a matchup, which side does the evidence favor? The possible decisions include the home team, the away team, and no clear edge, plus a draw for markets that include one. Jev powers the decision behind the scenes; the app presents a pick and the evidence behind it.

This is a more interesting experiment than asking a chatbot who will win. The input is a specific snapshot of data the application already owns. The output is a bounded decision we can show next to the same evidence and, eventually, compare with the result.

### How we built the first version

I delegated the prxps implementation to a coding agent while working on this post. We added an on-demand panel to the game detail page. Pressing **Get our pick** calls a separate server endpoint, so loading a matchup doesn't depend on an evaluation finishing.

The server looks up the event in prxps's existing odds cache. It uses complete moneyline markets, rejects stale data, and preserves the draw outcome when present. For each book, it converts decimal prices to implied probabilities and normalizes them to remove the margin, then averages across books. That gives the decision a concrete market baseline. It's a simple normalization, not an independently trained forecast.

Available injury reports and NFL weather add context. An absent injury report stays unknown; it doesn't turn into a claim that everyone is healthy. The question tells Jev to use the supplied state rather than remembered team strength or news, and to avoid counting an injury twice if the odds already reflect it.

The central call uses the same evaluation API as the refund example, with a `choice` question. The abbreviated question looks like this:

```js
questions: {
  lean: {
    type: 'choice',
    instructions: 'Choose the pregame lean supported by the supplied data.',
    criteria: {
      home: 'The evidence supports leaning toward the home team.',
      away: 'The evidence supports leaning toward the away team.',
      no_edge: 'The evidence is too close, incomplete, or conflicting.',
      // Include a draw option when the supplied market supports it.
    },
  },
}
```

The response drives the selected team and decision-support bars. The facts underneath come from ordinary code: bookmaker agreement, the market baseline, injury counts, and available conditions. Jev isn't writing an explanation. Showing the inputs separately also avoids pretending that a generated paragraph reveals why a model made its choice.

We cache the decision by a fingerprint of its input state, model, and question version. A changed snapshot gets a new evaluation; an unchanged one can reuse its read for up to 15 minutes, capped at game time. The Gateway key stays on the server. Missing credentials, timeouts, and unavailable data produce an unavailable state while the rest of the matchup page keeps working.

The first end-to-end integration test used a real Toledo–Temple matchup from the prxps odds cache. All nine available books favored Toledo. After removing each book's margin and averaging the markets, the baseline was 64% Toledo and 36% Temple. Jev chose Toledo with 85% decision support, 15% for no clear edge, and 0% for Temple. The evaluation took 891 milliseconds. In this case it agreed with the market, which is exactly the sort of result the comparison needs to record rather than dress up as new insight.

I then verified the deployed version with LSU at Ole Miss. All eight markets favored LSU, with a margin-removed baseline of 58% LSU and 42% Ole Miss. prxps Pick chose LSU with 90% decision support and left 10% on no clear edge.

<figure>
  <img src="https://sdld3v8bpzf3snqo.public.blob.vercel-storage.com/blog/2026-09-19-jev-decision-model/prxps-pick-production.jpg" alt="The prxps Pick production widget choosing LSU Tigers over Ole Miss Rebels with 90 percent decision support, while showing the eight-book market baseline and missing injury context." width="1600" height="1049" loading="lazy" decoding="async" />
  <figcaption>prxps Pick running in production. The disclosure shows the market facts and the context the model did not receive.</figcaption>
</figure>

The probabilities need careful labeling. If Jev assigns 70% to the home-team answer, that is a probability within our decision question. We haven't established that teams receiving that answer win 70% of the time. Adding a “no clear edge” option makes it especially misleading to present the distribution as a conventional win-probability forecast.

The first useful comparison will be against a simple baseline: pick the bookmaker favorite. If Jev mostly repeats the market, that should be visible. I want to find out whether the extra context changes its decisions sensibly, when it abstains, and whether those changes help over a meaningful set of resolved games.

### TODO: give the picks a track record

The first implementation is a reader, not a validated prediction system. These are the next experiments I want to build:

- **A public prxps Pick record.** Freeze the inputs and decision before each game, then score it after the result. Let people compare their own picks with the app's without changing anyone's RXP automatically.
- **A market comparison.** Track whether the model agrees with the favorite, picks an underdog, or abstains. Compare results by sport and data availability, including how often it declines to pick.
- **What-if reads.** Let someone remove an injury signal or compare a weather scenario using the same matchup. Label hypothetical inputs clearly and keep those results separate from the recorded pregame pick.

For now, the attraction is practical. I already have a workflow, a set of choices, and data to inform them. Jev gives me another way to implement the decisions inside it.
