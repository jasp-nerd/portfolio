---
title: JFAM
oneliner: an agent that runs a 22-table italian restaurant for 30 days and doesn't go broke.
kind: hackathon
year: 2026
when: may 2026
role: team of four, I wrote most of it and the eval tooling
effort: 8 hours, prosus × aiso
stat: { value: "4th", label: "of 16 teams" }
stack: [Python, LiteLLM, Claude]
links:
  github: https://github.com/Fan-shiyu/Prosus-Hackathon
tier: side
order: 7
---

Suppliers, menus, prices, staff, marketing, all decided by the agent. We tried an LLM in the live loop. It scored worse than plain rules, so we cut it and had Claude suggest rule changes between runs instead.

Every change needed a mechanism we could name and a signal we could see. The final eval ran on seeds nobody had seen before: 20 out of 20 restaurants survived, zero bankruptcies. Teams with higher peaks went bust.
