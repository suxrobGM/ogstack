import type { ImageDimensions, ImageKind } from "@ogstack/shared/constants";
import type { UrlMetadata } from "@/common/services";
import type { LogoPosition } from "../template.schema";

export interface ScaleTokens {
  aspect: number;
  shape: "og" | "wide" | "ultrawide";
  pad: number;
  gap: number;
  maxContentWidth: number;
  display: number;
  h1: number;
  h2: number;
  body: number;
  mono: number;
  kicker: number;
  rule: number;
}

export interface TemplateProps {
  metadata: UrlMetadata;
  accent: string;
  dark: boolean;
  logoUrl?: string;
  logoPosition: LogoPosition;
  kind: ImageKind;
  dimensions: ImageDimensions;
  scale: ScaleTokens;
}
