export function getPathSegments(url: string): string[] {
  try {
    return new URL(url).pathname.split("/").filter(Boolean).slice(0, 4);
  } catch {
    return [];
  }
}

export function buildNavItems(
  firstSegment: string | undefined,
): Array<{ label: string; active: boolean }> {
  return [
    { label: "Getting Started", active: false },
    { label: firstSegment ?? "Guides", active: true },
    { label: "API Reference", active: false },
    { label: "Examples", active: false },
    { label: "Changelog", active: false },
  ];
}
