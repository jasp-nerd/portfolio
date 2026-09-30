---
title: Trip Agent
oneliner: say "a weekend in lisbon for two under €1500" and your bank plans it, books it and pays.
kind: hackathon
year: 2026
when: apr 2026
role: team of four
effort: 24 hours, bunq hackathon 7.0
stat: { value: "7", label: "real banking actions" }
stack: [Claude, FastAPI, React, Playwright, ElevenLabs, bunq API]
links:
  github: https://github.com/jasp-nerd/bunq-hackathon
tier: side
order: 6
---

Trip planning is still eight tabs and a calculator. So at bunq's hackathon we built an agent that lives inside the bank. You type or talk, it asks one question, does its web research where you can see it, and pitches three packages. Say yes and it fires seven real sandbox calls: opens a savings pot, funds it, books the hotel through an actual browser, pays, pings your phone for approval, sets up weekly savings and splits the bill.

What I took home: build the demo path first, make the work visible, and boring beats flashy. We swapped headless search for plain HTML search late at night. It never crashed on stage.
