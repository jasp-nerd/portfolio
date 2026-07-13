---
title: Canvas Course Downloader
tagline: your whole degree, one ZIP file
description: Chrome extension that bulk-downloads Canvas LMS courses into organized folders — no API tokens needed. Public on the Chrome Web Store with 40+ users.
index: 4
featured: true
status: Public · 40+ users
stack: [JavaScript, Chrome APIs, Manifest V3, JSZip]
links:
  github: https://github.com/jasp-nerd/canvas-course-downloader
  store: https://chromewebstore.google.com/detail/canvas-course-downloader/mmnmcnffbkcnhcjiidmdnaclpfeekiol
specs:
  - { label: Auth, value: "Session cookies — zero setup" }
  - { label: Modes, value: "4 presets + custom config" }
  - { label: Scope, value: "Any Canvas instance, multi-course" }
  - { label: Browsers, value: "Chrome · Edge · Brave · Firefox" }
---

## The problem

When a course ends, its Canvas page eventually disappears — with the lecture slides,
assignments and readings you paid tuition for. Downloading it all by hand means
clicking through hundreds of files, and existing tools demand API tokens most
students can't even generate.

## What I built

A Chrome extension that archives entire Canvas courses using nothing but your existing
session cookies. Pick courses from a term-grouped selector, choose a preset — Full
Archive, Files Only, Text Only or Linked Only — and it walks the course structure,
finds embedded files hiding in assignments, pages, announcements and discussions,
and bundles everything into organized ZIP folders with JSZip.

Incremental mode skips previously downloaded files, grades export to CSV, throttling
is configurable so you don't hammer the server, and it works on any Canvas instance
including self-hosted ones, across Chrome, Edge, Brave and Firefox.

## Outcome

Public on the Chrome Web Store with 40+ users and growing — my second shipped
extension, and a lesson in designing for the least technical user: the whole point
was removing the API-token step that every alternative required.
