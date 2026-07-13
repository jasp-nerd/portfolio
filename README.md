# jaspnerd.dev

Personal portfolio of **Jasper Meijerink**, AI student at VU Amsterdam.
Live at [jaspnerd.dev](https://jaspnerd.dev).

![Portfolio hero](public/og.png)

## Stack

- [Astro 7](https://astro.build): static output, zero-JS baseline, content collections
- [Tailwind CSS v4](https://tailwindcss.com): CSS-first config (`@theme`, no config file)
- [GSAP](https://gsap.com) + ScrollTrigger: scroll choreography
- [Lenis](https://lenis.darkroom.engineering): smooth scrolling
- Self-hosted fonts via [Fontsource](https://fontsource.org): Archivo (variable width),
  Instrument Serif, Spline Sans Mono

## Design notes

The site reads as an index of shipped work. The homepage uses a dark "lab index"
treatment: mono spec labels, case-file numbering, real traction numbers. Featured
projects open light, paper-themed case-study pages styled like lab reports.

Motion follows [Emil Kowalski's](https://emilkowal.ski) design-engineering rules:
strong ease-out curves, sub-300ms micro-interactions, transform/opacity only, and
full `prefers-reduced-motion` support. The site stays readable with JavaScript
disabled.

## Development

```sh
npm install
npm run dev      # dev server
npm run check    # astro type check
npm run build    # static build to dist/
```

## Deployment

Pushes to `main` run CI (check + build) in GitHub Actions, then trigger a
[Coolify](https://coolify.io) deployment on a Hetzner VPS via webhook. Coolify
builds the site and serves `dist/` behind Traefik with automatic HTTPS.
