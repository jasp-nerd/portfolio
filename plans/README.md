# Improvement plans — audit of 1e3157d

Scope: visual/spacing consistency, mobile robustness, design quality (quick audit,
owner-requested focus). Correctness/security/deps not audited this run.

## Findings

| #   | Finding                                                                                                                                        | Category | Impact | Effort | Risk | Evidence                                                                                            |
| --- | ---------------------------------------------------------------------------------------------------------------------------------------------- | -------- | ------ | ------ | ---- | --------------------------------------------------------------------------------------------------- |
| 1   | Page can scroll horizontally on mobile: `overflow-x: clip` sits on `body` only, and the rotated, 105%-scaled ticker overflows the root element | mobile   | M      | S      | low  | `src/styles/global.css` body rule; `src/components/Ticker.astro` `-rotate-1 scale-x-105`            |
| 2   | Footer display line "SOMETHING" clips on ≤390px viewports: `clamp(3rem,11vw,10rem)` floor is too wide for Archivo at `wdth 125`                | mobile   | M      | S      | low  | `src/components/Contact.astro` heading                                                              |
| 3   | Header nav items clip on narrow phones; owner wants the header gone entirely (desktop + mobile)                                                | design   | M      | S      | low  | `src/components/Header.astro`                                                                       |
| 4   | Hero chrome competes with the name: eyebrow line, scroll cue, and the diagonal ticker banner (owner-directed removal)                          | design   | M      | S      | low  | `src/components/Hero.astro`, `src/components/Ticker.astro`                                          |
| 5   | Vertical rhythm too airy and doubles up: every section `py-20 sm:py-28` stacks to ~14rem of empty space between content blocks                 | spacing  | M      | S      | low  | `About/Work/Experience/Skills/Contact.astro` section classes                                        |
| 6   | 15 visible em dashes in UI strings and content data; owner wants `-` (or comma in prose)                                                       | copy     | S      | S      | low  | `experience.json`, `SectionHead.astro`, `[slug].astro`, `404.astro`, `site.ts`, project frontmatter |
| 7   | After header removal, top paddings sized for a fixed header (`pt-28/32` hero, `pt-32` case pages) become dead space                            | spacing  | S      | S      | low  | `Hero.astro`, `pages/projects/[slug].astro`, `404.astro`                                            |
| 8   | `public/og.png` shows the pre-change hero; regenerate after visual edits                                                                       | design   | S      | S      | low  | `public/og.png`                                                                                     |

Considered and rejected:

- Replacing section anchors' `scroll-mt-20` after header removal — harmless either way; not worth a plan.
- Hamburger menu instead of header removal — owner explicitly prefers no header.

## Direction (options, not defects)

- Real product screenshots on case pages: the schematic figures carry the aesthetic, but one annotated screenshot per featured project would substantiate the traction claims. Needs image assets from the owner (M).
- Per-project OG images: `[slug].astro` reuses the site-wide card; Astro can render per-page OGs at build time for better link previews when sharing individual case files (M).

## Plans

| Plan                                                 | Covers         | Status                                                      |
| ---------------------------------------------------- | -------------- | ----------------------------------------------------------- |
| [001-mobile-robustness.md](001-mobile-robustness.md) | #1, #2         | DONE (implemented in-session on owner's direct instruction) |
| [002-simplify-chrome.md](002-simplify-chrome.md)     | #3, #4, #7, #8 | DONE (implemented in-session on owner's direct instruction) |
| [003-rhythm-and-copy.md](003-rhythm-and-copy.md)     | #5, #6         | DONE (implemented in-session on owner's direct instruction) |

Execution order: 002 before 003 (rhythm values depend on which chrome remains). 001 independent.
Verification gates for all plans: `npm run check` (0 errors), `npm run build`, and a
390px-viewport render with `document.documentElement.scrollWidth <= window.innerWidth`.
