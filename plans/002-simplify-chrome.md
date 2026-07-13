# 002 — Simplify chrome: remove header, ticker, hero eyebrow + scroll cue

Written against commit `1e3157d`. Status: DONE (implemented in-session).

## Why

Owner verdict: the fixed header adds nothing (and its nav clips on phones), and the
hero stacks four competing elements (eyebrow, name, ticker banner, scroll cue). The
name should carry the hero alone.

## Steps

1. Delete `src/components/Header.astro` and `src/components/Ticker.astro`.
2. Remove their imports/usages from `src/pages/index.astro`,
   `src/pages/projects/[slug].astro`, `src/pages/404.astro`.
3. Remove the `nav` export from `src/lib/site.ts` and the `ticker` export + the
   `.ticker-track` / `@keyframes ticker` CSS block in `src/styles/global.css`.
4. In `src/components/Hero.astro`: delete the eyebrow `<p>` ("Index of shipped
   work…") and the "Scroll for the index" anchor; reduce top padding now that no
   fixed header exists (`pt-28 sm:pt-32` → `pt-14 sm:pt-20`).
5. Case pages and 404 sized their top padding for the header: `pt-32` → `pt-12
sm:pt-16` in `src/pages/projects/[slug].astro` and adjust `404.astro` similarly.
6. Regenerate `public/og.png` from the rebuilt hero (1200×630, reduced-motion,
   deviceScaleFactor 2).

## Out of scope

Keep the skip-link in `src/layouts/Base.astro` (still useful), the footer nav links,
and the case pages' "Back to the index" breadcrumbs — they are now the only
navigation; do not remove them.

## Done criteria

- `grep -rn "Header\|Ticker" src/` returns nothing.
- `npm run check` 0 errors, `npm run build` succeeds, all 7 routes still render.
- Hero name starts near the top on a 390px viewport with no dead band above.
