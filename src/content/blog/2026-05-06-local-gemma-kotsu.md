---
title: "Building a tiny local LLM starter for real projects"
description: "I built a Go Bubble Tea starter that talks to any local OpenAI-compatible model server, then used it to wire Gemma 4 into Kotsu as a kanji-learning preprocessing tool."
pubDate: 2026-05-06
category: tech
draft: true
tags: [ai, llms, gemma, go, kotsu, local-first]
keyword: "local LLM starter"
---

I wanted a local model I could use on a plane.

That was the excuse. The more interesting thing I ended up building was a tiny local LLM starter: a Go TUI that talks to any OpenAI-compatible model server running on my machine.

Then it turned into something real: a way to use Gemma 4 to draft new kanji mnemonic data for Kotsu.

The shape is intentionally boring:

```text
Go Bubble Tea TUI
        |
        v
http://127.0.0.1:8000/v1/chat/completions
        |
        v
whatever model server I am running today
```

That last line is the whole trick.

The TUI does not load weights. It does not know about safetensors, GGUF, Metal, CUDA, dtype choices, offloading, or which model format I am currently arguing with. It sends chat messages over HTTP and prints the response in a terminal interface I like.

That means I can swap the backend without rewriting the app:

- Transformers Serve with full Hugging Face weights
- llama.cpp with a quantized GGUF
- vLLM on a rented GPU
- some future local runtime I have not met yet

This is the small starter I wish I had reached for first.

## The starter

The repo lives at:

```text
~/Code/local-llm-quickstart
```

The layout is deliberately plain:

```text
cmd/local-llm/        # Go entrypoint
internal/llm/         # OpenAI-compatible client
internal/tui/         # Bubble Tea interface
scripts/              # optional model/runtime helpers
Makefile
README.md
```

I briefly considered TypeScript, then Go, then Elixir.

Go won for this version because Bubble Tea is good, the HTTP client story is simple, and the end result can become one small binary. Elixir is still extremely tempting for a supervised local control plane someday, but for "talk to localhost from a terminal," Go is the calm move.

The client boundary is tiny. The app sends a normal chat-completion request:

```text
POST /v1/chat/completions
```

and includes:

```json
{
  "model": "local",
  "messages": [
    { "role": "user", "content": "write a small go function" }
  ],
  "max_tokens": 512,
  "temperature": 0.7,
  "stream": false
}
```

That is enough to make the TUI portable across runtimes.

The starter also has the little terminal affordances I want every time:

- `/help`
- `/reset`
- `/save transcript.md`
- `/tokens 256`
- `/temp 0.4`
- `/model`
- `/quit`

It is not a model platform. It is a pocket client.

That distinction matters.

## Why the HTTP boundary matters

My first instinct was to write a Python script that loaded the model directly. That worked as a sketch, but it immediately dragged the interface into model-runtime concerns.

Loading a model is its own job.

Choosing dtype is its own job.

Deciding whether to use full weights, quantized weights, Metal, CUDA, disk offload, vLLM, llama.cpp, or Transformers is its own job.

The TUI does not need any of that in its bloodstream.

The cleaner split is:

```text
inference runtime
        |
        v
local OpenAI-compatible HTTP server
        |
        v
apps, scripts, TUIs, preprocessors
```

Once that boundary exists, the starter becomes useful beyond chat. Anything that can call HTTP can use the same local model.

That is what made the Kotsu experiment obvious.

## Kotsu as the first real use case

Kotsu is my minimalist Japanese learning app. It already has kanji lesson pages with readings, meanings, composition links, and a visual study surface.

