---
title: "Claude Voice: an AI agent that talks back"
description: "A small Python voice agent that remembers the thread, streams Claude's reply to the terminal, and speaks it aloud through ElevenLabs — no ffmpeg, just afplay."
pubDate: 2026-06-25
category: tech
draft: false
tags: ["tech", "ai", "claude", "python", "elevenlabs", "tts", "voice", "agent"]
keyword: "Claude voice agent"
---

Text-based AI responses are fine. You read them, they inform you, you move on. But an answer lands differently when it comes through a voice instead of a scroll buffer — the same words, the same logic, delivered through your speakers instead of your eyes.

A week ago I wired up a forty-line proof of concept to test that idea: one prompt in, Claude's answer spoken aloud, done. It worked well enough that I went back and built the real version. It's still small, but now it's a thing you can actually hold a conversation with.

The repo is at [github.com/mager/claude-voice](https://github.com/mager/claude-voice).

---

## What it does now

The original script was single-shot and stateless — every call started from nothing. The current version is a multi-turn agent. You type, Claude answers out loud, and it remembers the thread until you quit. Ask a follow-up and it has the context of everything you said before.

```
You: What should I make for dinner tonight?
Joe: ...
You: something vegetarian
Joe: ...
```

The one-shot mode still exists — pass a prompt as arguments and you get a single spoken answer with no loop:

```bash
./venv/bin/python main.py "Why is the sky blue?"
```

Run it bare and you drop into the conversation loop instead.

---

## Writing for the ear, not the eye

The thing that makes this read naturally is the system prompt. A model that's good at writing for a screen is, by default, bad at writing for speech — it reaches for markdown, bullet lists, numbered steps, and parentheticals that are invisible noise when a voice reads them aloud. So I told it not to:

```python
SYSTEM_PROMPT = (
    "You are a voice assistant. Your replies are spoken aloud, not read on a "
    "screen, so keep them concise and conversational — usually one to three "
    "sentences. Never use markdown, bullet points, code blocks, or symbols that "
    "don't read naturally when spoken aloud. If a question genuinely needs depth, "
    "give the short answer first, then offer to go deeper."
)
```

That last instruction matters more than I expected. Without it, a question like "how does TCP work" turns into a two-minute monologue that you can't skim or skip. With it, you get a sentence, and you decide whether to keep going. Voice has no scroll bar, so the model has to do the pacing for you.

---

## Streaming, then speaking

Two implementation details make it feel responsive instead of laggy.

First, the reply streams to the terminal token by token as Claude generates it, so you're reading the answer before a single byte of audio exists. The full text is captured as it streams and handed off to TTS once it's complete:

```python
def reply(history: list) -> str:
    print("Joe: ", end="", flush=True)
    text = ""
    with client.messages.stream(
        model=MODEL,
        max_tokens=1024,
        system=SYSTEM_PROMPT,
        messages=history,
    ) as stream:
        for delta in stream.text_stream:
            print(delta, end="", flush=True)
            text += delta
    print("\n")
    return text
```

Second, playback uses macOS's built-in `afplay`. The ElevenLabs convert call returns MP3 chunks; I write them to a temp file and hand the path to `afplay`. No `ffmpeg`, no `mpv`, no audio library to compile against — just a subprocess call to something every Mac already has:

```python
def speak(text: str) -> None:
    audio = voice.text_to_speech.convert(
        voice_id=VOICE_ID,
        text=text,
        model_id=TTS_MODEL,
    )
    with tempfile.NamedTemporaryFile(suffix=".mp3", delete=False) as f:
        for chunk in audio:
            if chunk:
                f.write(chunk)
        path = f.name
    try:
        subprocess.run(["afplay", path], check=True)
    finally:
        os.unlink(path)
```

It's a deliberate trade: this is Mac-only as written. On Linux you'd swap `afplay` for `aplay` or `paplay`. I'd rather take that constraint than carry a media dependency for a script this small.

---

## On the voice

The default narrator is **Joe** (`sB7vwSCyX0tQmU24cW2C`). I picked him because he sounds like he could narrate a nature documentary — warm, unhurried, no synthetic edge. That tone is the whole point: a robotic voice makes you notice the synthesis layer and stop listening to the content.

Here's the honest catch. Joe is an ElevenLabs *Voice Library* voice, and the API only serves those on a paid plan. I'm on the free tier. So the code is built around Joe as the default, but the end-to-end demo I actually ran today used **George** (`JBFqnCBsd6RMkjVDRZzb`), a premade voice that works on the free plan, wired in through a `VOICE_ID` override in `.env`:

```bash
# .env
VOICE_ID=JBFqnCBsd6RMkjVDRZzb   # George — premade, works on the free plan
```

So: Joe is the intended voice and the documentary-narrator goal, George is what came out of the speakers while I'm on the free tier. Upgrading the ElevenLabs plan is the only thing standing between the two, and it's a one-line change either way.

---

## The whole thing, end to end

```bash
git clone https://github.com/mager/claude-voice
cd claude-voice
python3 -m venv venv
./venv/bin/pip install -r requirements.txt
cp .env.example .env   # fill in your two API keys
./venv/bin/python main.py
```

Keys load from a gitignored `.env` via `python-dotenv`, so they never touch version control. The model is `claude-opus-4-8`; ElevenLabs runs `eleven_multilingual_v2`. The free tier gives you enough TTS credits to live with it for a while before you decide whether voice is worth a paid plan.

---

The interesting result from the forty-line version held up at this size: voice changes how an AI answer is perceived, and most of the work isn't the audio pipeline — it's teaching the model to talk like a person instead of formatting like a document. The pipeline is a temp file and a subprocess call. The system prompt is the part that took thought.
