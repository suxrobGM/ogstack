"use client";

import { Suspense, useState, type ReactElement, type SyntheticEvent } from "react";
import { Skeleton, Stack, Tab, Tabs } from "@mui/material";
import type { FrameworkSnippet } from "@/utils/framework-snippets";
import { CodeBlock } from "./code-block";

interface FrameworkSnippetTabsProps {
  snippets: FrameworkSnippet[];
  dense?: boolean;
}

/**
 * MUI Tabs strip + CodeBlock. Renders one snippet per framework so users can
 * copy the variant for their stack (Next.js, Nuxt, SvelteKit, …).
 */
export function FrameworkSnippetTabs(props: FrameworkSnippetTabsProps): ReactElement {
  const { snippets, dense } = props;
  const [active, setActive] = useState<string>(snippets[0]?.id ?? "");

  const first = snippets[0];

  if (!first) {
    return <></>;
  }

  const current = snippets.find((s) => s.id === active) ?? first;
  const onChange = (_: SyntheticEvent, value: string) => setActive(value);

  return (
    <Stack spacing={1.5}>
      <Tabs
        value={current.id}
        onChange={onChange}
        variant="scrollable"
        allowScrollButtonsMobile
        sx={{
          minHeight: 36,
          "& .MuiTab-root": { minHeight: 36, fontSize: 13, textTransform: "none" },
        }}
      >
        {snippets.map((s) => (
          <Tab key={s.id} value={s.id} label={s.label} />
        ))}
      </Tabs>
      <Suspense fallback={<Skeleton variant="rectangular" height={dense ? 80 : 120} />}>
        <CodeBlock code={current.code} language={current.language} dense={dense} />
      </Suspense>
    </Stack>
  );
}
