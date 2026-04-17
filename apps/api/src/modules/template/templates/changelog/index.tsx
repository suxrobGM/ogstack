import type { ReactElement } from "react";
import { Kicker, Pill } from "../decorations";
import { Box, Canvas, Dot, Row, Stack } from "../layout";
import { Text } from "../text";
import type { TemplateProps } from "../types";
import {
  description,
  formattedDate,
  logoStyles,
  prettyHost,
  resolveTheme,
  title,
  withAlpha,
} from "../utils";
import { CHANGE_ROWS, extractVersion } from "./helpers";

export function Changelog(props: TemplateProps): ReactElement {
  const { dark, accent, logoUrl, logoPosition, metadata } = props;
  const theme = resolveTheme(dark, accent);
  const heading = title(props);
  const desc = description(props, 120);
  const version = extractVersion(`${heading} ${metadata.description ?? ""}`);
  const siteName = metadata.siteName ?? prettyHost(metadata.url);

  return (
    <Canvas padding={60} bg={theme.bg} style={{ flexDirection: "row" }}>
      {logoUrl && <img src={logoUrl} style={logoStyles(logoPosition)} />}

      <Stack
        width="45%"
        justify="between"
        style={{ paddingRight: "48px", borderRight: `1px solid ${theme.border}` }}
      >
        <Stack gap={16}>
          <Kicker color={accent}>Release · {siteName}</Kicker>
          <Box>
            <Pill color={accent} textColor={accent} variant="soft" size="sm">
              Changelog
            </Pill>
          </Box>
        </Stack>

        <Stack gap={12}>
          <Text
            mono
            size={120}
            weight={800}
            color={theme.fg}
            style={{ lineHeight: 0.95, letterSpacing: "-0.04em" }}
          >
            {version}
          </Text>
          <Text variant="mono" size={18} color={theme.muted}>
            {formattedDate()}
          </Text>
        </Stack>

        <Row gap={10}>
          <Dot color={accent} size={6} />
          <Text variant="kicker" color={theme.muted}>
            Released
          </Text>
        </Row>
      </Stack>

      <Stack flex={1} justify="between" style={{ paddingLeft: "56px" }}>
        <Stack gap={16}>
          <Text variant="h3" color={theme.fg}>
            {heading}
          </Text>
          {desc && (
            <Text size={20} color={theme.fgSoft} style={{ lineHeight: 1.45 }}>
              {desc}
            </Text>
          )}
        </Stack>

        <Stack gap={14}>
          {CHANGE_ROWS.map((row) => (
            <Row
              key={row.label}
              gap={16}
              padding="14px 18px"
              radius={10}
              bg={withAlpha(row.dot, 0.08)}
              border={`1px solid ${withAlpha(row.dot, 0.25)}`}
            >
              <Dot color={row.dot} size={10} />
              <Text
                size={16}
                weight={700}
                color={theme.fg}
                style={{
                  minWidth: "110px",
                  textTransform: "uppercase",
                  letterSpacing: "0.12em",
                }}
              >
                {row.label}
              </Text>
              <Text size={16} color={theme.fgSoft}>
                {row.detail}
              </Text>
            </Row>
          ))}
        </Stack>
      </Stack>
    </Canvas>
  );
}
