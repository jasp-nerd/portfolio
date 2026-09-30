// <AsciiImage>: the photo drawn as ASCII glyphs; the pointer (or a tap, or keyboard focus on the
// surrounding link) reveals the real <img> through a ring of pixel blocks + scrambling glyphs.
// Port of prototypes/ascii-reveal.html. Attributes on the root: data-mode="mono|color",
// data-cell="7" (or "7x12"), data-radius="140" (CSS px), data-intro (dissolve in on scroll).

import { GlEffect, damp, type Next } from "./effect";
import { onFocusVisible, triggerOf } from "./input";
import { GLSL_COMMON, autoLevels, imageReady, objectPosition, program, texture } from "./gl";
import { loadFont, type Tokens } from "./tokens";
import { buildAtlas } from "./ascii-atlas";
import { register } from "./budget";

const FRAG = `#version 300 es
precision highp float;
uniform vec2 u_res, u_imgRes, u_pos, u_cell, u_mouse, u_levels;
uniform sampler2D u_img, u_atlas;
uniform float u_glyphs, u_radius, u_time, u_intro, u_color, u_invert;
uniform vec3 u_bg, u_ink, u_accent, u_dim;
out vec4 o;
${GLSL_COMMON}
void main(){
  vec2 p = vec2(gl_FragCoord.x, u_res.y - gl_FragCoord.y);
  vec2 cell = floor(p / u_cell), local = p - cell * u_cell, cc = (cell + 0.5) * u_cell;
  // cell average colour: the mip level that matches the cell footprint
  float lod = log2(max(u_cell.x, u_cell.y) / max(u_res.x / u_imgRes.x, u_res.y / u_imgRes.y));
  vec4 tx = textureLod(u_img, coverUV(cc / u_res, u_res, u_imgRes, u_pos), max(lod - 0.5, 0.0));
  vec3 col = mix(u_bg, tx.rgb, tx.a);
  float l = clamp((dot(col, vec3(0.2126, 0.7152, 0.0722)) - u_levels.x) / (u_levels.y - u_levels.x), 0.0, 1.0);
  l = l * l * (3.0 - 2.0 * l) * 0.35 + l * 0.65;
  float dens = mix(l, 1.0 - l, u_invert);          // light palettes: dark areas get dense glyphs
  float h = hash(cell);
  float gi = floor(dens * (u_glyphs - 1.0) + 0.5);
  // 3 ascii, 2 scrambling glyph, 1 solid block, 0 photo (transparent: the real <img> shows)
  float state = 3.0;
  float d = distance(cc, u_mouse) + (h - 0.5) * u_cell.y * 2.5;
  if (u_radius > 1.0) {
    if (d < u_radius * 0.60) state = 0.0;
    else if (d < u_radius * 0.80) state = 1.0;
    else if (d < u_radius) state = 2.0;
  }
  float t = u_intro * 1.35 - h;                     // intro: photo -> block -> scramble -> glyph
  if (t < 0.0) state = 0.0;
  else if (t < 0.12) state = min(state, 1.0);
  else if (t < 0.35) state = min(state, 2.0);
  if (state < 0.5) { o = vec4(0.0); return; }
  if (state < 1.5) { o = vec4(col, 1.0); return; }
  if (state < 2.5) gi = floor(hash(cell + floor(u_time * 16.0)) * (u_glyphs - 1.0)) + 1.0;
  float a = texture(u_atlas, vec2((gi * u_cell.x + local.x) / (u_glyphs * u_cell.x), local.y / u_cell.y)).r;
  vec3 ink;
  if (u_color > 0.5) {
    // image colour, normalised away from the ground so faint cells stay visible
    vec3 c = mix(col, 1.0 - col, u_invert);
    c = c / max(max(c.r, c.g), max(c.b, 0.08)) * (0.35 + 0.65 * dens);
    ink = mix(mix(c, 1.0 - c, u_invert), u_ink, 0.12);
  } else {
    ink = mix(u_dim, u_accent, smoothstep(0.25, 0.9, dens));
    ink = mix(ink, u_ink, smoothstep(0.85, 1.0, dens));
  }
  if (state > 1.5 && state < 2.5) ink = u_accent;
  o = vec4(mix(u_bg, ink, a), 1.0);
}`;

const U = ["res", "imgRes", "pos", "cell", "mouse", "levels", "img", "atlas", "glyphs", "radius", "time", "intro", "color", "invert", "bg", "ink", "accent", "dim"] as const;

class Ascii extends GlEffect {
  private img: HTMLImageElement;
  private cellW: number;
  private cellH: number;
  private radiusCss: number;
  private u!: Record<(typeof U)[number], WebGLUniformLocation | null>;
  private atlasTex: WebGLTexture | null = null;
  private atlasKey = "";
  private font = "";
  private radius = 0;
  private target = 0;
  private hover = false;
  private focus = false;
  private pinned = false;
  private intro: number;
  private introAt = -1;
  private introWanted = false;
  private t0 = performance.now();

  constructor(root: HTMLElement, img: HTMLImageElement) {
    super(root);
    this.img = img;
    const [w, h] = (root.dataset.cell || "7").split("x").map(Number);
    this.cellW = w > 1 ? w : 7;
    this.cellH = h > 1 ? h : Math.round((this.cellW * 12) / 7);
    this.radiusCss = Number(root.dataset.radius) || 140;
    this.intro = root.dataset.intro !== undefined ? 0 : 1;
    if (this.intro === 0) {
      const io = new IntersectionObserver(
        ([e]) => {
          if (!e.isIntersecting) return;
          io.disconnect();
          this.introWanted = true;
          this.startIntro();
        },
        { rootMargin: "0px 0px -25% 0px" }, // once the top edge is a quarter into the viewport
      );
      io.observe(root);
    }
    this.bind();
    this.followImage(img);
  }

