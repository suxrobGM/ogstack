"use client";

import type { ReactElement, SyntheticEvent } from "react";
import { Tab, Tabs } from "@mui/material";
import type { Route } from "next";
import { usePathname, useRouter } from "next/navigation";

interface ProjectTabsProps {
  projectId: string;
}

export function ProjectTabs(props: ProjectTabsProps): ReactElement {
  const { projectId } = props;
  const pathname = usePathname();
  const router = useRouter();

  const base = `/projects/${projectId}`;
  const tabs = [
    { label: "Images", href: base },
    { label: "Settings", href: `${base}/settings` },
  ] as const;

  const sorted = tabs
    .map((tab, index) => ({ tab, index }))
    .sort((a, b) => b.tab.href.length - a.tab.href.length);

  const matched = sorted.find(
    ({ tab }) => pathname === tab.href || pathname.startsWith(tab.href + "/"),
  );

  const currentTab = matched?.index ?? 0;

  const handleChange = (_: SyntheticEvent, value: number) => {
    const tab = tabs[value];
    if (tab) router.push(tab.href as Route);
  };

  return (
    <Tabs
      value={currentTab}
      onChange={handleChange}
      sx={{ borderBottom: 1, borderColor: "divider" }}
    >
      {tabs.map((tab) => (
        <Tab key={tab.href} label={tab.label} />
      ))}
    </Tabs>
  );
}
