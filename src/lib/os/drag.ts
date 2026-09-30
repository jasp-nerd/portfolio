// Dragging: windows by their title bar on desktop (with a little inertia),
// sheets downwards to dismiss on phones.
import { gsap } from "gsap";
import { Draggable } from "gsap/Draggable";
import { STILL, MENU_H } from "./env";

export function windowDrag(el: HTMLElement, bar: HTMLElement, onPress: () => void) {
  return Draggable.create(el, {
    type: "x,y",
    trigger: bar,
    inertia: !STILL.matches,
    edgeResistance: 0.8,
    zIndexBoost: false,
    minimumMovement: 3,
    onPress() {
      onPress();
      // keep the title bar reachable: never under the menu bar, never fully off screen.
      // Measure in viewport coordinates (offsetTop is relative to .wins, which already
      // sits below the menu bar, so using it here pushed every high window down on press).
      const r = el.getBoundingClientRect();
      const L = r.left - this.x, T = r.top - this.y, width = r.width;
      this.applyBounds({
        minX: -L - width + 96,
        maxX: innerWidth - L - 96,
        minY: MENU_H - T,
        maxY: innerHeight - T - 44,
      });
    },
    onDragStart: () => el.classList.add("is-dragging"),
    onRelease: () => el.classList.remove("is-dragging"),
  })[0];
}

export function sheetDrag(el: HTMLElement, bar: HTMLElement, onDismiss: () => void) {
  return Draggable.create(el, {
    type: "y",
    trigger: bar,
    bounds: { minY: 0, maxY: innerHeight },
    minimumMovement: 4,
    onRelease() {
      if (this.y > 120 || (this.y > 30 && this.getDirection() === "down")) onDismiss();
      else gsap.to(el, { y: 0, duration: 0.25, ease: "drawer" });
    },
  })[0];
}
