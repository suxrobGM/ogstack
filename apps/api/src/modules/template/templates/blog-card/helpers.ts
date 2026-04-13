export function deriveCategory(url: string): string {
  try {
    const path = new URL(url).pathname.split("/").filter(Boolean);
    const slug = path[0] ?? "Article";
    return slug.replace(/[-_]/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
  } catch {
    return "Article";
  }
}

export function estimateReadTime(text: string | null | undefined): string {
  const words = (text ?? "").trim().split(/\s+/).filter(Boolean).length;
  const minutes = Math.max(3, Math.round(words / 120) || 4);
  return `${minutes} min read`;
}
