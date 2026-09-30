---
title: Otterbende
oneliner: a self-play rl agent for a dutch card game, and a browser version with an otter deck.
kind: research + game
year: 2026
when: aug 2026
role: solo
effort: summer project
stat: { value: "28k", label: "parameters" }
stack: [Python, PyTorch, PPO, Svelte, TypeScript]
links:
  live: https://jasp-nerd.github.io/beverbende/
  github: https://github.com/jasp-nerd/beverbende
tier: side
order: 10
---

A faithful simulator of Beverbende, a PPO agent that learns by playing itself and beats every scripted bot over 40,800 rounds, and a short paper written for people new to ML. One "style" input changes when it knocks, from turn 14 to turn 2.

Then a Svelte game where you play the trained network, with a custom otter deck. The TypeScript engine is tested move for move against the Python one.
