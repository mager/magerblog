---
title: "Filbert: A real pattern for background coding agents"
description: "Phil Chen's Filbert write-up is interesting because it treats agents as infrastructure: a Slack-facing supervisor, async coding agents, thread-local memory on disk, and a self-improving prompt loop."
pubDate: 2026-04-14
category: tech
keyword: "Filbert"
draft: true
---

I finally read Phil Chen's full Filbert post, and the useful part is not the headline statistic that Filbert wrote over 95% of their PRs last week.

The useful part is the architecture.

Filbert is not presented as one magical general-purpose agent. It is a small system with clear boundaries:

- Slack is the human interface
- a lightweight supervisor manages the thread
- Codex or Claude does the coding work asynchronously
- the thread directory on disk is the memory
- Terraform, secrets, IAM, and self-hosted runners make the environment legible enough for the agent to operate safely

That is a serious pattern.

It is also exactly the direction I think this space is heading.

## The best idea in the post: separate the supervisor from the coding agent

The line that stood out most to me was the architectural decision inspired by OpenClaw: do not build one monolithic agent that does everything.

Instead, Filbert has a supervisor that does coordination work and coding agents that do coding work.

The supervisor:

- reads Slack thread snapshots
- posts status updates
- manages reactions
- watches for follow-up messages in the same thread
- decides whether to dispatch Codex or Claude
- polls status and tails logs while the coding agent runs
- cancels, restarts, or queues follow-up runs if new context arrives mid-flight
- checks machine resources before dispatching expensive work
- prunes stale worktrees and cleans build artifacts

The coding agent does not manage Slack. It gets a prompt file and a worktree, writes output, and exits.

That division is clean.

It keeps prompts small. It makes failures easier to reason about. And it means the coding agent can focus on one thing: producing a patch, notes, and results.

I think this is one of the biggest shifts in agent design right now. The winning systems are not trying to make one giant prompt smart enough to handle everything. They are splitting responsibility into narrow interfaces and passing context through explicit artifacts.

## The thread directory as memory is simple and correct

Filbert's per-thread directory looks like this:

```text
/var/lib/filbert/threads/<thread-hash>/
├── thread.md
├── inbox.md
├── agent-notes.md
├── reaction-state.json
└── runs/
    └── <run-id>/
        ├── stdout.log
        ├── stderr.log
        ├── result.json
        └── agent-prompt.md
```

This is the part I like most.

The thread directory is the memory, not the process.

That means the supervisor can be stateless. A fresh process spins up for a Slack event, reads the thread snapshot, inbox, and notes, does work, writes updated notes, and exits. If the process crashes, nothing important is lost. If a human replies three hours later, the next run only needs to reason about that thread, not restore some giant in-memory session.

That is a much better durability model than pretending a long-running process is the product.

It also keeps the prompt small in a principled way. The system does not need to load the whole world. It only needs the notes and artifacts for one thread.

I think more agent systems should work like this.

## The async dispatch model is the right one for real work

Another thing Filbert gets right is that dispatch is asynchronous.

The supervisor starts Codex or Claude in the background and gets out of the way. While the coding agent works, the supervisor remains available to:

- check status
- tail logs
- read new Slack messages
- update the human
- decide whether a follow-up should cancel and restart the current run
- queue a second run if the new message changes scope

That is a much more realistic model than forcing everything into one synchronous interaction.

Real engineering work is interruptible. Requirements change mid-flight. Humans remember critical details after the first message. A useful agent system has to tolerate that.

Filbert's inbox design does exactly that: follow-up messages in the same Slack thread are appended and processed in order. The human can refine the ask while work is already happening.

That sounds obvious, but it is a real product choice. A lot of agent tooling still assumes the prompt is fixed when execution starts.

In practice, it rarely is.

## Environment awareness is underrated

One subtle but important detail in the post is that the supervisor checks disk usage, memory pressure, and worktree sprawl before dispatching expensive coding agents.

I like that because it treats the agent as part of an operating system, not just a UI.

If you are going to run coding agents continuously, resource hygiene matters:

- stale worktrees accumulate
- build artifacts pile up
- background runs compete for CPU and memory
- careless automation quietly converts machine health into latency and flakiness

