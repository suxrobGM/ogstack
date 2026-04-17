import type { ReactElement } from "react";
import { Kicker, RadialGlow } from "../../decorations";
import { Canvas, Row, Rule, Stack } from "../../layout";
import { Text } from "../../text";
import type { TemplateProps } from "../../types";
import { description, logoStyles, prettyHost, resolveTheme, title, withAlpha } from "../../utils";

/**
 * Editorial magazine-cover aesthetic. Serif-forward headline occupies the
 * upper-third with a prominent accent kicker and a restrained dateline rule
 * at the bottom. Designed to breathe at 16:9 / 16:10.
 */
export function HeroEditorial(props: TemplateProps): ReactElement {
  const { accent, dark, logoUrl, logoPosition, metadata } = props;
  const theme = resolveTheme(dark, accent);
  const heading = title(props);
  const desc = description(props, 220);
  const host = prettyHost(metadata.url);
  const eyebrow = metadata.siteName ?? host;

  return (
    <Canvas
      padding={96}
      style={{
        flexDirection: "column",
        justifyContent: "space-between",
        background: dark
          ? `linear-gradient(180deg, #05050a 0%, ${theme.bg} 60%, #0c0c14 100%)`
          : `linear-gradient(180deg, #ffffff 0%, ${theme.bg} 55%, ${withAlpha(accent, 0.05)} 100%)`,
      }}
    >
      <RadialGlow color={accent} top="-18%" right="-12%" size="70%" intensity={0.55} />

      {logoUrl && <img src={logoUrl} style={logoStyles(logoPosition)} />}

      <Stack gap={20} maxWidth="72%" style={{ position: "relative" }}>
        <Kicker color={accent} size={18}>
          {eyebrow}
        </Kicker>
        <Text
          serif
          size={132}
          color={theme.fg}
          style={{ letterSpacing: "-0.03em", lineHeight: 1.02 }}
        >
          {heading}
        </Text>
      </Stack>

      <Stack gap={28} style={{ position: "relative" }}>
        {desc && (
          <Text variant="bodyLg" color={theme.fgSoft} maxWidth="60%" size={28}>
            {desc}
          </Text>
        )}
        <Row gap={24} align="center">
          <Text variant="mono" size={22} color={theme.muted}>
            {host}
          </Text>
          <Rule color={theme.border} flex={1} />
          <Text variant="kicker" color={theme.muted} size={16}>
            Feature Story
          </Text>
        </Row>
      </Stack>
    </Canvas>
  );
}
