// Alt text for project images, from the media manifest's descriptions when there is one.
import type { ImageMetadata } from "astro";
import manifest from "../../assets/projects/media.json";

type Entry = { path: string; description?: string };
const byKey = new Map<string, string>();
for (const [slug, list] of Object.entries((manifest as { projects?: Record<string, Entry[]> }).projects ?? {})) {
  for (const e of list) {
    const name = e.path.split("/").pop()!.split(".")[0];
    if (e.description) byKey.set(`${slug}/${name}`, e.description);
  }
}

export function altFor(slug: string, img: ImageMetadata, fallback: string): string {
  const file = img.src.split("?")[0].split("/").pop() ?? "";
  const name = file.split(".")[0];
  return byKey.get(`${slug}/${name}`) ?? fallback;
}
