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

I suggest 50 minutes of work, then 10 minutes away from the screen. Set a timer. Take the break when it rings, even if an agent is about to finish.

The [HSE recommends short, frequent screen breaks](https://www.hse.gov.uk/msd/dse/work-routine.htm), with five to ten minutes each hour as an example. The right timing depends on the work.

Use those 10 minutes to move, get some water, and look through a window toward distant buildings or trees ([Huberman-style](https://www.hubermanlab.com/episode/optimizing-workspace-for-productivity-focus-and-creativity)). Leave the phone behind. Reading agent output on a smaller screen is cheating during your break.

It is okay if the agents are still in the middle of work when you leave. They can keep working, and their questions can wait until you return. Protect those ten minutes for yourself.

Take a longer break in the middle of the day too. Have lunch away from the screen or go for a walk. If agents help me finish the work in six hours, I want to let that be a six-hour day. I do not need to fill the other two hours with more sessions just to reach eight.

## Put a limit on active sessions

For me, two, three, or four active sessions can be manageable. Five is pushing the limit. I want to treat five as an upper limit, with fewer when the decisions are difficult. Ten, twenty, or more sessions would be far too much to keep in my head.

Count a session as active until its output has been reviewed or the task has been put aside. An agent that has finished coding can still leave substantial work for you.

If I cannot explain what each session is doing, keep rereading output, or postpone a break to answer another question, I have too much going on. New ideas can wait in a queue.

## Keep one main thread per project

I try to keep one main thread coordinating the current work in each project. That is the orchestrator session, where I track the plan and decisions.

I like organizing this work in ChatGPT projects. I can stay in one long thread for a task and build up context as I go. A different task may get another thread, but I try to keep one change active in each project.

Git worktrees give agents separate checkouts, which helps keep file changes apart. I still have to review and combine their work. When I already have several projects going, one change at a time in each is easier to manage.

## Set a daily reading limit

Start by asking agents to write less. Choose a concise output style where the tool offers one, or save a simple instruction:

> Keep routine replies to a few sentences. Tell me what changed, what needs my decision, and where to find the evidence. Expand when the detail matters.

Skills and plugins can help too. [Caveman](https://github.com/JuliusBrussee/caveman/) is one option for shorter agent replies. Another useful instruction is to borrow the principles of [ASD-STE100 Simplified Technical English](https://www.asd-ste100.org/faq.html): short sentences, one topic per sentence, and active voice. I want replies that take less effort to read.

I feel like I read three or four times as much as I used to. Some days it feels closer to ten times. That is an impression, not a measurement. At work, I now review close to a thousand pull requests a month, with agent conversations adding still more text.

I want a daily reading budget, though I have not settled on a number. Code needs its own allowance: a short diff can require close attention. Scanning helps me navigate, but if I am scanning without understanding, it is time to pause the review and reduce the queue.

## Use voice for the long explanations

Voice input lets me explain what I want in ordinary speech, without typing every word. I can get a long thought out faster that way, and it gives my hands a break from the keyboard. Then I can ask the agent to turn it into a short plan and check that it understood me.

Keep water nearby and take pauses. Talking through every task can mean a lot of speaking. [Drink water and rest your voice](https://www.nidcd.nih.gov/health/taking-care-your-voice), especially if it feels tired. The screen break should be a break from dictating to agents too.

## Write the spec before starting the agent

Spend a few rounds on the spec before asking the agent to build. Explain the goal, read its interpretation, and correct what it missed. Agree on the expected behavior, constraints, and what will count as done.

For a CSV export, that might mean exporting only filtered rows, keeping a fixed column order, handling commas and quotes correctly, and testing an empty result. Those decisions can be made before the agent starts coding.

The time spent here can save repeated questions later. Once the agent understands what I want, I can let it work, take a break, or focus on another session. New questions may still arise, but we have already settled the basic direction. A small task needs only a short spec.

## Give the work a goal and a stopping rule

Goal driven development adds an outcome and a stopping rule. For the export task: prepare a reviewable change, run the agreed checks, and return the results. If a requirement is unclear or the time budget runs out, report what remains unfinished.

The agent handles the inner loop: inspect, change, test, and correct. I handle the outer loop: choose the goal, review the evidence, and decide what happens next. A clear goal gives us a shared reason to stop.

## Make the outer loop wider over time

Start with one small change and review it closely. As the process becomes reliable, let the agent complete and verify more work before returning. Keep closer review for unfamiliar code or decisions with serious consequences.

Wider loops still need results I can review carefully. If the same misunderstanding keeps returning, improve the spec or checks first. A longer run will not resolve an unclear goal.

## Reduce interruptions and protect the rest of the day

Check sessions at planned review points. Turn off routine progress alerts where possible. Read one result at a time; a notification can wait until the current review is finished.

Group similar decisions where practical: review plans together, then completed changes. Before switching, save the current state and next action so you can resume without rereading the whole thread.

Set a finish time before starting. I want to judge this approach by whether I can review the work carefully and still take the breaks I planned. If better specs and wider loops give me time back, I want to leave some of that time free.
