// Small WebGL2 toolkit shared by the fx effects: program + fullscreen triangle, image textures,
// auto-levels, image readiness, and GLSL snippets. Everything else lives in effect.ts / budget.ts.

export { readTokens, loadFont, toRgb, type Tokens, type RGB } from "./tokens";

export const VERT = `#version 300 es
layout(location = 0) in vec2 a;
void main(){ gl_Position = vec4(a, 0.0, 1.0); }`;

/** object-fit: cover (+ object-position) mapping, and ordered-dither thresholds. */
export const GLSL_COMMON = `
vec2 coverUV(vec2 uv, vec2 res, vec2 imgRes, vec2 pos){
  float ca = res.x / res.y, ia = imgRes.x / imgRes.y;
  vec2 s = ca > ia ? vec2(1.0, ia / ca) : vec2(ca / ia, 1.0);
  return uv * s + (1.0 - s) * pos;
}
float bayer2(vec2 a){ a = floor(a); return fract(a.x * 0.5 + a.y * a.y * 0.75); }
float bayer4(vec2 a){ return bayer2(0.5 * a) * 0.25 + bayer2(a); }
float bayer8(vec2 a){ return bayer4(0.5 * a) * 0.25 + bayer2(a); }
float hash(vec2 p){ p = fract(p * vec2(123.34, 456.21)); p += dot(p, p + 45.32); return fract(p.x * p.y); }
`;

export const reducedMotion = () => matchMedia("(prefers-reduced-motion: reduce)").matches;

function compile(gl: WebGL2RenderingContext, type: number, src: string): WebGLShader {
  const s = gl.createShader(type);
  if (!s) throw new Error("fx: createShader failed");
  gl.shaderSource(s, src);
  gl.compileShader(s);
  if (!gl.getShaderParameter(s, gl.COMPILE_STATUS) && !gl.isContextLost()) {
    throw new Error(`fx: shader compile failed\n${gl.getShaderInfoLog(s)}`);
  }
  return s;
}

/** Compile + link `frag`, bind a fullscreen triangle, return uniform locations (u_<name>). */
export function program<N extends string>(
  gl: WebGL2RenderingContext,
  frag: string,
  names: readonly N[],
): Record<N, WebGLUniformLocation | null> {
  const p = gl.createProgram();
  if (!p) throw new Error("fx: createProgram failed");
  gl.attachShader(p, compile(gl, gl.VERTEX_SHADER, VERT));
  gl.attachShader(p, compile(gl, gl.FRAGMENT_SHADER, frag));
  gl.linkProgram(p);
  if (!gl.getProgramParameter(p, gl.LINK_STATUS) && !gl.isContextLost()) {
    throw new Error(`fx: link failed\n${gl.getProgramInfoLog(p)}`);
  }
  gl.useProgram(p);
  gl.bindVertexArray(gl.createVertexArray());
  gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
  gl.enableVertexAttribArray(0);
  gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
  const u = {} as Record<N, WebGLUniformLocation | null>;
  for (const n of names) u[n] = gl.getUniformLocation(p, `u_${n}`);
  return u;
}

type TexSource = HTMLImageElement | HTMLCanvasElement;

/** Upload an image/canvas to texture `unit`. mip: trilinear mipmaps (cheap cell averages via textureLod). */
export function texture(
  gl: WebGL2RenderingContext,
  unit: number,
  src: TexSource,
  mip: boolean,
  tex?: WebGLTexture | null,
): WebGLTexture | null {
  const t = tex ?? gl.createTexture();
  gl.activeTexture(gl.TEXTURE0 + unit);
  gl.bindTexture(gl.TEXTURE_2D, t);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, src);
  if (mip) gl.generateMipmap(gl.TEXTURE_2D);
  const min = mip ? gl.LINEAR_MIPMAP_LINEAR : gl.NEAREST;
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, min);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, mip ? gl.LINEAR : gl.NEAREST);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  return t;
}

/** Resolve once the <img> has pixels (lazy images included); rejects on a broken image. */
export async function imageReady(img: HTMLImageElement): Promise<void> {
  if (!img.complete) {
    await new Promise<void>((ok, fail) => {
      img.addEventListener("load", () => ok(), { once: true });
      img.addEventListener("error", () => fail(new Error("fx: image failed to load")), { once: true });
    });
  }
  if (!img.naturalWidth) throw new Error("fx: image has no pixels");
  await img.decode().catch(() => {});
}

/** 3rd / 97th luminance percentile, so dark or washed-out photos still use the full ramp. */
export function autoLevels(img: HTMLImageElement): [number, number] {
  try {
    const c = document.createElement("canvas");
    c.width = c.height = 64;
    const x = c.getContext("2d", { willReadFrequently: true });
    if (!x) return [0, 1];
    x.drawImage(img, 0, 0, 64, 64);
    const d = x.getImageData(0, 0, 64, 64).data;
    const L: number[] = [];
    for (let i = 0; i < d.length; i += 4) {
      if (d[i + 3] < 8) continue;
      L.push((0.2126 * d[i] + 0.7152 * d[i + 1] + 0.0722 * d[i + 2]) / 255);
    }
    if (L.length < 16) return [0, 1];
    L.sort((a, b) => a - b);
    const lo = L[Math.floor(L.length * 0.03)];
    const hi = L[Math.floor(L.length * 0.97)];
    return [lo, Math.max(hi, lo + 0.1)];
  } catch {
    return [0, 1];
  }
}

/** object-position of the <img> as 0..1 (percentages only; anything else is centred). */
export function objectPosition(img: HTMLImageElement): [number, number] {
  const parts = getComputedStyle(img).objectPosition.split(/\s+/);
  const pct = (s: string | undefined) => (s && s.endsWith("%") ? parseFloat(s) / 100 : 0.5);
  return [pct(parts[0]), pct(parts[1])];
}
