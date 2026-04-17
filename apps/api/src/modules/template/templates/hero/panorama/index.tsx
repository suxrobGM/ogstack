import type { ReactElement } from "react";
import { DotGrid, Kicker, Pill, RadialGlow } from "../../decorations";
import { Box, Canvas, Row, Stack } from "../../layout";
import { Text } from "../../text";
import type { TemplateProps } from "../../types";
import {
  description,
  logoStyles,
  prettyHost,
  resolveTheme,
  title,
  truncate,
  withAlpha,
} from "../../utils";

/**
 * Two-column panorama: editorial left column with headline and description,
 * accent-gradient right column with a floating chip cluster. Works best at
 * 16:9; the right column expands at 16:10 without disturbing the left.
 */
export function HeroPanorama(props: TemplateProps): ReactElement {
  const { accent, dark, logoUrl, logoPosition, metadata } = props;
  const theme = resolveTheme(dark, accent);
  const heading = truncate(title(props), 90);
  const desc = description(props, 200);
  const host = prettyHost(metadata.url);
  const eyebrow = metadata.siteName ?? host;

  return (
    <Canvas
      padding={0}
      style={{
        flexDirection: "row",
        background: theme.bg,
      }}
    >
      {logoUrl && <img src={logoUrl} style={logoStyles(logoPosition)} />}

      <Stack
        flex={1}
        padding={96}
        gap={36}
        justify="center"
        style={{ position: "relative", zIndex: 2 }}
      >
        <Kicker color={accent} size={18}>
          {eyebrow}
        </Kicker>
        <Text
          size={104}
          color={theme.fg}
          weight={800}
          style={{ letterSpacing: "-0.035em", lineHeight: 1.04 }}
        >
          {heading}
        </Text>
        {desc && (
          <Text variant="bodyLg" color={theme.fgSoft} size={26} maxWidth="92%">
            {desc}
          </Text>
        )}
        <Row gap={12} align="center" style={{ marginTop: 8 }}>
          <Text variant="mono" size={22} color={theme.muted}>
            {host}
          </Text>
        </Row>
      </Stack>

      <Box
        flex={1}
        style={{
          position: "relative",
          background: `linear-gradient(135deg, ${withAlpha(accent, 0.95)} 0%, ${theme.accentStrong} 100%)`,
          overflow: "hidden",
        }}
      >
        <DotGrid color={theme.accentOn} opacity={0.12} spacing={42} radius={2} />
        <RadialGlow color={theme.accentOn} top="-10%" right="-10%" size="60%" intensity={0.3} />
        <Stack
          gap={18}
          padding={72}
          justify="end"
          align="start"
          style={{ height: "100%", position: "relative" }}
        >
          <Pill color={theme.accentOn} textColor={theme.accentOn} variant="outline" size="md">
            Read the post
          </Pill>
          <Text variant="kicker" color={theme.accentOn} size={14} style={{ opacity: 0.78 }}>
            Featured
          </Text>
        </Stack>
      </Box>
    </Canvas>
  );
}
