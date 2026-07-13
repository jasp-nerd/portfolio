export const site = {
  name: "Jasper Meijerink",
  handle: "jasp-nerd",
  role: "AI & Data Science @ Siemens | AI Honours student @ VU Amsterdam",
  location: "Amsterdam, NL",
  domain: "jaspnerd.dev",
  url: "https://jaspnerd.dev",
  title: "Jasper Meijerink — AI & data science, shipped",
  description:
    "Portfolio of Jasper Meijerink: AI & Data Science at Siemens, BSc AI (Honours) at VU Amsterdam. Computer vision, LLM pipelines and full-stack tools in real hands, including a Canvas backup extension with 4,000+ users.",
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
  "Canvas tool: 4,000+ users",
  "AI workshops for 300+ faculty",
  "Prosus × AISO hackathon finalist",
  "Based in Amsterdam",
] as const;
