import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";

const EASE = "cubic-bezier(0.23, 1, 0.32, 1)" as const;
// GSAP-native equivalent of the house curve
const GSAP_EASE = "expo.out";

/**
 * Site-wide motion. Runs only when the inline head script has added
 * `motion-ok` to <html> (JS available + no prefers-reduced-motion).
 * Without it, every element is simply visible — motion is enhancement only.
 */
export function initMotion(): void {
  const root = document.documentElement;
  if (!root.classList.contains("motion-ok")) return;

  gsap.registerPlugin(ScrollTrigger);

  // Smooth scroll, synced to GSAP's ticker (Lenis + ScrollTrigger consensus setup)
  const lenis = new Lenis({ duration: 1.05 });
  lenis.on("scroll", ScrollTrigger.update);
  gsap.ticker.add((time) => lenis.raf(time * 1000));
  gsap.ticker.lagSmoothing(0);

  // Anchor links scroll through Lenis so they inherit the same easing
  document
    .querySelectorAll<HTMLAnchorElement>('a[href^="/#"], a[href^="#"]')
    .forEach((a) => {
      a.addEventListener("click", (e) => {
        const hash = a.getAttribute("href")?.replace(/^\//, "");
        if (!hash?.startsWith("#")) return;
        const target = document.querySelector(hash);
        if (!target) return;
        e.preventDefault();
        lenis.scrollTo(target as HTMLElement, { offset: -12 });
      });
    });

  // Split-line reveals: headings marked data-split (lines pre-wrapped in CSS-hidden masks)
  document.querySelectorAll<HTMLElement>("[data-split]").forEach((el) => {
    const inners = el.querySelectorAll(".split-inner");
    if (!inners.length) return;
    gsap.to(inners, {
      y: 0,
      duration: 0.9,
      ease: GSAP_EASE,
      stagger: 0.07,
      scrollTrigger:
        el.dataset.split === "load"
          ? undefined
          : { trigger: el, start: "top 92%", once: true },
      delay: el.dataset.split === "load" ? 0.05 : 0,
    });
  });

  // Generic reveals — grouped elements stagger together
  const groups = new Map<string | Element, HTMLElement[]>();
  document.querySelectorAll<HTMLElement>("[data-reveal]").forEach((el) => {
    const key = el.dataset.revealGroup ?? el;
    const list = groups.get(key) ?? [];
    list.push(el);
    groups.set(key, list);
  });

  groups.forEach((els) => {
    gsap.to(els, {
      opacity: 1,
      y: 0,
      duration: 0.75,
      ease: GSAP_EASE,
      stagger: 0.06,
      scrollTrigger: { trigger: els[0], start: "top 92%", once: true },
    });
  });

  // Fonts settle layout after init — recompute trigger positions
  document.fonts?.ready.then(() => ScrollTrigger.refresh());

  // Safety net (own CLAUDE.md rule: content must never stay invisible).
  // If a trigger sits inside the viewport but never fired — scroll
  // restoration quirks, headless renders, a refresh miss — play it.
  window.setTimeout(() => {
    ScrollTrigger.getAll().forEach((st) => {
      const el = st.trigger as HTMLElement | null;
      if (
        st.progress === 0 &&
        el &&
        el.getBoundingClientRect().top < window.innerHeight
      ) {
        st.animation?.play();
      }
    });
  }, 3000);
}

export { EASE };
