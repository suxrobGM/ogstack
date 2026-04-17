import type { ReactElement } from "react";
import { Pill } from "../../decorations";
import { Box, Canvas, Row, Rule, Stack } from "../../layout";
import { Text } from "../../text";
import type { TemplateProps } from "../../types";
import { description, logoStyles, prettyHost, resolveTheme, title, withAlpha } from "../../utils";
import { buildNavItems, getPathSegments } from "./helpers";

export function DocsPage(props: TemplateProps): ReactElement {
  const { dark, accent, logoUrl, logoPosition, metadata } = props;
  const theme = resolveTheme(dark, accent);
  const heading = title(props);
  const desc = description(props, 180);
  const segments = getPathSegments(metadata.url);
  const siteName = metadata.siteName ?? prettyHost(metadata.url);
  const navItems = buildNavItems(segments[0]);

  return (
    <Canvas padding={0} style={{ flexDirection: "row" }}>
      {logoUrl && <img src={logoUrl} style={logoStyles(logoPosition)} />}

      <Stack
        width={300}
        padding="52px 28px"
        gap={28}
        bg={theme.bgElevated}
        style={{ borderRight: `1px solid ${theme.border}` }}
      >
        <Row gap={10}>
          <Box
            width={28}
            height={28}
            radius={8}
            style={{
              background: `linear-gradient(135deg, ${accent} 0%, ${theme.accentStrong} 100%)`,
            }}
          />
          <Text size={18} weight={700} color={theme.fg}>
            {siteName}
          </Text>
        </Row>

        <Rule color={theme.border} />

        <Stack gap={14}>
          <Text variant="monoLabel" size={11} color={theme.muted}>
            Documentation
          </Text>
          {navItems.map((item) => (
            <Row
              key={item.label}
              gap={10}
              padding="8px 12px"
              radius={8}
              bg={item.active ? withAlpha(accent, 0.14) : "transparent"}
            >
              <Box width={4} height={16} radius={2} bg={item.active ? accent : "transparent"} />
              <Text
                size={16}
                weight={item.active ? 600 : 500}
                color={item.active ? accent : theme.fgSoft}
              >
                {item.label}
              </Text>
            </Row>
          ))}
        </Stack>
      </Stack>

      <Stack flex={1} padding="64px 72px" gap={24} bg={theme.bg} justify="center">
        <Row gap={10} wrap>
          {segments.length === 0 ? (
            <Pill color={theme.border} textColor={theme.muted} variant="outline" size="sm">
              / docs
            </Pill>
          ) : (
            segments.map((seg, i) => (
              <Row key={i} gap={10}>
                <Box
                  padding="6px 14px"
                  radius={8}
                  bg={i === segments.length - 1 ? withAlpha(accent, 0.14) : theme.surface}
                >
                  <Text
                    variant="mono"
                    size={14}
                    weight={600}
                    color={i === segments.length - 1 ? accent : theme.muted}
                  >
                    {seg}
                  </Text>
                </Box>
                {i < segments.length - 1 && (
                  <Text size={14} color={theme.muted}>
                    /
                  </Text>
                )}
              </Row>
            ))
          )}
        </Row>

        <Text
          size={58}
          weight={700}
          color={theme.fg}
          maxWidth={760}
          style={{ lineHeight: 1.08, letterSpacing: "-0.025em" }}
        >
          {heading}
        </Text>
        {desc && (
          <Text variant="body" color={theme.fgSoft} maxWidth={720} style={{ lineHeight: 1.5 }}>
            {desc}
          </Text>
        )}

        <Row gap={10} style={{ marginTop: "12px" }}>
          <Box
            padding="8px 14px"
            radius={8}
            bg={theme.surface}
            border={`1px solid ${theme.border}`}
          >
            <Row gap={10}>
              <Text variant="mono" size={14} color={accent}>
                $
              </Text>
              <Text variant="mono" size={14} color={theme.fgSoft}>
                read {siteName.toLowerCase()}/docs
              </Text>
            </Row>
          </Box>
        </Row>
      </Stack>
    </Canvas>
  );
}
