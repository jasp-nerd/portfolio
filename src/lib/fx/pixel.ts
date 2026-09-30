// <PixelImage>: the photo as dithered pixel blocks that de-pixelate to the real <img>.
// Port of prototypes/pixel-reveal.html. Attributes on the root:
//   data-mode="step"  whole image steps block -> block/2 -> ... -> photo while the closest
//                     `a, button, [data-fx-trigger]` (or the root) is hovered / keyboard-focused
//   data-mode="lens"  quadtree rings of finer blocks around the pointer
//   data-tone="duotone|color", data-block="14" (coarsest block, CSS px),
//   optional data-levels (halvings before the photo), data-radius (lens radius, CSS px)

import { GlEffect, damp, type Next } from "./effect";
import { onFocusVisible, triggerOf } from "./input";
import { GLSL_COMMON, autoLevels, imageReady, objectPosition, program, texture } from "./gl";
import { mixRgb, type Tokens } from "./tokens";
import { register } from "./budget";

const FRAG = `#version 300 es
precision highp float;
uniform vec2 u_res, u_imgRes, u_pos, u_mouse, u_lv;
uniform sampler2D u_img;
uniform float u_radius, u_progress, u_mode, u_style, u_block, u_levels, u_invert;
uniform vec3 u_pal[4];   // ground, ground+accent, accent, ink
out vec4 o;
${GLSL_COMMON}
void main(){
  vec2 p = vec2(gl_FragCoord.x, u_res.y - gl_FragCoord.y);
  float s = u_block, level = 0.0;
  if (u_mode < 0.5) {
    // lens: refine this block while its centre is inside the ring for that depth
    for (int i = 0; i < 8; i++) {
      if (float(i) >= u_levels) break;
      vec2 c = (floor(p / s) + 0.5) * s;
      float thr = u_radius * mix(1.0, 0.45, float(i) / max(u_levels - 1.0, 1.0));
      if (distance(c, u_mouse) < thr) { s *= 0.5; level += 1.0; } else break;
    }
  } else {
    level = min(floor(u_progress * (u_levels + 1.0)), u_levels);
    s = u_block / exp2(level);
  }
  if (level >= u_levels) { o = vec4(0.0); return; }   // full resolution: the real <img> shows
  vec2 blk = floor(p / s), c = (blk + 0.5) * s;
  float lod = log2(s / max(u_res.x / u_imgRes.x, u_res.y / u_imgRes.y)) - 0.5;
  vec4 tx = textureLod(u_img, coverUV(c / u_res, u_res, u_imgRes, u_pos), max(lod, 0.0));
  vec3 col = mix(u_pal[0], tx.rgb, tx.a);
  float l = clamp((dot(col, vec3(0.2126, 0.7152, 0.0722)) - u_lv.x) / (u_lv.y - u_lv.x), 0.0, 1.0);
  float dn = mix(l, 1.0 - l, u_invert);                 // "ink amount" against the ground
  float b = bayer4(blk);
  vec3 outc;
  float stage = level + u_style;                        // colour tone skips the 4-tone stage
  if (stage < 0.5) {
    float q = clamp(floor(dn * 3.0 + b), 0.0, 3.0);     // 4-tone ordered dither
    outc = q < 0.5 ? u_pal[0] : q < 1.5 ? u_pal[1] : q < 2.5 ? u_pal[2] : u_pal[3];
  } else if (stage < 1.5) {
    // tonal dither: luminance in 5 Bayer steps, the photo's hue kept
    vec3 cn = clamp((col - u_lv.x) / (u_lv.y - u_lv.x), 0.0, 1.0);
    float ln = dot(cn, vec3(0.2126, 0.7152, 0.0722));
    float lq = clamp(floor(ln * 4.0 + b) / 4.0, 0.0, 1.0);
    outc = clamp(cn * (lq + 0.04) / (ln + 0.04), 0.0, 1.0);
    // dark ground: blacks lift to the ground; light ground: whites sink to it
    outc = mix(u_pal[0] + (1.0 - u_pal[0]) * outc, outc * u_pal[0], u_invert);
  } else {
    outc = col;                                         // plain mosaic
  }
  vec2 f = p - blk * s;                                 // hairline grid: big blocks read as pixels
  if (s >= 10.0 && (f.x < 1.0 || f.y < 1.0)) outc = mix(outc * 0.82, mix(outc, u_pal[3], 0.07), u_invert);
  o = vec4(outc, 1.0);
}`;

const U = ["res", "imgRes", "pos", "mouse", "lv", "img", "radius", "progress", "mode", "style", "block", "levels", "invert", "pal"] as const;
const IN_MS = 420;
const OUT_MS = 240;

class Pixel extends GlEffect {
  private img: HTMLImageElement;
  private step: boolean;
  private blockCss: number;
  private levels: number;
  private u!: Record<(typeof U)[number], WebGLUniformLocation | null>;
  private radius = 0;
  private target = 0;
  private progress = 0;
  private hover = false;
  private focus = false;
  private pinned = false;

