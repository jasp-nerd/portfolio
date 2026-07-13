---
title: VU Education Lab AI Assistant
tagline: turns any webpage into teaching material
description: Chrome extension that transforms webpages and PDFs into summaries, quizzes and teaching ideas for university educators. Production pilot for the VU Centre for Teaching and Learning.
index: 1
featured: true
status: In production
period: 2025 — present
stack:
  [JavaScript, Chrome Extension, Node.js, Express, Azure, Azure OpenAI, Gemini]
links:
  github: https://github.com/jasp-nerd/VU-Education-Lab-AI-Assistant-for-Teachers
  store: https://chromewebstore.google.com/detail/vu-education-lab-ai-assis/mehgkempbebagedafdmlkojjlmkbcgno
specs:
  - { label: Deployment, value: "Chrome Web Store · v3.2.2" }
  - { label: Users, value: "University educators, rolling out" }
  - { label: Providers, value: "Azure OpenAI + Gemini, dual" }
  - { label: Privacy, value: "GDPR compliant, no data stored" }
---

## The problem

University teachers want to use generative AI to prepare course material, but pasting
content into chat interfaces is slow, and most tools ignore the educational framing:
what level are the students, what kind of quiz, what teaching format?

## What I built

A Chrome extension, piloted by the VU Centre for Teaching and Learning, that works
directly on whatever the teacher is reading. Any webpage or in-browser PDF becomes raw
material for five tools: summaries, quizzes (multiple choice, true/false, short answer),
concept explanations at adjustable levels, teaching ideas (lectures, discussions,
activities, assessments), and custom prompts built on educational templates.

The backend is a Node.js/Express service on Azure with **dual-provider AI** — Azure
OpenAI and Google Gemini with seamless switching — behind Google OAuth restricted to
`@vu.nl` accounts. The extension answers in English or Dutch, automatically matching
the language of the source material.

## Outcome

Live on the Chrome Web Store as a production pilot (v3.2.2), rolling out to educators
across the university. GDPR compliant with no data storage, and it runs on Chrome,
Brave and Edge. It is the project that taught me what "production" actually means:
OAuth flows, quota handling, versioned releases and real users with real deadlines.
