import type { ReactElement } from "react";
import { Box, Canvas, Dot, Row, Rule, Spacer, Stack } from "../layout";
import { Text } from "../text";
import type { TemplateProps } from "../types";
import { description, logoStyles, prettyHost, resolveTheme, title } from "../utils";

export function Minimal(props: TemplateProps): ReactElement {
  return props.scale.shape === "og" ? SwissGridMinimal(props) : QuietMinimal(props);
}

function SwissGridMinimal(props: TemplateProps): ReactElement {
  const { dark, accent, logoUrl, logoPosition, metadata, scale } = props;
  const theme = resolveTheme(dark, accent);
  const heading = title(props);
  const desc = description(props, 110);
  const host = prettyHost(metadata.url);

  return (
    <Canvas padding={scale.pad + 20} bg={theme.bg} style={{ flexDirection: "row" }}>
      {logoUrl && <img src={logoUrl} style={logoStyles(logoPosition)} />}

      <Stack
        justify="between"
        width={80}
        paddingY={20}
        style={{ borderRight: `1px solid ${theme.border}`, marginRight: "64px" }}
      >
        {["01", "02", "03", "04"].map((n) => (
          <Text key={n} variant="mono" size={scale.mono - 2} color={theme.muted}>
            {n}
          </Text>
        ))}
      </Stack>

      <Stack justify="between" flex={1} paddingY={20}>
        <Row gap={14}>
          <Dot color={accent} size={10} />
          <Text variant="mono" size={scale.mono - 2} color={theme.muted}>
            {host.toUpperCase()}
          </Text>
        </Row>

        <Stack gap={24} maxWidth={scale.maxContentWidth}>
          <Text
            size={scale.h1 - 8}
            weight={500}
            color={theme.fg}
            style={{ lineHeight: 1.08, letterSpacing: "-0.025em" }}
          >
            {heading}
          </Text>
          {desc && (
            <Text variant="body" color={theme.fgSoft} size={scale.body}>
              {desc}
            </Text>
          )}
        </Stack>

        <Row gap={16}>
          <Text
            variant="mono"
            size={scale.mono - 2}
            color={theme.muted}
            style={{ textTransform: "uppercase", letterSpacing: "0.22em" }}
          >
            §
          </Text>
          <Text
            variant="mono"
            size={scale.mono - 2}
            color={theme.muted}
            style={{ textTransform: "uppercase", letterSpacing: "0.22em" }}
          >
            Index / Reading
          </Text>
          <Rule color={theme.border} flex={1} />
          <Box>—</Box>
        </Row>
      </Stack>
    </Canvas>
  );
}

function QuietMinimal(props: TemplateProps): ReactElement {
  const { accent, dark, logoUrl, logoPosition, metadata, scale } = props;
  const theme = resolveTheme(dark, accent);
  const heading = title(props);
  const desc = description(props, 160);
  const host = prettyHost(metadata.url);
  const eyebrow = metadata.siteName ?? host;

  return (
    <Canvas
      padding={scale.pad}
      style={{
        flexDirection: "column",
        background: theme.bg,
      }}
    >
      {logoUrl && <img src={logoUrl} style={logoStyles(logoPosition)} />}

      <Row gap={12} align="center">
        <Dot color={accent} size={10} />
        <Text variant="kicker" color={theme.fgSoft} size={scale.kicker}>
          {eyebrow}
        </Text>
      </Row>

      <Spacer />

      <Stack gap={scale.gap} maxWidth="72%">
        <Text
          size={scale.display}
          color={theme.fg}
          weight={700}
          style={{ letterSpacing: "-0.035em", lineHeight: 1.02 }}
        >
          {heading}
        </Text>
        {desc && (
          <Text variant="body" color={theme.fgSoft} size={scale.body + 4} maxWidth="88%">
            {desc}
          </Text>
        )}
      </Stack>

      <Spacer />

      <Row gap={16} align="center">
        <Rule color={theme.border} length={120} />
        <Text variant="mono" size={scale.mono} color={theme.muted}>
          {host}
        </Text>
        <Spacer />
        <Text variant="kicker" color={theme.muted} size={scale.kicker - 2}>
          Hero
        </Text>
      </Row>
    </Canvas>
  );
}
