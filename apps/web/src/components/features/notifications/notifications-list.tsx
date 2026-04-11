"use client";

import { useState, type ReactElement } from "react";
import CampaignIcon from "@mui/icons-material/Campaign";
import CheckIcon from "@mui/icons-material/Check";
import CloseIcon from "@mui/icons-material/Close";
import DoneAllIcon from "@mui/icons-material/DoneAll";
import PaymentIcon from "@mui/icons-material/Payment";
import SpeedIcon from "@mui/icons-material/Speed";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import { Box, Button, Chip, IconButton, Stack, Tooltip, Typography } from "@mui/material";
import { useRouter } from "next/navigation";
import { DataTable, type Column } from "@/components/ui/data/data-table";
import { Pagination } from "@/components/ui/data/pagination";
import { PageHeader } from "@/components/ui/layout/page-header";
import { useApiMutation, useApiQuery } from "@/hooks";
import { client } from "@/lib/api/client";
import { queryKeys } from "@/lib/query-keys";

type Filter = "all" | "unread";

const TYPE_ICONS: Record<string, ReactElement> = {
  USAGE_ALERT: <SpeedIcon fontSize="small" sx={{ color: "info.main" }} />,
  QUOTA_EXCEEDED: <WarningAmberIcon fontSize="small" sx={{ color: "warning.main" }} />,
  BILLING_EVENT: <PaymentIcon fontSize="small" sx={{ color: "success.main" }} />,
  SYSTEM_ANNOUNCEMENT: <CampaignIcon fontSize="small" sx={{ color: "primary.main" }} />,
};

const TYPE_LABELS: Record<string, string> = {
  USAGE_ALERT: "Usage",
  QUOTA_EXCEEDED: "Quota",
  BILLING_EVENT: "Billing",
  SYSTEM_ANNOUNCEMENT: "System",
};

interface NotificationRow {
  id: string;
  type: string;
  title: string;
  message: string;
  actionUrl?: string | null;
  readAt?: Date | string | null;
  createdAt: Date | string;
}

export function NotificationsList(): ReactElement {
  const router = useRouter();
  const [filter, setFilter] = useState<Filter>("all");
  const [page, setPage] = useState(1);

  const listQuery = useApiQuery(queryKeys.notifications.list(filter, page), () =>
    client.api.notifications.get({
      query: {
        page,
        limit: 20,
        ...(filter === "unread" ? { unreadOnly: "true" as const } : {}),
      },
    }),
  );

  const markAsRead = useApiMutation(
    (ids: string[]) => client.api.notifications.read.patch({ ids }),
    {
      invalidateKeys: [queryKeys.notifications.all],
      successMessage: "Marked as read",
    },
  );

  const markAllAsRead = useApiMutation(() => client.api.notifications["read-all"].patch(), {
    invalidateKeys: [queryKeys.notifications.all],
    successMessage: "All notifications marked as read",
  });

  const deleteNotification = useApiMutation(
    (id: string) => client.api.notifications({ id }).delete(),
    {
      invalidateKeys: [queryKeys.notifications.all],
    },
  );

  const notifications = (listQuery.data?.items ?? []) as NotificationRow[];
  const pagination = listQuery.data?.pagination;

  const columns: Column<NotificationRow>[] = [
    {
      key: "type",
      header: "Type",
      width: 100,
      render: (row) => (
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          {TYPE_ICONS[row.type]}
          <Typography variant="caption">{TYPE_LABELS[row.type] ?? row.type}</Typography>
        </Box>
      ),
    },
    {
      key: "title",
      header: "Title",
      width: "30%",
      render: (row) => (
        <Typography variant="body2" sx={{ fontWeight: row.readAt ? 400 : 600 }}>
          {row.title}
        </Typography>
      ),
    },
    {
      key: "message",
      header: "Message",
      render: (row) => (
        <Typography
          variant="caption"
          color="text.secondary"
          noWrap
          sx={{ maxWidth: 300, display: "block" }}
        >
          {row.message}
        </Typography>
      ),
    },
    {
      key: "createdAt",
      header: "Date",
      width: 140,
      render: (row) => (
        <Typography variant="caption" color="text.secondary">
          {new Date(row.createdAt).toLocaleDateString(undefined, {
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          })}
        </Typography>
      ),
    },
    {
      key: "status",
      header: "Status",
      width: 90,
      render: (row) => (
        <Chip
          label={row.readAt ? "Read" : "Unread"}
          size="small"
          color={row.readAt ? "default" : "primary"}
          variant={row.readAt ? "outlined" : "filled"}
          sx={{ fontSize: "0.7rem", height: 22 }}
        />
      ),
    },
    {
      key: "actions",
      header: "",
      width: 80,
      align: "right",
      render: (row) => (
        <Stack direction="row" spacing={0.5}>
          {!row.readAt && (
            <Tooltip title="Mark as read">
              <IconButton size="small" onClick={() => markAsRead.mutate([row.id])}>
                <CheckIcon sx={{ fontSize: 16 }} />
              </IconButton>
            </Tooltip>
          )}
          <Tooltip title="Delete">
            <IconButton size="small" onClick={() => deleteNotification.mutate(row.id)}>
              <CloseIcon sx={{ fontSize: 16 }} />
            </IconButton>
          </Tooltip>
        </Stack>
      ),
    },
  ];

  return (
    <Stack spacing={3}>
      <PageHeader
        title="Notifications"
        description="Stay updated with usage, billing, and system alerts."
        actions={
          <Stack direction="row" spacing={1}>
            <Stack direction="row" spacing={0.5}>
              <Button
                size="small"
                variant={filter === "all" ? "contained" : "outlined"}
                onClick={() => {
                  setFilter("all");
                  setPage(1);
                }}
              >
                All
              </Button>
              <Button
                size="small"
                variant={filter === "unread" ? "contained" : "outlined"}
                onClick={() => {
                  setFilter("unread");
                  setPage(1);
                }}
              >
                Unread
              </Button>
            </Stack>
            <Button
              size="small"
              variant="outlined"
              startIcon={<DoneAllIcon sx={{ fontSize: 16 }} />}
              onClick={() => markAllAsRead.mutate()}
              sx={{ textTransform: "none" }}
            >
              Mark all read
            </Button>
          </Stack>
        }
      />

      <DataTable
        columns={columns}
        rows={notifications}
        rowKey={(row) => row.id}
        loading={listQuery.isLoading}
        onRowClick={(row) => {
          if (row.actionUrl) {
            if (!row.readAt) markAsRead.mutate([row.id]);
            router.push(row.actionUrl as never);
          }
        }}
        empty={{
          title: "No notifications",
          description:
            filter === "unread"
              ? "You're all caught up!"
              : "Notifications about usage, billing, and system updates will appear here.",
        }}
      />

      {pagination && (
        <Pagination page={page} totalPages={pagination.totalPages} onPageChange={setPage} />
      )}
    </Stack>
  );
}
