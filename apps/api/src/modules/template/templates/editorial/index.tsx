import type { ReactElement } from "react";
import { CornerMarks, Kicker } from "../decorations";
import { Canvas, Row, Rule, Stack } from "../layout";
import { Text } from "../text";
import type { TemplateProps } from "../types";
import { description, logoStyles, prettyHost, title } from "../utils";

/** Warm paper palette is intentional for this template — `dark` is ignored. */
const PAPER = {
  bg: "#faf7f2",
  bgEnd: "#f3ede3",
  fg: "#1a1614",
  soft: "#5b524c",
  muted: "#8a7f77",
  border: "#e8e1d8",
};

export function Editorial(props: TemplateProps): ReactElement {
  const { accent, kind, logoUrl, logoPosition, metadata, scale } = props;
  const heading = title(props);
  const desc = description(props, 220);
  const host = prettyHost(metadata.url);
  const eyebrow = metadata.siteName ?? host;
  const footerLabel = kind === "og" ? `Essay · ${new Date().getFullYear()}` : "Feature Story";

  return (
    <Canvas
      padding={scale.pad}
      style={{
        flexDirection: "column",
        justifyContent: "space-between",
        background: `linear-gradient(180deg, ${PAPER.bg} 0%, ${PAPER.bgEnd} 100%)`,
      }}
    >
      <CornerMarks color={accent} size={22} />
      {logoUrl && <img src={logoUrl} style={logoStyles(logoPosition)} />}

      <Row gap={20} width="100%">
        <Kicker color={accent} size={scale.kicker}>
          {eyebrow}
        </Kicker>
        <Rule color={PAPER.border} flex={1} />
        <Text variant="mono" size={scale.mono} color={PAPER.muted}>
          {host}
        </Text>
      </Row>

      <Stack gap={scale.gap} maxWidth={scale.maxContentWidth}>
        <Text variant="serif" size={scale.display} color={PAPER.fg} style={{ lineHeight: 1.04 }}>
          {heading}
        </Text>
        <Rule color={accent} length={72} thickness={scale.rule + 2} />
        {desc && (
          <Text
            variant="serifItalic"
            size={scale.body + 2}
            color={PAPER.soft}
            maxWidth={Math.round(scale.maxContentWidth * 0.86)}
          >
            {desc}
          </Text>
        )}
      </Stack>

      <Row gap={24} align="center" width="100%">
        <Rule color={PAPER.border} flex={1} />
        <Text variant="kicker" color={PAPER.muted} size={scale.kicker}>
          {footerLabel}
        </Text>
      </Row>
    </Canvas>
  );
}
