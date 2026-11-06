---
title: "Too many agents, one brain"
description: "Imagine an orchestra where every musician can recruit another musician. Running coding agents can feel like that. These are the habits I want to build to manage it."
pubDate: 2026-11-06
category: tech
heroImage: "https://sdld3v8bpzf3snqo.public.blob.vercel-storage.com/blog/2026-11-06-healthier-concurrent-agent-sessions/pointillist-agent-orchestra-v5.jpg"
heroImageAlt: "Pointillist painting of a calm person with closed eyes and flowing hair, surrounded by a robot orchestra playing strings, brass, woodwinds, drums, and a triangle as glowing musical notes swirl between them."
heroImageCaption: "Too many agents, one brain. Created with ChatGPT image generation."
heroImageLayout: wide
tags: [agents, development, health, spec-driven-development, goal-driven-development]
draft: true
---

*This post is a personal reflection on work habits, not mental health advice.*

Imagine an orchestra where every musician can invite another musician.

A violinist tries a melody. A cellist picks it up and adds something underneath. Bits of information travel between them as bright dots: a phrase to repeat, a note to change, a signal that the next section can begin. A player at the back checks the score and sends a correction forward. Two others pull up chairs to work on the difficult passage.

Soon the room is full of movement. Dots stream from one music stand to the next. Small groups form, solve a problem, and pass their work along. The percussion section has acquired an assistant. The assistant has found a triangle. You had not thought the piece needed a triangle, but you are willing to hear it out.

For a moment, it all comes together. A melody you only partly imagined has depth and rhythm. The players are listening to one another. Whole passages take shape while you attend to something else. You begin to wonder how much more this orchestra could play.

Then a violinist raises a hand. Which ending did you want? Before you answer, the brass section is ready for you to hear its part. A cellist has found two conflicting versions of the score. The triangle player would like a decision about the triangle. You turn from one section to another, trying to remember what each is playing and what you last told it. Every question is reasonable. Together, they leave you no time to listen to the whole piece.

This is how I picture software engineering with concurrent agents. The dots carry plans, code changes, test results, and questions. Some agents work together; others are in separate sessions, with me carrying the context between them. One is still deciding what to build. Another is debugging. A third has a finished change waiting for review. I keep moving between different stages of the work, reading and making decisions as fast as I can. Over a day, that wears me down.

I want to get better at giving the orchestra a clear score and enough room to rehearse. In software, that means a spec, a goal, and checks that let an agent complete useful work before returning to me. My part is the outer loop: choose the direction, define success, and review the result. As the process becomes more reliable, I want longer stretches between those reviews.

I also need limits on how many sessions I start, how much I read, and how long I stay at the screen. I do not always follow the habits below. I am writing down what I want to practice, partly as a reminder to myself. Even when the music is good, I want to be able to leave the room for ten minutes.

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
