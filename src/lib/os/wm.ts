// jasp.os window manager: open / close / minimize / focus / drag, desktop and phone modes.
import { gsap } from "gsap";
import type { Draggable } from "gsap/Draggable";
import { sound } from "../fx/sound";
import { syncDock } from "./dock";
import { windowDrag, sheetDrag } from "./drag";
import { PHONE, STILL, MENU_H } from "./env";

export { PHONE, STILL };
/** the bold "app" name in the menu bar, by window kind */
const APP: Record<string, string> = {
  about: "textedit",
  finder: "finder",
  project: "preview",
  log: "console",
  work: "activity monitor",
  mail: "mail",
  trash: "finder",
  os: "jasp.os",
  video: "player",
};

export interface Win {
  id: string;
  el: HTMLElement;
  bar: HTMLElement;
  title: HTMLElement;
  opener: HTMLElement | null;
  drag?: Draggable;
  placed: boolean;
  min: boolean;
}

export class WM {
  wins = new Map<string, Win>();
  stack: string[] = [];
  z = 20;
  cascade = 0;
  dockOpen: HTMLElement | null;
  titleEl: HTMLElement | null;

  constructor(root: Document = document) {
    root.querySelectorAll<HTMLElement>(".win[data-win]").forEach((el) => {
      const id = el.dataset.win!;
      const w: Win = {
        id,
        el,
        bar: el.querySelector(".win-bar")!,
        title: el.querySelector(".win-title")!,
        opener: null,
        placed: el.hasAttribute("data-open"),
        min: false,
      };
      el.setAttribute("role", "dialog");
      el.setAttribute("aria-modal", "false");
      el.addEventListener("pointerdown", () => this.focus(id, false), { capture: true });
      el.querySelector('[data-act="close"]')?.addEventListener("click", () => this.close(id));
      el.querySelector('[data-act="min"]')?.addEventListener("click", () => this.minimize(id));
      this.wins.set(id, w);
    });
    this.dockOpen = document.querySelector("[data-dock-open]");
    this.titleEl = document.querySelector("[data-active-title]");
    // the windows that are open on first paint, bottom to top
    const initial = [...this.wins.values()].filter((w) => w.el.hasAttribute("data-open"));
    initial.sort((a, b) => +(a.el.dataset.z ?? 0) - +(b.el.dataset.z ?? 0));
    if (PHONE.matches) initial.forEach((w) => w.el.removeAttribute("data-open"));
    else if (innerWidth < 1200) {
      const extra = initial.find((w) => w.id === "projects");
      extra?.el.removeAttribute("data-open");
      initial.forEach((w) => w.id !== "projects" && this.focus(w.id, false));
    } else initial.forEach((w) => this.focus(w.id, false));
    this.setMode();
    document.documentElement.classList.remove("os-first");
    PHONE.addEventListener("change", () => {
      [...this.stack].forEach((id) => this.close(id, true));
      this.setMode();
      if (!PHONE.matches) initial.forEach((w) => this.open(w.id, null, true));
    });
    this.sync();
  }

  get(id: string) {
    return this.wins.get(id);
  }
  isOpen(id: string) {
    return !!this.wins.get(id)?.el.hasAttribute("data-open");
  }
  top(): Win | undefined {
    return this.wins.get(this.stack[this.stack.length - 1]);
  }

  /** (re)create draggables for the current mode */
  setMode() {
    this.wins.forEach((w) => {
      w.drag?.kill();
      w.drag = undefined;
      gsap.set(w.el, { clearProps: "transform,opacity" });
      // pin GSAP's transform cache to identity. Otherwise the first drag picks up the
      // scale(.96) of the CSS boot animation that is still running, and the window shrinks.
      gsap.set(w.el, { x: 0, y: 0, scale: 1 });
      w.placed = w.el.hasAttribute("data-open");
      w.drag = PHONE.matches
        ? sheetDrag(w.el, w.bar, () => this.close(w.id))
        : windowDrag(w.el, w.bar, () => this.focus(w.id, false));
    });
  }

