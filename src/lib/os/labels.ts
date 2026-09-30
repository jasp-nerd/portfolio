// UI labels for jasp.os. Version-specific microcopy only, never project copy.

export function linkLabel(kind: string, url: string): string {
  if (kind === "store") return url.includes("chromewebstore") ? "chrome web store" : "store";
  if (kind === "github") return "source";
  if (kind === "pypi") return "pypi";
  if (kind === "live") return "website";
  return kind;
}

/** What the trash says when you try to throw something in it. */
export function refusal(opts: { stat?: { value: string; label: string }; kind: string }): string {
  const { stat, kind } = opts;
  if (stat && /user/i.test(stat.label)) return `nope, ${stat.value} people use that.`;
  if (kind === "project") return "nope, that one still works.";
  return "nope, I still need that.";
}
