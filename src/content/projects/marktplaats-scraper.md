---
title: Marktplaats Scraper
tagline: first in line for secondhand deals
description: Real-time monitor for Dutch secondhand marketplace listings matching configurable queries, with formatted Discord notifications and production-ready logging.
index: 12
status: Personal tool
stack: [Python, BeautifulSoup4, Discord webhooks, Heroku]
links:
  github: https://github.com/jasp-nerd/marktplaats-scraper
specs:
  - { label: Queries, value: "Configurable, paginated" }
  - { label: State, value: "Persistent duplicate filtering" }
---

Watches Marktplaats for new listings matching configurable search queries and pushes
formatted Discord notifications. Duplicate filtering, pagination support, Dutch price
formatting, persistent state and production-ready logging — the sibling of the
Kamernet scraper, generalized to any secondhand hunt.
