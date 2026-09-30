// Input helpers shared by the image effects.

/** closest interactive ancestor that drives the effect (or the root itself) */
export const triggerOf = (root: HTMLElement) =>
  root.closest<HTMLElement>("a, button, [data-fx-trigger]") ?? root;

/** keyboard focus (focus-visible only, so a mouse click does not pin the effect open) */
export function onFocusVisible(el: HTMLElement, cb: (on: boolean) => void) {
  el.addEventListener("focusin", (e) => {
    const t = e.target as Element;
    let visible = true;
    try {
      visible = t.matches(":focus-visible");
    } catch {}
    if (visible) cb(true);
  });
  el.addEventListener("focusout", (e) => {
    if (!el.contains(e.relatedTarget as Node | null)) cb(false);
  });
}
