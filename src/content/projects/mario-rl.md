---
title: Mario RL
tagline: two algorithms walk into level 1-1
description: Research project comparing A3C and PPO reinforcement learning agents on Super Mario Bros, with multi-seed experiment runs and automated comparison plots.
index: 6
featured: true
status: Research · team project
stack: [Python, PyTorch, OpenAI Gym, gym-super-mario-bros, matplotlib, pandas]
links:
  github: https://github.com/jasp-nerd/mario-rl
specs:
  - { label: Algorithms, value: "A3C vs PPO, shared CNN" }
  - { label: Environment, value: "Super Mario Bros 1-1" }
  - { label: Method, value: "Multi-seed runs, fixed preprocessing" }
  - { label: Output, value: "Automated comparison plots" }
---

## The problem

A3C and PPO are both standard policy-gradient algorithms, but paper comparisons are
hard to trust: different network architectures, different preprocessing, different
numbers of seeds. We wanted a comparison where the _only_ variable is the algorithm.

## What I built

A research codebase where both agents share the same ActorCritic CNN architecture and
identical environment preprocessing wrappers, differing only in their update rule.
A multi-seed experiment runner handles repeated training runs, and comparison plots
are generated automatically from the logged results — no hand-made charts.

Built as a team project with clear module ownership; the shared interfaces (agent API,
environment wrappers, experiment runner) were designed so everyone could work without
stepping on each other.

## Outcome

A reproducible answer instead of an anecdote: fixed seeds, same architecture, same
preprocessing, plots straight from the data. It taught me experiment design — the
discipline of controlling variables — which turns out to matter more than the
algorithms themselves.
