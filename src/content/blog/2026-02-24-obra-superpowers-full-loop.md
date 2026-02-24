---
title: "The Full-Loop Agent: What obra/superpowers Gets Right"
pubDate: "2026-02-24"
description: "Most coding agents stop at the PR. The best ones keep going — specs, implementation, tests, deployment, and monitoring. A deep dive into obra/superpowers and what it takes to build an agent that truly owns the full software lifecycle."
category: "code"
tags: ["AI", "Agents", "Claude Code", "DevOps", "Software Development"]
heroImage: ""
keyword: "obra superpowers full loop agent software development"
draft: true
---

There's a moment every engineer recognizes: the PR is merged, the code is "done," but the feature isn't real until it's running in production and someone has verified it works. That gap — between "merged" and "live" — is where most AI coding assistants tap out.

I came across obra/superpowers recently — a Claude Code skill that attempts to close this gap. It's not just a coding assistant. It's built for the **full loop**.

## The Loop Nobody Closes

Most AI coding tools are syntax generators. You describe a function, they write the code. Maybe they even run the tests. But the actual software development lifecycle looks more like this:

1. **Understand** the problem and constraints
2. **Design** the solution (architecture, APIs, data models)
3. **Implement** the code
4. **Test** it (unit, integration, e2e)
5. **Deploy** it to an environment
6. **Verify** it works in production
7. **Monitor** and iterate

Steps 1-4 are table stakes. Steps 5-7 are where the value is — and where most agents hand the baton back to a human.

obra/superpowers doesn't hand the baton. It keeps running.

## What "Full Loop" Actually Means

When you activate the superpowers plugin in Claude Code, you're not just getting a better autocomplete. You're getting an agent with opinions about the entire delivery pipeline:

### 1. It Writes the Spec First

Before touching code, it generates a `SPEC.md` — user stories, acceptance criteria, edge cases, rollback plan. Not as busywork. As a contract between you and the system.

```markdown
## Feature: Payment Retry Logic
- **Goal**: Reduce failed payment churn by 12%
- **Acceptance Criteria**:
  - [ ] Retry failed payments at 1h, 24h, 72h intervals
  - [ ] Stop retrying after 3 attempts or user cancellation
  - [ ] Log all retry attempts to analytics
- **Rollback**: Feature flag `payment_retry_v2`, default off
```

You review. You approve. *Then* it starts coding.

### 2. It Implements Like a Senior Engineer

Not just "write the function." It:

- Checks existing patterns in the codebase (it reads `CONTRIBUTING.md`, scans similar features)
- Adds the feature flag first (deployability before functionality)
- Writes the happy path, then the error handling
- Leaves TODOs with ticket numbers for known gaps

### 3. It Tests Like It Doesn't Trust Itself

The plugin generates:

- Unit tests for logic branches
- Integration tests for API contracts
- A manual QA checklist for things that can't be automated
- A `TESTING.md` with how to verify in staging

It runs them locally. If something fails, it fixes it. No "here's the code, you figure out the tests."

### 4. It Deploys (Safely)

This is where it gets interesting. The plugin doesn't just say "deploy this." It:

