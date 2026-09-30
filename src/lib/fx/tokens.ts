// Palette + font tokens for the fx effects, resolved on the effect's root element.
// Colours can be any CSS colour (hex, rgb, oklch, color-mix...): they are resolved through a
// probe element (so var() and inheritance work) and converted to sRGB through a 1x1 canvas.

export type RGB = [number, number, number];

export interface Tokens {
  bg: RGB;
  ink: RGB;
  accent: RGB;
  dim: RGB;
  /** CSS font-family stack for glyphs, always ends in monospace */
  mono: string;
  /** 1 when the ink is darker than the ground (light palettes): glyph density follows darkness */
  invert: number;
}

const FALLBACK = { bg: "#111", ink: "#eee", accent: "#8b6cff", dim: "#555" } as const;
const GENERIC = new Set(["monospace", "ui-monospace", "sans-serif", "serif", "system-ui", "cursive"]);

let scratch: CanvasRenderingContext2D | null = null;

/** Any CSS colour string to sRGB 0..1 (unknown or invalid colours become black). */
export function toRgb(css: string): RGB {
  scratch ??= document.createElement("canvas").getContext("2d", { willReadFrequently: true });
  if (!scratch) return [0, 0, 0];
  scratch.canvas.width = 1;
  scratch.canvas.height = 1;
  scratch.clearRect(0, 0, 1, 1);
  scratch.fillStyle = "#000";
  scratch.fillStyle = css;
  scratch.fillRect(0, 0, 1, 1);
  const d = scratch.getImageData(0, 0, 1, 1).data;
  return [d[0] / 255, d[1] / 255, d[2] / 255];
}

export const luma = (c: RGB) => 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
export const mixRgb = (a: RGB, b: RGB, t: number): RGB => [
  a[0] + (b[0] - a[0]) * t,
  a[1] + (b[1] - a[1]) * t,
  a[2] + (b[2] - a[2]) * t,
];

/** Quote bare family names so "Redaction 35" or "Geist Mono Variable" survive the font shorthand. */
export function fontStack(raw: string): string {
  const fams = raw
    .split(",")
    .map((f) => f.trim())
    .filter(Boolean)
    .map((f) => (/^["']/.test(f) || GENERIC.has(f) ? f : `"${f}"`));
  if (!fams.includes("monospace")) fams.push("monospace");
  return fams.join(", ");
}

/**
 * Resolve --fx-* for `root`: a value set on the root itself wins, else the nearest ancestor's
 * --fx-*, else --bg/--ink/--accent/--dim, else hard defaults.
 * (global.css declares `[data-fx] { --fx-bg: var(--bg) }` on the root, which would shadow values set
 * on an ancestor; a root value equal to that default is treated as "not set" and resolved on the parent.)
 */
export function readTokens(root: HTMLElement): Tokens {
  const own = getComputedStyle(root);
  // one fresh probe per token: a colour change on a live element can start a CSS transition
  // (global reduced-motion rules set 0.01ms durations) and report the old colour
  const probes = (Object.keys(FALLBACK) as (keyof typeof FALLBACK)[]).map((name) => {
    const mine = own.getPropertyValue(`--fx-${name}`).trim();
    const dflt = own.getPropertyValue(`--${name}`).trim() || FALLBACK[name];
    const p = document.createElement("span");
    p.setAttribute("aria-hidden", "true");
    p.style.cssText =
      "position:absolute;width:0;height:0;overflow:hidden;visibility:hidden;pointer-events:none;transition:none!important";
    p.style.color = mine && mine !== dflt ? mine : `var(--fx-${name}, var(--${name}, ${FALLBACK[name]}))`;
    return p;
  });
  (root.parentElement ?? root).append(...probes);
  const [bg, ink, accent, dim] = probes.map((p) => toRgb(getComputedStyle(p).color));
  probes.forEach((p) => p.remove());
  const mono = fontStack(own.getPropertyValue("--fx-mono").trim());
  return { bg, ink, accent, dim, mono, invert: luma(ink) < luma(bg) ? 1 : 0 };
}

/** Wait (max 1.5s) for the glyph font so the atlas is not built from a fallback face. */
export async function loadFont(stack: string): Promise<void> {
  if (!("fonts" in document)) return;
  const timeout = new Promise<void>((r) => setTimeout(r, 1500));
  await Promise.race([document.fonts.load(`16px ${stack}`).then(() => undefined), timeout]).catch(() => {});
}
