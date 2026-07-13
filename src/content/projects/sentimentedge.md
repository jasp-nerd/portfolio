---
title: SentimentEdge
tagline: does yesterday's news predict today's price?
description: Full-stack market sentiment dashboard — DistilBERT fine-tuned on financial news, dual-axis sentiment/price charts, and a backtester with three trading strategies.
index: 3
featured: true
status: Public research build
stack:
  [
    Python,
    PyTorch,
    HuggingFace,
    Flask,
    TypeScript,
    React,
    Recharts,
    Finnhub API,
  ]
links:
  github: https://github.com/jasp-nerd/SentimentEdge
specs:
  - { label: Model, value: "DistilBERT · Financial PhraseBank" }
  - { label: Strategies, value: "Threshold · momentum · contrarian" }
  - { label: Pipeline, value: "Live news → scored → backtested" }
  - { label: Demo mode, value: "Runs without API keys" }
---

## The problem

Financial news sentiment is an obvious trading signal — but is it actually predictive?
I wanted to answer that question with a real pipeline instead of a notebook screenshot:
score live news, chart it against price, and backtest whether the signal makes money.

## What I built

A full-stack dashboard. The model side fine-tunes **DistilBERT on the Financial
PhraseBank** for three-way sentiment classification. A Flask backend with APScheduler
pulls live news from the Finnhub API, scores each headline, and stores everything in
SQLite. The React/TypeScript frontend (Vite, Tailwind v4, Recharts) shows dual-axis
sentiment-vs-price charts, a color-coded live news feed, and an accuracy tracker that
asks the honest question: did yesterday's sentiment predict today's move?

A built-in backtester runs three strategies — threshold, momentum and contrarian —
against historical data, and a paste-a-headline analyzer lets anyone poke at the model
directly. Demo mode works without any API keys.

## Outcome

An end-to-end NLP system rather than a model in isolation: fine-tuning, scheduled
ingestion, a typed API and a production-style frontend. The backtests are refreshingly
humbling — which is exactly the point of building the evaluation instead of assuming
the signal works.
