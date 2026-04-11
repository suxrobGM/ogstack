"use client";

import type { ReactElement, SyntheticEvent } from "react";
import { Tab, Tabs } from "@mui/material";
import { usePathname, useRouter } from "next/navigation";
import { ROUTES } from "@/lib/constants";

const SETTINGS_TABS = [
  { label: "Profile", href: ROUTES.settingsProfile },
  { label: "Security", href: ROUTES.settingsSecurity },
] as const;

export function SettingsTabs(): ReactElement {
  const pathname = usePathname();
  const router = useRouter();

  const currentTab = SETTINGS_TABS.findIndex((tab) => pathname.startsWith(tab.href)) ?? 0;

  const handleChange = (_: SyntheticEvent, value: number) => {
    const tab = SETTINGS_TABS[value];
    if (tab) router.push(tab.href);
  };

  return (
    <Tabs
      value={currentTab === -1 ? 0 : currentTab}
      onChange={handleChange}
      sx={{ borderBottom: 1, borderColor: "divider" }}
    >
      {SETTINGS_TABS.map((tab) => (
        <Tab key={tab.href} label={tab.label} />
      ))}
    </Tabs>
  );
}
