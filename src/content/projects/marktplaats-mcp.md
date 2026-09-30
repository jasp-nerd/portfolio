---
title: marktplaats-mcp
oneliner: lets claude shop secondhand for you. search listings, vet sellers, compare prices.
kind: mcp server
year: 2026
when: jul 2026 → now
role: solo
effort: side project
stat: { value: "224", label: "installs last month" }
stack: [Python, FastMCP, Docker, Playwright]
links:
  live: https://marktplaats-mcp.jaspnerd.dev
  github: https://github.com/jasp-nerd/marktplaats-mcp
  pypi: https://pypi.org/project/marktplaats-mcp/
tier: featured
order: 4
---

An MCP server for Marktplaats and 2dehands. Your assistant can search, check sellers and compare prices, and with your own login it can message and bid too. There's a hosted read-only endpoint you can paste straight into claude.ai.

It's in the official MCP registry, has install guides for 40 clients and a CI canary that complains when Marktplaats changes their API.
