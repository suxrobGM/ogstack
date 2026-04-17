import type { ReactElement } from "react";
import { Box, Canvas, Dot, Row, Rule, Stack } from "../../layout";
import { Text } from "../../text";
import type { TemplateProps } from "../../types";
import { description, logoStyles, prettyHost, resolveTheme, title } from "../../utils";

export function Minimal(props: TemplateProps): ReactElement {
  const { dark, accent, logoUrl, logoPosition, metadata } = props;
  const theme = resolveTheme(dark, accent);
  const heading = title(props);
  const desc = description(props, 110);
  const host = prettyHost(metadata.url);

  return (
    <Canvas padding={80} bg={theme.bg} style={{ flexDirection: "row" }}>
      {logoUrl && <img src={logoUrl} style={logoStyles(logoPosition)} />}

      <Stack
        justify="between"
        width={80}
        paddingY={20}
        style={{ borderRight: `1px solid ${theme.border}`, marginRight: "64px" }}
      >
        {["01", "02", "03", "04"].map((n) => (
          <Text key={n} variant="mono" size={14} color={theme.muted}>
            {n}
          </Text>
        ))}
      </Stack>

      <Stack justify="between" flex={1} paddingY={20}>
        <Row gap={14}>
          <Dot color={accent} size={10} />
          <Text variant="mono" size={14} color={theme.muted}>
            {host.toUpperCase()}
          </Text>
        </Row>

        <Stack gap={24} maxWidth={920}>
          <Text
            size={64}
            weight={500}
            color={theme.fg}
            style={{ lineHeight: 1.08, letterSpacing: "-0.025em" }}
          >
            {heading}
          </Text>
          {desc && (
            <Text variant="body" color={theme.fgSoft}>
              {desc}
            </Text>
          )}
        </Stack>

        <Row gap={16}>
          <Text
            variant="mono"
            size={14}
            color={theme.muted}
            style={{ textTransform: "uppercase", letterSpacing: "0.22em" }}
          >
            §
          </Text>
          <Text
            variant="mono"
            size={14}
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
