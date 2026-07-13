---
title: VU Education Lab AI Assistant
tagline: turns any webpage into teaching material
description: Chrome extension that turns webpages and PDFs into summaries, quizzes and teaching ideas. Built solo from idea to production, now rolling out to educators across VU Amsterdam.
index: 1
featured: true
status: In production
period: 2025 - present
stack:
  [JavaScript, Chrome Extension, Node.js, Express, Azure, Azure OpenAI, Gemini]
links:
  github: https://github.com/jasp-nerd/VU-Education-Lab-AI-Assistant-for-Teachers
  store: https://chromewebstore.google.com/detail/vu-education-lab-ai-assis/mehgkempbebagedafdmlkojjlmkbcgno
specs:
  - { label: Deployment, value: "Chrome Web Store · v3.2.2" }
  - { label: Rollout, value: "Educators across VU Amsterdam" }
  - { label: Backend, value: "Azure · OAuth · SSE streaming" }
  - { label: Privacy, value: "GDPR compliant, no data stored" }
---

## The problem

Teachers at VU wanted to use generative AI for course prep, but pasting content into a
chat window is slow and ignores the educational framing: which student level, what
kind of quiz, which teaching format. The VU Centre for Teaching and Learning wanted a
tool that meets teachers where they already work.

## What I built

A Chrome extension that works on whatever the teacher is reading. Any webpage or
in-browser PDF becomes raw material for five tools: summaries, quizzes (multiple
choice, true/false, short answer), concept explanations at adjustable levels, teaching
ideas, and custom prompts built on educational templates. It answers in English or
Dutch, matching the language of the source.

I built the full stack solo: the extension itself plus a Node.js/Express backend on
Azure with Google OAuth restricted to vu.nl accounts, SSE streaming for responses,
rate limiting, and dual AI providers (Azure OpenAI and Gemini) behind one interface.

## Outcome

Live on the Chrome Web Store at v3.2.2 and rolling out to educators across the
university. GDPR compliant, stores no user data, runs on Chrome, Brave and Edge. This
project taught me what production means: OAuth flows, quota handling, versioned
releases, and users with deadlines.
