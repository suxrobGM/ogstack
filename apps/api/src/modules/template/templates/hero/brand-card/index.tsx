import type { ReactElement } from "react";
import { AvatarCircle, Pill, RadialGlow } from "../../decorations";
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
 * Card-style hero with a prominent accent border, centered content, and a
 * CTA-shaped pill footer. Think SaaS landing cover — benefit-led + action.
 */
export function HeroBrandCard(props: TemplateProps): ReactElement {
  const { accent, dark, logoUrl, logoPosition, metadata } = props;
  const theme = resolveTheme(dark, accent);
  const heading = truncate(title(props), 100);
  const desc = description(props, 200);
  const host = prettyHost(metadata.url);
  const brand = metadata.siteName ?? host;
  const initial = (brand[0] ?? "·").toUpperCase();

  return (
    <Canvas
      padding={72}
      style={{
        background: dark
          ? `linear-gradient(145deg, #06060c 0%, ${theme.bg} 55%, #0b0b14 100%)`
          : `linear-gradient(145deg, #f6f6f8 0%, ${theme.bg} 60%, ${withAlpha(accent, 0.04)} 100%)`,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      {logoUrl && <img src={logoUrl} style={logoStyles(logoPosition)} />}

      <RadialGlow color={accent} top="-20%" left="-12%" size="55%" intensity={0.35} />
      <RadialGlow
        color={theme.accentStrong}
        bottom="-20%"
        right="-12%"
        size="55%"
        intensity={0.3}
      />

      <Box
        width="86%"
        height="78%"
        radius={28}
        padding={64}
        border={`1px solid ${theme.border}`}
        style={{
          position: "relative",
          flexDirection: "column",
          justifyContent: "space-between",
          background: theme.bgElevated,
          boxShadow: `0 24px 64px ${withAlpha(accent, 0.22)}`,
        }}
      >
        <Box
          absolute
          top={0}
          left={0}
          width="100%"
          height="6px"
          radius="28px 28px 0 0"
          style={{
            background: `linear-gradient(90deg, ${accent} 0%, ${theme.accentStrong} 100%)`,
          }}
        />

        <Row gap={20} align="center">
          <AvatarCircle
            initial={initial}
            size={72}
            bg={withAlpha(accent, 0.18)}
            fg={accent}
            border={`1px solid ${withAlpha(accent, 0.4)}`}
          />
          <Stack gap={4}>
            <Text variant="kicker" color={theme.muted} size={13}>
              {brand}
            </Text>
            <Text variant="mono" color={theme.fgSoft} size={18}>
              {host}
            </Text>
          </Stack>
        </Row>

        <Stack gap={24} style={{ flex: 1, justifyContent: "center" }}>
          <Text
            size={96}
            color={theme.fg}
            weight={800}
            style={{ letterSpacing: "-0.03em", lineHeight: 1.04 }}
          >
            {heading}
          </Text>
          {desc && (
            <Text variant="bodyLg" color={theme.fgSoft} size={26} maxWidth="92%">
              {desc}
            </Text>
          )}
        </Stack>

        <Row gap={16} align="center" justify="between">
          <Pill color={accent} textColor={theme.accentOn} variant="solid" size="md">
            Read more
          </Pill>
          <Text variant="kicker" color={theme.muted} size={12}>
            Hero · Blog
          </Text>
        </Row>
      </Box>
    </Canvas>
  );
}
