export function extractVersion(text: string): string {
  const match = text.match(/v?\d+\.\d+(?:\.\d+)?/);
  if (!match) return "v1.0.0";
  return match[0].startsWith("v") ? match[0] : `v${match[0]}`;
}

export interface ChangeRow {
  label: string;
  dot: string;
  detail: string;
}

export const CHANGE_ROWS: ChangeRow[] = [
  { label: "Added", dot: "#22c55e", detail: "New capabilities and endpoints" },
  { label: "Improved", dot: "#3b82f6", detail: "Performance, stability, polish" },
  { label: "Fixed", dot: "#f59e0b", detail: "Bugs resolved this release" },
];
