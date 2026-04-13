import type { ReactElement } from "react";
import { Kicker, Pill, RadialGlow } from "../decorations";
import { Box, Canvas, Row, Stack } from "../layout";
import { Text } from "../text";
import type { TemplateProps } from "../types";
import { description, logoStyles, prettyHost, resolveTheme, title, withAlpha } from "../utils";

export function SplitHero(props: TemplateProps): ReactElement {
  const { dark, accent, logoUrl, logoPosition, metadata } = props;
  const theme = resolveTheme(dark, accent);
  const heading = title(props);
  const desc = description(props, 140);
  const host = prettyHost(metadata.url);
  const eyebrow = metadata.siteName ?? host;

  return (
    <Canvas padding={0} style={{ flexDirection: "row" }}>
      {logoUrl && <img src={logoUrl} style={logoStyles(logoPosition)} />}

      {/* Left — editorial text column */}
      <Stack
        justify="between"
        padding="64px 56px"
        bg={theme.bg}
        style={{ width: "58%", position: "relative" }}
      >
        <Kicker color={accent}>{eyebrow}</Kicker>

        <Stack gap={20}>
          <Text variant="h1" color={theme.fg}>
            {heading}
          </Text>
          {desc && (
            <Text variant="body" color={theme.fgSoft}>
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

      {/* Right — spotlight composition */}
      <Box
        width="42%"
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
        <RadialGlow color={accent} size="520px" intensity={0.45} />

        {metadata.ogImage ? (
          <Box
            width="82%"
            height="72%"
            radius={18}
            border={`1px solid ${theme.border}`}
            style={{
              overflow: "hidden",
              boxShadow: `0 32px 80px ${withAlpha(accent, 0.3)}`,
              transform: "rotate(-3deg)",
              position: "relative",
            }}
          >
            <img
              src={metadata.ogImage}
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
          </Box>
        ) : (
          <Box
            width={340}
            height={340}
            style={{ alignItems: "center", justifyContent: "center", position: "relative" }}
          >
            <Box
              absolute
              width={260}
              height={320}
              radius={22}
              bg={withAlpha(accent, 0.18)}
              border={`1px solid ${withAlpha(accent, 0.3)}`}
              style={{ transform: "rotate(-10deg) translateX(-40px)" }}
            />
            <Box
              absolute
              width={260}
              height={320}
              radius={22}
              bg={theme.bgElevated}
              border={`1px solid ${theme.border}`}
              style={{ transform: "rotate(4deg) translateX(30px)" }}
            />
            <Box
              absolute
              width={260}
              height={320}
              radius={22}
              style={{
                background: `linear-gradient(150deg, ${accent} 0%, ${theme.accentStrong} 100%)`,
                alignItems: "center",
                justifyContent: "center",
                transform: "rotate(-2deg)",
              }}
            >
              <Text serif italic size={120} color={theme.accentOn} weight={400}>
                {eyebrow.charAt(0).toUpperCase()}
              </Text>
            </Box>
          </Box>
        )}
      </Box>
    </Canvas>
  );
}
