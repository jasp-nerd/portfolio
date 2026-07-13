import { defineCollection } from "astro:content";
import { z } from "astro:schema";
import { glob, file } from "astro/loaders";

const projects = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/projects" }),
  schema: z.object({
    title: z.string(),
    tagline: z.string(),
    description: z.string(),
    index: z.number(),
    featured: z.boolean().default(false),
    status: z.string(),
    period: z.string().optional(),
    stack: z.array(z.string()),
    links: z
      .object({
        github: z.string().url().optional(),
        live: z.string().url().optional(),
        store: z.string().url().optional(),
      })
      .default({}),
    specs: z
      .array(z.object({ label: z.string(), value: z.string() }))
      .default([]),
  }),
});

const experience = defineCollection({
  loader: file("./src/content/experience.json"),
  schema: z.object({
    id: z.string(),
    role: z.string(),
    org: z.string(),
    place: z.string(),
    period: z.string(),
    kind: z.enum(["work", "education", "community"]),
    order: z.number(),
    points: z.array(z.string()),
  }),
});

export const collections = { projects, experience };
