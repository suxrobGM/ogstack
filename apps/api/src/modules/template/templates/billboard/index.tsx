import type { ReactElement } from "react";
import { CornerMarks, GradientHeading, RadialGlow } from "../decorations";
import { Canvas, Row, Stack } from "../layout";
import { Text } from "../text";
import type { TemplateProps } from "../types";
import { description, logoStyles, prettyHost, resolveTheme, title, withAlpha } from "../utils";

export function Billboard(props: TemplateProps): ReactElement {
  const { accent, dark, logoUrl, logoPosition, metadata, scale } = props;
  const theme = resolveTheme(dark, accent);
  const heading = title(props, 60);
  const desc = description(props, 140);

  const headingSize = heading.length > 32 ? scale.display + 12 : scale.display + 36;
  const host = prettyHost(metadata.url);
  const eyebrow = metadata.siteName ?? host;

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

      <Stack gap={scale.gap + 12} align="center" style={{ position: "relative", maxWidth: "78%" }}>
        <Text variant="kicker" color={accent} size={scale.kicker}>
          {eyebrow}
        </Text>
        <GradientHeading
          from={theme.fg}
          to={accent}
          size={headingSize}
          style={{
            textAlign: "center",
            justifyContent: "center",
            display: "flex",
            overflowWrap: "break-word",
            wordBreak: "break-word",
          }}
        >
          {heading}
        </GradientHeading>
        {desc && (
          <Text
            variant="bodyLg"
            color={theme.fgSoft}
            align="center"
            size={scale.body + 6}
            maxWidth="72%"
          >
            {desc}
          </Text>
        )}
        <Row gap={12} align="center" style={{ marginTop: 24 }}>
          <Text variant="mono" size={scale.mono + 2} color={theme.muted}>
            {host}
          </Text>
        </Row>
      </Stack>
    </Canvas>
  );
}
