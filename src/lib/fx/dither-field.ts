// <DitherField>: animated ordered-dither noise that fills its positioned parent.
// Port of prototypes/dither-bg.html. Domain-warped fBm in 4 tones (ground -> accent) through an
// 8x8 Bayer threshold, rendered at 1/px resolution and upscaled with image-rendering: pixelated.
// Attributes on the root: data-calm="bottom-left|left|center|none" (area kept quiet for text),
// data-px="3" (CSS px per dither pixel). Pauses off-screen and in hidden tabs; reduced motion
// draws one still frame; fine pointers get a soft lamp that lifts the field under the cursor.

import { EASE, GlEffect, damp, type Next } from "./effect";
import { GLSL_COMMON, program, reducedMotion } from "./gl";
import { mixRgb, type Tokens } from "./tokens";
import { register } from "./budget";

const FRAG = `#version 300 es
precision highp float;
uniform vec2 u_res, u_mouse;
uniform float u_time, u_hover, u_calm;
uniform vec3 u_c[4];
out vec4 o;
${GLSL_COMMON}
float h21(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
float noise(vec2 p){
  vec2 i = floor(p), f = fract(p), u = f * f * (3.0 - 2.0 * f);
  return mix(mix(h21(i), h21(i + vec2(1, 0)), u.x), mix(h21(i + vec2(0, 1)), h21(i + 1.0), u.x), u.y);
}
float fbm(vec2 p){
  float v = 0.0, a = 0.5; mat2 m = mat2(1.6, 1.2, -1.2, 1.6);
  for (int i = 0; i < 5; i++){ v += a * noise(p); p = m * p; a *= 0.5; }
  return v;
}
void main(){
  vec2 px = vec2(gl_FragCoord.x, u_res.y - gl_FragCoord.y);
  vec2 n = px / u_res;
  float asp = u_res.x / u_res.y;
  vec2 uv = vec2(n.x * asp, n.y) * 2.2;
  float t = u_time * 0.035;
  vec2 q = vec2(fbm(uv + vec2(0.0, t)), fbm(uv + vec2(5.2, 1.3) - t));
  vec2 r = vec2(fbm(uv + 3.0 * q + vec2(1.7, 9.2) + t * 1.4), fbm(uv + 3.0 * q + vec2(8.3, 2.8) - t));
  float f = fbm(uv + 2.6 * r);
  float field = smoothstep(0.32, 1.0, f) * 1.15;
  // calm zones keep text on top readable: 0 bottom-left, 1 left, 2 center, 3 none
  float copy = 0.0, nav = 0.0, fall = 1.0;
  if (u_calm < 0.5) copy = smoothstep(0.66, 0.18, n.x) * smoothstep(0.2, 0.5, n.y);
  else if (u_calm < 1.5) copy = smoothstep(0.62, 0.2, n.x);
  else if (u_calm < 2.5) copy = 1.0 - smoothstep(0.16, 0.46, length((n - 0.5) * vec2(asp, 1.0)) / max(asp, 1.0) * 1.4);
  if (u_calm < 2.5) {
    nav = smoothstep(0.12, 0.02, n.y);
    fall = mix(1.0, 0.55, smoothstep(0.5, 1.0, n.y));
  }
  float v = field * (1.0 - 0.9 * copy) * (1.0 - 0.85 * nav) * fall * 0.85;
  vec2 d = (n - u_mouse) * vec2(asp, 1.0);
  v += u_hover * 0.32 * exp(-dot(d, d) * 22.0) * (0.4 + 0.6 * f) * (1.0 - 0.8 * copy);
  float lv = floor(clamp(v, 0.0, 1.0) * 2.999 + bayer8(px));
  o = vec4(lv < 0.5 ? u_c[0] : lv < 1.5 ? u_c[1] : lv < 2.5 ? u_c[2] : u_c[3], 1.0);
}`;

