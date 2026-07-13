# 003 — Vertical rhythm + em dash sweep

Written against commit `1e3157d`. Status: DONE (implemented in-session).

## Why

Adjacent sections each carry `py-20 sm:py-28`, stacking to ~14rem of empty space —
consistent but visibly hollow between About → Case files → Experience. And the owner
wants zero em dashes in rendered text: `-` for separators/ranges, comma in prose.

## Steps

1. Standardize the section rhythm: in `About.astro`, `Work.astro`,
   `Experience.astro`, `Skills.astro` change section classes
   `py-20 sm:py-28` → `py-14 sm:py-20`; in `Contact.astro` change
   `pt-20 sm:pt-28` → `pt-14 sm:pt-20`. Keep `SectionHead.astro`'s `mb-12 sm:mb-16`
   (consistent already).
2. Em dash sweep, visible strings only (leave code comments alone):
   - `src/content/experience.json`: all `role` and `period` values (`"Mar 2026 —
present"` → `"Mar 2026 - present"`, `"Data Science & AI — Working Student"` →
     `"Data Science & AI - Working Student"`, etc.)
   - Project frontmatter `period` fields in `src/content/projects/*.md`.
   - `SectionHead.astro` (`{index} — {label}`), `Experience.astro`
     (`{data.org} — {data.place}`), `Contact.astro` (`05 — Contact`),
     `[slug].astro` (title + `Case file NN — status`), `404.astro` (both), and
     `site.ts` `title`.
   - Prose bodies in `src/content/projects/*.md`: replace any em dash with a comma
     (none expected; verify with grep).
3. Verify: `grep -rn "—" src/ | grep -v "^\s*//" | grep -vE "\*|/\*"` shows only
   code comments (or nothing).

## Done criteria

- `npm run check` 0 errors, `npm run build` succeeds.
- Rendered HTML contains no em dash: `curl -s localhost:4322/ | grep -c "—"` → 0
  (repeat for one case page and /404).