  constructor(root: HTMLElement, img: HTMLImageElement) {
    super(root);
    this.img = img;
    this.step = root.dataset.mode !== "lens";
    this.blockCss = Math.max(2, Number(root.dataset.block) || 14);
    const auto = Math.round(Math.log2(this.blockCss)); // ends near 1-2 CSS px before the photo
    this.levels = Math.min(6, Math.max(2, Number(root.dataset.levels) || auto));
    this.bind();
    this.followImage(img);
  }

  protected async build(gl: WebGL2RenderingContext) {
    await imageReady(this.img);
    this.u = program(gl, FRAG, U);
    texture(gl, 0, this.img, true);
    gl.uniform1i(this.u.img, 0);
    gl.uniform2f(this.u.imgRes, this.img.naturalWidth, this.img.naturalHeight);
    gl.uniform2fv(this.u.pos, objectPosition(this.img));
    gl.uniform2fv(this.u.lv, autoLevels(this.img));
    gl.uniform1f(this.u.mode, this.step ? 1 : 0);
    gl.uniform1f(this.u.style, this.root.dataset.tone === "color" ? 1 : 0);
    gl.uniform1f(this.u.levels, this.levels);
  }

  protected layout(gl: WebGL2RenderingContext) {
    gl.uniform2f(this.u.res, this.w, this.h);
    gl.uniform1f(this.u.block, Math.max(2, Math.round(this.blockCss * this.scale)));
    if (!this.step) this.settle();
  }

  protected applyTokens(gl: WebGL2RenderingContext, t: Tokens) {
    gl.uniform3fv(this.u.pal, [...t.bg, ...mixRgb(t.bg, t.accent, 0.31), ...t.accent, ...t.ink]);
    gl.uniform1f(this.u.invert, t.invert);
  }

  private get active() {
    return this.hover || this.focus || this.pinned;
  }

  private lensRadius() {
    const css = Number(this.root.dataset.radius);
    return css > 0 ? css * this.scale : Math.min(this.w, this.h) * 0.42;
  }

  private settle() {
    if (!this.step) {
      const full = (Math.hypot(this.w, this.h) + this.blockCss * this.scale) * 2.3;
      this.target = this.pinned || this.focus ? full : this.hover ? this.lensRadius() : 0;
    }
    this.kick();
  }

  protected advance(dt: number): Next {
    if (this.step) {
      // linear, so every resolution step gets equal screen time; exits faster than enters
      const want = this.active ? 1 : 0;
      const dir = Math.sign(want - this.progress);
      this.progress = Math.min(1, Math.max(0, this.progress + (dir * dt * 1000) / (dir > 0 ? IN_MS : OUT_MS)));
      return this.progress !== want;
    }
    const m = this.m;
    m.x += (m.tx - m.x) * damp(dt, 18);
    m.y += (m.ty - m.y) * damp(dt, 18);
    this.radius += (this.target - this.radius) * damp(dt, this.target > this.radius ? 8 : 14);
    if (this.target === 0 && this.radius < 0.5) this.radius = 0;
    return Math.abs(this.target - this.radius) > 0.5 || Math.hypot(m.tx - m.x, m.ty - m.y) > 0.5;
  }

  protected render(gl: WebGL2RenderingContext) {
    gl.uniform2f(this.u.mouse, this.m.x, this.m.y);
    gl.uniform1f(this.u.radius, this.radius);
    gl.uniform1f(this.u.progress, this.progress);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
  }

  private bind() {
    const trigger = triggerOf(this.root);
    const hoverEl = this.step ? trigger : this.root;
    hoverEl.addEventListener("pointerenter", (e) => {
      if (e.pointerType === "touch") return;
      this.hover = true;
      if (!this.step) this.aim(e, this.radius < 1);
      this.settle();
    });
    hoverEl.addEventListener("pointerleave", (e) => {
      if (e.pointerType === "touch") return;
      this.hover = false;
      this.settle();
    });
    hoverEl.addEventListener("pointerup", (e) => {
      if (e.pointerType !== "touch") return; // a tap toggles
      this.pinned = !this.pinned;
      if (!this.step) this.aim(e, true);
      this.settle();
    });
    if (!this.step) {
      this.root.addEventListener("pointermove", (e) => {
        if (e.pointerType === "touch") return;
        this.aim(e, false);
        this.kick();
      });
    }
    onFocusVisible(trigger, (on) => {
      this.focus = on;
      if (on && !this.step && !this.hover) this.centre();
      this.settle();
    });
  }
}

export function initPixel(root: HTMLElement): void {
  if (root.dataset.fxReady) return;
  const img = root.querySelector("img");
  if (!img) return;
  root.dataset.fxReady = "";
  register(new Pixel(root, img));
}
