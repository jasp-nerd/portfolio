// Images in a project's asset folder that don't follow the cover/still-N naming
// (e.g. cookbuddy/start.jpg). Used as a fallback cover and stills.
import type { ImageMetadata } from "astro";

const all = import.meta.glob<{ default: ImageMetadata }>("/src/assets/projects/*/*.{png,jpg,jpeg,webp,svg}", {
  eager: true,
});
const PREFER = ["start", "hero", "home", "main"];

export function extraImages(slug: string): ImageMetadata[] {
  return Object.entries(all)
    .filter(([p]) => p.split("/").at(-2) === slug)
    .map(([p, m]) => ({ name: p.split("/").pop()!.split(".")[0], img: m.default }))
    .filter(({ name }) => !/^(cover|icon|still-\d+)$/.test(name))
    .sort((a, b) => {
      const ra = PREFER.indexOf(a.name), rb = PREFER.indexOf(b.name);
      return (ra < 0 ? 99 : ra) - (rb < 0 ? 99 : rb) || a.name.localeCompare(b.name);
    })
    .map(({ img }) => img);
}
