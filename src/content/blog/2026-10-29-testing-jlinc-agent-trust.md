---
title: 'JLINC: Signed agreements and audit records for AI agents'
description: 'What signed agreements and audit records could add to personal assistants and enterprise workflows, with results from a small JLINC test.'
pubDate: '2026-10-29'
updatedDate: '2026-11-05'
category: 'tech'
tags: ['jlinc', 'agents', 'security', 'langchain', 'privacy']
draft: false
---

I've been wanting to test [JLINC](https://protocol.jlinc.io/) because I care about agent trust and reliability. When I give an agent access to my information, I want to define what it may do and check the resulting exchanges.

Permission to read a document does not necessarily include sending it to another service or using it to train a model. JLINC connects data exchanges to signed agreements and produces records that can be checked for changes. I built a small experiment to test its audit checks and tool access controls.

Thanks to Ben Curtis, JLINC's CTO, for helping refine this article and answering my technical questions. Shoutout to Miguel Solari, a good friend from my San Francisco days who works at JLINC, for connecting us.

![Three steps: the parties sign terms, the application checks permission before running a tool, and JLINC records signed evidence of the exchange.](/images/jlinc-agreement-flow.svg)

## What JLINC does

JLINC associates data exchanges with a **Verifiable Contractual Agreement**, or VCA. The parties sign the agreement, and subsequent exchanges refer to it. The protocol also describes delegation, through which an identity can authorize another identity to sign on its behalf. [Protocol specification](https://protocol.jlinc.io/)

An agreement needs a system that enforces its terms. JLINC's developer API supports policy checks through an access-control service. The application must connect those checks to the actions it allows. [Access-control guide](https://docs.jlinc.io/usage-guide/access-control)

The Core service handles the original data records. A separate Archive service retains signed audit records containing hashes of those originals. JLINC calls this Zero-Knowledge Auditing: the archive can hold evidence without receiving the original data payload. [Protocol specification](https://protocol.jlinc.io/)

The archive still sees timestamps and decentralized identifiers, or DIDs. In the deployment described during review, Core keeps the mapping from those identifiers to users. I would avoid usernames or email addresses in archive identifiers and review the metadata they expose.

## Why I would use it in my own projects

Two projects give me concrete places to try this: [prxps](https://prxps.xyz), my sports picks app, and [Loooom](https://loooom.xyz), my collection of agent skills and testing tools. Their workflows exist today; adding JLINC would be a new experiment.

### prxps: checking a reward decision

In prxps, people make free sports picks and earn RXP, a reputation score with no cash value. The app has a [Rust reward calculator](/blog/2026-09-30-rust-backend-prxps-rxp-calculator/) that takes odds and streak days and returns a reward preview.

Its [settlement event flow](/notes/2026-10-01-pubsub-for-prxps/) records each resolved pick and reward, then updates recommendations through Pub/Sub. Stable event IDs and consumer receipts prevent duplicate deliveries from repeating that work.

To investigate a disputed reward, I would want the odds, streak, calculation version, returned RXP, and settlement event ID. JLINC could sign that record and retain evidence to check whether it had changed. Calculation tests would still establish formula correctness, and the existing transaction controls would still prevent duplicate rewards.

An agent explaining a user's recommendations could read the required pick history while being denied access to settle picks or change RXP. I would connect JLINC's policy checks to those tools and test both paths: explanation allowed, reward change denied before execution.

### Loooom: checking what an evaluation actually tested

[Loooom's gym](https://loooom.xyz/gym) saves skill revisions and compares their test answers. One published experiment shortened the `focus` skill from 948 to 242 words. The original and shorter versions each passed all 15 final trials. Those results were graded by an AI and cover a small test set.

I would use JLINC to check whether a reported score still matches its experiment: the skill version, test questions, model settings, answers, rubric, and results. Signed records could show whether that saved content had changed. A reviewer would still need access to the content to inspect the experiment.

Git tracks the skill and test files. JLINC could connect those versions to signed model exchanges and results that I can check against a separate archive. A signature would not make the grader correct or guarantee future behavior.

A repair agent could propose a skill revision and run tests, while publishing it would require separate approval. The publishing tool would enforce that boundary, with the test record available for review.

I would start with synthetic prxps records and public Loooom test data, keeping private user data out of the first integration.

## Where MyTerms fits

[MyTerms](https://myterms.info/ieee7012-standards/) makes the personal use case more concrete. It describes IEEE 7012-2025, a standard for machine-readable personal privacy terms. Individuals can propose terms to a service, with the resulting agreement retained by both sides. The MyTerms agreements have plain language, machine-readable, and legal forms.

An agent acting for me should distinguish permission to use a document for my current request from permission to use it for another purpose. Machine-readable terms could support that check, while the readable version lets me understand what I am accepting.

The [MyTerms Contract Negotiation Protocol Internet-Draft](https://datatracker.ietf.org/doc/draft-curtis-myterms/) describes technical requirements for VCAs under IEEE 7012, including agreement formats, negotiation, signing, and auditing. It is an individual Internet-Draft: work in progress, not an adopted IETF standard.

I have not implemented a MyTerms agreement in this experiment. Connecting its terms to enforced tool permissions would be a separate integration.

## Why an enterprise would consider it

A support assistant may need to send customer information to an outside specialist. JLINC could connect that exchange to agreed terms and evidence both companies can check. Three uses stand out:

- **Vendor handoffs:** a company sends selected error logs to a vendor for diagnosis. A signed agreement could record the permitted purpose and retention period, while audit evidence lets each party check the recorded exchange. The systems handling the logs must still enforce those limits.
- **Incident review:** if the companies disagree about what was sent, compare the retained record with its signed evidence and operational logs.
- **Agents acting for a company:** a company authorizes a support agent to sign certain exchanges on its behalf. Delegation records could help a reviewer trace the agent's signing authority back to the company; tool permissions would still control its actions.

These are proposed uses, not complete enterprise workflows demonstrated by my test.

Deployment choices also matter. JLINC documents a configuration with a self-hosted Core service and a remote Archive service. That lets an organization keep original data in its own environment while placing audit evidence elsewhere. [Deployment guide](https://docs.jlinc.io/deployments/docker)

An operator retaining its original data and audit records can validate the evidence locally and check the archive service's results. That depends on access to the evidence and correct verification code. My test used the hosted Core verifier, so independent verification remains untested.

The [CloudGo Sovereign AI Lab](https://cloudgo.ai/sovereign-ai-lab/) offers a business evaluation around one workflow: CloudGo supplies organizational knowledge and source context, while JLINC adds agreements, authority, and evidence around its use. My developer test used JLINC directly.

## What I tested

The [community example on GitHub](https://github.com/mager/jlinc-agent-trust-lab) includes the scripts, 11 local tests, setup instructions, and saved hosted results. You can run the local tests without a JLINC account.

I started with two questions: could I detect a changed audit record, and could I stop a tool call after an authorization denial?

I used the hosted JLINC test service for both Core and Archive. I created two synthetic identities, representing an agent and a tool, and recorded the inputs `20` and `22` with the output `42`. This was fixed test data. No model or autonomous agent ran.

The event used the **nil agreement**, which supports auditing without a predefined contract. I signed the event as the sender and counter-signed it as the recipient. Both audit records passed all seven returned verification checks. [Event API](https://docs.jlinc.io/usage-guide/exchanging-data), [audit API](https://docs.jlinc.io/usage-guide/zero-knowledge-auditing)

Then I changed one character in the digest of a local copy of an audit record and submitted it for verification. JLINC rejected that record. Its audit hash and audit signature checks failed. A fresh retrieval of the original archive records still verified.

| Hosted test | Observed result |
| --- | --- |
| Original audit records | 2 valid, 0 invalid |
| One changed digest in a local copy | 1 valid, 1 invalid |
| Original archive records retrieved again | Valid |
| `read` authorization request | Allowed; local test function ran once |
| `delete` authorization request | Denied; local test function did not run |

The authorization test used a synthetic user and resource. Its function only returned `42` and incremented a local counter. It never deleted data.

My application guard requested a new decision before each invocation and accepted only the Boolean value `true`:

```js
export async function invokeAuthorized(post, request, tool) {
  const decision = await post('auth', request);
  if (decision.decision !== true) {
    throw new Error('Tool use denied');
  }
  return tool();
}
```

A request failure also stops execution. The application must supply the subject, action, and resource from trusted state. The model should not be able to choose its own authority.

## Record integrity and missing events

The test changed a local audit digest, not the stored event. It did not test deletion, replay, or independently operated Core and Archive services.

I supplied the answer `42` myself. Its signature protects a recorded claim; it does not prove that a calculation happened, that every action was recorded, or that a model's answer is correct.

JLINC's November 4 feedback described record chaining as a protocol addition under development, without a blockchain or Merkle-tree design. My October tests did not establish that capability. For prxps, checking whether a reward record changed and detecting a missing record are separate problems. An action never captured by the application would still need another way to detect it.

## What happened in the SDK tests

I tested `@jlinc/langchain` 0.1.4 against a local HTTP fixture, not the hosted authorization service. Explicit denial and HTTP errors blocked the tool when no fallback was configured, and LangChain callbacks reached the fixture. Three behaviors needed care:

- **Cached permission:** after one allow decision, invoking the tool without another `evaluate` call reused that decision. My application guard requests a fresh check each time.
- **Response types:** a deliberately malformed string `"false"` allowed execution because it is truthy in JavaScript. I did not observe this response from the hosted service; the guard accepts only Boolean `true`.
- **Audit failures:** making the tracer's internal request method throw caused it to log the error and continue. This made no network request, so it was not a hosted outage test.

These findings apply to this version and setup. The [test repo](https://github.com/mager/jlinc-agent-trust-lab) contains the reproduction details; the [SDK source](https://gitea.jlinc.io/jlinc-labs/jlinc-langchain-js) shows the implementation.

I'm excited to see what the JLINC team builds next, especially how record chaining develops. This experiment gave me concrete ways to think about signed evidence and permissions in my own apps.
