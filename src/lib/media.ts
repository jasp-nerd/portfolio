import type { ImageMetadata } from "astro";
import fs from "node:fs";
import path from "node:path";

// Media per project is found by convention, so content files never hardcode paths:
//   src/assets/projects/<slug>/cover.*, still-N.*, icon.*   (optimized by astro:assets)
//   public/media/<slug>/loop.{mp4,webm}, loop-poster.jpg, demo.mp4, demo.vtt, demo-poster.jpg
const images = import.meta.glob<{ default: ImageMetadata }>(
  "/src/assets/projects/*/*.{png,jpg,jpeg,webp,svg}",
  { eager: true },
);

export interface ProjectMedia {
  cover?: ImageMetadata;
  stills: ImageMetadata[];
  icon?: ImageMetadata;
  loop?: { mp4: string; webm?: string; poster?: string };
  demo?: { mp4: string; vtt?: string; poster?: string };
}

const pub = (p: string) => fs.existsSync(path.join(process.cwd(), "public", p));

export function getMedia(slug: string): ProjectMedia {
  const mine = Object.entries(images).filter(([p]) => p.split("/").at(-2) === slug);
  const find = (name: string) => mine.find(([p]) => path.parse(p).name === name)?.[1].default;
  const stills = mine
    .filter(([p]) => path.parse(p).name.startsWith("still-"))
    .sort(([a], [b]) => a.localeCompare(b, undefined, { numeric: true }))
    .map(([, m]) => m.default);

  const base = `/media/${slug}`;
  const loop = pub(`${base}/loop.mp4`)
    ? {
        mp4: `${base}/loop.mp4`,
        webm: pub(`${base}/loop.webm`) ? `${base}/loop.webm` : undefined,
        poster: pub(`${base}/loop-poster.jpg`) ? `${base}/loop-poster.jpg` : undefined,
      }
    : undefined;
  const demo = pub(`${base}/demo.mp4`)
    ? {
        mp4: `${base}/demo.mp4`,
        vtt: pub(`${base}/demo.vtt`) ? `${base}/demo.vtt` : undefined,
        poster: pub(`${base}/demo-poster.jpg`) ? `${base}/demo-poster.jpg` : undefined,
      }
    : undefined;

  return { cover: find("cover"), stills, icon: find("icon"), loop, demo };
}
