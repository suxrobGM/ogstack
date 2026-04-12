export const TEMPLATE_SLUGS = [
  "gradient_dark",
  "gradient_light",
  "split_hero",
  "centered_bold",
  "blog_card",
  "docs_page",
  "product_launch",
  "changelog",
  "github_repo",
  "minimal",
] as const;

export const FONT_FAMILIES = [
  "inter",
  "plus-jakarta-sans",
  "space-grotesk",
  "jetbrains-mono",
  "noto-sans",
] as const;

export const LOGO_POSITIONS = ["top-left", "top-right", "bottom-left", "bottom-right"] as const;

export type TemplateSlug = (typeof TEMPLATE_SLUGS)[number];
export type FontFamily = (typeof FONT_FAMILIES)[number];
export type LogoPosition = (typeof LOGO_POSITIONS)[number];

export const FONT_LABELS: Record<FontFamily, string> = {
  inter: "Inter",
  "plus-jakarta-sans": "Plus Jakarta Sans",
  "space-grotesk": "Space Grotesk",
  "jetbrains-mono": "JetBrains Mono",
  "noto-sans": "Noto Sans",
};

export const LOGO_POSITION_LABELS: Record<LogoPosition, string> = {
  "top-left": "Top Left",
  "top-right": "Top Right",
  "bottom-left": "Bottom Left",
  "bottom-right": "Bottom Right",
};

export interface PlaygroundFormValues {
  url: string;
  template: TemplateSlug;
  accent: string;
  dark: boolean;
  font: FontFamily;
  logoUrl: string;
  logoPosition: LogoPosition;
}
