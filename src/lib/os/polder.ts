// jasp.os wallpaper: a Dutch polder at golden hour, in violet, through an 8x8 Bayer dither.
// Rendered at 1/PX resolution into a 2D canvas and scaled up with pixelated sampling.
// Static layers (sky, fields, ditches, treeline, sheep) are computed once per resize;
// per frame only the drifting clouds and the windmill sails change, at ~12 fps.
// Reduced motion: one still frame. Hidden tab: paused.

import { hash, vnoise, fbm, clamp, smooth } from "./noise";

const PX = 3;
const FPS = 12;
const BAYER = [
  0, 32, 8, 40, 2, 34, 10, 42, 48, 16, 56, 24, 50, 18, 58, 26, 12, 44, 4, 36, 14, 46, 6, 38, 60, 28, 52, 20, 62, 30, 54,
  22, 3, 35, 11, 43, 1, 33, 9, 41, 51, 19, 59, 27, 49, 17, 57, 25, 15, 47, 7, 39, 13, 45, 5, 37, 63, 31, 55, 23, 61, 29,
  53, 21,
].map((v) => (v + 0.5) / 64);

type RGB = [number, number, number];
function parseColor(s: string): RGB {
  const hex = s.trim().replace("#", "");
  if (/^[0-9a-f]{6}$/i.test(hex)) return [0, 2, 4].map((i) => parseInt(hex.slice(i, i + 2), 16)) as RGB;
  const m = s.match(/\d+(\.\d+)?/g);
  return m ? [+m[0], +m[1], +m[2]] : [128, 128, 128];
}

interface Mill { x: number; y: number; h: number; L: number; }

