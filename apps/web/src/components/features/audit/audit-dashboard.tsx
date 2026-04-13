"use client";

import type { ReactElement } from "react";
import { Grid, Stack, Typography } from "@mui/material";
import { useQueryClient } from "@tanstack/react-query";
import type { Route } from "next";
import { useRouter } from "next/navigation";
import type { AuditHistoryResponse } from "@/types/api";
import { AuditForm } from "./audit-form";
import { AuditHistoryList } from "./audit-history-list";

interface AuditDashboardProps {
  initialHistory: AuditHistoryResponse;
}

export function AuditDashboard(props: AuditDashboardProps): ReactElement {
  const { initialHistory } = props;
  const router = useRouter();
  const queryClient = useQueryClient();

  return (
    <Grid container spacing={4}>
      <Grid size={{ xs: 12, md: 5 }}>
        <Stack spacing={3}>
          <Typography variant="h5">Run an audit</Typography>
          <AuditForm
            onSuccess={(report) => {
              queryClient.invalidateQueries({ queryKey: ["audit", "history"] });
              router.push(`/audits/${report.id}` as Route);
            }}
          />
        </Stack>
      </Grid>
      <Grid size={{ xs: 12, md: 7 }}>
        <Stack spacing={3}>
          <Typography variant="h5">Recent audits</Typography>
          <AuditHistoryList items={initialHistory.items} />
        </Stack>
      </Grid>
    </Grid>
  );
}
