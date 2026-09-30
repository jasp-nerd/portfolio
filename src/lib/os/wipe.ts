// Full-screen pixel-block wipe (the vuk.fyi move): blocks fill in random order,
// the swap happens under full cover, then blocks clear in a new random order. ~480ms total.
export function pixelWipe(swap: () => void, color = getComputedStyle(document.documentElement).getPropertyValue("--ink").trim() || "#222") {
  const c = document.createElement("canvas");
  const B = 32;
  const cols = Math.ceil(innerWidth / B), rows = Math.ceil(innerHeight / B);
  c.width = cols;
  c.height = rows;
  c.className = "wipe";
  c.setAttribute("aria-hidden", "true");
  document.body.append(c);
  const ctx = c.getContext("2d")!;
  const order = () => {
    const a = Array.from({ length: cols * rows }, (_, i) => i);
    for (let i = a.length - 1; i > 0; i--) {
      const j = (Math.random() * (i + 1)) | 0;
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  };
  const inn = order(), out = order();
  const T = 220;
  let t0 = 0, phase = 0, drawn = 0;
  ctx.fillStyle = color;
  const step = (now: number) => {
    if (!t0) t0 = now;
    const p = Math.min(1, (now - t0) / T);
    const target = Math.floor(p * inn.length);
    const list = phase === 0 ? inn : out;
    for (; drawn < target; drawn++) {
      const i = list[drawn];
      if (phase === 0) ctx.fillRect(i % cols, (i / cols) | 0, 1, 1);
      else ctx.clearRect(i % cols, (i / cols) | 0, 1, 1);
    }
    if (p < 1) return void requestAnimationFrame(step);
    if (phase === 0) {
      swap();
      phase = 1;
      t0 = 0;
      drawn = 0;
      ctx.fillRect(0, 0, cols, rows);
      requestAnimationFrame(step);
    } else c.remove();
  };
  requestAnimationFrame(step);
}