export function initPolder(host: HTMLElement) {
  const canvas = host.querySelector("canvas")!;
  const ctx = canvas.getContext("2d", { alpha: false })!;
  const still = matchMedia("(prefers-reduced-motion: reduce)");
  let W = 0, H = 0, hy = 0, CW = 0;
  let base = new Float32Array(0), frame = new Float32Array(0), cloud = new Float32Array(0);
  let img: ImageData;
  let pal: RGB[] = [];
  let big: Mill = { x: 0, y: 0, h: 0, L: 0 }, small: Mill = { x: 0, y: 0, h: 0, L: 0 };
  let angle = 0.4, speed = 0.3, drift = 0;
  let broken = false, fly: { x: number; y: number; vx: number; vy: number; a: number } | null = null;
  let raf = 0, last = 0;

  function readPalette() {
    const cs = getComputedStyle(host);
    const n = +cs.getPropertyValue("--wp-levels") || 5;
    const all = [0, 1, 2, 3, 4].map((i) => parseColor(cs.getPropertyValue(`--wp${i}`) || "#888"));
    pal = n === 2 ? [all[0], all[4]] : all;
  }

  function build() {
    const r = host.getBoundingClientRect();
    W = Math.max(1, Math.ceil(r.width / PX));
    H = Math.max(1, Math.ceil(r.height / PX));
    canvas.width = W;
    canvas.height = H;
    canvas.style.width = `${W * PX}px`;
    canvas.style.height = `${H * PX}px`;
    img = ctx.createImageData(W, H);
    const portrait = W < H;
    hy = Math.round(H * (portrait ? 0.6 : 0.655));
    const s = Math.min(H, W * 1.1);
    big = { x: Math.round(W * (portrait ? 0.74 : 0.872)), y: hy, h: s * 0.165, L: s * 0.125 };
    small = { x: Math.round(W * (portrait ? 0.16 : 0.105)), y: hy, h: s * 0.05, L: s * 0.04 };
    base = new Float32Array(W * H);
    frame = new Float32Array(W * H);
    CW = W * 2;
    cloud = new Float32Array(CW * hy);
    const sunX = W * (portrait ? 0.3 : 0.2), sunY = hy - H * 0.085, sunR = Math.max(4, s * 0.045);
    const vpx = W * 0.6;
    const clumps = [
      [0.02, 0.07, 0.03], [0.33, 0.04, 0.02], [0.47, 0.02, 0.012], [0.68, 0.03, 0.016], [0.97, 0.06, 0.028],
    ];
    const sheep = [[0.28, 0.2], [0.305, 0.23], [0.43, 0.42], [0.62, 0.3], [0.16, 0.62]];

    for (let y = 0; y < H; y++) {
      for (let x = 0; x < W; x++) {
        let v: number;
        if (y < hy) {
          const t = y / hy;
          v = 0.5 + 0.46 * Math.pow(t, 1.6);
          const d = Math.hypot(x - sunX, (y - sunY) * 1.1) / sunR;
          if (d < 1) v = 1;
          else v += 0.22 * Math.exp(-(d - 1) * 0.35) * (0.6 + 0.4 * t);
          // treeline and a church spire on the horizon
          const u = x / W;
          for (const [cu, hw, hf] of clumps) {
            const dx = (u - cu) / hw;
            if (Math.abs(dx) < 1) {
              const th = H * hf * Math.sqrt(1 - dx * dx) * (0.7 + 0.6 * vnoise(x * 0.45, 3.1));
              if (hy - y <= th) v = 0.12 + 0.08 * vnoise(x * 0.9, y * 0.9);
            }
          }
          const sx = Math.round(W * 0.585);
          if (Math.abs(x - sx) <= 1 && hy - y < H * 0.05 - Math.abs(x - sx) * 2) v = 0.1;
          if (Math.abs(x - sx) <= 3 && hy - y < H * 0.02) v = 0.12;
        } else {
          const d = (y - hy + 1) / (H - hy);
          const depth = 1 / d;
          const X = ((x - vpx) / H) * depth * 2.4;
          const Z = depth * 1.3;
          const fi = Math.floor(X), ff = X - fi;
          const zi = Math.floor(Z / 2.2), zf = Z / 2.2 - zi;
          const foot = (depth * 2.4) / H;
          const footZ = (depth * depth * 1.3) / (H - hy) / 2.2;
          v = 0.23 + 0.17 * hash(fi, zi) + (vnoise(x * 0.35, y * 0.7) - 0.5) * 0.1;
          const dw = 0.06;
          const ditchX = ff < dw ? clamp(1 - foot / (dw * 2)) : 0;
          const ditchZ = zf < 0.07 ? clamp(1 - footZ / 0.14) : 0;
          const w = Math.max(ditchX, ditchZ * 0.9);
          v = v * (1 - w) + (0.78 + 0.1 * (1 - d)) * w;
          const haze = Math.exp(-(y - hy) / (0.06 * H));
          v = v * (1 - haze * 0.55) + 0.66 * haze * 0.55;
        }
        base[y * W + x] = v;
      }
    }
    // sheep, grazing in fixed spots
    for (const [u, dv] of sheep) {
      const sx = Math.round(W * u), sy = Math.round(hy + (H - hy) * dv);
      const sz = Math.max(1, Math.round(1 + dv * 2.2));
      for (let yy = 0; yy < sz + 1; yy++)
        for (let xx = 0; xx < sz * 2; xx++) {
          const i = (sy + yy) * W + sx + xx;
          if (i >= 0 && i < base.length) base[i] = 1;
        }
      const hi = (sy) * W + sx - 1;
      if (hi >= 0 && hi < base.length) base[hi] = 0.05;
    }
    for (let y = 0; y < hy; y++) {
      const fade = 1 - (y / hy) * 0.85;
      for (let x = 0; x < CW; x++) {
        // wrap horizontally so the drift loops seamlessly
        const n = fbm(x / 26, y / 7.5) * (1 - x / CW) + fbm((x - CW) / 26, y / 7.5) * (x / CW);
        cloud[y * CW + x] = smooth(0.5, 0.72, n) * 0.3 * fade;
      }
    }
  }

  function drawMill(m: Mill, a: number, missing: number) {
    const top = m.y - m.h;
    // tower: tapered body, a gallery, a cap
    for (let y = Math.floor(top); y < m.y; y++) {
      const t = (y - top) / m.h;
      const hw = m.h * (0.1 + 0.1 * t);
      for (let x = Math.floor(m.x - hw); x <= m.x + hw; x++) set(x, y, 0.06);
    }
    const gy = Math.round(m.y - m.h * 0.35);
    for (let x = Math.floor(m.x - m.h * 0.24); x <= m.x + m.h * 0.24; x++) set(x, gy, 0.06);
    const capR = m.h * 0.12;
    for (let y = Math.floor(top - capR); y < top; y++)
      for (let x = Math.floor(m.x - capR); x <= m.x + capR; x++)
        if (Math.hypot(x - m.x, (y - top) * 1.4) < capR) set(x, y, 0.06);
    if (m.h > 20) set(Math.round(m.x), Math.round(m.y - m.h * 0.12), 0.9), set(Math.round(m.x), Math.round(m.y - m.h * 0.12) - 1, 0.9);
    const hx = m.x, hyy = top - capR * 0.4;
    for (let k = 0; k < 4; k++) if (k !== missing) drawSail(hx, hyy, a + (k * Math.PI) / 2, m.L);
  }

  function drawSail(cx: number, cy: number, a: number, L: number) {
    const sw = Math.max(2, L * 0.2);
    const c = Math.cos(a), s = Math.sin(a);
    const R = Math.ceil(L + sw + 2);
    for (let y = Math.floor(cy - R); y <= cy + R; y++)
      for (let x = Math.floor(cx - R); x <= cx + R; x++) {
        const dx = x - cx, dy = y - cy;
        const along = dx * c + dy * s, perp = -dx * s + dy * c;
        if (along < -1 || along > L) continue;
        if (Math.abs(perp) < 0.75) { set(x, y, 0.05); continue; }
        if (along > L * 0.2 && perp > 0 && perp < sw) {
          const edge = perp > sw - 1 || along > L - 1;
          const bar = Math.floor(along / 2.6) % 2 === 0;
          if (edge || bar) set(x, y, 0.08);
        }
      }
  }

  function set(x: number, y: number, v: number) {
    if (x < 0 || y < 0 || x >= W || y >= H) return;
    frame[y * W + x] = v;
  }

  function render() {
    const off = drift % CW;
    const o0 = Math.floor(off), of = off - o0;
    for (let y = 0; y < H; y++) {
      const row = y * W;
      if (y < hy) {
        const crow = y * CW;
        for (let x = 0; x < W; x++) {
          const i0 = (x + o0) % CW, i1 = (i0 + 1) % CW;
          const cl = cloud[crow + i0] * (1 - of) + cloud[crow + i1] * of;
          const b = base[row + x];
          frame[row + x] = b < 0.3 ? b : b + cl;
        }
      } else frame.set(base.subarray(row, row + W), row);
    }
    drawMill(small, angle * 0.8 + 1, -1);
    drawMill(big, angle, broken ? 1 : -1);
    if (fly) drawSail(fly.x, fly.y, fly.a, big.L);

    const d = img.data, n = pal.length - 1;
    for (let y = 0; y < H; y++) {
      const brow = (y & 7) * 8;
      for (let x = 0; x < W; x++) {
        const i = y * W + x;
        const sv = clamp(frame[i]) * n;
        let k = Math.floor(sv);
        if (sv - k > BAYER[brow + (x & 7)]) k++;
        const c = pal[k > n ? n : k];
        const j = i * 4;
        d[j] = c[0]; d[j + 1] = c[1]; d[j + 2] = c[2]; d[j + 3] = 255;
      }
    }
    ctx.putImageData(img, 0, 0);
  }

  function tick(now: number) {
    raf = requestAnimationFrame(tick);
    if (now - last < 1000 / FPS) return;
    const dt = Math.min(0.2, (now - (last || now)) / 1000);
    last = now;
    speed += (0.3 - speed) * (1 - Math.exp(-dt / 2.5));
    if (!broken) angle += speed * dt;
    drift += dt * 0.9;
    if (fly) {
      fly.vy += 60 * dt;
      fly.x += fly.vx * dt; fly.y += fly.vy * dt; fly.a += 7 * dt;
      if (fly.y > H + big.L || fly.x > W + big.L) fly = null;
    }
    render();
  }

  function start() {
    cancelAnimationFrame(raf);
    render();
    if (!still.matches && !document.hidden) { last = 0; raf = requestAnimationFrame(tick); }
  }

  readPalette();
  build();
  start();
  host.dataset.ready = "";
  let rt = 0;
  addEventListener("resize", () => { clearTimeout(rt); rt = window.setTimeout(() => { build(); start(); }, 150); });
  document.addEventListener("visibilitychange", start);
  still.addEventListener("change", start);

  return {
    /** is this client point on the big windmill? */
    hit(cx: number, cy: number) {
      const r = canvas.getBoundingClientRect();
      const x = (cx - r.left) / PX, y = (cy - r.top) / PX;
      const hubY = big.y - big.h - big.h * 0.05;
      return Math.hypot(x - big.x, y - hubY) < big.L + 2 || (Math.abs(x - big.x) < big.h * 0.22 && y < big.y && y > big.y - big.h);
    },
    /** spin it faster; returns true when it just broke */
    poke(): boolean {
      if (broken) return false;
      speed += 2.2;
      if (still.matches) angle += 0.5;
      if (speed > 9) {
        broken = true;
        const top = big.y - big.h;
        fly = still.matches ? null : { x: big.x, y: top - big.h * 0.05, vx: 70, vy: -55, a: angle + Math.PI / 2 };
        render();
        return true;
      }
      render();
      return false;
    },
    fix() { broken = false; fly = null; speed = 0.3; render(); },
    repaint() { readPalette(); render(); },
    /** 1440x900-ish still, used to regenerate the no-JS fallback */
    snapshot: () => canvas.toDataURL("image/png"),
  };
}
export type Polder = ReturnType<typeof initPolder>;
