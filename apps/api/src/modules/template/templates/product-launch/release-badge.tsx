import type { ReactElement } from "react";
import { LabelValue } from "../decorations";
import { Dot, Row, Rule, Stack } from "../layout";
import { Text } from "../text";
import { withAlpha } from "../utils";

export function ReleaseBadge(props: {
  accent: string;
  strong: string;
  version: string;
}): ReactElement {
  const { accent, strong, version } = props;
  return (
    <Stack
      absolute
      top={130}
      right={72}
      width={220}
      padding="22px 24px"
      radius={18}
      gap={14}
      border={`1px solid ${withAlpha(accent, 0.32)}`}
      style={{
        background: `linear-gradient(160deg, ${withAlpha(accent, 0.18)} 0%, ${withAlpha(strong, 0.08)} 100%)`,
      }}
    >
      <Row justify="between">
        <Text variant="monoLabel" size={11} color={withAlpha("#ffffff", 0.55)}>
          Release
        </Text>
        <Dot color={accent} />
      </Row>
      <Text serif italic size={64} color="#ffffff" weight={400} style={{ lineHeight: 1 }}>
        {version.replace("v", "")}
      </Text>
      <Rule color={withAlpha("#ffffff", 0.12)} />
      <LabelValue
        label="Channel"
        value="Stable · Live"
        labelColor={withAlpha("#ffffff", 0.5)}
        valueColor="#ffffff"
      />
    </Stack>
  );
}
