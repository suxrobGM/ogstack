import type { ReactElement } from "react";
import { DotGrid, Kicker, RadialGlow } from "../decorations";
import { Canvas, Dot, Row, Rule, Stack } from "../layout";
import { Text } from "../text";
import type { TemplateProps } from "../types";
import { description, logoStyles, prettyHost, resolveTheme, title } from "../utils";

export function Aurora(props: TemplateProps): ReactElement {
  const { accent, logoUrl, logoPosition, metadata, scale } = props;
  const theme = resolveTheme(true, accent);
  const heading = title(props);
  const desc = description(props);
  const host = prettyHost(metadata.url);
  const eyebrow = metadata.siteName ?? host;

  return (
    <Canvas
      padding={scale.pad + 12}
      style={{
        justifyContent: "space-between",
        flexDirection: "column",
        background: `linear-gradient(160deg, #05050a 0%, ${theme.bg} 55%, #0d0d18 100%)`,
      }}
    >
      <RadialGlow color={accent} top="-280px" right="-240px" size="880px" intensity={0.7} />
      <RadialGlow
        color={theme.accentStrong}
        bottom="-320px"
        left="-200px"
        size="720px"
        intensity={0.5}
      />
      <DotGrid color={theme.fg} opacity={0.05} spacing={26} radius={1.2} />

      {logoUrl && <img src={logoUrl} style={logoStyles(logoPosition)} />}

      <Kicker color={accent} size={scale.kicker}>
        {eyebrow}
      </Kicker>

      <Stack gap={scale.gap} maxWidth={scale.maxContentWidth} style={{ position: "relative" }}>
        <Text
          size={scale.display - 8}
          weight={800}
          color={theme.fg}
          style={{ letterSpacing: "-0.035em", lineHeight: 1.04 }}
        >
          {heading}
        </Text>
        {desc && (
          <Text
            variant="bodyLg"
            color={theme.fgSoft}
            size={scale.body + 4}
            maxWidth={Math.round(scale.maxContentWidth * 0.86)}
          >
            {desc}
          </Text>
        )}
      </Stack>

      <Row gap={20} style={{ position: "relative" }}>
        <Dot color={accent} size={10} />
        <Text variant="mono" size={scale.mono + 4} color={theme.fgSoft}>
          {host}
        </Text>
        <Rule color={theme.border} flex={1} />
        <Text variant="kicker" color={theme.muted} size={scale.kicker}>
          Open Graph
        </Text>
      </Row>
    </Canvas>
  );
}
