import type { ReactElement } from "react";
import { AvatarCircle, Pill } from "../decorations";
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
import { deriveCategory, estimateReadTime } from "./helpers";

export function BlogCard(props: TemplateProps): ReactElement {
  const { dark, accent, logoUrl, logoPosition, metadata } = props;
  const theme = resolveTheme(dark, accent);
  const heading = title(props);
  const desc = description(props, 140);
  const author = metadata.author ?? metadata.siteName ?? prettyHost(metadata.url);
  const category = deriveCategory(metadata.url);
  const readTime = estimateReadTime(metadata.description);

  return (
    <Canvas
      padding="64px 72px"
      bg={theme.bg}
      style={{
        flexDirection: "column",
        justifyContent: "space-between",
        background: `linear-gradient(180deg, ${theme.bg} 0%, ${theme.surface} 100%)`,
      }}
    >
      <Box
        absolute
        top="-60px"
        right="40px"
        style={{
          fontSize: "420px",
          fontFamily: "Instrument Serif",
          color: withAlpha(accent, 0.08),
          lineHeight: 1,
        }}
      >
        “
      </Box>

      {logoUrl && <img src={logoUrl} style={logoStyles(logoPosition)} />}

      <Row justify="between">
        <Pill color={accent} textColor={accent} variant="soft" size="sm">
          {category}
        </Pill>
        <Text variant="mono" size={15} color={theme.muted}>
          {formattedDate()}
        </Text>
      </Row>

      <Stack gap={18} maxWidth={960}>
        <Text serif size={60} color={theme.fg}>
          {heading}
        </Text>
        {desc && (
          <Text variant="body" color={theme.fgSoft} maxWidth={900}>
            {desc}
          </Text>
        )}
      </Stack>

      <Row gap={16}>
        <AvatarCircle
          initial={author.charAt(0) || "A"}
          bg={accent}
          fg={theme.accentOn}
          size={52}
          border={`2px solid ${theme.bg}`}
        />
        <Stack gap={2}>
          <Text size={19} color={theme.fg} weight={700}>
            {author}
          </Text>
          <Row gap={8}>
            <Text variant="small" color={theme.muted}>
              {readTime}
            </Text>
            <Dot color={theme.muted} size={3} />
            <Text variant="small" color={theme.muted}>
              {prettyHost(metadata.url)}
            </Text>
          </Row>
        </Stack>
      </Row>
    </Canvas>
  );
}
