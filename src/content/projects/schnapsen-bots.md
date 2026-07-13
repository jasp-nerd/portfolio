---
title: Schnapsen Bot Strategies
tagline: aggression vs patience, 1,000 games at a time
description: Two rule-based agents for the card game Schnapsen — one aggressive, one conservative — benchmarked over 1,000-game tournaments with fixed seeds.
index: 9
status: Coursework
stack: [Python, game theory, statistics]
links:
  github: https://github.com/jasp-nerd/schnapsen
specs:
  - { label: Benchmark, value: "1,000-game tournaments" }
  - { label: Baselines, value: "RandBot · RdeepBot" }
---

Extended the Intelligent Systems course framework with two rule-based agents:
RiskTakingBot (plays high-value cards, trump exchanges and marriages early) and
LaidBackBot (conserves high cards, minimizes point loss). Benchmarked against RandBot
and RdeepBot baselines over reproducible 1,000-game tournaments with fixed seeds.
