---
title: "Too many agents, one brain"
description: "Running agents all day means switching between plans, bugs, reviews, and decisions. I want fewer interruptions, regular breaks, and more room between human reviews."
pubDate: 2026-11-06
category: tech
heroImage: "https://sdld3v8bpzf3snqo.public.blob.vercel-storage.com/blog/2026-11-06-healthier-concurrent-agent-sessions/pointillist-mind-detailed-v4.jpg"
heroImageAlt: "Detailed pointillist painting of a calm human with closed eyes and flowing hair, surrounded by hundreds of small robots passing glowing parts, building structures, and working together along colored currents."
heroImageCaption: "Too many agents, one brain. Created with ChatGPT image generation."
heroImageLayout: wide
tags: [agents, development, health, spec-driven-development, goal-driven-development]
draft: true
---

*This post is a personal reflection on work habits, not mental health advice.*

One agent wants a decision about the architecture. Another needs help with a failing test. A third has finished a feature and wants a review. I switch between them, answering questions, then return to the first thread and try to remember what we decided.

Each thread is at a different stage of development. Planning needs me to think about requirements and tradeoffs. Debugging needs close attention to a specific failure. Reviewing code needs me to check whether the result meets the requirements. Each switch means loading a different problem back into my head.

Doing this all day is stressful. Even a short question can require several minutes of reading before I can answer it well. When the next question arrives before I have finished the last review, the work starts to feel like a queue I can never clear. Over time, that wears me down.

I want a way to use concurrent agents that leaves enough attention for careful decisions, with room for breaks and a clear end to the day. My starting point is a small set of limits: take 10 minutes away from the screen every hour, cap active sessions, and give each agent a clear spec and goal.

I do not always follow these habits. I am writing down what I want to practice, partly as a reminder to myself. Treat this as a routine I am trying to build, with room to adjust as I learn what works.

The longer-term aim is to manage the outer loop: decide what matters, define success, and review the result. As the process becomes more reliable, I want to make that loop wider, with more useful work between interruptions.

## Take a 10-minute break every hour

I suggest a simple schedule: 50 minutes of work, then 10 minutes away from the screen. Set a timer before opening the first session. Take the break when it rings, even if an agent is about to finish.

