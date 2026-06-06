"use client";

import type { ReactElement } from "react";
import { Grid, Stack, Typography } from "@mui/material";
import { useQueryClient } from "@tanstack/react-query";
import type { Route } from "next";
import { useRouter } from "next/navigation";
import type { PageAuditHistoryResponse } from "@/api/types";
import { useAuth } from "@/auth";
import { AuditForm } from "./audit-form";
import { AuditHistoryList } from "./audit-history-list";

interface AuditDashboardProps {
  history: PageAuditHistoryResponse;
}

export function AuditDashboard(props: AuditDashboardProps): ReactElement {
  const { history } = props;
  const router = useRouter();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const aiAllowed = !!user;

  return (
    <Grid container spacing={4}>
      <Grid size={{ xs: 12, md: 5 }}>
        <Stack spacing={3}>
          <Typography variant="h5">Run an audit</Typography>
          <AuditForm
            showAiOption
            aiAllowed={aiAllowed}
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
          <AuditHistoryList items={history.items} />
        </Stack>
      </Grid>
    </Grid>
  );
}