Filbert apparently learned this the hard way when he left stale worktrees filling the disk. That is not a failure of model intelligence. That is a systems design problem. And the fix belongs in the supervisor prompt and cleanup workflow.

That is exactly where it should be.

## The self-improvement loop is the most interesting part

The most important section in the whole post is "Hour 5: Self-improvement."

Filbert can read his own prompts because the supervisor prompt and coding-agent prompt live in the repo. When humans told him he was too verbose in Slack, he inspected his supervisor prompt, realized there was no acknowledgment protocol, and opened a PR to fix it. When humans said he was not acknowledging messages fast enough, he updated the instructions again. The same thing happened with the coding-agent prompt: bounded diagnostics, resource hygiene, and the rule about never loading production credentials all grew through this feedback loop.

That loop looks like this:

1. Filbert behaves badly in production
2. a human notices and says so in Slack
3. Filbert reads the prompt that caused the behavior
4. Filbert opens a PR changing the prompt
5. a human reviews and merges it
6. Filbert behaves better next run

That is a real learning surface.

Not learning in the foundation-model sense. Learning in the operational sense.

The system is inspectable. The failure mode is legible. The fix is a sentence or two of English in version control. And the improvement compounds over time because the agent encounters the consequences of its own instructions in real production contexts.

I think this is one of the cleanest arguments for keeping prompts in the repo alongside code and infrastructure. If prompts are part of the system, they should be reviewable, diffable, and patchable by the system's own operators, including the agent itself.

## This only works because the rest of the stack is already mature

Phil is also very clear about something people tend to flatten away: Filbert was built in an afternoon, but only because the underlying environment was already prepared.

That included:

- self-hosted GitHub Actions
- secrets in GCP Secret Manager
- IAM roles in Terraform
- a monorepo containing both infrastructure and product code
- skills for agents to navigate that environment
- service accounts scoped to only the secrets they need
- a stored GitHub token for clone, push, and PR access

That matters.

The lesson is not that you can casually bolt an agent onto a chaotic stack and get magic. The lesson is that once your infrastructure is explicit, codified, and readable, agents become much more capable because they can inspect the same source of truth that humans use.

His point about Terraform is especially good. A proper Terraform setup in a monorepo becomes agent leverage. Filbert can debug his own permissions issues because the permission model is in the repo. He can inspect local, staging, and production differences, understand what is missing, and even run `terraform plan` before opening a PR.

That is not just convenience. That is a huge reduction in guesswork.

## The evaluation loop is hidden inside the workflow

One clever detail is the alternating-provider schedule. They run Codex on some days, Claude on others, across the same recurring tasks.

That accidentally becomes a model eval harness.

They do not need a separate benchmark pipeline to learn something useful. The PR review process itself becomes the evaluation surface. Which model writes better tests? Which one finds real bugs instead of false positives? Which one respects safety rules like not removing exports from contracts?

I like this because it turns normal engineering process into measurement.

That is probably how a lot of practical evals will work. Not a giant academic benchmark, but repeated exposure to the same kinds of tasks inside a reviewable workflow.

## Why this post matters to me

The Filbert post feels important because it is not arguing that one model won.

It is arguing for specialized agents with explicit communication protocols.

The protocol is intentionally plain:

- supervisor writes a prompt file
- coding agent reads the prompt in a worktree
- coding agent writes `result.json` and `agent-notes.md`
- supervisor reads the outputs and talks to the human

That is enough.

If the interface is file-based and the responsibility boundary is clear, you can swap models per task category without rewriting the whole system. That is a much healthier abstraction than coupling your entire product to one agent runtime, one vendor, or one giant opaque session.

That also happens to line up closely with how I think about agent systems in general. The interesting work is not just prompting harder. It is designing interfaces, state boundaries, and feedback loops that let different agents do narrow jobs well.

Filbert makes that concrete.

## My main takeaway

The headline is not "we built an amazing coding agent in one afternoon."

The real headline is closer to this:

Once your infra is explicit and your interfaces are narrow, a background coding agent becomes a pretty normal systems integration project.

That is a big shift.

It means the frontier is moving away from isolated chat interactions and toward operational agent design: supervisors, worktrees, durable thread memory, prompt PRs, resource hygiene, and model swapping behind stable interfaces.

That is where this gets real.

And honestly, I think Filbert is one of the clearest public examples of that pattern so far.