![Kotsu kanji lesson view with large black Japanese characters on a paper-white interface](https://lh3.googleusercontent.com/pw/AP1GczM9Pj_lmgagWbw9whqvSL7tCmh7t8SfR2_-fjIjfR3iFsO4s1azcZwUIZC6rXFTVFi7ecVV3gJkOPz6bWKSY8g9RhFi-Lywi5SW2X8Xnt5684OfHjdE7J7UUp4FOe9B8Bq12cxJqgCri8ZSDa-q7uE1gg=w2322-h1522-s-no-gm)

What I wanted next was a generated "Knack" for each kanji:

- radical decomposition
- visual mnemonic
- one-sentence click
- pitch accent cue for the primary on reading

The important product decision: do not call the LLM from the live app.

Kotsu should not need a running model server to render a kanji page. The model should preprocess learning data into a file I can inspect, edit, and commit.

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

The generated JSON shape is intentionally strict:

```json
{
  "kanji": "明",
  "meaning": "bright / light",
  "radicals": ["日", "月"],
  "mnemonic": "Sun on one side, moon on the other. Brightness is what happens when the sky refuses to pick a shift.",
  "the_kotsu": "明 clicks when you stop seeing two boxes and start seeing every light in the sky reporting for duty.",
  "pitch_accent": {
    "reading": "メイ",
    "pattern": "Heiban"
  }
}
```

The script refuses malformed output. If the model sends markdown, missing fields, or an invalid pitch accent label, it does not silently become course material.

In the Svelte app, this becomes a new Kotsu panel on kanji pages when the generated entry exists. If the entry does not exist, the page stays exactly as it was.

That is the right role for AI in this part of the product: draft structured material, save it as an artifact, review it like content.

## The shared local runtime

I keep model files and Python runtime stuff outside the app repos:

```text
~/LLM
  .venv/
  models/
    gemma-4-E4B-it/
```

That gives me one shared local model environment instead of one venv per experiment.

Kotsu gets a convenience command:

```bash
npm run llm:serve
```

which starts the shared server. The generator runs in another terminal:

```bash
npm run knacks:generate -- 明 --tokens 180 --temperature 0.1
```

The starter TUI can point at the same endpoint:

```bash
cd ~/Code/local-llm-quickstart
make run
```

Same server. Different clients.

That is the real win. The starter is not only a chat app. It is a reusable local LLM access pattern.

## The Gemma model-format note

I did still learn the model-format lesson the slow way.

I downloaded the official Hugging Face weights:

```bash
cd ~/LLM
hf download google/gemma-4-E4B-it \
  --local-dir models/gemma-4-E4B-it
```

That produced:

```text
~/LLM/models/gemma-4-E4B-it/model.safetensors
```

About 15 GB on disk.

This is the full developer-friendly checkpoint. It is the version I want for Transformers, reference outputs, future fine-tuning experiments, and serious evaluation.

It is not automatically the version I want for a fast laptop chat loop.

There is also a GGUF build:

```text
ggml-org/gemma-4-E4B-it-GGUF
```

with a Q4 file around 5.34 GB:

```text
gemma-4-E4B-it-Q4_K_M.gguf
```

That is the kind of thing llama.cpp likes. Smaller, quantized, much more likely to feel good locally for text chat.

The safetensors model and the GGUF model are not "real" versus "fake." They are different tools:

- safetensors: source-of-truth checkpoint, Transformers, tuning, evaluation
- GGUF: practical local inference, llama.cpp, airplane mode, less heat

The starter architecture makes that lesson less painful because the app does not care which one I use.

## The full model did load

This part was still exciting.

With the full Gemma 4 E4B weights downloaded, I started the local Transformers server:

```bash
cd ~/Code/kotsu
npm run llm:serve
```

The first request loaded the weights:

```text
[transformers] Loading /Users/mager/LLM/models/gemma-4-E4B-it@main
Loading weights: 100%|██████████| 2076/2076
```

Then came the important warning:

```text
Some parameters are on the meta device because they were offloaded to the disk.
```

Translation: the model loaded, but not comfortably.

I tried generating one Knack for `明`. I lowered the token budget. I lowered temperature. The server received the request, then generation sat long enough that I stopped it.

That is not a failure of the app architecture. It is a runtime finding.

The full-weight local path loads on my Mac, but it is not pleasant for interactive generation when it has to offload to disk. For batch preprocessing, maybe it can run overnight. For chat, I should probably use GGUF locally or move the full model to a GPU box.

The lesson is not "I downloaded the wrong model." The lesson is:

```text
Downloaded successfully does not mean pleasant to run.
Keep the model boundary boring.
Let the runtime be replaceable.
Treat generated learning data as artifacts.
```

## The slimmer cloud version

The first cloud plan I wrote down was too heavy.

For a one-time preprocessing job, I do not need Vertex AI, GKE, a public endpoint, or a polished deployment story. I need a temporary GPU, an SSH tunnel, and the discipline to shut it down.

The slimmer order of operations is:

1. Try the 5.34 GB GGUF locally with llama.cpp.
2. If that is good enough, stop there.
3. If I need the full safetensors model, rent one GPU VM for a short batch run.
4. Generate JSON, review it, commit it, delete the VM.

That is it.

### Step zero: try GGUF locally

The practical local version is:

```text
ggml-org/gemma-4-E4B-it-GGUF
gemma-4-E4B-it-Q4_K_M.gguf
```

It is about 5.34 GB and is designed for llama.cpp-style local inference.

```bash
cd ~/Code/local-llm-quickstart
mkdir -p models
hf download ggml-org/gemma-4-E4B-it-GGUF \
  --include "gemma-4-E4B-it-Q4_K_M.gguf" \
  --local-dir models
```

Install llama.cpp:

```bash
brew install llama.cpp
```

Run the model as a local OpenAI-compatible server:

```bash
llama-server \
  -m ~/Code/local-llm-quickstart/models/gemma-4-E4B-it-Q4_K_M.gguf \
  --host 127.0.0.1 \
  --port 8080 \
  --ctx-size 8192
```

Then point either client at it:

```bash
cd ~/Code/local-llm-quickstart
LOCAL_LLM_ENDPOINT=http://127.0.0.1:8080 \
LOCAL_LLM_MODEL=local \
make run PORT=8080
```

or:

```bash
cd ~/Code/kotsu
KOTSU_LLM_ENDPOINT=http://127.0.0.1:8080 \
KOTSU_LLM_MODEL=local \
npm run knacks:generate -- 明 --tokens 220 --temperature 0.2
```

If that works, the cloud plan can wait.

### If cloud is still needed

The slim GCP version is Compute Engine with a Deep Learning VM image. That avoids most of the driver ceremony because Google's Deep Learning VM images already include GPU-oriented ML tooling, and the GPU image families include NVIDIA driver/CUDA variants.

I would use a G2 machine with one NVIDIA L4 first. It has 24 GB VRAM, which is a reasonable first try for Gemma 4 E4B inference. If it fails on memory, I would stop it and move up, not spend a day tuning flags.

```bash
gcloud config set project YOUR_PROJECT_ID
gcloud services enable compute.googleapis.com

ZONE=us-east4-c
VM=gemma-e4b-once

gcloud compute instances create "$VM" \
  --zone="$ZONE" \
  --machine-type=g2-standard-8 \
  --boot-disk-size=200GB \
  --image-family=pytorch-latest-gpu \
  --image-project=deeplearning-platform-release \
  --maintenance-policy=TERMINATE \
  --provisioning-model=SPOT
```

SSH in:

```bash
gcloud compute ssh "$VM" --zone="$ZONE"
```

On the VM:

```bash
nvidia-smi
python3 -m venv ~/vllm
source ~/vllm/bin/activate
pip install -U pip vllm
export HF_TOKEN=hf_...

vllm serve google/gemma-4-E4B-it \
  --host 127.0.0.1 \
  --port 8000 \
  --dtype bfloat16 \
  --max-model-len 8192
```

Leave that running. From the laptop, create the tunnel:

```bash
gcloud compute ssh "$VM" \
  --zone="$ZONE" \
  -- -L 8000:127.0.0.1:8000
```

Then run Kotsu locally against the cloud GPU:

```bash
cd ~/Code/kotsu
KOTSU_LLM_ENDPOINT=http://127.0.0.1:8000 \
KOTSU_LLM_MODEL=google/gemma-4-E4B-it \
npm run knacks:generate -- --limit 5
```

When done:

```bash
gcloud compute instances delete "$VM" --zone="$ZONE"
```

No public endpoint. No Vertex. No container. No autoscaling. No architecture astronautics.

Just one GPU box, one SSH tunnel, one batch job.

### When Vertex would make sense

Vertex AI would make sense if this became a durable service: recurring generation jobs, team access, IAM, model registry, monitoring, or an endpoint that stays alive. For this experiment, it is more infrastructure than the problem deserves.

## Where this leaves me

Right now I have:

- a tiny Go Bubble Tea local LLM starter
- a shared `~/LLM` model/runtime folder
- the full Gemma 4 E4B IT weights
- a Kotsu generator that writes strict JSON
- a Svelte kanji panel that consumes generated Knacks

What I do not have yet:

- a fast full-weight local generation loop
- reviewed generated Knacks for the whole kanji set
- proof that the pitch accent cues are reliable enough to publish without human review

That last point matters. The model can suggest pitch accent patterns. It should not be treated as an authority. Kotsu can use AI to draft learning material, but I still want review before turning that into educational content.

My next experiment is probably:

1. Try the GGUF path through llama.cpp for local iteration.
2. Try vLLM on a rented GPU for the full safetensors model.
3. Keep the Go starter as the client either way.

That is the part I like. The starter does not need to be rewritten when the runtime changes.

Local AI is less magical when you can see the pipes.

It is also more useful.
