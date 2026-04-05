import type { LogoPosition } from "../template.schema";
import type { TemplateProps } from "./types";

/** Resolved colors from dark/light mode toggle. */
export interface ThemeColors {
  bg: string;
  fg: string;
  muted: string;
  surface: string;
  border: string;
}

export function resolveTheme(dark: boolean, _accent: string): ThemeColors {
  return dark
    ? { bg: "#0f172a", fg: "#f8fafc", muted: "#94a3b8", surface: "#1e293b", border: "#334155" }
    : { bg: "#ffffff", fg: "#0f172a", muted: "#64748b", surface: "#f1f5f9", border: "#e2e8f0" };
}

export function logoStyles(position: LogoPosition): Record<string, string> {
  const base: Record<string, string> = { position: "absolute", width: "48px", height: "48px" };
  switch (position) {
    case "top-left":
      return { ...base, top: "40px", left: "60px" };
    case "top-right":
      return { ...base, top: "40px", right: "60px" };
    case "bottom-left":
      return { ...base, bottom: "40px", left: "60px" };
    case "bottom-right":
      return { ...base, bottom: "40px", right: "60px" };
  }
}

export function truncate(text: string | null, max: number): string {
  if (!text) return "";
  return text.length > max ? `${text.slice(0, max)}…` : text;
}

export function title(props: TemplateProps): string {
  return props.metadata.ogTitle ?? props.metadata.title ?? props.metadata.url;
}

export function description(props: TemplateProps): string {
  return truncate(props.metadata.ogDescription ?? props.metadata.description, 160);
}
