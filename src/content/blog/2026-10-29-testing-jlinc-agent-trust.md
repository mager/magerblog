---
title: "Why I'm testing JLINC for personal and enterprise agents"
description: 'What signed agreements and audit records could add to personal assistants and enterprise workflows, with results from a small JLINC test.'
pubDate: '2026-10-29'
category: 'tech'
tags: ['jlinc', 'agents', 'security', 'langchain', 'privacy']
draft: true
---

I've been wanting to test [JLINC](https://protocol.jlinc.io/) because I care about agent trust and reliability. When I give an agent access to my information, I want to define what it may do with that information and have a way to check the resulting exchanges.

An assistant might need to read a document to answer a question. That permission does not necessarily include sending the document to another service, retaining it for another purpose, or using it to train a model. In a company, the same question extends across employees, departments, vendors, and customers.

JLINC interests me because it connects data exchanges to signed agreements and produces records that can be checked for changes. In practical terms, I want to know which parties signed a record, which terms it refers to, and whether the record still matches the audit evidence. I built a small experiment to test the audit checks and tool access controls, then consider how I might use them in a personal or enterprise workflow.

## What JLINC does

JLINC associates data exchanges with a **Verifiable Contractual Agreement**, or VCA. The parties sign the agreement, and subsequent exchanges refer to it. The protocol also describes delegation, through which an identity can authorize another identity to sign on its behalf. [Protocol specification](https://protocol.jlinc.io/)

There are three parts I find useful to consider separately:

| Part | Question it helps address |
| --- | --- |
| Agreement | What terms did the parties accept? |
| Authorization | May this subject perform this action on this resource? |
| Audit evidence | Does this recorded exchange still match its signatures and audit record? |

An agreement needs a system that enforces its terms. JLINC's developer API supports policy checks through an access-control service. The application must connect those checks to the actions it allows. [Access-control guide](https://docs.jlinc.io/usage-guide/access-control)

The Core service handles the data records. A separate Archive service can retain signed audit records containing hashes of the originals. JLINC calls this Zero-Knowledge Auditing: the archive can hold evidence without receiving the original data payload. That description concerns the audit design; it does not mean every identifier or piece of metadata is hidden. [Protocol specification](https://protocol.jlinc.io/)

For me, the value is the ability to check evidence across a boundary between systems. Ordinary logs remain useful for debugging and operations. Signed records add a way to detect changes to recorded content, provided I trust the relevant identities, keys, and verification process.

## Why I would use it in my own projects

Two projects I already build give me concrete places to try this: [prxps](https://prxps.xyz), my sports picks app, and [Loooom](https://loooom.xyz), my collection of agent skills and tools for testing them. The workflows below exist today. Adding JLINC to them would be a new experiment.

### prxps: checking a reward decision

In prxps, people make free sports picks and earn RXP, a reputation score with no cash value. The app has a [Rust reward calculator](/blog/2026-09-30-rust-backend-prxps-rxp-calculator/) that takes odds and streak days and returns a reward preview.

It also has a [settlement event flow](/notes/2026-10-01-pubsub-for-prxps/). When a pick resolves, a Firestore transaction writes the reward and a `pick.resolved` event. A worker publishes the event to Pub/Sub, and a consumer invalidates the user's recommendations. Stable event IDs and consumer receipts prevent duplicate deliveries from repeating that work.

Suppose I need to investigate why a pick earned a particular amount of RXP. I would want a record of the odds, streak, calculation version, returned reward, and settlement event ID. A JLINC integration could sign that record and retain audit evidence so I could later check whether the recorded inputs or result had changed.

That would help me review a disputed reward or compare behavior before and after a calculator change. I would still need calculation tests to establish that the formula was correct. The existing transaction and duplicate-handling controls would still prevent rewards from being applied twice.

There is also a useful agent permission boundary here. If I let an agent explain a user's recommendations, I could permit it to read the required pick history while denying access to the action that settles picks or changes RXP. I would test both paths: explanation allowed, reward change denied before the tool runs. JLINC's policy checks could support that boundary if I connected them to those tools.

### Loooom: checking what an evaluation actually tested

[Loooom's gym](https://loooom.xyz/gym) saves skill revisions and compares their test answers. One published experiment shortened the `focus` skill from 948 to 242 words. The original and shorter versions each passed all 15 final trials. Those results were graded by an AI and cover a small test set.

The question I would use JLINC to investigate is whether a reported score still matches the exact experiment that produced it.

For a future run, I would record the skill version, test questions, model settings, answers, grading rubric, and results. Signed records and separate audit evidence could let me check that this saved record had not changed. A reviewer would need access to the relevant content to inspect the experiment itself.

Git already helps me track changes to the skill and test files. The additional experiment would be to connect those versions to the recorded model exchanges and results, then verify that record independently. A signature would not make the grader correct or make 15 passing trials a guarantee of future behavior.

I would also separate permission to propose a skill revision from permission to publish it. A repair agent could create a candidate and run tests. Updating the public skill would require a separate approval, enforced by the publishing tool. The test record would give me specific evidence to review before that approval.

These are the reasons I would try JLINC as an individual builder: I have results I want to explain, experiments I want to inspect, and agent actions I want to limit. I would start with synthetic prxps records and public Loooom test data so I could learn the integration without adding private user data to another system.

## Where MyTerms fits

[MyTerms](https://myterms.info/ieee7012-standards/) makes the personal use case more concrete. It describes IEEE 7012-2025, a standard for machine-readable personal privacy terms. Individuals can propose terms to a service, with the resulting agreement retained by both sides. The MyTerms agreements have plain language, machine-readable, and legal forms.

I like the direction: I should be able to state the terms under which a service may use my information. An agent acting for me should have a clear representation of those terms.

For example, I would want to distinguish permission to use a document for my current request from permission to use it for another purpose. The machine-readable form could support software that checks that distinction, while the readable version lets me understand what I am accepting.

I have not implemented or enforced a MyTerms agreement in this experiment. The next useful test would connect an explicit test agreement to an actual policy decision and show which actions it permits.

## Why an enterprise would consider it

For an enterprise, I would look first at workflows that cross organizational boundaries.

Consider a support assistant that sends a customer issue to a specialist vendor. The company may permit the vendor to use a limited set of facts to diagnose the issue. It may restrict further sharing or other uses. Both parties need to understand the applicable terms, and someone may later need to review the exchange.

A JLINC integration could associate that handoff with a signed agreement and retain evidence of the recorded exchange. Each party could use the evidence to check the records it holds. The company would still need controls that select the allowed fields, check access before transmission, and handle any required retention or deletion process.

That gives me three practical reasons to evaluate it:

- **Vendor handoffs:** attach explicit terms and evidence to selected data exchanges.
- **Incident review:** check whether a disputed record matches the signed evidence, alongside operational logs.
- **Delegated work:** examine which identity signed an exchange and how its authority was established.

These are proposed uses. My small test did not demonstrate a complete enterprise workflow or prove compliance with a standard.

Deployment choices also matter. JLINC documents a configuration with a self-hosted Core service and a remote Archive service. That could let an organization keep original data in its own environment while placing audit evidence elsewhere. The team would still need to review the metadata it sends and the services it trusts. [Deployment guide](https://docs.jlinc.io/deployments/docker)

The [CloudGo Sovereign AI Lab](https://cloudgo.ai/sovereign-ai-lab/) applies this idea to a business evaluation. CloudGo supplies organizational knowledge and source context, while JLINC adds agreements, authority, and evidence around its use. A team scopes one workflow and reviews the results. That is a possible route for a company evaluation; my developer test used JLINC directly.

## What I tested

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

## What the tests do not establish

The changed-digest test is a useful first result, but its scope is small. I did not change the stored event, delete evidence, or replay a request. Core and Archive ran on the same hosted test service, so I did not test two independently operated services.

Most importantly, I supplied the answer `42` myself. A valid signature on that record does not prove a calculation took place. It protects a recorded claim. The surrounding system still needs a trustworthy way to capture actions and detect missing records.

An accurate audit record also says nothing by itself about whether a model's answer is correct. I would continue to test answer quality, tool behavior, and task completion separately.

I also ran the published `@jlinc/langchain` package, version 0.1.4, against a local HTTP fixture. It confirmed that explicit denial and an authorization HTTP error blocked the tool when no fallback was configured. Real LangChain tool callbacks reached the fixture.

Three behaviors need attention in an application:

- The wrapper reused its last authorization decision without requesting another one when the tool ran again.
- A malformed response containing the string `"false"` selected the allowed tool because that string is truthy in JavaScript. My fixture supplied this response; I did not observe it from the hosted service.
- The tracer logged a write failure and resolved the callback. If evidence is required before an action proceeds, the application needs an explicit completion check and a defined response to failure.

These are findings about the tested SDK behavior, not failures demonstrated in the signing protocol. The [SDK source](https://gitea.jlinc.io/jlinc-labs/jlinc-langchain-js) helps explain them. The 11 local tests include checks for the stricter application guard above.

The pinned SDK dependency tree also had seven npm audit findings on October 29, 2026. A normal dependency update did not resolve them within its constraints. I kept the SDK as a development dependency for the reproduction tests. The live API scripts use only Node's built-in modules.

## What I want to test next

For my own projects, I would start with one synthetic prxps reward record and one Loooom evaluation run. I would also test whether an agent allowed to inspect those results is blocked from changing a reward or publishing a skill. For an enterprise, I would choose one vendor handoff with a named owner, a limited payload, and explicit terms. In each case, I would want to show the denied path as clearly as the successful one.

My next experiment is an explicit synthetic VCA connected to an enforceable tool policy. After that, I want to test stored-event changes, missing records, replay, and archive failure in an isolated local deployment.

I also want to ask the JLINC team how they recommend handling delegation revocation and what a separate verifier needs when it does not control the Core server. Those answers will help me judge where this fits in a real application.
