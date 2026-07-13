---
title: Kamernet Scraper
tagline: beating the Amsterdam housing market to the ping
description: Real-time monitor for Amsterdam rental listings with rich Discord notifications — persistent dedup, rate limiting and Heroku deployment.
index: 11
status: Personal tool
stack: [Python, BeautifulSoup4, Discord webhooks, Heroku]
links:
  github: https://github.com/jasp-nerd/kamernet_scraper
specs:
  - { label: Latency, value: "Configurable check intervals" }
  - { label: Output, value: "Rich Discord embeds" }
---

In Amsterdam's rental market, listings are gone in hours. This scraper monitors
Kamernet in real time and sends rich Discord notifications — price, size, furnishing,
landlord and tenant requirements — with persistent state tracking to avoid duplicates,
smart batching for Discord's embed limits, and deliberately polite rate limiting.