  protected async build(gl: WebGL2RenderingContext) {
    await imageReady(this.img);
    this.font = this.tokens?.mono ?? "monospace";
    await loadFont(this.font);
    this.u = program(gl, FRAG, U);
    texture(gl, 0, this.img, true);
    this.atlasTex = gl.createTexture();
    this.atlasKey = "";
    gl.uniform1i(this.u.img, 0);
    gl.uniform1i(this.u.atlas, 1);
    gl.uniform2f(this.u.imgRes, this.img.naturalWidth, this.img.naturalHeight);
    gl.uniform2fv(this.u.pos, objectPosition(this.img));
    gl.uniform2fv(this.u.levels, autoLevels(this.img));
    gl.uniform1f(this.u.color, this.root.dataset.mode === "color" ? 1 : 0);
  }

  protected layout(gl: WebGL2RenderingContext) {
    const cw = Math.max(2, Math.round(this.cellW * this.scale));
    const ch = Math.max(3, Math.round(this.cellH * this.scale));
    const key = `${cw}x${ch}|${this.font}`;
    if (key !== this.atlasKey) {
      const atlas = buildAtlas(cw, ch, this.font);
      texture(gl, 1, atlas.canvas, false, this.atlasTex);
      gl.uniform1f(this.u.glyphs, atlas.count);
      this.atlasKey = key;
    }
    gl.uniform2f(this.u.res, this.w, this.h);
    gl.uniform2f(this.u.cell, cw, ch);
    if (this.pinned || this.focus) this.target = this.full();
    else if (this.hover) this.target = this.radiusCss * this.scale;
  }

  protected applyTokens(gl: WebGL2RenderingContext, t: Tokens) {
    gl.uniform3fv(this.u.bg, t.bg);
    gl.uniform3fv(this.u.ink, t.ink);
    gl.uniform3fv(this.u.accent, t.accent);
    gl.uniform3fv(this.u.dim, t.dim);
    gl.uniform1f(this.u.invert, t.invert);
    if (t.mono !== this.font) {
      const font = t.mono;
      void loadFont(font).then(() => {
        if (!this.gl || this.tokens?.mono !== font) return;
        this.font = font;
        this.layout(this.gl);
        this.kick();
      });
    }
  }

  protected ready() {
    this.startIntro();
  }

  private startIntro() {
    if (!this.introWanted || this.introAt >= 0 || this.intro >= 1 || !this.gl) return;
    this.introAt = performance.now();
    this.kick();
  }

  /** radius that clears every cell (touch pin / keyboard focus) */
  private full() {
    return (Math.hypot(this.w, this.h) + this.cellH * this.scale * 3) / 0.6;
  }

  protected advance(dt: number, now: number): Next {
    const m = this.m;
    m.x += (m.tx - m.x) * damp(dt, 16);
    m.y += (m.ty - m.y) * damp(dt, 16);
    this.radius += (this.target - this.radius) * damp(dt, this.target > this.radius ? 9 : 14);
    if (this.target === 0 && this.radius < 0.5) this.radius = 0;
    let intro = false;
    if (this.introAt >= 0 && this.intro < 1) {
      const p = Math.min((now - this.introAt) / 800, 1);
      this.intro = 1 - (1 - p) ** 3;
      intro = p < 1;
    }
    const moving = Math.abs(this.target - this.radius) > 0.5 || Math.hypot(m.tx - m.x, m.ty - m.y) > 0.5;
    if (moving || intro) return true;
    // resting ring: only the scramble ticks, 16 times a second, no rAF in between
    return this.radius > 1 && this.radius < this.full() * 0.97 && !document.hidden ? 1000 / 16 : false;
  }

  protected render(gl: WebGL2RenderingContext, now: number) {
    gl.uniform2f(this.u.mouse, this.m.x, this.m.y);
    gl.uniform1f(this.u.radius, this.radius);
    gl.uniform1f(this.u.time, (now - this.t0) / 1000);
    gl.uniform1f(this.u.intro, this.intro);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
  }

  private settle() {
    this.target = this.pinned || this.focus ? this.full() : this.hover ? this.radiusCss * this.scale : 0;
    this.kick();
  }

  private bind() {
    const r = this.root;
    r.addEventListener("pointerenter", (e) => {
      if (e.pointerType !== "mouse") return;
      this.hover = true;
      this.aim(e, this.radius < 1);
      this.settle();
    });
    r.addEventListener("pointermove", (e) => {
      if (e.pointerType !== "mouse" && !this.pinned) return;
      this.aim(e, false);
      this.kick();
    });
    r.addEventListener("pointerleave", (e) => {
      if (e.pointerType !== "mouse") return;
      this.hover = false;
      this.settle();
    });
    r.addEventListener("pointerup", (e) => {
      if (e.pointerType === "mouse") return; // touch / pen: a tap toggles a full reveal
      this.pinned = !this.pinned;
      this.aim(e, true);
      this.settle();
    });
    onFocusVisible(triggerOf(r), (on) => {
      this.focus = on;
      if (on && !this.hover) this.centre();
      this.settle();
    });
  }
}

export function initAscii(root: HTMLElement): void {
  if (root.dataset.fxReady) return;
  const img = root.querySelector("img");
  if (!img) return;
  root.dataset.fxReady = "";
  register(new Ascii(root, img));
}
