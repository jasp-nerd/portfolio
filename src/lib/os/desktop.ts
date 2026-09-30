// jasp.os glue: openers, desktop icons (select, double-click, drag to trash), menu bar,
// keyboard shortcuts, alerts, mail compose and the easter eggs.
import { gsap } from "gsap";
import { Draggable } from "gsap/Draggable";
import { WM } from "./wm";
import { PHONE, STILL } from "./env";
import { initPolder, type Polder } from "./polder";
import { initSecret } from "./secret";
import { sound } from "../fx/sound";
import { initClocks, offsetFromVisitor } from "../fx/clock";

const $ = <T extends HTMLElement>(s: string, r: ParentNode = document) => r.querySelector<T>(s);
const $$ = <T extends HTMLElement>(s: string, r: ParentNode = document) => [...r.querySelectorAll<T>(s)];
const typing = (t: EventTarget | null) =>
  t instanceof HTMLElement && (t.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName));

export function boot() {
  const html = document.documentElement;
  const wm = new WM();
  const wp = $("[data-polder]");
  let polder: Polder | null = null;
  try {
    if (wp) polder = initPolder(wp);
  } catch {
    /* the still image stays */
  }
  // dev only: scripts use these to regenerate public/os/polder*.png and to test the window manager
  if (import.meta.env.DEV) Object.assign(window, { __polder: polder, __wm: wm });
  const alert = makeAlert();

  // anything with data-open opens a window (desktop icons have their own rules below)
  document.addEventListener("click", (e) => {
    const el = (e.target as HTMLElement).closest<HTMLElement>("[data-open]");
    if (!el || el.classList.contains("dicon")) return;
    if (!wm.get(el.dataset.open!)) return;
    e.preventDefault();
    closeMenu();
    wm.open(el.dataset.open!, el);
  });

  // desktop icons: click selects, double-click (or Enter) opens, touch opens on tap
  const coarse = matchMedia("(pointer: coarse)");
  const icons = $$("a.dicon");
  const trash = $("[data-trash]");
  const select = (a: HTMLElement | null) => icons.forEach((i) => i.toggleAttribute("data-selected", i === a));
  icons.forEach((a) => {
    a.addEventListener("click", (e) => {
      e.preventDefault();
      if (a.dataset.dragged) return void delete a.dataset.dragged;
      if (e.detail === 0 || coarse.matches) wm.open(a.dataset.open!, a);
      else select(a);
      sound.play("tick");
    });
    a.addEventListener("dblclick", (e) => {
      e.preventDefault();
      wm.open(a.dataset.open!, a);
    });
  });
  $(".desk")?.addEventListener("pointerdown", (e) => {
    if (!(e.target as HTMLElement).closest(".dicon")) select(null);
  });

  if (!PHONE.matches && trash) {
    icons
      .filter((a) => a !== trash)
      .forEach((a) => {
        Draggable.create(a, {
          type: "x,y",
          dragClickables: true,
          minimumMovement: 5,
          zIndexBoost: true,
          onDragStart() {
            a.dataset.dragged = "1";
            select(a);
          },
          onDrag() {
            trash.toggleAttribute("data-hot", this.hitTest(trash, "35%"));
          },
          onRelease() {
            if (!this.isDragging && !a.dataset.dragged) return;
            setTimeout(() => delete a.dataset.dragged, 50);
            if (!this.hitTest(trash, "35%")) return;
            trash.removeAttribute("data-hot");
            if (!STILL.matches) {
              gsap.fromTo(trash, { x: -3 }, { x: 0, duration: 0.3, ease: "elastic.out(1, 0.3)" });
              gsap.to(a, { x: 0, y: 0, duration: 0.45, ease: "back.out(1.6)" });
            } else gsap.set(a, { x: 0, y: 0 });
            sound.play("pop");
            alert(a.dataset.refuse ?? "nope.", "ok", a);
          },
        });
      });
  }

  // menu bar
  const jBtn = $("[aria-controls='jmenu']");
  const jMenu = $("#jmenu");
  function closeMenu() {
    if (!jMenu || jMenu.hidden) return;
    jMenu.hidden = true;
    jBtn?.setAttribute("aria-expanded", "false");
  }
  jBtn?.addEventListener("click", (e) => {
    e.stopPropagation();
    const open = jMenu!.hidden;
    jMenu!.hidden = !open;
    jBtn.setAttribute("aria-expanded", String(open));
    if (open) $("button", jMenu!)?.focus();
  });
  jMenu?.addEventListener("keydown", (e) => {
    const items = $$("button", jMenu);
    const i = items.indexOf(document.activeElement as HTMLElement);
    if (e.key === "ArrowDown") items[(i + 1) % items.length].focus(), e.preventDefault();
    if (e.key === "ArrowUp") items[(i - 1 + items.length) % items.length].focus(), e.preventDefault();
  });
  document.addEventListener("click", (e) => {
    if (!(e.target as HTMLElement).closest(".mb-menu")) closeMenu();
  });
  $("[data-tidy]")?.addEventListener("click", () => {
    closeMenu();
    wm.tidy();
    icons.forEach((a) => gsap.to(a, { x: 0, y: 0, duration: STILL.matches ? 0 : 0.4, ease: "power2.inOut" }));
  });
  // secret mode (1-bit), locked until the konami code
  const secret = initSecret(() => polder?.repaint());
  $("[data-bit]")?.addEventListener("click", () => secret.unlocked() && closeMenu());

  // sound: m toggles it, no button
  const toggleSound = () => {
    sound.enabled = !sound.enabled;
    sound.play("pop");
  };

  initClocks();
  $$("[data-offset]").forEach((el) => (el.textContent = `(${offsetFromVisitor()})`));

  // mail compose → the visitor's own mail app
  const form = $<HTMLFormElement>("form[data-mail]");
  form?.addEventListener("submit", (e) => {
    e.preventDefault();
    const fd = new FormData(form);
    const subject = String(fd.get("subject") || "hi from jaspnerd.dev");
    const body = String(fd.get("body") || "");
    const enc = (s: string) => encodeURIComponent(s);
    location.href = `mailto:${form.dataset.mail}?subject=${enc(subject)}${body ? `&body=${enc(body)}` : ""}`;
  });

  // windmill: poke it enough and it breaks
  wp?.addEventListener("pointermove", (e) => wp.classList.toggle("on-mill", !!polder?.hit(e.clientX, e.clientY)));
  $(".desk")?.addEventListener("click", (e) => {
    if (!polder || (e.target as HTMLElement).closest(".win, .dicon, .dock, .alert")) return;
    if (!polder.hit(e.clientX, e.clientY)) return;
    sound.play("tick");
    if (polder.poke()) setTimeout(() => alert("you broke it. put it back?", "put it back", null, () => polder?.fix()), STILL.matches ? 0 : 900);
  });

  // keyboard: esc closes the top window, m toggles sound, a few quiet single-key openers
  const keys: Record<string, string> = { a: "about", p: "projects", w: "work", e: "mail" };
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      if (jMenu && !jMenu.hidden) return closeMenu(), jBtn?.focus();
      const inWin = (document.activeElement as HTMLElement | null)?.closest<HTMLElement>(".win[data-open]");
      const id = inWin?.dataset.win ?? wm.top()?.id;
      if (id) wm.close(id);
      return;
    }
    if (e.metaKey || e.ctrlKey || e.altKey || typing(e.target) || secret.typing()) return;
    if (e.key === "m") return toggleSound();
    const id = keys[e.key];
    if (id) wm.open(id, document.activeElement as HTMLElement, true);
  });

  requestAnimationFrame(() => setTimeout(() => html.classList.add("os-booted"), 900));
}

function makeAlert() {
  const box = document.getElementById("os-alert")!;
  const msg = box.querySelector<HTMLElement>(".alert-msg")!;
  const ok = box.querySelector<HTMLButtonElement>(".alert-ok")!;
  let back: HTMLElement | null = null;
  let after: (() => void) | undefined;
  const close = () => {
    box.hidden = true;
    after?.();
    after = undefined;
    back?.focus({ preventScroll: true });
  };
  ok.addEventListener("click", close);
  box.addEventListener("keydown", (e) => {
    if (e.key === "Escape" || e.key === "Tab") {
      e.preventDefault();
      e.stopPropagation();
      if (e.key === "Escape") close();
    }
  });
  box.addEventListener("click", (e) => e.target === box && close());
  return (text: string, label = "ok", from: HTMLElement | null = null, then?: () => void) => {
    back = from ?? (document.activeElement as HTMLElement | null);
    after = then;
    msg.textContent = text;
    ok.textContent = label;
    box.hidden = false;
    ok.focus();
    if (!STILL.matches)
      gsap.fromTo(box.firstElementChild, { opacity: 0, scale: 0.96 }, { opacity: 1, scale: 1, duration: 0.18, ease: "house" });
  };
}
