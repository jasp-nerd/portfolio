// Base class for the WebGL2 fx: owns the canvas + context lifecycle (setup / teardown for the
// context budget), resize + DPR, token refresh, and the on-demand render loop.
// The real <img> / content stays in the DOM; the canvas is decoration (aria-hidden, no pointer events).

import { readTokens, type Tokens } from "./tokens";
import { reducedMotion } from "./gl";

/** what advance() wants next: true = another rAF, number = wake again in N ms, false = idle */
export type Next = boolean | number;

export const EASE = "cubic-bezier(0.23, 1, 0.32, 1)";

/** exponential smoothing factor: frame-rate independent ease-out */
export const damp = (dt: number, rate: number) => 1 - Math.exp(-dt * rate);

export abstract class GlEffect {
  readonly root: HTMLElement;
  canvas: HTMLCanvasElement | null = null;
  gl: WebGL2RenderingContext | null = null;
  tokens: Tokens | null = null;
  /** drawing buffer size, device px */
  w = 0;
  h = 0;
  /** drawing-buffer px per CSS px */
  scale = 1;
  /** inside the lazy-init margin (maintained by budget.ts) */
  near = false;
  /** permanently off (no WebGL2, broken image, shader error): the plain content stays */
  disabled = false;

  protected attrs: WebGLContextAttributes = {
    alpha: true,
    premultipliedAlpha: true,
    antialias: false,
    depth: false,
    stencil: false,
  };
  protected canvasCss = `position:absolute;inset:0;width:100%;height:100%;display:block;pointer-events:none;opacity:0;transition:opacity 300ms ${EASE}`;

  /** continuous effects can cap their frame rate (ms between draws) */
  protected minFrameMs = 0;
  private drawn = 0;
  private ok = false;
  private gen = 0;
  private raf = 0;
  private timer = 0;
  private last = 0;
  private ro: ResizeObserver | null = null;
  private tokenKey = "";

  constructor(root: HTMLElement) {
    this.root = root;
  }

  /** holds (or is acquiring) a GL context: counts against the budget */
  get live() {
    return this.gl !== null;
  }

  /** image effects need motion; the dither field overrides this and draws a still frame */
  allowed(): boolean {
    return !reducedMotion();
  }

  /** create programs / textures (may await images and fonts) */
  protected abstract build(gl: WebGL2RenderingContext): Promise<void> | void;
  /** drawing buffer was resized: update size-dependent uniforms */
  protected abstract layout(gl: WebGL2RenderingContext): void;
  protected abstract render(gl: WebGL2RenderingContext, now: number): void;
  protected abstract applyTokens(gl: WebGL2RenderingContext, t: Tokens): void;
  /** advance animation state by dt seconds */
  protected advance(_dt: number, _now: number): Next {
    return false;
  }
  /** called once the canvas is on the page */
  protected ready(): void {}

  /** size the drawing buffer; default: cover the canvas' CSS box at `dpr` */
  protected fit(c: HTMLCanvasElement, dpr: number): boolean {
    const r = c.getBoundingClientRect();
    if (r.width < 1 || r.height < 1) return false;
    c.width = Math.max(1, Math.round(r.width * dpr));
    c.height = Math.max(1, Math.round(r.height * dpr));
    this.scale = c.width / r.width;
    return true;
  }

  async setup(): Promise<boolean> {
    if (this.gl || this.disabled) return this.ok;
    const gen = ++this.gen;
    const c = document.createElement("canvas");
    c.setAttribute("aria-hidden", "true");
    c.dataset.fxCanvas = "";
    const gl = c.getContext("webgl2", this.attrs);
    if (!gl) {
      this.disabled = true;
      return false;
    }
    this.canvas = c;
    this.gl = gl;
    // lost by the browser (GPU reset, too many contexts): drop it, the <img> shows again
    c.addEventListener("webglcontextlost", (e) => {
      e.preventDefault();
      if (this.canvas === c) this.teardown();
    });
    try {
      this.tokens = readTokens(this.root);
      this.tokenKey = JSON.stringify(this.tokens);
      await this.build(gl);
      if (gen !== this.gen) return false;
      this.applyTokens(gl, this.tokens);
    } catch (err) {
      if (gen === this.gen) {
        console.warn("[fx] falling back to plain content", err);
        this.disabled = true;
        this.teardown();
      }
      return false;
    }
    c.style.cssText = this.canvasCss;
    this.root.append(c);
    this.ok = true;
    this.ro = new ResizeObserver(() => this.resize());
    this.ro.observe(this.root);
    this.resize();
    requestAnimationFrame(() => (c.style.opacity = "1"));
    this.ready();
    this.kick();
    return true;
  }

