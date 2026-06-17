---
title: "Claude Voice: an AI agent that speaks its responses"
description: "Forty lines of Python, two API keys, and Claude's answers come out of your speakers instead of your screen."
pubDate: 2026-06-17
category: tech
draft: true
tags: ["tech", "ai", "claude", "python", "elevenlabs", "tts", "voice"]
---

Text-based AI responses are fine. You read them, they inform you, you move on. But there's something qualitatively different about an AI that speaks. The same answer — same words, same logic — lands differently when it comes through a voice instead of a terminal.

I wanted to understand that difference without building a lot of infrastructure, so I wired together the Anthropic Python SDK and ElevenLabs TTS to make something minimal: a script that takes a prompt, sends it to Claude, and plays the response aloud. The whole thing is about 40 lines.

The repo is at [github.com/mager/claude-voice](https://github.com/mager/claude-voice).

---

## What it does

The flow is straightforward:

1. Take a prompt from the command line (or stdin if you run it bare).
2. Send it to Claude via the Anthropic SDK.
3. Pass the response text to ElevenLabs TTS.
4. Play the audio. Return the text too, so it's visible in the terminal.

Nothing queued, nothing async, no web server. One function, one request, one voice output.

---

## The code

```python
# main.py
import sys
import anthropic
from elevenlabs import ElevenLabs, play

client = anthropic.Anthropic()
voice = ElevenLabs()

def ask(prompt: str) -> str:
    message = client.messages.create(
        model="claude-opus-4-8",
        max_tokens=1024,
        messages=[{"role": "user", "content": prompt}],
    )
    text = message.content[0].text
    audio = voice.text_to_speech.convert(
        voice_id="JBFqnCBsd6RMkjVDRZzb",  # George
        text=text,
        model_id="eleven_multilingual_v2",
    )
    play(audio)
    return text

if __name__ == "__main__":
    prompt = " ".join(sys.argv[1:]) if len(sys.argv) > 1 else input("Ask: ")
    response = ask(prompt)
    print(f"\n{response}")
```

Dependencies:

```
anthropic
elevenlabs
```

That's it. `pip install anthropic elevenlabs`, set `ANTHROPIC_API_KEY` and `ELEVENLABS_API_KEY` in your environment, and run it:

```bash
python main.py "What's the difference between a coroutine and a thread in Python?"
```

Claude answers. George speaks it. The text prints to the terminal as a fallback.

---

## On the voice choice

The voice ID `JBFqnCBsd6RMkjVDRZzb` is George, one of ElevenLabs' stock voices. The reason to name this explicitly: voice selection is a real design decision. A robotic or over-produced voice makes the same answer feel worse — it draws attention to the synthesis layer and you stop listening to the content. George has a natural cadence without affect. It reads technical explanations clearly without sounding like a commercial.

If you want something different, browse [elevenlabs.io/voice-library](https://elevenlabs.io/voice-library), find a voice you like, copy the voice ID, and swap it in. That one-line change is the whole customization surface for a prototype.

---

## What this is actually useful for

The "agent" feel here comes entirely from the output method, not from tool calls or memory or multi-step reasoning. That's the interesting part. The same Claude API call you've probably made before produces something that feels more like a conversation when the answer comes through a speaker rather than a scroll buffer.

Concrete places this fits:

- **Ambient assistants** — run it in the background, ask questions without looking at a screen.
- **Accessibility tooling** — voice output is the right interface for users who shouldn't have to read from a display.
- **Conversational UI prototyping** — before you build a voice app properly, you can validate whether voice is the right medium in an afternoon.
- **Distraction-free Q&A** — you're working, you have a question, you ask it, you hear the answer without switching windows.

The script as-is is stateless — each call is a fresh context. Adding a conversation loop means threading prior turns into the `messages` array. That's a few more lines when you need it.

---

## Setup

```bash
git clone https://github.com/mager/claude-voice
cd claude-voice
pip install -r requirements.txt
export ANTHROPIC_API_KEY=your_key_here
export ELEVENLABS_API_KEY=your_key_here
python main.py "Tell me something interesting about sound waves."
```

Two API keys, one `pip install`, one script. The ElevenLabs free tier gives you enough credits to prototype without committing to a plan. The Anthropic API runs on pay-as-you-go — at `max_tokens=1024` per call, you're spending fractions of a cent per response.

---

The point of keeping this minimal is that the interesting question — does voice change how an AI answer is perceived? — deserves a quick answer. Build the 40-line version first. If the answer is yes for your use case, you'll know what to build next.
