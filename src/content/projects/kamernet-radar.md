---
title: Kamernet Radar
oneliner: real-time rental radar for amsterdam rooms, with llm scoring and alerts to 100+ services.
kind: tool
year: 2026
when: 2025 → now
role: solo
effort: side project
stat: { value: "100+", label: "notification channels" }
stack: [Python, Docker, Apprise, Next.js]
links:
  github: https://github.com/jasp-nerd/kamernet-radar
tier: side
order: 11
---

Rooms in Amsterdam are gone in minutes, so this watches Kamernet, scores every new listing with an LLM against what you're looking for and pings you wherever you are: Discord, Telegram, ntfy, email, WhatsApp. Self-hosted, Docker, optional dashboard. Also available as an MCP server so an agent can search for you.
