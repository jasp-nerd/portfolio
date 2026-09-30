// Glyph atlas for the ASCII effect, built at runtime in the page's mono font.
// Candidate glyphs are rendered at the exact cell size (device px), their ink coverage is
// measured, and ~14 glyphs evenly spaced by coverage are kept. So the ramp adapts to whatever
// monospace the version ships, and NEAREST sampling keeps the glyphs terminal-crisp.

const CANDIDATES = " .,:;-~=+<>!?/|()[]{}*1il7%#&$@0";
const RAMP = 14;

export interface Atlas {
  canvas: HTMLCanvasElement;
  count: number;
}

export function buildAtlas(cw: number, ch: number, font: string): Atlas {
  const c = document.createElement("canvas");
  const x = c.getContext("2d", { willReadFrequently: true });
  if (!x) throw new Error("fx: 2d context unavailable");
  x.font = `100px ${font}`;
  const advance = x.measureText("M").width / 100 || 0.6;
  // as tall as the cell allows, but never wider than it
  const px = Math.max(4, Math.min(Math.round(ch * 0.86), Math.floor(cw / advance)));
  const face = `${px}px ${font}`;
  const draw = (g: string, cx: number) => x.fillText(g, cx, ch / 2 + px * 0.04);

  c.width = cw;
  c.height = ch;
  const coverage = (g: string) => {
    x.clearRect(0, 0, cw, ch);
    x.fillStyle = "#fff";
    x.font = face;
    x.textAlign = "center";
    x.textBaseline = "middle";
    draw(g, cw / 2);
    const d = x.getImageData(0, 0, cw, ch).data;
    let s = 0;
    for (let i = 3; i < d.length; i += 4) s += d[i];
    return s;
  };
  const scored = [...CANDIDATES].map((g) => ({ g, s: coverage(g) })).sort((a, b) => a.s - b.s);
  const max = scored[scored.length - 1].s || 1;
  const ramp: string[] = [];
  for (let i = 0; i < RAMP; i++) {
    const target = (i / (RAMP - 1)) ** 1.15 * max;
    let best = scored[0];
    for (const e of scored) if (Math.abs(e.s - target) < Math.abs(best.s - target)) best = e;
    if (!ramp.includes(best.g)) ramp.push(best.g);
  }

  c.width = cw * ramp.length;
  c.height = ch;
  x.fillStyle = "#000";
  x.fillRect(0, 0, c.width, c.height);
  x.fillStyle = "#fff";
  x.font = face;
  x.textAlign = "center";
  x.textBaseline = "middle";
  ramp.forEach((g, i) => draw(g, (i + 0.5) * cw));
  return { canvas: c, count: ramp.length };
}
