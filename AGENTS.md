# Portfolio — jaspnerd.dev

Personal portfolio of Jasper Meijerink (AI student, Amsterdam). Static Astro site,
deployed via Coolify on a Hetzner VPS. Public repo: `jasp-nerd/portfolio`.

## Commands

```
npm run dev        # dev server (or: astro dev --background, manage with astro dev stop/status/logs)
npm run check      # astro check — MUST pass before claiming any task done
npm run build      # static build to dist/ — MUST pass before commit
npm run preview    # serve the built site locally
npm run format     # prettier
```

## Hard version facts (do not regress to older training data)

- **Astro 7** (static output). Content in Content Collections (`src/content.config.ts`, collections defined with `defineCollection` + `glob()` loader).
- **Tailwind CSS v4 — CSS-first.** There is NO `tailwind.config.js` and there must never be one.
  No `@tailwind base/components/utilities` directives, no PostCSS setup.
  Config lives in `src/styles/global.css`: `@import "tailwindcss";` + design tokens in `@theme { ... }`.
  Failures from v3 patterns are silent (build passes, styles don't apply) — check rendered output.
- **GSAP 3.15** — ScrollTrigger and SplitText are free and imported from the main `gsap` package
  (`gsap/ScrollTrigger`, `gsap/SplitText`). No club/bonus files.
- **Lenis 1.3** for smooth scroll (`import Lenis from 'lenis'`), synced to `gsap.ticker`.

## Structure rules

- One page section = one component: `src/components/<Section>.astro`. No giant files (>250 lines → split).
- Content is data: projects/experience live in `src/content/` with typed schemas — never hardcode
  project copy inside components.
- Site-wide constants (name, email, social links) in `src/lib/site.ts`.
- Scripts belong inside the component's `<script>` tag (Astro bundles them); shared motion helpers
  in `src/lib/`.
- No new dependencies without explicit approval — the stack is deliberately pinned and boring.

## Animation rules (Emil Kowalski house rules — see .claude/skills/emil-design-eng)

- One engine: GSAP + ScrollTrigger. CSS transitions for micro-interactions. Never mix in other libs.
- `ease-out` for enter/exit (house curve: `cubic-bezier(0.23, 1, 0.32, 1)`); never `ease-in` on UI.
- UI micro-interactions < 300ms; hero/scroll reveals ≤ ~800ms; stagger 30–80ms; exits faster than enters.
- Never animate from `scale(0)`; enter from `scale(0.95)`–`0.98` + opacity. Animate only `transform`/`opacity`.
- Every scroll/entrance effect guarded by `prefers-reduced-motion` (fallback: content simply visible;
  never leave content stuck at opacity 0 when JS or motion is unavailable).
- Hover effects gated behind `@media (hover: hover) and (pointer: fine)`.

## Accessibility & quality bar

- Semantic HTML (header/nav/main/section/footer, one h1), alt text on all images, keyboard-navigable,
  visible focus states, WCAG AA contrast.
- The site must be fully readable with JavaScript disabled (animations are enhancement only).
- Self-hosted fonts via @fontsource — no external CDNs of any kind.

## Deployment

- Push to `main` → GitHub Actions runs `astro check` + `astro build` → on success triggers the
  Coolify deploy webhook (secrets `COOLIFY_WEBHOOK`, `COOLIFY_TOKEN`). Coolify builds on-server
  (nixpacks, static, publish dir `/dist`) and serves at https://jaspnerd.dev behind Traefik + Let's Encrypt.

## Documentation

Full docs: https://docs.astro.build — consult before: [routing](https://docs.astro.build/en/guides/routing/),
[components](https://docs.astro.build/en/basics/astro-components/),
[content collections](https://docs.astro.build/en/guides/content-collections/),
[styling/Tailwind](https://docs.astro.build/en/guides/styling/).
