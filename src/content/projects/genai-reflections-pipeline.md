---
title: GenAI Reflections Pipeline
tagline: qualitative research, systematized
description: Five-step LLM pipeline analyzing 59 student reflections on GenAI in academic writing — keyword extraction, sentiment, thematic clustering and a full audit trail.
index: 8
status: Research
stack: [Python, Ollama, deepseek-r1, Azure OpenAI, matplotlib, YAML]
links:
  github: https://github.com/jasp-nerd/Analysis-of-Student-Reflections-on-GenAI-in-Academic-Work
specs:
  - { label: Corpus, value: "59 student reflections" }
  - { label: Finding, value: "Source verification = top concern (29%)" }
---

A five-step qualitative research pipeline: keyword extraction, sentiment classification
with confidence scores, analytic memo generation, two-pass LLM thematic clustering, and
audit-trail logging. Found balanced sentiment (37% positive, 36% negative) with source
verification as the dominant student concern. Configurable via YAML across local
(Ollama) and cloud (Azure OpenAI) providers.
