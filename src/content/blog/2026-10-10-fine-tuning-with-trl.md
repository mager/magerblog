---
title: "Fine-tuning a small language model with Hugging Face TRL"
description: "A first fine-tuning experiment for software engineers: teach a small model to label issues, compare it with the original, and learn from the mistakes."
pubDate: 2026-10-10
category: tech
tags: [machine-learning, hugging-face, fine-tuning, python, trl]
keyword: "fine-tuning with TRL"
---

After writing about [Jev, TypeSafe's decision model](/blog/2026-09-19-jev-decision-model/), I've been thinking about models whose job is choosing among a few answers. Which queue should receive a ticket? Which tool should an agent call? TypeSafe calls its approach [System One models](https://typesafe.ai/blog/introducing-system-one-models-and-jev): models built for fast, structured decisions that software can use directly.

I wanted to understand the training side of that idea. What happens between downloading a model and teaching it to make a particular kind of decision? Hugging Face's [TRL library](https://huggingface.co/docs/trl/en/index) looked like a good place to start, but its list of training methods introduces a lot of vocabulary at once.

So I built a small experiment: give a model a software issue and ask it to return one JSON label. Train it on examples, then compare it with the original model on issues it did not train on.

Here, a small generative language model acts as a classifier, producing its JSON answer one token at a time. Jev has a specialized architecture and returns probabilities over defined answers. The connection is the application: a narrow decision inside ordinary software. This experiment teaches the basics of adapting and evaluating a model for that job.

The result was more instructive than a perfect demo. The model learned to return valid JSON on all 20 test issues, but chose the right label on only 12. It missed every documentation issue. That gap is the part I most want to understand.

The complete sample project is on GitHub: [mager/trl-issue-triage](https://github.com/mager/trl-issue-triage). It includes the data, pinned dependencies, training and inference scripts, tests, and every prediction from the recorded run. You need a terminal and some Python familiarity; you do not need to implement a neural network.

## What we're trying to build

Imagine maintaining a repository with a steady stream of incoming issues. Before deciding who should handle each one, you want a suggested category:

| Label | Meaning |
| --- | --- |
| `bug` | Existing behavior is broken |
| `feature` | Someone wants new behavior |
| `question` | Someone needs help or an explanation |
| `docs` | Documentation needs a correction or addition |

For an issue such as “Saving my profile returns a 500 error,” the desired answer is:

```json
{"label":"bug"}
```

There is a policy decision hiding in that table. An incorrect code example in the documentation could sound like a bug. For this project, documentation issues always get `docs`. The model needs examples of that distinction, and the evaluator needs the same rule.

The sample only suggests labels in a terminal. It does not connect to GitHub or change real issues. I would want human review before adding that integration, especially given these results.

For a real product, I would first try rules, a stronger model with a clear prompt, or a conventional text classifier. Four-way classification does not inherently require a generative language model. I chose it because the output is small enough to inspect and the mistakes are easy to explain.

Fine-tuning becomes worth investigating when you have a repeated task, consistent examples of the desired behavior, and a reason to adapt a particular model. It adds a dataset and a training pipeline to the things you maintain.

## Where transformers fit

A transformer is a neural-network architecture. Its attention layers let token representations incorporate information from other positions in the input. A token might be a word, part of a word, or punctuation. The decoder-style model in this example predicts the next token from the tokens that came before it. Repeating that operation produces an answer. Hugging Face's [transformer introduction](https://huggingface.co/learn/llm-course/en/chapter1/4) develops those ideas further.

The model's **weights**, also called parameters, are learned numbers that affect those predictions. **Pretraining** learns them from a large dataset. **Fine-tuning** continues training an existing model on a narrower dataset. **Inference** uses the resulting model to generate an answer without updating those weights.

“Transformers” also names a Hugging Face software library. That overlap can make the ecosystem confusing. Here is what each piece does in this project:

| Piece | Its job here |
| --- | --- |
| Hugging Face Hub | Hosts the model files we download |
| Transformers | Loads the tokenizer and model, and generates text |
| Datasets | Turns our examples into a training dataset |
| PyTorch | Runs the tensor operations and computes gradients |
| TRL | Provides the supervised fine-tuning trainer |
| PEFT (parameter-efficient fine-tuning) | Adds the small set of parameters we will train |

We start with [SmolLM2-135M-Instruct](https://huggingface.co/HuggingFaceTB/SmolLM2-135M-Instruct), a small instruction-tuned model. The 135M refers to roughly 135 million parameters. This is an intentionally modest model for a short experiment, with substantial capability limits. Its original weights remain part of the system after training.

## Start with supervised fine-tuning

TRL stands for Transformers Reinforcement Learning, but reinforcement learning is not required to use it. Its [quickstart](https://huggingface.co/docs/trl/en/quickstart) covers several approaches:

| Method | What you provide |
| --- | --- |
| Supervised fine-tuning, or SFT | Inputs paired with desired answers |
| Direct preference optimization, or DPO | Preferred and rejected answers for a prompt |
| Group relative policy optimization, or GRPO | Prompts and rewards for generated answers |

Our labels already tell us what the answer should be, so SFT is the natural starting point. There is no reward model or reinforcement-learning loop in this sample.

During training, the model predicts answer tokens. A **loss** measures how poorly its predictions match the desired tokens. Backpropagation computes gradients, which tell the optimizer how changes to trainable parameters would affect that loss. The optimizer takes a small update, and the process repeats.

This training objective is token prediction, not directly “get the issue label right.” Most tokens in our answers are identical JSON punctuation and the word `label`. That will matter when we look at the results.

## Train a small adapter with LoRA

Updating every weight is called full fine-tuning. This sample uses [LoRA, or low-rank adaptation](https://huggingface.co/docs/peft/main/en/conceptual_guides/lora), which freezes the original weights and learns small matrix updates in selected layers. PEFT implements it, and TRL accepts the configuration:

```python
LoraConfig(
    r=8,
    lora_alpha=16,
    lora_dropout=0.05,
    target_modules="all-linear",
    task_type="CAUSAL_LM",
    bias="none",
)
```

Rank `r` controls the size of the low-rank updates. Alpha affects their scaling, and dropout adds regularization during training. These are starting settings for this experiment, not universal recommendations.

The run reports 2,442,240 trainable parameters, about 1.78% of the model plus adapters. The saved adapter weights occupy about 9.4 MiB. They are useful together with the original model; the adapter alone cannot generate an answer. LoRA reduces the parameters we train, but does not remove the memory needed to load and run the base model.

## Make the examples readable

The project includes 112 short issues authored for the tutorial with AI assistance. They contain no private tickets or scraped repository data. Each row is plain JSON:

```json
{"id":"train-bug-01","text":"Saving my profile returns a 500 error.","label":"bug"}
```

The split is fixed before training:

| Split | Issues | Purpose |
| --- | ---: | --- |
| Training | 80 | Update the adapter weights |
| Validation | 12 | Inspect loss while developing the experiment |
| Test | 20 | Compare the original model and final adapter |

Each split has equal numbers of the four labels. No issue text appears in more than one split. These are distinct authored examples, though they still share the narrow style and assumptions of a teaching dataset. They are not a representative sample of real GitHub issues.

`triage.py` converts the rows into TRL's [conversational prompt/completion format](https://huggingface.co/docs/trl/en/dataset_formats). The prompt contains our labeling instructions and the issue. The completion contains the assistant's desired answer:

```python
{
    "prompt": [
        {"role": "system", "content": SYSTEM},
        {"role": "user", "content": "Saving my profile returns a 500 error."},
    ],
    "completion": [
        {"role": "assistant", "content": '{"label":"bug"}'},
    ],
}
```

The tokenizer's [chat template](https://huggingface.co/docs/transformers/en/chat_templating) converts those messages into the token sequence the model expects, including role boundaries. Training and inference use the same template.

We set `completion_only_loss=True` so the loss is computed on the answer tokens. The issue still supplies context, but the trainer does not reward the model for reproducing the prompt. The script checks the actual training batch to confirm that the prompt is masked and the answer is retained. It also rejects examples that would exceed the configured length instead of silently truncating the answer. See the [SFTTrainer documentation](https://huggingface.co/docs/trl/en/sft_trainer) for those controls.

## Run the experiment

Install [uv](https://docs.astral.sh/uv/getting-started/installation/), then clone the sample repository:

```bash
git clone https://github.com/mager/trl-issue-triage.git
cd trl-issue-triage
uv sync --locked
uv run pytest -q
```

The project selects Python 3.11 and pins its dependencies and model revision. The first model run downloads public weights from Hugging Face. Allow a few GB of disk space for packages and caches. This model does not require an API key or a paid inference service.

First run a two-step check:

```bash
uv run python train.py --max-steps 2 --output outputs/smoke
```

That checks loading, training, and saving. Two steps are not a meaningful quality experiment. Use a separate directory for the full run:

```bash
uv run python train.py --output outputs/triage
```

The main settings are eight epochs, a learning rate of `2e-4` (0.0002), and a maximum sequence length of 256 tokens. The **learning rate** scales the optimizer's updates. An **epoch** is one pass through the training examples. Each batch contains two issues; **gradient accumulation** combines four batches before an optimizer update. On one device, that means eight issues per update and 80 updates for the full run.

The project uses float32 weights and ordinary eager attention. It automatically selects CUDA when available, then Apple's MPS GPU backend, then CPU. You can force CPU training with `--cpu`. The recorded full run used an Apple M4 Pro with 24 GB of unified memory and took about 37 seconds inside the training call, excluding downloads, model loading, and the separate prediction comparison. Other hardware will differ.

One compatibility detail is worth preserving: TRL 1.15.0 failed in its fused loss path during the Mac smoke test. The sample pins **TRL 1.14.0**, which completed the run. The lockfile is part of the example; upgrading it is another experiment to verify.

The output directory contains the adapter, tokenizer, and `run.json` with training history and environment information. Use a fresh output directory for another run so you can compare results.

## Measure the task, not just the loss

Run the same test issues through the original model and the adapter:

```bash
uv run python evaluate.py \
  --adapter outputs/triage \
  --output outputs/comparison.json
```

The evaluator disables the adapter for the baseline, then enables it. Both passes use the same labeling prompt and greedy decoding, with a limit of 32 generated tokens. The test answers never enter the prompts.

There are two separate questions: did the answer obey the JSON contract, and did it choose the right label? Extra prose, extra keys, unknown labels, and malformed JSON fail validation. Invalid answers count as incorrect rather than disappearing from the accuracy denominator.

Here is the recorded result:

| Metric | Original model | With LoRA adapter |
| --- | ---: | ---: |
| Valid JSON matching the schema | 0/20 | 20/20 |
| Correct label across all issues | 0/20 | 12/20 |
| Bug issues correct | 0/5 | 5/5 |
| Feature issues correct | 0/5 | 4/5 |
| Questions correct | 0/5 | 3/5 |
| Documentation issues correct | 0/5 | 0/5 |

The original model tended to answer the issue conversationally instead of classifying it. For example, it responded to the stale-credentials issue with prose about credentials and secrets. Its zero score means it failed this strict output contract under this prompt. It does not prove the model has no ability to recognize bugs.

The adapter consistently produced JSON, but it still failed the policy distinction we defined earlier. Given this held-out issue:

```text
Add a glossary explaining the terminology in the architecture guide.
```

It returned:

```json
{"label":"feature"}
```

Our expected label was `docs`. The answer was easy for software to parse and still wrong.

The final validation log reported roughly 95% token accuracy. That sounds much better than 60% test issue accuracy, but they measure different things on different splits. Predicting the punctuation and shared words in our tiny JSON answers is much easier than choosing the category. Lower loss is a training signal; it is not a substitute for evaluating the application behavior.

The sample's `results/comparison.json` preserves all raw predictions, settings, data hashes, and training history. This is one run with one fixed prompt, not a benchmark. Each test issue moves the score by five percentage points. A stronger prompt, few-shot examples, constrained output, a different model, or a conventional classifier might do better. This experiment does not compare those alternatives.

## Try an issue, then improve the experiment

To run inference with the saved adapter:

```bash
uv run python predict.py \
  --adapter outputs/triage \
  "Saving my profile returns a 500 error."
```

Omit `--adapter` to try the original model. The command validates the response and exits with an error if it cannot use it. Even a valid response is only a suggested label.

My next change would be to the examples and development evaluation. I would collect documentation requests that resemble features, documentation errors that resemble runtime bugs, and questions that describe a failure without enough information to classify it. I would also compare a few-shot prompt before spending more time on training settings.

Those iterations belong on training and validation data. Having inspected these test failures, I should not repeatedly optimize against the same 20 issues and call the resulting score independent evidence. A later final comparison needs a fresh holdout, ideally from the real project and separated by time, with related reports kept together.

For me, this is the useful first set of machine-learning skills: define the behavior, make the data inspectable, preserve a baseline, and measure failures in terms the application cares about. TRL makes the training loop accessible. The engineering work is deciding what that loop should learn and whether the result is useful.
