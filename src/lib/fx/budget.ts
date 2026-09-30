// Lazy init + WebGL context budget for all fx on a page, plus the global watchers
// (theme attributes, colour scheme, reduced motion, tab visibility, DPR changes).
//
// - An effect gets a context when its root comes within 200px of the viewport.
// - At most MAX_LIVE contexts exist. When a new one is needed, the live effects that are no
//   longer near the viewport are released farthest-first (WEBGL_lose_context, canvas removed,
//   the plain <img> shows). They are rebuilt when they come back into range.

import type { GlEffect } from "./effect";

const MAX_LIVE = 12;
const all = new Map<Element, GlEffect>();
let io: IntersectionObserver | null = null;
let watching = false;

export function register(fx: GlEffect) {
  if (all.has(fx.root)) return;
  all.set(fx.root, fx);
  io ??= new IntersectionObserver(onIntersect, { rootMargin: "200px" });
  io.observe(fx.root);
  watch();
}

/** number of effects currently holding a context (handy when debugging a page) */
export const liveCount = () => [...all.values()].filter((f) => f.live).length;

function onIntersect(entries: IntersectionObserverEntry[]) {
  for (const e of entries) {
    const fx = all.get(e.target);
    if (!fx) continue;
    fx.near = e.isIntersecting;
    if (fx.near) acquire(fx);
  }
}

function distance(el: Element) {
  const r = el.getBoundingClientRect();
  const dy = r.bottom < 0 ? -r.bottom : r.top > innerHeight ? r.top - innerHeight : 0;
  const dx = r.right < 0 ? -r.right : r.left > innerWidth ? r.left - innerWidth : 0;
  return Math.hypot(dx, dy);
}

function prune() {
  for (const [el, fx] of all) {
    if (el.isConnected) continue;
    fx.teardown();
    io?.unobserve(el);
    all.delete(el);
  }
}

function acquire(fx: GlEffect) {
  if (fx.live || fx.disabled || !fx.allowed()) return;
  prune();
  let n = liveCount();
  if (n >= MAX_LIVE) {
    const spare = [...all.values()]
      .filter((f) => f.live && !f.near)
      .sort((a, b) => distance(b.root) - distance(a.root));
    for (const f of spare) {
      if (n < MAX_LIVE) break;
      f.teardown();
      n--;
    }
    if (n >= MAX_LIVE) return; // everything live is on screen: this one stays a plain image
  }
  void fx.setup();
}

function each(fn: (fx: GlEffect) => void) {
  for (const fx of all.values()) fn(fx);
}

/** classes that libraries toggle on <html> all the time (Lenis while scrolling) are not a theme change */
const noisy = (cls: string | null) =>
  (cls ?? "")
    .split(/\s+/)
    .filter((c) => c && !c.startsWith("lenis"))
    .sort()
    .join(" ");

function watch() {
  if (watching) return;
  watching = true;

  let queued = 0;
  const refresh = () => {
    if (queued) return;
    queued = requestAnimationFrame(() => {
      queued = 0;
      each((fx) => fx.refresh());
    });
  };
  const mo = new MutationObserver((records) => {
    const real = records.some(
      (r) =>
        r.attributeName !== "class" ||
        noisy(r.oldValue) !== noisy((r.target as Element).getAttribute("class")),
    );
    if (real) refresh();
  });
  const opts = { attributes: true, attributeOldValue: true };
  mo.observe(document.documentElement, opts);
  if (document.body) mo.observe(document.body, opts);
  matchMedia("(prefers-color-scheme: dark)").addEventListener("change", refresh);
  document.addEventListener("fx:refresh", refresh);
  // effects near the top can init before late stylesheets land (dev CSS injection): re-read once
  if (document.readyState !== "complete") addEventListener("load", refresh, { once: true });

  matchMedia("(prefers-reduced-motion: reduce)").addEventListener("change", () =>
    each((fx) => {
      if (!fx.allowed()) fx.teardown();
      else if (fx.near) acquire(fx);
      fx.wake();
    }),
  );
  document.addEventListener("visibilitychange", () => each((fx) => fx.wake()));

  const dpr = () =>
    matchMedia(`(resolution: ${window.devicePixelRatio}dppx)`).addEventListener(
      "change",
      () => {
        each((fx) => fx.resize());
        dpr();
      },
      { once: true },
    );
  dpr();

  // Astro ClientRouter (if a version enables it): the old page's effects go away with it
  document.addEventListener("astro:before-swap", () => {
    each((fx) => fx.teardown());
    for (const el of all.keys()) io?.unobserve(el);
    all.clear();
  });
}