  place(w: Win) {
    // the first-paint trio has CSS positions; everything else cascades from the upper middle
    if (w.el.dataset.z) return void (w.placed = true);
    const k = this.cascade++ % 6;
    const width = Math.min(w.el.offsetWidth || 560, innerWidth - 24);
    const x = Math.max(112, Math.min(innerWidth * 0.34 + k * 28, innerWidth - width - 16));
    const y = Math.min(48 + k * 26, innerHeight - 240);
    w.el.style.left = `${Math.round(x)}px`;
    w.el.style.top = `${Math.round(y)}px`;
    // stop above the dock
    w.el.style.maxHeight = `${Math.round(innerHeight - MENU_H - y - 92)}px`;
    w.placed = true;
  }

  open(id: string, opener: HTMLElement | null = null, instant = false) {
    const w = this.wins.get(id);
    if (!w) return false;
    if (opener) w.opener = opener;
    const quick = instant || STILL.matches;
    if (w.min) return this.restore(w, quick);
    if (this.isOpen(id)) {
      this.focus(id, true);
      return true;
    }
    w.el.setAttribute("data-open", "");
    if (!PHONE.matches && !w.placed) this.place(w);
    this.focus(id, true);
    gsap.killTweensOf(w.el);
    if (PHONE.matches) {
      document.documentElement.classList.add("has-sheet");
      gsap.set(w.el, { y: 0 });
      if (quick) gsap.set(w.el, { yPercent: 0, opacity: 1 });
      else gsap.fromTo(w.el, { yPercent: 100 }, { yPercent: 0, duration: 0.34, ease: "drawer" });
    } else if (quick) gsap.set(w.el, { opacity: 1, scale: 1 });
    else gsap.fromTo(w.el, { opacity: 0, scale: 0.96 }, { opacity: 1, scale: 1, duration: 0.22, ease: "house" });
    sound.play("open");
    this.sync();
    return true;
  }

  close(id: string, instant = false) {
    const w = this.wins.get(id);
    if (!w || !this.isOpen(id)) return;
    const quick = instant || STILL.matches;
    this.stack = this.stack.filter((s) => s !== id);
    w.el.querySelectorAll("video").forEach((v) => v.pause());
    const done = () => {
      w.el.removeAttribute("data-open");
      w.el.removeAttribute("data-active");
      gsap.set(w.el, { opacity: 1, scale: 1, yPercent: 0 });
      if (PHONE.matches) gsap.set(w.el, { y: 0 });
      if (!this.stack.length) document.documentElement.classList.remove("has-sheet");
      this.sync();
    };
    gsap.killTweensOf(w.el);
    if (quick) done();
    else if (PHONE.matches) gsap.to(w.el, { yPercent: 100, duration: 0.22, ease: "power2.out", onComplete: done });
    else gsap.to(w.el, { opacity: 0, scale: 0.97, duration: 0.13, ease: "power2.out", onComplete: done });
    sound.play("close");
    this.returnFocus(w);
    const next = this.top();
    if (next) this.focus(next.id, false);
  }

  returnFocus(w: Win) {
    const o = w.opener;
    const visible = o && o.isConnected && o.offsetParent !== null && !w.el.contains(o);
    if (visible) o!.focus({ preventScroll: true });
    else this.top()?.title.focus({ preventScroll: true });
    w.opener = null;
  }

