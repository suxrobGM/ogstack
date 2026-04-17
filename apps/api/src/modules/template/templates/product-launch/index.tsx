import type { ReactElement } from "react";
import { LabelValue } from "../decorations";
import { Canvas, Dot, Row, Rule, Spacer, Stack } from "../layout";
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
import { GradientMesh } from "./gradient-mesh";
import { ReleaseBadge } from "./release-badge";

function extractVersion(text: string): string {
  const match = text.match(/v?(\d+)\.(\d+)(?:\.\d+)?/);
  if (match) return `v${match[1]}.${match[2]}`;
  return "v1.0";
}

export function ProductLaunch(props: TemplateProps): ReactElement {
  const { dark, accent, logoUrl, logoPosition, metadata } = props;
  const theme = resolveTheme(dark, accent);
  const heading = title(props);
  const desc = description(props, 110);
  const host = prettyHost(metadata.url);
  const eyebrow = metadata.siteName ?? host;
  const version = extractVersion(`${heading} ${metadata.description ?? ""}`);

  return (
    <Canvas padding="64px 72px" bg="#07070c" style={{ flexDirection: "column" }}>
      <GradientMesh accent={accent} strong={theme.accentStrong} />
      <ReleaseBadge accent={accent} strong={theme.accentStrong} version={version} />

      {logoUrl && <img src={logoUrl} style={logoStyles(logoPosition)} />}

      <Row gap={14} style={{ position: "relative" }}>
        <Dot color={accent} style={{ boxShadow: `0 0 0 4px ${withAlpha(accent, 0.25)}` }} />
        <Text variant="monoLabel" size={14} color={accent} style={{ letterSpacing: "0.22em" }}>
          Now Shipping · {version}
        </Text>
        <Rule color={withAlpha("#ffffff", 0.08)} flex={1} />
        <Text variant="mono" size={13} color={withAlpha("#ffffff", 0.45)}>
          {eyebrow}
        </Text>
      </Row>

      <Stack flex={1} justify="center" gap={28} maxWidth={760} style={{ position: "relative" }}>
        <Row gap={18} align="baseline">
          <Text serif italic size={18} color={accent}>
            Introducing —
          </Text>
          <Rule color={withAlpha(accent, 0.4)} flex={1} style={{ marginBottom: "8px" }} />
        </Row>

        <Text
          size={84}
          weight={800}
          color="#ffffff"
          style={{ lineHeight: 1.02, letterSpacing: "-0.04em", paddingBottom: "6px" }}
        >
          {heading}
        </Text>

        {desc && (
          <Text
            size={24}
            color={withAlpha("#ffffff", 0.7)}
            maxWidth={720}
            style={{ lineHeight: 1.4 }}
          >
            {desc}
          </Text>
        )}
      </Stack>

      <Row
        gap={32}
        style={{
          paddingTop: "28px",
          borderTop: `1px solid ${withAlpha("#ffffff", 0.08)}`,
          position: "relative",
        }}
      >
        <LabelValue
          label="Released"
          value={formattedDate()}
          labelColor={withAlpha("#ffffff", 0.4)}
          valueColor="#ffffff"
        />
        <Dot color={accent} size={4} />
        <LabelValue
          label="From"
          value={host}
          labelColor={withAlpha("#ffffff", 0.4)}
          valueColor="#ffffff"
        />
        <Spacer />
        <Row gap={10} padding="10px 18px" radius={999} bg={accent}>
          <Text
            size={14}
            weight={700}
            color={theme.accentOn}
            style={{ textTransform: "uppercase", letterSpacing: "0.14em" }}
          >
            Read the announcement
          </Text>
          <Text size={14} color={theme.accentOn}>
            →
          </Text>
        </Row>
      </Row>
    </Canvas>
  );
}
