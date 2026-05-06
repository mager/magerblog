---
title: "Building a tiny local LLM starter for real projects"
description: "I built a Go Bubble Tea starter for local model servers, used Gemma 4 through llama.cpp, and split the TUI into llocal."
pubDate: 2026-05-06
category: tech
draft: false
tags: [ai, llms, gemma, go, kotsu, local-first]
keyword: "local LLM starter"
heroImage: "https://lh3.googleusercontent.com/pw/AP1GczP6qce3QH-xEz2RlHflHnHoxLFaga-7LDSGn5euIg1uGuenacaoyByX4_j8275vgNQaYPR6UpUvpRe7Dq0Gp9l9SDnMUo-N97oZ8J_64TUBFRhMDMa7JmP1YXdYS21G7qJLw4ijaEHn9aFPJe7v8CpLJA=w2322-h1522-s-no-gm"
---

I wanted a local model I could use on a plane.

That was the excuse. The more useful thing I ended up building was a tiny local LLM starter: a Go TUI that talks to a model server running on my machine.

Then it turned into a real use case. I used Gemma 4 to draft kanji mnemonic data for Kotsu, my Japanese learning app.

The architecture is intentionally boring:

```text
Go Bubble Tea TUI
        |
        v
http://127.0.0.1:8080/v1/chat/completions
        |
        v
llama-server running Gemma
```

That last line is the whole trick.

The TUI does not load weights. It does not know about GGUF, Metal, CUDA, offloading, or which model format I am currently arguing with. It sends chat messages over HTTP and renders the response in a terminal UI.

That means I can swap the backend without rewriting the app:

- llama.cpp with a quantized GGUF
- Transformers with full Hugging Face weights
- vLLM on a rented GPU
- whatever local runtime wins next month

This is the small starter I wish I had reached for first.

By the end of the experiment, the TUI had enough polish that I split it into its own repo: [llocal](https://github.com/mager/llocal). The extra `l` is for localhost.

![](https://lh3.googleusercontent.com/pw/AP1GczNUraSsqez2y8uUb-B87tDMwq-VJOjtdZS8CtyUrenSmKAjgb72J1jTz2aANfBLj3Sof_E_GCF6CtAz9nHBoJ-0lFkWf0G9QdIMONuVYfOtFU6R6lcrL6jEKTWwoc6SV0yj-fdKNu3zta20BWYguPRjqw=w2322-h1522-s-no-gm)

## Why the HTTP boundary matters

My first instinct was to write a script that loaded the model directly. That worked as a sketch, but it immediately pulled the interface into runtime concerns.

Loading a model is its own job. Choosing dtype is its own job. Deciding between full weights, quantized weights, local Metal inference, or a remote GPU is its own job.

The cleaner split is:

```text
inference runtime
        |
        v
local server with an OpenAI-style chat endpoint
        |
        v
apps, scripts, TUIs, preprocessors
```

Once that boundary exists, the client stays simple and the model becomes reusable. Anything that can call HTTP can use the same local server.

That is what made the Kotsu experiment obvious.

## Kotsu as the first real use case

Kotsu already had kanji lesson pages. What I wanted next was a generated "Knack" for each character:

- radical decomposition
- visual mnemonic
- one-sentence click
- pitch accent cue for the primary on reading

The important product decision was not to call the LLM from the live app.

Kotsu should not need a running model server to render a lesson page. The model should preprocess learning data into a file I can inspect, edit, and commit.

So the flow became:

```text
local model server
        |
        v
Kotsu generator script
        |
        v
src/lib/generated/kanji-knacks.json
        |
        v
Svelte lesson page
```

The generated JSON is intentionally strict. If the model sends malformed output, missing fields, or an invalid pitch accent label, it does not silently become course material.

That feels like the right role for AI here: draft structured material, save it as an artifact, review it like content.

## The Gemma lesson

I learned the model-format lesson the slow way.

I downloaded the full Gemma 4 E4B weights from Hugging Face. They loaded, but not comfortably. My Mac could offload enough to make the model technically run, but not enough to make it pleasant for interactive generation.

Then I tried the thing I should have tried first: a GGUF build through `llama.cpp`.

That changed the whole feel of the project.

On my M4 Pro, `llama-server` loaded the quantized model with Metal and started serving requests on `127.0.0.1:8080`. Generation landed around 55 tokens per second, which is the difference between "interesting experiment" and "tool I will actually keep using."

That clarified the tradeoff:

- full safetensors weights are the source-of-truth checkpoint
- quantized GGUF is the practical local runtime

The important part is that the app does not care. The client talks to an HTTP endpoint either way.

## A small llama.cpp rant, shortened to the useful part

The confusing thing for newcomers is that a Google model ends up running through something called `llama-server`.

That sounds wrong until you realize `llama.cpp` is not really "for Llama" anymore. The name is historical. In practice, it has become a strong local inference engine for many GGUF models, including Gemma.

I do not need the runtime to share a logo with the model. I need it to be fast, boring, and replaceable.

For this project, `llama.cpp` solved the hard local-runtime problem in one move:

- quantized weights
- Metal acceleration
- a local server
- an OpenAI-style chat endpoint

That was enough.

## The part that became a product

Once the runtime felt good, the TUI started needing real affordances instead of demo energy.

The useful pass was not glamorous:

- `tokens=auto` by default
- bigger budgets for prompts that look like drafts, itineraries, or code tasks
- a visible warning when the reply hits the token limit
- scrolling for long answers
- keyboard escapes that still work while the model is thinking

That is the difference between a local AI toy and a terminal tool.

The same server also works for the Kotsu generator, which is the broader point. This is not just a chat client. It is a reusable local LLM access pattern.

## The cloud plan got smaller

My first cloud plan was too heavy.

For a one-time preprocessing job, I do not need Vertex, Kubernetes, or a durable public endpoint. I need:

1. a local GGUF path first
2. a temporary GPU only if the full model materially improves output
3. generated JSON I can review and commit
4. the discipline to shut the VM down when I am done

That is it.

If the quantized local path is good enough for drafting, that is the right answer. If not, I can rent a GPU for a short batch run without redesigning the client.

## Where this leaves me

Right now I have:

- a tiny Go Bubble Tea local LLM starter at [github.com/mager/local-llm-quickstart](https://github.com/mager/local-llm-quickstart)
- a standalone TUI at [github.com/mager/llocal](https://github.com/mager/llocal)
- a shared `~/LLM` model/runtime folder
- a Gemma setup that feels interactive locally through GGUF + `llama.cpp`
- a Kotsu generator that writes strict JSON
- a Svelte kanji panel that consumes generated Knacks

What I do not have yet is the part that matters most: reviewed learning material for the full kanji set.

The model can draft mnemonic content and suggest pitch accent cues. It should not be treated as an authority. For Kotsu, AI is a preprocessing tool, not the final editor.

If you want to try the polished TUI:

```bash
git clone https://github.com/mager/llocal.git
cd llocal
go install ./cmd/llocal
```

Start a local server:

```bash
brew install llama.cpp
llama-server \
  -m /path/to/model.gguf \
  --host 127.0.0.1 \
  --port 8080 \
  --ctx-size 8192
```

Then, in another terminal:

```bash
llocal
```

My next step is probably to keep using this local server path for Kotsu preprocessing, and only rent a GPU if I can prove the full model produces meaningfully better artifacts.

That is the part I like. The client does not need to be rewritten when the runtime changes.

Local AI is less magical when you can see the pipes.

It is also more useful.
