---
title: Canvas Course Downloader
tagline: your whole degree, one ZIP file
description: Open-source Chrome extension that backs up entire Canvas LMS courses into organized folders. 4,000+ users and outside contributors submitting features.
index: 3
featured: true
status: 4,000+ users
stack: [JavaScript, Chrome APIs, Manifest V3, JSZip]
links:
  github: https://github.com/jasp-nerd/canvas-course-downloader
  store: https://chromewebstore.google.com/detail/canvas-course-downloader/mmnmcnffbkcnhcjiidmdnaclpfeekiol
specs:
  - { label: Users, value: "4,000+ and growing" }
  - { label: Contributors, value: "Active, unsolicited PRs" }
  - { label: Auth, value: "Session cookies, zero setup" }
  - { label: Scope, value: "Any Canvas instance" }
---

## The problem

When a course ends, its Canvas page disappears, and with it the slides, assignments
and readings you paid tuition for. Backing up by hand means clicking through hundreds
of files. The existing tools demanded API tokens most students can't even generate.

I needed local backups and a way to feed course material into AI tools. Nothing good
existed, so I built it for myself.

## What I built

A Chrome extension that archives entire Canvas courses using your existing session
cookies. You pick courses from a term-grouped selector, choose a preset (Full Archive,
Files Only, Text Only or Linked Only), and it walks the course structure, finds files
embedded in assignments, pages, announcements and discussions, and bundles it all into
organized ZIP folders. Incremental mode skips what you already downloaded, grades
export to CSV, and configurable throttling keeps the load on Canvas polite. It runs on
Chrome, Edge, Brave and Firefox, against any Canvas instance including self-hosted ones.

## Outcome

I open-sourced it, put it on the Chrome Web Store, and moved on. Then users found it.
The Canvas data breach in May 2026 pushed a wave of students and teachers looking to
back up their data, and the extension was already there. It now serves **4,000+ users**.
Developers I had never met read the code and submitted pull requests with features I
hadn't considered. Bug reports from r/Canvas taught me how much Canvas setups vary
between universities, and each one made the tool work further beyond my own campus.
