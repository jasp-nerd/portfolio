---
title: AI Text Detector
tagline: human or machine, 98% sure
description: DistilBERT fine-tuned on ~150k human/AI text pairs for detecting AI-generated text — ~98% validation accuracy, with a Gradio interface and CLI.
index: 7
status: Public
stack: [Python, PyTorch, HuggingFace, DistilBERT, Gradio, scikit-learn]
links:
  github: https://github.com/jasp-nerd/ai-text-detector
specs:
  - { label: Accuracy, value: "~98% validation, 3 epochs" }
  - { label: Dataset, value: "GPT-wiki-intro, ~150k pairs" }
---

Fine-tuned DistilBERT (66M parameters) on the GPT-wiki-intro dataset for binary
classification of AI-generated versus human-written text, reaching ~98% validation
accuracy. Built as part of my AI literacy work at VU Amsterdam, with a Gradio web
interface and CLI for hands-on testing.
