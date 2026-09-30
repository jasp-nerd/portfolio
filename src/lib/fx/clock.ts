import { site } from "../site";

/** [data-clock] shows Amsterdam time; data-clock="seconds" adds seconds. */
export function initClocks(root: ParentNode = document) {
  const els = [...root.querySelectorAll<HTMLElement>("[data-clock]")];
  if (!els.length) return;
  const tick = () => {
    const now = new Date();
    for (const el of els) {
      el.textContent = now
        .toLocaleTimeString("en-GB", {
          timeZone: site.timezone,
          hour: "2-digit",
          minute: "2-digit",
          second: el.dataset.clock === "seconds" ? "2-digit" : undefined,
        })
        .toLowerCase();
    }
  };
  tick();
  setInterval(tick, 1000);
}

/** hours between the visitor and Amsterdam, e.g. "same time as you" / "6h ahead of you" */
export function offsetFromVisitor(): string {
  const now = new Date();
  const ams = new Date(now.toLocaleString("en-US", { timeZone: site.timezone }));
  const diff = Math.round((ams.getTime() - now.getTime()) / 36e5);
  if (diff === 0) return "same time as you";
  return `${Math.abs(diff)}h ${diff > 0 ? "ahead of" : "behind"} you`;
}
