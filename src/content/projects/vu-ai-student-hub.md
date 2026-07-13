---
title: VU AI Student Hub
tagline: the study platform my degree was missing
description: Community study platform covering all 35 courses of the BSc AI at VU Amsterdam. 515+ quiz questions, grade calculators, practice problems and an AI course assistant.
index: 2
featured: true
status: Live · community-driven
period: 2025 — present
stack:
  [React 19, Next.js 16, TypeScript, Tailwind CSS 4, OpenRouter, KaTeX, Vercel]
links:
  github: https://github.com/jasp-nerd/vu-ai-hub
  live: https://vu-ai-hub.vercel.app/
specs:
  - { label: Coverage, value: "All 35 courses of the programme" }
  - { label: Content, value: "515+ quiz Qs · 176 problems · 169 resources" }
  - { label: Traction, value: "875 visitors, 3,450+ views in 2 weeks" }
  - { label: Peak, value: "~200 daily visitors in exam week" }
---

## The problem

Every student in my programme rebuilt the same study notes, hunted for old practice
material, and computed by hand what they needed on the exam to pass. Nothing was
shared.

## What I built

A community study platform covering all 35 courses of the BSc AI at VU Amsterdam:
515+ quiz questions with difficulty filters and explanations, 176 practice problems,
169 curated resources, 142 student-contributed study tips, 17 course summaries, and a
grade calculator for every course. An AI course assistant (OpenRouter) answers
course-specific questions, and KaTeX renders the math-heavy subjects properly.

The content lives in typed TypeScript data files. No database, no CMS: contributing
is a copy-paste template and a pull request. Built solo with React 19, Next.js 16,
TypeScript and Tailwind CSS 4.

## Outcome

875 visitors and 3,450+ page views in the first two weeks, a 35% bounce rate, and
around 200 daily visitors during exam week. Students keep contributing content, which
means the site improves without me touching it. That was the design goal.
