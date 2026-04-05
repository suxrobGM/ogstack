import type { UrlMetadata } from "@/common/services";
import type { LogoPosition } from "../template.schema";

export interface TemplateProps {
  metadata: UrlMetadata;
  accent: string;
  dark: boolean;
  logoUrl?: string;
  logoPosition: LogoPosition;
}
