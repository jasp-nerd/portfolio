---
title: VU AI Assistant
oneliner: a side panel that turns whatever a lecturer is reading into quizzes, rubrics and slides.
kind: browser extension
year: 2026
when: 2025 → now, v4 in progress
role: only developer, idea to production
effort: day job at the VU Education Lab
stat: { value: "16", label: "teaching tools" }
stack: [WXT, React, TypeScript, Hono, Azure]
links:
  live: https://teacher-assistant.vu-edulab.nl
  store: https://chromewebstore.google.com/detail/vu-education-lab-ai-assis/mehgkempbebagedafdmlkojjlmkbcgno
tier: featured
order: 2
---

Point it at an article, a Canvas page, a PDF or a video and it makes teaching material: summaries, quiz banks, flashcards, rubrics, slide outlines. Exports to Word, PowerPoint in the VU template, Canvas, Moodle and Anki. On a Canvas course it reads the whole course first, so the quiz matches what was actually taught.

It runs on the VU's EU Azure setup and never stores page text. I wrote the threat model too, since a university privacy review is its own boss fight.
