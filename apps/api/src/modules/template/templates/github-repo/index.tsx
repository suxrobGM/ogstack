import type { ReactElement } from "react";
import { Kicker } from "../decorations";
import { Box, Canvas, Dot, Row, Spacer, Stack } from "../layout";
import { Text } from "../text";
import type { TemplateProps } from "../types";
import { description, logoStyles, resolveTheme, title, withAlpha } from "../utils";
import { ForkIcon, IssueIcon, RepoIcon, StarIcon } from "./icons";

function repoSlug(url: string): { owner: string; name: string } {
  try {
    const parts = new URL(url).pathname.split("/").filter(Boolean);
    return { owner: parts[0] ?? "owner", name: parts[1] ?? "repository" };
  } catch {
    return { owner: "owner", name: "repo" };
  }
}

export function GithubRepo(props: TemplateProps): ReactElement {
  const { dark, accent, logoUrl, logoPosition, metadata } = props;
  const theme = resolveTheme(dark, accent);
  const heading = title(props);
  const desc = description(props, 150);
  const { owner, name } = repoSlug(metadata.url);

  const stats = [
    { icon: <StarIcon color={theme.fg} />, label: "stars", value: "12.4k" },
    { icon: <ForkIcon color={theme.fg} />, label: "forks", value: "842" },
    { icon: <IssueIcon color={theme.fg} />, label: "issues", value: "37" },
  ];

  return (
    <Canvas padding="60px 72px" bg={theme.bg} style={{ flexDirection: "column" }}>
      <Box
        absolute
        top={0}
        right={0}
        width={420}
        height={420}
        style={{
          background: `radial-gradient(circle at top right, ${withAlpha(accent, 0.18)} 0%, rgba(0,0,0,0) 65%)`,
        }}
      />

      {logoUrl && <img src={logoUrl} style={logoStyles(logoPosition)} />}

      <Row gap={16} style={{ paddingBottom: "32px", borderBottom: `1px solid ${theme.border}` }}>
        <RepoIcon color={accent} size={32} />
        <Row gap={10}>
          <Text variant="mono" size={24} color={theme.fgSoft}>
            {owner}
          </Text>
          <Text variant="mono" size={24} color={theme.muted}>
            /
          </Text>
          <Text variant="mono" size={24} color={theme.fg} weight={700}>
            {name}
          </Text>
        </Row>
        <Spacer />
        <Kicker color={theme.muted} size={13}>
          Public · MIT
        </Kicker>
      </Row>

      <Stack flex={1} justify="center" gap={18} maxWidth={960}>
        <Text variant="h2" color={theme.fg}>
          {heading}
        </Text>
        {desc && (
          <Text variant="body" color={theme.fgSoft}>
            {desc}
          </Text>
        )}
      </Stack>

      <Stack gap={20} style={{ paddingTop: "24px", borderTop: `1px solid ${theme.border}` }}>
        <Row gap={28}>
          {stats.map((s) => (
            <Row key={s.label} gap={8}>
              {s.icon}
              <Text size={18} color={theme.fg} weight={700}>
                {s.value}
              </Text>
              <Text size={16} color={theme.muted}>
                {s.label}
              </Text>
            </Row>
          ))}
          <Spacer />
          <Row gap={8}>
            <Dot color={accent} size={12} />
            <Text size={16} color={theme.fgSoft}>
              TypeScript
            </Text>
          </Row>
        </Row>

        <Row width="100%" height={6} radius={999} bg={theme.surface} style={{ overflow: "hidden" }}>
          <Box width="68%" bg={accent} />
          <Box width="22%" bg={withAlpha(accent, 0.55)} />
          <Box width="10%" bg={withAlpha(accent, 0.3)} />
        </Row>
      </Stack>
    </Canvas>
  );
}
