import type { ReactElement } from "react";
import { AvatarCircle, Kicker, Pill, RadialGlow } from "../decorations";
import { Box, Canvas, Row, Stack } from "../layout";
import { Text } from "../text";
import type { TemplateProps } from "../types";
import {
  description,
  logoStyles,
  prettyHost,
  resolveTheme,
  title,
  truncate,
  withAlpha,
} from "../utils";

export function Showcase(props: TemplateProps): ReactElement {
  return props.scale.shape === "og" ? SplitShowcase(props) : CardShowcase(props);
}

function SplitShowcase(props: TemplateProps): ReactElement {
  const { dark, accent, logoUrl, logoPosition, metadata, scale } = props;
  const theme = resolveTheme(dark, accent);
  const heading = title(props);
  const desc = description(props, 140);
  const host = prettyHost(metadata.url);
  const eyebrow = metadata.siteName ?? host;

  return (
    <Canvas padding={0} style={{ flexDirection: "row" }}>
      {logoUrl && <img src={logoUrl} style={logoStyles(logoPosition)} />}

      <Stack
        justify="between"
        padding={`${scale.pad}px ${scale.pad - 4}px`}
        bg={theme.bg}
        flex={1}
        style={{ position: "relative" }}
      >
        <Kicker color={accent} size={scale.kicker}>
          {eyebrow}
        </Kicker>

        <Stack gap={scale.gap}>
          <Text
            size={scale.h1}
            weight={800}
            color={theme.fg}
            style={{ letterSpacing: "-0.03em", lineHeight: 1.06 }}
          >
            {heading}
          </Text>
          {desc && (
            <Text variant="body" color={theme.fgSoft} size={scale.body}>
              {desc}
            </Text>
          )}
        </Stack>

        <Row gap={14}>
          <Pill color={accent} textColor={theme.accentOn} variant="solid" size="sm">
            <Box style={{ marginRight: "8px" }}>→</Box>
            {host}
          </Pill>
        </Row>
      </Stack>

      <Box
        width="42%"
        height="100%"
        style={{
          alignItems: "center",
          justifyContent: "center",
          position: "relative",
          background: `linear-gradient(145deg, ${withAlpha(accent, 0.12)} 0%, ${withAlpha(
            theme.accentStrong,
            0.22,
          )} 100%)`,
          borderLeft: `1px solid ${theme.border}`,
        }}
      >
        <RadialGlow color={accent} size="80%" intensity={0.45} />

        {metadata.ogImage ? (
          <Box
            width="78%"
            height="62%"
            radius={18}
            border={`1px solid ${theme.border}`}
            style={{ overflow: "hidden", transform: "rotate(-3deg)" }}
          >
            <img
              src={metadata.ogImage}
              style={{
                display: "flex",
                width: "100%",
                height: "100%",
                objectFit: "cover",
              }}
            />
          </Box>
        ) : (
          <Box
            width="62%"
            height="72%"
            radius={22}
            style={{
              background: `linear-gradient(150deg, ${accent} 0%, ${theme.accentStrong} 100%)`,
              alignItems: "center",
              justifyContent: "center",
              transform: "rotate(-4deg)",
            }}
          >
            <Text serif italic size={scale.display + 32} color={theme.accentOn} weight={400}>
              {eyebrow.charAt(0).toUpperCase()}
            </Text>
          </Box>
        )}
      </Box>
    </Canvas>
  );
}

function CardShowcase(props: TemplateProps): ReactElement {
  const { accent, dark, logoUrl, logoPosition, metadata, scale } = props;
  const theme = resolveTheme(dark, accent);
  const heading = truncate(title(props), 100);
  const desc = description(props, 200);
  const host = prettyHost(metadata.url);
  const brand = metadata.siteName ?? host;
  const initial = (brand[0] ?? "·").toUpperCase();

  return (
    <Canvas
      padding={scale.pad}
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
        padding={scale.pad - 8}
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
            <Text variant="kicker" color={theme.muted} size={scale.kicker - 4}>
              {brand}
            </Text>
            <Text variant="mono" color={theme.fgSoft} size={scale.mono - 2}>
              {host}
            </Text>
          </Stack>
        </Row>

        <Stack gap={scale.gap} style={{ flex: 1, justifyContent: "center" }}>
          <Text
            size={scale.h1}
            color={theme.fg}
            weight={800}
            style={{ letterSpacing: "-0.03em", lineHeight: 1.04 }}
          >
            {heading}
          </Text>
          {desc && (
            <Text variant="bodyLg" color={theme.fgSoft} size={scale.body + 2} maxWidth="92%">
              {desc}
            </Text>
          )}
        </Stack>

        <Row gap={16} align="center" justify="between">
          <Pill color={accent} textColor={theme.accentOn} variant="solid" size="md">
            Read more
          </Pill>
          <Text variant="kicker" color={theme.muted} size={scale.kicker - 4}>
            Hero · Blog
          </Text>
        </Row>
      </Box>
    </Canvas>
  );
}
