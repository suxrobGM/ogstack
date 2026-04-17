import type { ImageDimensions } from "@ogstack/shared/constants";
import type { LogoPosition } from "../template.schema";
import type { ScaleTokens, TemplateProps } from "./types";

export interface ThemeColors {
  bg: string;
  bgElevated: string;
  fg: string;
  fgSoft: string;
  muted: string;
  surface: string;
  border: string;
  accent: string;
  accentSoft: string;
  accentGlow: string;
  accentStrong: string;
  accentOn: string;
}

interface RGB {
  r: number;
  g: number;
  b: number;
}

function hexToRgb(hex: string): RGB {
  const clean = hex.replace("#", "");
  const full =
    clean.length === 3
      ? clean
          .split("")
          .map((c) => c + c)
          .join("")
      : clean;
  const r = Number.parseInt(full.slice(0, 2), 16);
  const g = Number.parseInt(full.slice(2, 4), 16);
  const b = Number.parseInt(full.slice(4, 6), 16);
  return { r: r || 0, g: g || 0, b: b || 0 };
}

function rgbToHex({ r, g, b }: RGB): string {
  const toHex = (n: number) =>
    Math.max(0, Math.min(255, Math.round(n)))
      .toString(16)
      .padStart(2, "0");
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

export function withAlpha(hex: string, alpha: number): string {
  const { r, g, b } = hexToRgb(hex);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

export function darken(hex: string, amount: number): string {
  const { r, g, b } = hexToRgb(hex);
  const factor = 1 - amount;
  return rgbToHex({ r: r * factor, g: g * factor, b: b * factor });
}

export function lighten(hex: string, amount: number): string {
  const { r, g, b } = hexToRgb(hex);
  return rgbToHex({
    r: r + (255 - r) * amount,
    g: g + (255 - g) * amount,
    b: b + (255 - b) * amount,
  });
}

/** Perceived luminance — used to pick readable foreground over accent. */
export function luminance(hex: string): number {
  const { r, g, b } = hexToRgb(hex);
  return (0.299 * r + 0.587 * g + 0.114 * b) / 255;
}

export function readableOn(hex: string): string {
  return luminance(hex) > 0.6 ? "#0b0b10" : "#ffffff";
}

export function resolveTheme(dark: boolean, accent: string): ThemeColors {
  const accentSoft = withAlpha(accent, 0.14);
  const accentGlow = withAlpha(accent, 0.35);
  const accentStrong = darken(accent, 0.2);
  const accentOn = readableOn(accent);

  if (dark) {
    return {
      bg: "#0a0a0f",
      bgElevated: "#13131a",
      fg: "#f5f5f7",
      fgSoft: "#c8c8d0",
      muted: "#7a7a85",
      surface: "#1a1a22",
      border: "#2a2a35",
      accent,
      accentSoft,
      accentGlow,
      accentStrong,
      accentOn,
    };
  }

  return {
    bg: "#ffffff",
    bgElevated: "#fafafb",
    fg: "#0a0a0f",
    fgSoft: "#3f3f46",
    muted: "#71717a",
    surface: "#f4f4f5",
    border: "#e4e4e7",
    accent,
    accentSoft,
    accentGlow,
    accentStrong,
    accentOn,
  };
}

export function logoStyles(position: LogoPosition): Record<string, string | number> {
  const base: Record<string, string | number> = {
    position: "absolute",
    width: "44px",
    height: "44px",
    borderRadius: "10px",
    zIndex: 10,
  };
  switch (position) {
    case "top-left":
      return { ...base, top: "44px", left: "60px" };
    case "top-right":
      return { ...base, top: "44px", right: "60px" };
    case "bottom-left":
      return { ...base, bottom: "44px", left: "60px" };
    case "bottom-right":
      return { ...base, bottom: "44px", right: "60px" };
  }
}

export function truncate(text: string | null | undefined, max: number): string {
  if (!text) return "";
  return text.length > max ? `${text.slice(0, max).trimEnd()}…` : text;
}

export function prettyHost(url: string): string {
  try {
    const host = new URL(url).hostname;
    return host.replace(/^www\./, "");
  } catch {
    return url;
  }
}

export function prettyPath(url: string): string {
  try {
    const path = new URL(url).pathname;
    return path === "/" ? "" : path.replace(/\/$/, "");
  } catch {
    return "";
  }
}

export function title(props: TemplateProps): string {
  const fromMeta = props.metadata.ogTitle ?? props.metadata.title;
  if (fromMeta) return fromMeta;
  const host = prettyHost(props.metadata.url);
  const path = prettyPath(props.metadata.url);
  return path ? `${host}${path}` : host;
}

export function description(props: TemplateProps, max = 160): string {
  return truncate(props.metadata.ogDescription ?? props.metadata.description, max);
}

export function formattedDate(): string {
  return new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

/**
 * Width-lerps layout tokens between OG (1200px) and hero 16:10 (1920px) anchors,
 * bucketed into shape bands for templates that need a layout switch at a given aspect.
 */
export function scaleTokens(dims: ImageDimensions): ScaleTokens {
  const aspect = dims.width / dims.height;
  const shape: ScaleTokens["shape"] = aspect < 1.85 ? "og" : aspect < 2.1 ? "wide" : "ultrawide";
  const t = Math.max(0, Math.min(1, (dims.width - 1200) / (1920 - 1200)));
  const lerp = (a: number, b: number) => Math.round(a + (b - a) * t);
  return {
    aspect,
    shape,
    pad: lerp(60, 112),
    gap: lerp(20, 32),
    maxContentWidth: lerp(860, 1400),
    display: lerp(96, 150),
    h1: lerp(72, 120),
    h2: lerp(56, 88),
    body: lerp(22, 30),
    mono: lerp(16, 22),
    kicker: lerp(14, 20),
    rule: lerp(1, 2),
  };
}