This is a practical starting point. The UK Health and Safety Executive recommends short, frequent breaks from screen work. It gives five to ten minutes each hour as an example, while noting that the right timing depends on the work. [HSE: work routine and breaks](https://www.hse.gov.uk/msd/dse/work-routine.htm).

Use those 10 minutes to move, get some water, and look at something far away. Step outside or look through a window toward distant buildings or trees. Leave the phone behind. Reading agent output on a smaller screen keeps the same work going.

Andrew Huberman discusses this in [Optimizing Workspace for Productivity, Focus, & Creativity](https://www.hubermanlab.com/episode/optimizing-workspace-for-productivity-focus-and-creativity), in the section starting at 42:15. He suggests about five minutes of relaxed distance viewing after 45 minutes of close visual work. He describes letting the gaze broaden and the eyes relax. I would use this as a break from close focus, without treating it as a promise to improve eyesight. His timing is separate from the 10-minute hourly break I suggest here.

Make the break possible before it starts. Give the agent a clear stopping point. It can finish an agreed task and wait for review. A question can wait too. If a task needs continuous supervision, pause it before you leave.

There is no need to keep every agent busy during a break.

## Put a limit on active sessions

I would start with a limit of two active sessions. That is a workflow choice, not a medical threshold. The useful number depends on how much judgment each task needs.

Count a session as active until its output has been reviewed or the task has been put aside. An agent that has finished coding can still leave substantial work for you.

With two sessions, one might handle a well-defined change while the other investigates a bug. If both need difficult decisions, reduce the limit to one. Put new ideas in a queue instead of opening another chat.

Limit simultaneous decisions too. Two agents waiting on major design choices can demand more attention than several agents running agreed checks. Before starting another session, ask what it will need from you when it returns.

Watch for signs that the limit is too high:

- You repeatedly read the same output without understanding it.
- You cannot explain what each session is trying to achieve.
- Finished changes accumulate faster than you can review them.
- You postpone a break to answer one more question.

When this happens, stop starting work. Finish or pause an existing task first. More sessions are useful only while their results remain manageable.

## Set a daily reading limit

I feel like I am reading three or four times as much as I used to. Some days it feels closer to ten times. I have not measured that increase, but the volume is hard to miss: plans, agent replies, test results, review comments, and code.

At work, I now review close to a thousand pull requests a month. Each one brings more code and more decisions to understand. Add several agent sessions, and there is a lot to keep in my head.

I find myself reading faster and scanning for the parts that matter. That helps me find my way through the text, but I still need to slow down to understand a difficult change. I want to put a limit on how much I ask myself to read in a day.

A rough daily word budget for agent reports is one place to start. Code needs its own allowance: a short diff can take more attention than a long explanation. I have not settled on a useful number yet. I want to choose a limit I can adjust, then stop adding work when I reach it.

I can also ask agents to produce less text. A routine update can state what changed, what needs my decision, and where to find the evidence. Full logs can stay available behind a link. Repeating the whole plan after every step adds more reading without helping me decide.

The budget needs to leave room for careful code review. When I catch myself scanning a diff without understanding it, I want to pause the review and reduce the queue. A short agent summary can help me navigate the work; I still need to inspect the change before approving it.

## Write the spec before starting the agent

Spec driven development gives the agent a stable description of the work. It also gives me a place to return after a break, without rebuilding the requirements from a long chat.

For a small change, the spec can be short. Include the expected behavior, important constraints, acceptance checks, and what is outside the task.

For example, a spec for adding CSV export could say:

```text
Behavior: Export the rows that match the current filters.
Columns: Name, status, and creation date, in that order.
Edge cases: Escape commas, quotes, and newlines in field values.
Empty result: Export the header row with no data rows.
Constraints: Keep existing access rules and avoid new dependencies.
Evidence: Test filtered results, escaping, and empty results.
Out of scope: Saved exports and scheduled delivery.
```

This gives the agent several decisions it can make without asking me. It also makes the eventual review specific: I can compare the result with the agreed behavior.

The spec should match the size of the task. A small fix does not need pages of process. It needs enough clarity to let the agent proceed and let me check its work.

## Give the work a goal and a stopping rule

I use goal driven development here to mean giving the agent an outcome, a way to check it, and limits on its effort. The spec describes the expected behavior. The goal tells the agent what result to reach.

For the same CSV task, the goal could be:

```text
Goal: Prepare a reviewable CSV export change that meets the spec.
Work: Inspect the code, implement the change, and run relevant checks.
Budget: Spend up to 30 minutes on this attempt.
Stop: Finish when the acceptance checks pass, or report a blocker
      when the budget expires or a requirement needs my decision.
Return: A change summary, test results, and unresolved issues.
Boundary: Leave deployment for my review.
```

A time budget limits an attempt; it does not prove the work is complete. Ask the agent to report incomplete checks clearly. If the tool supports execution or spending limits, set those controls as well.

This structure lets the agent handle the inner loop: inspect, change, test, and correct. My outer loop is to choose the task, agree on the constraints, inspect the evidence, and decide what happens next.

## Make the outer loop wider over time

Start with one small change and review it closely. Once that works reliably, let the agent complete a related group of changes before returning. Later, it may be able to implement and verify a complete, bounded feature between reviews.

Wider loops mean longer periods of useful independent work. They still need small, reviewable results. A large diff with a short summary can make the human part harder.

Increase the interval between reviews when the evidence supports it: requirements are understood, checks catch mistakes, and reports make unresolved issues clear. Keep closer review for unfamiliar code or decisions with serious consequences.

If every review reveals the same misunderstanding, improve the spec or the checks before increasing the interval. A longer run will not resolve an unclear goal.

## Reduce interruptions and protect the rest of the day

Check sessions at planned review points. Where the tools allow it, turn off routine progress alerts and keep notifications for blockers or decisions. Read one result at a time. A notification can wait until the current review is finished.

Where practical, group similar decisions: review plans together, then review completed changes. Ask each agent to state the decision it needs, its recommendation, and the relevant evidence. Before switching, record the current state and next action in a short task list. This gives you a place to resume without reading the whole thread again.

Give the workstation some attention too. Support your feet and back, keep your shoulders relaxed, and keep your wrists aligned with your forearms. Change position during the day. OSHA's workstation guidance recommends both a neutral working position and regular changes of position. [OSHA: good working positions](https://www.osha.gov/etools/computer-workstations/positions).

Set a finish time before starting. Leave space for lunch and ordinary movement outside the hourly breaks. A running agent does not need to extend the workday. Before stopping, save each task's state and next action so the next session has a clear starting point.

I want to judge this approach by whether I can review the work carefully and still take the breaks I planned. Writing the rules is easier than following them, and I expect to need reminders. If better specs and wider loops give me time back, I want to leave some of that time free.
