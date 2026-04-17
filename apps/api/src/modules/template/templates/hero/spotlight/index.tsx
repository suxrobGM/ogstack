import type { ReactElement } from "react";
import { CornerMarks, GradientHeading, RadialGlow } from "../../decorations";
import { Canvas, Row, Stack } from "../../layout";
import { Text } from "../../text";
import type { TemplateProps } from "../../types";
import { description, logoStyles, prettyHost, resolveTheme, title, withAlpha } from "../../utils";

/**
 * Single giant gradient headline with corner marks — a maximalist display
 * treatment that reads well at full-bleed 1920×1080 hero sizes. Designed
 * for landing pages that want a billboard feel.
 */
export function HeroSpotlight(props: TemplateProps): ReactElement {
  const { accent, dark, logoUrl, logoPosition, metadata } = props;
  const theme = resolveTheme(dark, accent);
  const heading = title(props);
  const desc = description(props, 140);
  const host = prettyHost(metadata.url);

  return (
    <Canvas
      padding={0}
      style={{
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        background: dark
          ? `radial-gradient(circle at 50% 45%, ${withAlpha(accent, 0.28)} 0%, ${theme.bg} 55%, #030306 100%)`
          : `radial-gradient(circle at 50% 45%, ${withAlpha(accent, 0.18)} 0%, ${theme.bg} 60%, #f4f4f6 100%)`,
      }}
    >
      <RadialGlow color={accent} top="10%" left="15%" size="55%" intensity={0.4} />
      <RadialGlow color={theme.accentStrong} bottom="0%" right="15%" size="50%" intensity={0.35} />
      <CornerMarks color={theme.border} size={36} />

      {logoUrl && <img src={logoUrl} style={logoStyles(logoPosition)} />}

      <Stack gap={32} align="center" style={{ position: "relative", maxWidth: "78%" }}>
        <Text variant="kicker" color={accent} size={20}>
          {metadata.siteName ?? host}
        </Text>
        <GradientHeading
          from={theme.fg}
          to={accent}
          size={168}
          style={{ textAlign: "center", justifyContent: "center", display: "flex" }}
        >
          {heading}
        </GradientHeading>
        {desc && (
          <Text variant="bodyLg" color={theme.fgSoft} align="center" size={32} maxWidth="72%">
            {desc}
          </Text>
        )}
        <Row gap={12} align="center" style={{ marginTop: 24 }}>
          <Text variant="mono" size={20} color={theme.muted}>
            {host}
          </Text>
        </Row>
      </Stack>
    </Canvas>
  );
}
