export type PlatformLayout = "large" | "compact" | "square";

export interface PlatformConfig {
  id: string;
  name: string;
  layout: PlatformLayout;
  titleMax: number;
  descMax: number;
  imageAspect: string;
  hintColor: string;
}

export const PLATFORMS: PlatformConfig[] = [
  {
    id: "x",
    name: "X (Twitter)",
    layout: "large",
    titleMax: 70,
    descMax: 125,
    imageAspect: "1.91 / 1",
    hintColor: "#000000",
  },
  {
    id: "facebook",
    name: "Facebook",
    layout: "large",
    titleMax: 88,
    descMax: 200,
    imageAspect: "1.91 / 1",
    hintColor: "#1877F2",
  },
  {
    id: "linkedin",
    name: "LinkedIn",
    layout: "large",
    titleMax: 120,
    descMax: 180,
    imageAspect: "1.91 / 1",
    hintColor: "#0A66C2",
  },
  {
    id: "slack",
    name: "Slack",
    layout: "compact",
    titleMax: 100,
    descMax: 300,
    imageAspect: "1.91 / 1",
    hintColor: "#4A154B",
  },
  {
    id: "telegram",
    name: "Telegram",
    layout: "compact",
    titleMax: 80,
    descMax: 200,
    imageAspect: "1.91 / 1",
    hintColor: "#229ED9",
  },
  {
    id: "discord",
    name: "Discord",
    layout: "compact",
    titleMax: 100,
    descMax: 350,
    imageAspect: "1.91 / 1",
    hintColor: "#5865F2",
  },
  {
    id: "instagram",
    name: "Instagram",
    layout: "square",
    titleMax: 60,
    descMax: 120,
    imageAspect: "1 / 1",
    hintColor: "#E4405F",
  },
];

export function truncate(text: string | null, max: number): string {
  if (!text) return "";
  if (text.length <= max) return text;
  return text.slice(0, Math.max(0, max - 1)).trimEnd() + "…";
}
