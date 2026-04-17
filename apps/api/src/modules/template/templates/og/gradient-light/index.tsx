import type { ReactElement } from "react";
import { CornerMarks, Kicker } from "../../decorations";
import { Box, Canvas, Row, Rule, Stack } from "../../layout";
import { Text } from "../../text";
import type { TemplateProps } from "../../types";
import { description, logoStyles, prettyHost, title } from "../../utils";

const PAPER = {
  bg: "#faf7f2",
  bgEnd: "#f3ede3",
  fg: "#1a1614",
  soft: "#5b524c",
  muted: "#8a7f77",
  border: "#e8e1d8",
};

export function GradientLight(props: TemplateProps): ReactElement {
  const { accent, logoUrl, logoPosition, metadata } = props;
  const heading = title(props);
  const desc = description(props);
  const host = prettyHost(metadata.url);
  const eyebrow = metadata.siteName ?? host;

  return (
    <Canvas
      padding="96px 120px"
      style={{
        flexDirection: "column",
        justifyContent: "center",
        background: `linear-gradient(180deg, ${PAPER.bg} 0%, ${PAPER.bgEnd} 100%)`,
      }}
    >
      <CornerMarks color={accent} size={22} />
      {logoUrl && <img src={logoUrl} style={logoStyles(logoPosition)} />}

      <Box absolute top={96} left={120} right={120}>
        <Row gap={20} width="100%">
          <Kicker color={accent}>{eyebrow}</Kicker>
          <Rule color={PAPER.border} flex={1} />
          <Text variant="mono" size={16} color={PAPER.muted}>
            {host}
          </Text>
        </Row>
      </Box>

      <Stack gap={28} maxWidth={920}>
        <Text variant="serif" size={84} color={PAPER.fg}>
          {heading}
        </Text>
        <Rule color={accent} length={64} thickness={3} />
        {desc && (
          <Text variant="serifItalic" size={24} color={PAPER.soft} maxWidth={800}>
            {desc}
          </Text>
        )}
      </Stack>

      <Box absolute bottom={96} left={120}>
        <Text
          size={14}
          color={PAPER.muted}
          weight={600}
          style={{ textTransform: "uppercase", letterSpacing: "0.28em" }}
        >
          Essay · {new Date().getFullYear()}
        </Text>
      </Box>
    </Canvas>
  );
}
