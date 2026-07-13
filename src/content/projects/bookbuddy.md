---
title: BookBuddy
tagline: a librarian that actually knows you
description: Full-stack book platform with AI-powered recommendations — search, organize and review books, then chat with an assistant that knows your collection.
index: 5
featured: true
status: Live demo
stack:
  [
    Python,
    Flask,
    SQLAlchemy,
    React,
    React Query,
    Tailwind CSS,
    Google Books API,
    Gemini,
  ]
links:
  github: https://github.com/jasp-nerd/BookBuddy
  live: https://bookbuddy.jasper-ai.tech/
specs:
  - { label: Backend, value: "Flask + SQLAlchemy + SQLite" }
  - { label: Frontend, value: "React · Router · Query · Tailwind" }
  - { label: AI, value: "Gemini, collection-aware chat" }
  - { label: Data, value: "Google Books API" }
---

## The problem

Book recommendation engines suggest whatever everyone else is reading. I wanted the
opposite: an assistant grounded in _my_ shelves — what I loved, what I rated two stars,
what I keep saying I'll read.

## What I built

A full-stack platform. The Flask/SQLAlchemy backend manages collections against the
Google Books API; the React frontend (React Router, React Query, Tailwind CSS) handles
search, lists — Favorites, Read, Want to Read — and reviews with 1–5 star ratings.

The interesting part is the chat: a Gemini-powered assistant that receives your
collection and ratings as context, so "what should I read next?" gets answered from
your actual taste, not a global bestseller list.

## Outcome

Live demo running at bookbuddy.jasper-ai.tech. As an academic project it was my
deep-dive into proper full-stack architecture — REST design, ORM relationships,
client-side caching with React Query — plus the prompt engineering needed to make an
LLM useful when grounded in structured user data.
