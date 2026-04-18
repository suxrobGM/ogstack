"use client";

import type { ReactElement } from "react";
import { Chip, Typography } from "@mui/material";
import type { Route } from "next";
import { useRouter } from "next/navigation";
import { DataTable, type Column } from "@/components/ui/data/data-table";
import { feedback } from "@/theme";
import { fontFamilies } from "@/theme/typography";
import type { PageAuditHistoryItem } from "@/types/api";

interface AuditHistoryListProps {
  items: PageAuditHistoryItem[];
}

function gradeColor(score: number): string {
  if (score >= 90) return feedback.success;
  if (score >= 70) return feedback.info;
  if (score >= 50) return feedback.warning;
  return feedback.error;
}

function hostname(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
}

export function AuditHistoryList(props: AuditHistoryListProps): ReactElement {
  const { items } = props;
  const router = useRouter();

  const columns: Column<PageAuditHistoryItem>[] = [
    {
      key: "url",
      header: "URL",
      render: (row) => (
        <Typography sx={{ fontFamily: fontFamilies.mono, fontSize: 13 }}>
          {hostname(row.url)}
        </Typography>
      ),
    },
    {
      key: "overallScore",
      header: "Score",
      width: 120,
      render: (row) => {
        const color = gradeColor(row.overallScore);
        return (
          <Chip
            label={`${row.overallScore} · ${row.letterGrade}`}
            size="small"
            sx={{
              bgcolor: `${color}1A`,
              color,
              fontWeight: 600,
            }}
          />
        );
      },
    },
    {
      key: "createdAt",
      header: "Date",
      width: 180,
      render: (row) => (
        <Typography variant="caption" sx={{ color: "text.secondary" }}>
          {new Date(row.createdAt).toLocaleString()}
        </Typography>
      ),
    },
  ];

  return (
    <DataTable
      columns={columns}
      rows={items}
      rowKey={(r) => r.id}
      onRowClick={(row) => router.push(`/audits/${row.id}` as Route)}
      empty={{
        title: "No audits yet",
        description: "Run your first audit above to see it here.",
      }}
    />
  );
}
