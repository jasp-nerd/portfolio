---
title: Kamernet Monitor
tagline: beating the Amsterdam housing market to the ping
description: Live monitoring service for Amsterdam rental listings. Scrapes Kamernet in real time, pushes rich Discord alerts, and runs as a hosted web app.
index: 4
featured: true
status: Live service
stack: [Python, BeautifulSoup4, Discord webhooks, Docker]
links:
  github: https://github.com/jasp-nerd/kamernet_scraper
  live: https://kamernet.jaspnerd.dev/
specs:
  - { label: Deployment, value: "Self-hosted, kamernet.jaspnerd.dev" }
  - { label: Alerts, value: "Rich Discord embeds" }
  - { label: State, value: "Persistent, no duplicate pings" }
  - { label: Scraping, value: "Rate-limited on purpose" }
---

## The problem

Amsterdam rental listings vanish in hours. By the time you check Kamernet after class,
the room is gone. Winning that race means seeing the listing within minutes of it going
up, and nobody refreshes a search page that often.

## What I built

A monitoring service that checks Kamernet on a configurable interval and pushes a rich
Discord notification the moment a matching listing appears: price, size, furnishing,
landlord details, tenant requirements and photos, batched to fit Discord's embed
limits. Persistent state tracking means you get pinged once per listing, never again
on the next scan. The scraper rate-limits itself on purpose; racing other students is
fine, hammering the site is not.

It started as a script on Heroku and now runs as a hosted service on my own
infrastructure at [kamernet.jaspnerd.dev](https://kamernet.jaspnerd.dev/).

## Outcome

The ping arrives while the listing is minutes old. Friends asked to use it once
apartment-hunting season hit, which pushed the rewrite from a personal script into a
hosted service: per-user config, Docker deployment, a monitored production loop. It
also became my testbed for running real services on my own server instead of a
free-tier platform.
