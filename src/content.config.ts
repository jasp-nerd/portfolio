import { defineCollection } from "astro:content";
import { z } from "astro/zod";
import { glob, file } from "astro/loaders";

// Project copy lives in markdown; media is resolved by slug in src/lib/media.ts.
const projects = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/projects" }),
  schema: z.object({
    title: z.string(),
    oneliner: z.string(),
    kind: z.string(),
    year: z.number(),
    when: z.string(),
    role: z.string(),
    effort: z.string(),
    stat: z.object({ value: z.string(), label: z.string() }),
    stack: z.array(z.string()),
    links: z
      .object({
        live: z.string().url().optional(),
        github: z.string().url().optional(),
        store: z.string().url().optional(),
        pypi: z.string().url().optional(),
      })
      .default({}),
    tier: z.enum(["featured", "side"]),
    order: z.number(),
  }),
});

const experience = defineCollection({
  loader: file("./src/content/experience.json"),
  schema: z.object({
    id: z.string(),
    role: z.string(),
    org: z.string(),
    place: z.string(),
    when: z.string(),
    now: z.boolean(),
    kind: z.enum(["work", "education", "community"]),
    order: z.number(),
    points: z.array(z.string()),
  }),
});

export const collections = { projects, experience };