const U = ["res", "mouse", "time", "hover", "calm", "c"] as const;
const CALM: Record<string, number> = { "bottom-left": 0, left: 1, center: 2, none: 3 };

class Dither extends GlEffect {
  private u!: Record<(typeof U)[number], WebGLUniformLocation | null>;
  private px: number;
  private time = 12;
  private lamp = { x: 0.7, y: 0.35, tx: 0.7, ty: 0.35, h: 0, th: 0 };
  private visible = false;

  constructor(root: HTMLElement) {
    super(root);
    this.px = Math.max(1, Number(root.dataset.px) || 3);
    this.minFrameMs = 30; // slow drift: ~30fps is indistinguishable and halves the GPU work
    this.attrs = { alpha: false, antialias: false, depth: false, stencil: false, powerPreference: "low-power" };
    this.canvasCss = `position:absolute;left:0;top:0;display:block;pointer-events:none;image-rendering:pixelated;opacity:0;transition:opacity 600ms ${EASE}`;
    new IntersectionObserver(([e]) => {
      this.visible = e.isIntersecting;
      this.kick();
    }).observe(root);
    this.bindLamp();
  }

  allowed() {
    return true; // reduced motion still gets one static frame
  }

  private get playing() {
    return this.visible && !document.hidden && !reducedMotion();
  }

  /** whole device pixels per dither pixel, CSS size an exact multiple: no moire */
  protected fit(c: HTMLCanvasElement, dpr: number) {
    const r = this.root.getBoundingClientRect();
    if (r.width < 1 || r.height < 1) return false;
    const dev = Math.max(1, Math.round(this.px * dpr));
    c.width = Math.ceil((r.width * dpr) / dev);
    c.height = Math.ceil((r.height * dpr) / dev);
    c.style.width = `${(c.width * dev) / dpr}px`;
    c.style.height = `${(c.height * dev) / dpr}px`;
    this.scale = dpr / dev;
    return true;
  }

  protected build(gl: WebGL2RenderingContext) {
    this.u = program(gl, FRAG, U);
    gl.uniform1f(this.u.calm, CALM[this.root.dataset.calm ?? ""] ?? 0);
  }

  protected layout(gl: WebGL2RenderingContext) {
    gl.uniform2f(this.u.res, this.w, this.h);
  }

  protected applyTokens(gl: WebGL2RenderingContext, t: Tokens) {
    const tones = [t.bg, mixRgb(t.bg, t.accent, 0.16), mixRgb(t.bg, t.accent, 0.63), t.accent];
    gl.uniform3fv(this.u.c, tones.flat());
  }

  protected advance(dt: number): Next {
    if (!this.playing) return false;
    this.time += dt;
    const m = this.lamp;
    m.x += (m.tx - m.x) * damp(dt, 4);
    m.y += (m.ty - m.y) * damp(dt, 4);
    m.h += (m.th - m.h) * damp(dt, 3);
    return true;
  }

  protected render(gl: WebGL2RenderingContext) {
    gl.uniform1f(this.u.time, this.time);
    gl.uniform2f(this.u.mouse, this.lamp.x, this.lamp.y);
    gl.uniform1f(this.u.hover, reducedMotion() ? 0 : this.lamp.h);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
  }

  /** the field itself ignores the pointer (pointer-events: none), so listen on its parent */
  private bindLamp() {
    const host = this.root.parentElement;
    if (!host || !matchMedia("(hover: hover) and (pointer: fine)").matches) return;
    host.addEventListener("pointermove", (e) => {
      if (e.pointerType !== "mouse") return;
      const r = this.root.getBoundingClientRect();
      this.lamp.tx = (e.clientX - r.left) / r.width;
      this.lamp.ty = (e.clientY - r.top) / r.height;
      this.lamp.th = 1;
    });
    host.addEventListener("pointerleave", () => (this.lamp.th = 0));
  }
}

export function initDither(root: HTMLElement): void {
  if (root.dataset.fxReady) return;
  root.dataset.fxReady = "";
  register(new Dither(root));
}