- Creates the PR with a detailed description linking back to the spec
- Waits for CI to pass
- If CI fails, reads the logs, fixes the issue, pushes again
- Once green, comments on the PR with deployment instructions
- Optionally: runs the deploy command itself (if you've granted permissions)

### 5. It Verifies in Production

After deploy:

- Hits health check endpoints
- Verifies feature flags are reading correctly
- Checks error rates in your monitoring (Datadog, Grafana, etc.)
- Reports back: "Deployed at 14:23 UTC. Error rate stable. Feature flag active for 10% of traffic."

### 6. It Stays Awake

The loop doesn't end at deploy. The plugin sets up:

- Alerts for error spikes related to the new code
- A reminder to check metrics in 24 hours
- A rollback command if things go sideways

## The Architecture of Autonomy

Building an agent that does this requires more than a good system prompt. Here's what obra/superpowers actually does under the hood:

### Tool Contracts

The plugin expects certain tools to be available and defines how to use them:

```typescript
// From the SKILL.md — tools the agent can invoke
type DeployTools = {
  createPR: (spec: Spec, branch: string) => Promise<PR>;
  runCI: (pr: PR) => Promise<CIResult>;
  deploy: (env: 'staging' | 'prod', flags: FeatureFlags) => Promise<DeployResult>;
  checkMetrics: (window: '1h' | '24h', service: string) => Promise<Metrics>;
};
```

If your stack doesn't match, the plugin tells you what's missing — and offers to generate the adapter.

### State Machines, Not Scripts

The plugin doesn't follow a linear checklist. It uses state machines:

```
SPEC_REVIEW → IMPLEMENTING → TESTING → DEPLOY_PENDING → DEPLOYED → MONITORING
                    ↓              ↓            ↓
                REVISION      FIX_TESTS    ROLLBACK
```

At each state, it knows what "done" looks like and what to do if something fails.

### Checkpoints and Recovery

If the session dies mid-deploy, you don't start over. The plugin writes checkpoint files:

```json
// .claude/superpowers-state.json
{
  "currentState": "DEPLOY_PENDING",
  "prNumber": 442,
  "branch": "feat/payment-retry",
  "lastAction": "ci_passed",
  "timestamp": "2026-02-24T14:20:00Z"
}
```

Restart Claude Code, and it picks up exactly where it left off.

## Why This Matters

The promise of AI coding assistants was always "write code faster." But writing code was never the bottleneck.

The bottleneck is:
- Context switching between coding and deploying
- Forgetting to add the feature flag
- Not writing tests because you're "just prototyping"
- Deploying on Friday because the change was "small"
- Finding out about production issues from users instead of alerts

obra/superpowers attacks those bottlenecks directly. It's not a faster typist. It's a more reliable engineer.

## What Using It Looks Like

The skill lives in your `.claude/skills/` directory. Once activated, you can prompt:

```
I need to add payment retry logic to the billing service. 
Walk me through the spec, then implement and deploy to staging.
```

It pauses at each gate (spec review, PR approval) and asks for human sign-off. Or, if you trust it:

```
Enable autonomous mode. Deploy to prod once CI passes.
```

(Yes, there's a kill switch. Yes, it requires explicit opt-in.)

## The Deep Dive: Building Your Own Full-Loop Agent

If you're building an agent SDK or thinking about full-loop automation, here are the patterns obra/superpowers gets right:

### 1. Human-in-the-Loop at the Right Moments

Don't ask for approval on every line of code. Do ask before:
- Deploying to production
- Deleting data
- Changing security-critical code
- Costs exceeding a threshold

Define these gates in your skill. Let the user configure their risk tolerance.

### 2. Idempotent Everything

The agent should be able to crash and resume safely. Every action should be:
- Checkable ("did this already run?")
- Repeatable ("run it again, same result")
- Undoable ("roll this back if needed")

### 3. Observability as a First-Class Citizen

The plugin doesn't just deploy code. It teaches Claude Code how to *read* your observability stack — logs, metrics, traces. This is what enables post-deploy verification.

If you're building an agent, give it:
- A query interface for your monitoring tools
- Structured log parsing capabilities
- Alerting hooks it can subscribe to

### 4. The Spec is the Source of Truth

Every action links back to the spec. If a test fails, the error message references the acceptance criterion it violated. If a deploy rolls back, the reason is documented against the original goal.

This isn't just good hygiene. It makes the agent debuggable.

### 5. Progressive Trust

Start with full human oversight. As the agent proves itself on your codebase, grant more autonomy:

```
Level 0: Pause for approval at every gate
Level 1: Auto-merge to staging, pause for prod
Level 2: Auto-deploy to prod with feature flags
Level 3: Full autonomy with rollback capability
```

obra/superpowers implements this as a config flag. Most teams should start at Level 0.

## The Future: Agents That Own Services

This plugin points to something bigger. Not just "AI writes code" but "AI owns services."

Imagine an agent that:
- Monitors its own error rates
- Opens PRs to fix bugs it detects
- Refactors its own code when complexity thresholds are hit
- Writes the runbook for the next engineer (human or AI)

We're not there yet. But closing the loop — from idea to production to monitoring — is the prerequisite.

obra/superpowers is a glimpse of what that looks like.

---

*Building agent tooling or full-loop automation? [I'd love to hear what you're working on](https://x.com/mager).*
