import type { ReactElement } from "react";
import { Canvas, Dot, Row, Rule, Spacer, Stack } from "../../layout";
import { Text } from "../../text";
import type { TemplateProps } from "../../types";
import { description, logoStyles, prettyHost, resolveTheme, title } from "../../utils";

/**
 * Ultra-minimal: small eyebrow top-left, headline in the middle-left third,
 * domain row at the bottom. All remaining space is negative space — reads
 * as restraint at full hero resolution.
 */
export function HeroMinimal(props: TemplateProps): ReactElement {
  const { accent, dark, logoUrl, logoPosition, metadata } = props;
  const theme = resolveTheme(dark, accent);
  const heading = title(props);
  const desc = description(props, 160);
  const host = prettyHost(metadata.url);
  const eyebrow = metadata.siteName ?? host;

  return (
    <Canvas
      padding={112}
      style={{
        flexDirection: "column",
        background: theme.bg,
      }}
    >
      {logoUrl && <img src={logoUrl} style={logoStyles(logoPosition)} />}

      <Row gap={12} align="center">
        <Dot color={accent} size={10} />
        <Text variant="kicker" color={theme.fgSoft} size={14}>
          {eyebrow}
        </Text>
      </Row>

      <Spacer />

      <Stack gap={24} maxWidth="68%">
        <Text
          size={120}
          color={theme.fg}
          weight={700}
          style={{ letterSpacing: "-0.035em", lineHeight: 1.02 }}
        >
          {heading}
        </Text>
        {desc && (
          <Text variant="body" color={theme.fgSoft} size={26} maxWidth="88%">
            {desc}
          </Text>
        )}
      </Stack>

      <Spacer />

      <Row gap={16} align="center">
        <Rule color={theme.border} length={120} />
        <Text variant="mono" size={20} color={theme.muted}>
          {host}
        </Text>
        <Spacer />
        <Text variant="kicker" color={theme.muted} size={12}>
          Hero
        </Text>
      </Row>
    </Canvas>
  );
}
