// Dock state: running dots on the favourites, and an extra item for every other
// window that is open or minimized (removed again when it closes).
import { gsap } from "gsap";
import { STILL } from "./env";

/** the fixed dock items rendered by Dock.astro */
const favs = () => [...document.querySelectorAll<HTMLElement>(".dock-row:not([data-dock-open]) [data-dock]")].map((b) => b.dataset.dock!);

export function syncDock(row: HTMLElement | null, wins: { id: string; el: HTMLElement; live: boolean }[]) {
  const byId = new Map(wins.map((w) => [w.id, w]));
  document.querySelectorAll<HTMLElement>("[data-dock]").forEach((b) => {
    b.toggleAttribute("data-running", !!byId.get(b.dataset.dock!)?.live);
  });
  if (!row) return;
  const fixed = favs();
  const want = wins.filter((w) => !fixed.includes(w.id) && w.live);
  const have = new Map([...row.querySelectorAll<HTMLElement>("[data-dock]")].map((b) => [b.dataset.dock!, b]));
  have.forEach((b, id) => !want.some((w) => w.id === id) && b.parentElement!.remove());
  for (const w of want) {
    if (have.has(w.id)) continue;
    const title = w.el.dataset.title ?? w.id;
    const li = document.createElement("li");
    const b = document.createElement("button");
    b.type = "button";
    b.className = "dock-item";
    b.dataset.open = w.id;
    b.dataset.dock = w.id;
    b.dataset.running = "";
    b.setAttribute("aria-label", title);
    const icon = w.el.querySelector(".win-title-icon")?.cloneNode(true) as HTMLElement | undefined;
    if (icon) {
      icon.classList.remove("win-title-icon");
      icon.setAttribute("width", "40");
      icon.setAttribute("height", "40");
      icon.style.setProperty("--s", "40px");
      b.append(icon);
    }
    const tip = document.createElement("span");
    tip.className = "dock-tip";
    tip.setAttribute("aria-hidden", "true");
    tip.textContent = title;
    const dot = document.createElement("span");
    dot.className = "dock-dot";
    b.append(tip, dot);
    li.append(b);
    row.append(li);
    if (!STILL.matches) gsap.from(b, { scale: 0.9, opacity: 0, duration: 0.2, ease: "house" });
  }
  document.querySelector(".dock")?.toggleAttribute("data-extra", want.length > 0);
}
