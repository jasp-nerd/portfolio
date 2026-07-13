---
title: Mario RL
tagline: two algorithms walk into level 1-1
description: Research project comparing A3C and PPO reinforcement learning agents on Super Mario Bros, with multi-seed experiment runs and automated comparison plots.
index: 5
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

A3C and PPO are both standard policy-gradient algorithms, and published comparisons
between them are hard to trust: different network architectures, different
preprocessing, different seed counts. We wanted a comparison where the only variable
is the algorithm.

## What I built

A research codebase where both agents share one ActorCritic CNN architecture and
identical environment preprocessing wrappers, differing only in their update rule. A
multi-seed experiment runner handles repeated training, and comparison plots generate
straight from the logged results.

We built it as a team with clear module ownership. I designed the shared interfaces
(agent API, environment wrappers, experiment runner) so four people could work in
parallel without merge fights.

## Outcome

A reproducible answer instead of an anecdote: fixed seeds, same architecture, same
preprocessing, plots from the data. The project taught me experiment design, and that
controlling variables matters more than the algorithms themselves.
