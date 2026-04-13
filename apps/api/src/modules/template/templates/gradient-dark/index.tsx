import type { ReactElement } from "react";
import { DotGrid, Kicker, RadialGlow } from "../decorations";
import { Canvas, Dot, Row, Rule, Stack } from "../layout";
import { Text } from "../text";
import type { TemplateProps } from "../types";
import { description, logoStyles, prettyHost, resolveTheme, title } from "../utils";

export function GradientDark(props: TemplateProps): ReactElement {
  const { accent, logoUrl, logoPosition, metadata } = props;
  const theme = resolveTheme(true, accent);
  const heading = title(props);
  const desc = description(props);
  const host = prettyHost(metadata.url);
  const eyebrow = metadata.siteName ?? host;

  return (
    <Canvas
      padding={72}
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

      <Kicker color={accent}>{eyebrow}</Kicker>

      <Stack gap={22} maxWidth={1000} style={{ position: "relative" }}>
        <Text variant="display" color={theme.fg}>
          {heading}
        </Text>
        {desc && (
          <Text variant="bodyLg" color={theme.fgSoft} maxWidth={860}>
            {desc}
          </Text>
        )}
      </Stack>

      <Row gap={20} style={{ position: "relative" }}>
        <Dot color={accent} size={10} />
        <Text variant="mono" size={20} color={theme.fgSoft}>
          {host}
        </Text>
        <Rule color={theme.border} flex={1} />
        <Text variant="kicker" color={theme.muted}>
          Open Graph
        </Text>
      </Row>
    </Canvas>
  );
}
