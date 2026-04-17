import type { ReactElement } from "react";
import { Kicker, Pill, RadialGlow } from "../../decorations";
import { Box, Canvas, Row, Stack } from "../../layout";
import { Text } from "../../text";
import type { TemplateProps } from "../../types";
import { description, logoStyles, prettyHost, resolveTheme, title, withAlpha } from "../../utils";

const RIGHT_COL_WIDTH = 504;
const CANVAS_HEIGHT = 630;
const IMAGE_CARD_WIDTH = 420;
const IMAGE_CARD_HEIGHT = 300;
const FALLBACK_CARD_WIDTH = 300;
const FALLBACK_CARD_HEIGHT = 360;

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
        flex={1}
        style={{ position: "relative" }}
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

      {/* Right — spotlight composition (explicit pixel dims to keep resvg happy) */}
      <Box
        width={RIGHT_COL_WIDTH}
        height={CANVAS_HEIGHT}
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
            width={IMAGE_CARD_WIDTH}
            height={IMAGE_CARD_HEIGHT}
            radius={18}
            border={`1px solid ${theme.border}`}
            style={{ overflow: "hidden", transform: "rotate(-3deg)" }}
          >
            <img
              src={metadata.ogImage}
              width={IMAGE_CARD_WIDTH}
              height={IMAGE_CARD_HEIGHT}
              style={{
                display: "flex",
                width: `${IMAGE_CARD_WIDTH}px`,
                height: `${IMAGE_CARD_HEIGHT}px`,
                objectFit: "cover",
              }}
            />
          </Box>
        ) : (
          <Box
            width={FALLBACK_CARD_WIDTH}
            height={FALLBACK_CARD_HEIGHT}
            radius={22}
            style={{
              background: `linear-gradient(150deg, ${accent} 0%, ${theme.accentStrong} 100%)`,
              alignItems: "center",
              justifyContent: "center",
              transform: "rotate(-4deg)",
            }}
          >
            <Text serif italic size={160} color={theme.accentOn} weight={400}>
              {eyebrow.charAt(0).toUpperCase()}
            </Text>
          </Box>
        )}
      </Box>
    </Canvas>
  );
}
