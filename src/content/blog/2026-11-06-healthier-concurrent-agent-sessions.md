---
title: "The human limits of parallel agents"
description: "Practical habits for protecting your attention while your agents work, without becoming their meat proxy."
pubDate: 2026-11-06
category: tech
heroImage: "https://sdld3v8bpzf3snqo.public.blob.vercel-storage.com/blog/2026-11-06-healthier-concurrent-agent-sessions/abstract-agent-orchestra-v7.jpg"
heroImageAlt: "Abstract painting of a fragmented human face and wild hair amid loosely drawn robot musicians, with scratched lines, paint drips, soft blue and pink color, and scattered instruments."
heroImageCaption: "An orchestra of agents. Created with ChatGPT image generation."
heroImageLayout: wide
tags: [agents, development, health, spec-driven-development, goal-driven-development]
draft: false
---

*This post is a personal reflection on work habits, not mental health advice.*

Imagine an orchestra where every musician can invite another musician.

A violinist tries a melody. A cellist adds something underneath. Information travels between them as bright dots: a phrase to repeat, a note to change. A player sends a correction forward. Two others pull up chairs to help.

Dots stream between music stands. Small groups form and pass their work along. The percussion section has acquired an assistant. The assistant has found a triangle. You had not thought the piece needed a triangle, but you are willing to hear it out.

For a moment, it comes together. A melody you only partly imagined has depth and rhythm. Passages take shape while you attend to something else. How much more could this orchestra play?

Then a violinist raises a hand. Which ending did you want? The brass section needs a review. A cellist has found conflicting scores. The triangle player would like a decision about the triangle. You turn between sections, trying to remember your last instructions. Every question is reasonable. Together, they leave no time to listen to the whole piece.

This is how I picture software engineering with parallel agents. Some work together; others need me to carry context between sessions. One is planning, another is debugging, and a third needs a review. Switching between these stages all day wears me down.

I want to give the orchestra a clear score and room to rehearse: a spec, a goal, and checks that let agents work between reviews. I also need limits on sessions, reading, and time at the screen.

I do not always follow these habits. I am writing down what I want to practice. Even when the music is good, I want to leave the room for ten minutes.

## Take a 10-minute break every hour

I suggest 50 minutes of work, then 10 minutes away from the screen. Set a timer. Take the break when it rings, even if an agent is about to finish.

The [HSE recommends short, frequent screen breaks](https://www.hse.gov.uk/msd/dse/work-routine.htm), with five to ten minutes each hour as an example. The right timing depends on the work.

Use those 10 minutes to move, get some water, and look through a window toward distant buildings or trees ([Huberman-style](https://www.hubermanlab.com/episode/optimizing-workspace-for-productivity-focus-and-creativity)). Leave the phone behind. Reading agent output on a smaller screen is cheating during your break.

It is okay if agents are still working when you leave. Their questions can wait. Protect those ten minutes for yourself.

Take a longer midday break for lunch or a walk. If agents help me finish in six hours, I want a six-hour day. I do not need extra sessions just to reach eight.

## Put a limit on active sessions

Two, three, or four active sessions can be manageable for me. Five is pushing the limit. Ten or twenty would be far too much to keep in my head.

Count a session as active until you review its output or put it aside. Finished code still needs your attention.

Losing track of sessions, rereading output, or postponing breaks tells me to stop adding work. New ideas can wait.

## Keep one main thread per project

I like ChatGPT projects, with one main thread coordinating the current task. This orchestrator session holds context and decisions. Another task may get another thread, but I try to keep one change active per project.

Git worktrees keep agents' file changes apart. I still have to review and combine their work. One change at a time per project is easier to manage.

## Set a daily reading limit

Ask agents to write less. Choose a concise output style where available, or save this instruction:

> Keep routine replies to a few sentences. Tell me what changed, what needs my decision, and where to find the evidence. Expand when the detail matters.

[Caveman](https://github.com/JuliusBrussee/caveman/) is one option for shorter replies. The [i-have-adhd skill](https://github.com/ayghri/i-have-adhd) puts the next action first, numbers the steps, and cuts tangents. I also ask for [ASD-STE100 Simplified Technical English](https://www.asd-ste100.org/faq.html): short sentences, one topic per sentence, and active voice.

I feel like I read three or four times as much as before; some days, ten times. That's an impression. I review close to a thousand pull requests a month at work, plus agent conversations.

I want a daily reading budget, though I have not picked a number. Even short diffs need attention. If I scan without understanding, I need to pause and reduce the queue.

## Use voice for the long explanations

Speaking lets me explain a long thought faster and rest my hands. I ask the agent for a short plan to check that it understood me.

I can't recommend [FluidVoice](https://fluidvoice.com/) enough. It's open source, has a lot of useful features, and the team behind it is amazing.

[Keep water nearby and rest your voice](https://www.nidcd.nih.gov/health/taking-care-your-voice). A screen break should be a break from dictating to agents too.

## Write the spec and define the goal

Spend a few rounds on the spec before building. Explain the goal, check the agent's interpretation, and correct it. Agree on expected behavior, constraints, and what counts as done.

For a CSV export, settle which rows and columns to include, how to handle quoted values, and what happens with an empty result.

Goal driven development adds a stopping rule: prepare a reviewable change, run agreed checks, and return the results. If blocked or out of time, report unfinished work.

That can save repeated questions later. With the direction clear, I can take a break or focus on another session while the agent works. A small task needs only a short spec.

## Widen the loop

The agent handles the inner loop: inspect, change, test, and correct. I handle the outer loop: choose the goal, review the evidence, and decide what happens next.

As that becomes reliable, let the agent complete more work between reviews. Keep closer review for unfamiliar code or serious consequences. If the same misunderstanding keeps returning, fix the spec before widening the loop.

## Reduce interruptions and protect the rest of the day

Check sessions at planned review points. Turn off routine progress alerts where possible. Finish one review before answering the next notification.

Review plans together, then completed changes. Save the next action before switching so you can resume without rereading.

Set a finish time. If better specs and wider loops give me time back, I want to leave some of that time free.
