---
title: Cookbuddy
oneliner: a voice-first recipe finder. say "something italian under 30 minutes, no mushrooms" and it filters 1,000 recipes.
kind: conversational agent
year: 2026
when: spring 2026
role: team of five, course project
effort: project conversational agents, VU
stat: { value: "94.7%", label: "intent accuracy" }
stack: [BERT, Prolog, MARBEL, Flask, Python]
links:
  github: https://github.com/jasp-nerd/recipe-conversation-agent
tier: featured
order: 5
---

Speech goes to text, a BERT model picks the intent and pulls out the slots (cuisine, ingredients, diet, time, exclusions), a MARBEL dialogue manager keeps the conversation on track and a Prolog database narrows down the recipes as you talk. Fourteen intents, with recovery paths for unclear requests and empty results.

The saved evaluation run scores 94.7% intent accuracy on 2,772 test utterances. Built with Arjun, Omar, Kyan and Skick for the Project Conversational Agents course at VU.
