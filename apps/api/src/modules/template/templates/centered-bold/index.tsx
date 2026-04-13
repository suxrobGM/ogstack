import type { ReactElement } from "react";
import { GradientHeading, Kicker } from "../decorations";
import { Box, Canvas, Dot, Row, Stack } from "../layout";
import { Text } from "../text";
import type { TemplateProps } from "../types";
import { description, logoStyles, prettyHost, resolveTheme, title, withAlpha } from "../utils";

export function CenteredBold(props: TemplateProps): ReactElement {
  const { dark, accent, logoUrl, logoPosition, metadata } = props;
  const theme = resolveTheme(dark, accent);
  const heading = title(props);
  const desc = description(props, 120);
  const host = prettyHost(metadata.url);
  const eyebrow = metadata.siteName ?? host;

  const headingFrom = dark ? "#ffffff" : "#0a0a0f";
  const headingTo = accent;

  return (
    <Canvas
      padding={80}
      bg={theme.bg}
      style={{ flexDirection: "column", alignItems: "center", justifyContent: "center" }}
    >
      <Box
        absolute
        top="-220px"
        right="-180px"
        width={560}
        height={560}
        style={{
          borderRadius: "50%",
          background: `radial-gradient(circle, ${withAlpha(accent, 0.45)} 0%, rgba(0,0,0,0) 70%)`,
          transform: "rotate(15deg)",
        }}
      />
      <Box
        absolute
        bottom="-260px"
        left="-140px"
        width={480}
        height={480}
        style={{
          borderRadius: "50%",
          background: `radial-gradient(circle, ${withAlpha(theme.accentStrong, 0.35)} 0%, rgba(0,0,0,0) 70%)`,
        }}
      />

      {logoUrl && <img src={logoUrl} style={logoStyles(logoPosition)} />}

      <Stack
        gap={28}
        maxWidth={1000}
        align="center"
        style={{ textAlign: "center", position: "relative" }}
      >
        <Kicker color={accent}>{eyebrow}</Kicker>
        <GradientHeading
          from={headingFrom}
          to={headingTo}
          size={112}
          style={{ textAlign: "center", justifyContent: "center", letterSpacing: "-0.045em" }}
        >
          {heading}
        </GradientHeading>
        {desc && (
          <Text
            variant="bodyLg"
            color={theme.fgSoft}
            maxWidth={820}
            align="center"
            style={{ justifyContent: "center" }}
          >
            {desc}
          </Text>
        )}
      </Stack>

      <Box absolute bottom={60}>
        <Row gap={12}>
          <Dot color={accent} />
          <Text variant="mono" size={16} color={theme.muted}>
            {host}
          </Text>
        </Row>
      </Box>
    </Canvas>
  );
}
