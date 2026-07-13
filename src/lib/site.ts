export const site = {
  name: "Jasper Meijerink",
  handle: "jasp-nerd",
  role: "AI Engineer in training",
  location: "Amsterdam, NL",
  domain: "jaspnerd.dev",
  url: "https://jaspnerd.dev",
  title: "Jasper Meijerink — AI student building things that ship",
  description:
    "Portfolio of Jasper Meijerink: BSc Artificial Intelligence (Honours) student at VU Amsterdam, working student AI & Data Science at Siemens. Twelve shipped projects across AI/ML, full-stack and automation.",
  email: "jasper.meijerink@outlook.com",
  github: "https://github.com/jasp-nerd",
  linkedin: "https://www.linkedin.com/in/jasper-meij-ai",
  ogImage: "/og.png",
} as const;

export const nav = [
  { label: "Work", href: "/#work" },
  { label: "About", href: "/#about" },
  { label: "Experience", href: "/#experience" },
  { label: "Contact", href: "/#contact" },
] as const;

/** Ticker belt items — role facts, kept honest. */
export const ticker = [
  "AI & Data Science @ Siemens",
  "BSc AI (Honours) @ VU Amsterdam",
  "12 projects shipped",
  "2 extensions on Chrome Web Store",
  "AI literacy workshops for 100+ faculty",
  "Based in Amsterdam",
] as const;