  /** release the context (WEBGL_lose_context) and remove the canvas; setup() can run again later */
  teardown() {
    this.gen++;
    this.ok = false;
    cancelAnimationFrame(this.raf);
    clearTimeout(this.timer);
    this.raf = this.timer = 0;
    this.ro?.disconnect();
    this.ro = null;
    const { gl, canvas } = this;
    this.gl = null;
    this.canvas = null;
    if (gl && !gl.isContextLost()) gl.getExtension("WEBGL_lose_context")?.loseContext();
    canvas?.remove();
  }

  resize() {
    const { gl, canvas } = this;
    if (!gl || !canvas || !this.ok) return;
    if (!this.fit(canvas, Math.min(window.devicePixelRatio || 1, 2))) return;
    this.w = canvas.width;
    this.h = canvas.height;
    gl.viewport(0, 0, this.w, this.h);
    this.layout(gl);
    this.render(gl, performance.now()); // resizing cleared the buffer: redraw before paint
  }

  /** re-read palette tokens (theme switch) */
  refresh() {
    if (!this.gl || !this.ok) return;
    const t = readTokens(this.root);
    const key = JSON.stringify(t);
    if (key === this.tokenKey) return;
    this.tokenKey = key;
    this.tokens = t;
    this.applyTokens(this.gl, t);
    this.kick();
  }

  /** visibility / motion preference changed */
  wake() {
    this.kick();
  }

  /** schedule a frame (no-op while one is pending or without a context) */
  kick() {
    if (!this.ok || this.raf) return;
    clearTimeout(this.timer);
    this.timer = 0;
    this.last = performance.now();
    this.raf = requestAnimationFrame(this.frame);
  }

  private frame = (now: number) => {
    this.raf = 0;
    const gl = this.gl;
    if (!gl || !this.ok) return;
    if (this.minFrameMs && now - this.drawn < this.minFrameMs) {
      this.raf = requestAnimationFrame(this.frame); // frame cap: skip this vsync
      return;
    }
    this.drawn = now;
    const dt = Math.min(Math.max(now - this.last, 0) / 1000, 0.05);
    this.last = now;
    const next = this.advance(dt, now);
    this.render(gl, now);
    if (next === true) this.raf = requestAnimationFrame(this.frame);
    else if (typeof next === "number") this.timer = window.setTimeout(() => this.kick(), next);
  };

  /** smoothed pointer (x, y) chasing its target (tx, ty), drawing-buffer px */
  protected m = { x: -1e4, y: -1e4, tx: -1e4, ty: -1e4 };

  /** aim the pointer at an event; snap skips the easing (first contact, taps) */
  protected aim(e: { clientX: number; clientY: number }, snap: boolean) {
    const r = (this.canvas ?? this.root).getBoundingClientRect();
    this.m.tx = (e.clientX - r.left) * this.scale;
    this.m.ty = (e.clientY - r.top) * this.scale;
    if (snap) {
      this.m.x = this.m.tx;
      this.m.y = this.m.ty;
    }
  }

  /** the browser swapped the <img> source later (srcset upgrade on resize): rebuild from the new pixels */
  protected followImage(img: HTMLImageElement) {
    img.addEventListener("load", () => {
      if (!this.ok) return; // still setting up (or released): setup reads the current pixels anyway
      this.teardown();
      void this.setup();
    });
  }

  /** keyboard reveals grow from the middle */
  protected centre() {
    this.m.tx = this.m.x = this.w / 2;
    this.m.ty = this.m.y = this.h / 2;
  }
}
