// The secret mode: 1-bit black and white. Locked in the j menu until the Konami code
// is typed once (remembered per browser); after that the menu item toggles it.
import { gsap } from "gsap";
import { pixelWipe } from "./wipe";
import { STILL } from "./env";

const KEY = "jn-secret";
const CODE = ["ArrowUp", "ArrowUp", "ArrowDown", "ArrowDown", "ArrowLeft", "ArrowRight", "ArrowLeft", "ArrowRight", "b", "a"];

export function initSecret(repaint: () => void) {
  const html = document.documentElement;
  const btn = document.querySelector<HTMLButtonElement>("[data-bit]");
  const label = btn?.querySelector<HTMLElement>("[data-bit-label]");
  const hint = btn?.querySelector<HTMLElement>("[data-bit-hint]");
  const status = document.querySelector<HTMLElement>("[data-bit-status]");
  let unlocked = false;
  try {
    unlocked = localStorage.getItem(KEY) === "1";
  } catch {}

  const sync = () => {
    btn?.setAttribute("aria-disabled", String(!unlocked));
    btn?.toggleAttribute("data-unlocked", unlocked);
    if (unlocked) btn?.setAttribute("aria-pressed", String(html.hasAttribute("data-bit")));
    if (label) label.textContent = unlocked ? "1-bit mode" : "secret mode";
    if (hint) hint.hidden = unlocked;
    if (status) status.textContent = unlocked ? "secret mode, unlocked" : "secret mode, locked";
  };
  const toggle = () => {
    const swap = () => {
      html.toggleAttribute("data-bit");
      repaint();
      sync();
    };
    if (STILL.matches) swap();
    else pixelWipe(swap);
  };

  btn?.addEventListener("click", () => {
    if (unlocked) return toggle();
    if (!STILL.matches) gsap.fromTo(btn, { x: -4 }, { x: 0, duration: 0.4, ease: "elastic.out(1, 0.3)" });
  });

  let pos = 0;
  document.addEventListener("keydown", (e) => {
    pos = e.key === CODE[pos] ? pos + 1 : e.key === CODE[0] ? 1 : 0;
    if (pos < CODE.length) return;
    pos = 0;
    e.stopImmediatePropagation();
    if (!unlocked) {
      unlocked = true;
      try {
        localStorage.setItem(KEY, "1");
      } catch {}
    }
    toggle();
  });
  sync();
  return { typing: () => pos > 0, unlocked: () => unlocked };
}