  minimize(id: string) {
    const w = this.wins.get(id);
    if (!w || !this.isOpen(id) || PHONE.matches) return this.close(id);
    w.min = true;
    this.stack = this.stack.filter((s) => s !== id);
    this.sync();
    const target = this.dockItem(id);
    const r = w.el.getBoundingClientRect();
    const t = target?.getBoundingClientRect();
    const px = gsap.getProperty(w.el, "x") as number, py = gsap.getProperty(w.el, "y") as number;
    w.el.dataset.px = String(px);
    w.el.dataset.py = String(py);
    const hide = () => {
      w.el.removeAttribute("data-open");
      w.el.removeAttribute("data-active");
      gsap.set(w.el, { x: px, y: py, scale: 1, opacity: 1 });
    };
    if (STILL.matches || !t) hide();
    else
      gsap.to(w.el, {
        x: px + (t.left + t.width / 2) - (r.left + r.width / 2),
        y: py + (t.top + t.height / 2) - (r.top + r.height / 2),
        scale: 0.12,
        opacity: 0,
        duration: 0.26,
        ease: "power2.inOut",
        onComplete: hide,
      });
    sound.play("pop");
    this.returnFocus(w);
  }

  restore(w: Win, quick: boolean) {
    w.min = false;
    const t = this.dockItem(w.id)?.getBoundingClientRect();
    w.el.setAttribute("data-open", "");
    this.focus(w.id, true);
    const px = +(w.el.dataset.px ?? 0), py = +(w.el.dataset.py ?? 0);
    if (quick || !t) gsap.set(w.el, { x: px, y: py, scale: 1, opacity: 1 });
    else {
      const r = w.el.getBoundingClientRect();
      gsap.fromTo(
        w.el,
        { x: px + (t.left + t.width / 2) - (r.left + r.width / 2), y: py + (t.top + t.height / 2) - (r.top + r.height / 2), scale: 0.12, opacity: 0 },
        { x: px, y: py, scale: 1, opacity: 1, duration: 0.28, ease: "house" },
      );
    }
    sound.play("open");
    this.sync();
    return true;
  }

  focus(id: string, moveFocus: boolean) {
    const w = this.wins.get(id);
    if (!w) return;
    if (this.stack[this.stack.length - 1] !== id || w.el.style.zIndex === "") {
      this.stack = this.stack.filter((s) => s !== id).concat(id);
      w.el.style.zIndex = String(++this.z);
    }
    this.wins.forEach((o) => o.el.toggleAttribute("data-active", o === w));
    if (moveFocus) w.title.focus({ preventScroll: true });
    this.syncTitle();
  }

  dockItem(id: string) {
    return document.querySelector<HTMLElement>(`[data-dock="${id}"]`);
  }

  syncTitle() {
    if (this.titleEl) this.titleEl.textContent = APP[this.top()?.el.dataset.kind ?? ""] ?? "jasp.os";
  }

  /** menu bar app name + dock state */
  sync() {
    this.syncTitle();
    syncDock(this.dockOpen, [...this.wins.values()].map((w) => ({ id: w.id, el: w.el, live: this.isOpen(w.id) || w.min })));
  }

  /** bring minimized windows back and cascade every open window from the top left */
  tidy() {
    this.wins.forEach((w) => w.min && this.restore(w, true));
    const list = this.stack.map((id) => this.wins.get(id)!).filter(Boolean);
    list.forEach((w, k) => {
      const el = w.el;
      const before = el.getBoundingClientRect();
      gsap.killTweensOf(el);
      gsap.set(el, { x: 0, y: 0, scale: 1, opacity: 1 });
      const x = Math.min(124 + k * 36, innerWidth - el.offsetWidth - 16);
      const y = Math.min(16 + k * 32, innerHeight - MENU_H - 240);
      el.style.left = `${Math.max(8, x)}px`;
      el.style.top = `${Math.max(8, y)}px`;
      el.style.maxHeight = `${Math.round(innerHeight - MENU_H - Math.max(8, y) - 92)}px`;
      w.placed = true;
      if (STILL.matches) return;
      const after = el.getBoundingClientRect();
      gsap.fromTo(
        el,
        { x: before.left - after.left, y: before.top - after.top },
        { x: 0, y: 0, duration: 0.45, delay: k * 0.04, ease: "power3.inOut" },
      );
    });
  }
}
