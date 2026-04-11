import type { ReactElement, ReactNode } from "react";
import { Stack } from "@mui/material";
import { SettingsTabs } from "@/components/features/settings/settings-tabs";
import { PageHeader } from "@/components/ui/layout/page-header";

interface SettingsLayoutProps {
  children: ReactNode;
}

export default function SettingsLayout(props: SettingsLayoutProps): ReactElement {
  const { children } = props;

  return (
    <Stack spacing={4}>
      <PageHeader title="Settings" description="Manage your account and preferences." />
      <SettingsTabs />
      {children}
    </Stack>
  );
}
