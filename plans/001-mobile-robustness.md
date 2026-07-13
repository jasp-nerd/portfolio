# 001 — Mobile robustness: kill horizontal scroll, fix footer clipping

Written against commit `1e3157d`. Status: DONE (implemented in-session).

## Why

On iPhone-width viewports the page pans sideways and the footer's second display
line ("SOMETHING") clips at the right edge. Horizontal pan on a portfolio reads as
broken; the clipped heading is the first thing a recruiter sees at the contact step.

## Context the executor needs

- Astro 7 static site, Tailwind CSS v4 (CSS-first config in `src/styles/global.css`,
  no tailwind.config.js). Verify with `npm run check` and `npm run build`.
- `overflow-x: clip` currently sits on `body` in `src/styles/global.css`. The html
  (root) element establishes the horizontal scroll; clipping body alone does not
  prevent root overflow on iOS Safari.
- The footer heading in `src/components/Contact.astro` uses
  `text-[clamp(3rem,11vw,10rem)]` with the `.voice-display` class
  (`font-variation-settings: "wdth" 125` — extra-wide glyphs). At 390px the 3rem
  floor makes "SOMETHING" wider than the viewport minus `px-5` padding.

## Steps

1. In `src/styles/global.css`, move/duplicate the clip to the root:
   `html { overflow-x: clip; }` (keep the body rule). Verify: build, render at
   390×844, check `document.documentElement.scrollWidth <= 390`.
2. In `src/components/Contact.astro`, change the heading size floor:
   `text-[clamp(3rem,11vw,10rem)]` → `text-[clamp(2.3rem,10.5vw,10rem)]`.
   Verify: 390px render shows all three lines ("Let's build" / "something" /
   "real.") fully inside the viewport.

## Out of scope

Do not change the split-line reveal markup, `voice-display` letterforms, or any
desktop sizing above the clamp midpoint.

## Done criteria

- `npm run check` → 0 errors; `npm run build` succeeds.
- Headless render at 390×844: no element wider than the viewport
  (`[...document.querySelectorAll('*')].filter(e => e.getBoundingClientRect().right > 390)`
  returns only intentionally-clipped ancestors, i.e. none after ticker removal).

## Escape hatch

If horizontal overflow persists after step 1, list the offending elements with the
snippet above and report back instead of adding `overflow: hidden` wrappers.
