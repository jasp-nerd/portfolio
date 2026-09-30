import { gsap } from "gsap";
import { ScrambleTextPlugin } from "gsap/ScrambleTextPlugin";

gsap.registerPlugin(ScrambleTextPlugin);

// ASCII only: glyphs outside the display font fall back and reflow the line.
export const GLYPHS = "#%&*+=<>/\\|01_-";

/**
 * [data-scramble="decode"]  decodes once when scrolled into view
 * [data-scramble="hover"]   re-scrambles on hover / focus of itself or closest a/button
 * The real text stays in an .sr-only span; the animated copy is aria-hidden.
 */
export function initScramble(root: ParentNode = document, chars = GLYPHS) {
  const mm = gsap.matchMedia();
  mm.add("(prefers-reduced-motion: no-preference)", () => {
    root.querySelectorAll<HTMLElement>("[data-scramble]").forEach((el) => {
      if (el.dataset.scrambleReady) return;
      el.dataset.scrambleReady = "1";
      const text = el.textContent ?? "";
      const sr = document.createElement("span");
      sr.className = "sr-only";
      sr.textContent = text;
      const vis = document.createElement("span");
      vis.setAttribute("aria-hidden", "true");
      vis.textContent = text;
      el.replaceChildren(sr, vis);
      const run = (duration: number) =>
        gsap.to(vis, { duration, scrambleText: { text, chars, speed: 0.6, revealDelay: 0.1 }, ease: "none" });

      if (el.dataset.scramble === "decode") {
        const io = new IntersectionObserver(([e]) => {
          if (!e.isIntersecting) return;
          io.disconnect();
          run(0.8);
        });
        io.observe(el);
      } else {
        const host = el.closest<HTMLElement>("a, button") ?? el;
        let busy = false;
        const go = () => {
          if (busy) return;
          busy = true;
          run(0.45).then(() => (busy = false));
        };
        host.addEventListener("pointerenter", go);
        host.addEventListener("focus", go);
      }
    });
  });
}
