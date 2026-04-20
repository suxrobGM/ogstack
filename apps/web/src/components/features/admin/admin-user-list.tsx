"use client";

import { useState, type ReactElement } from "react";
import SearchIcon from "@mui/icons-material/Search";
import { Chip, InputAdornment, Stack, TextField, Typography } from "@mui/material";
import { PLANS, type Plan } from "@ogstack/shared";
import { useRouter } from "next/navigation";
import { DataTable, type Column } from "@/components/ui/data/data-table";
import { Pagination } from "@/components/ui/data/pagination";
import { SelectInput } from "@/components/ui/form/select-input";
import { PageHeader } from "@/components/ui/layout/page-header";
import { useApiQuery, useDebouncedValue } from "@/hooks";
import { client } from "@/lib/api/client";
import { ROUTES } from "@/lib/constants";
import { queryKeys } from "@/lib/query-keys";
import type { AdminUserListItem, AdminUserListResponse } from "@/types/api";

type StatusFilter = "" | "active" | "suspended";

interface AdminUserListProps {
  initialData?: AdminUserListResponse | null;
}

export function AdminUserList(props: AdminUserListProps): ReactElement {
  const { initialData } = props;
  const router = useRouter();

  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [plan, setPlan] = useState<Plan | "">("");
  const [status, setStatus] = useState<StatusFilter>("");

  const debouncedSearch = useDebouncedValue(search, 400);

  const { data, isLoading } = useApiQuery<AdminUserListResponse>(
    queryKeys.admin.usersList({ page, search: debouncedSearch, plan, status }),
    () =>
      client.api.admin.users.get({
        query: {
          page,
          limit: 20,
          ...(debouncedSearch && { search: debouncedSearch }),
          ...(plan && { plan }),
          ...(status && { status }),
        },
      }),
    { initialData: initialData!, errorMessage: "Failed to load users." },
  );

  const items = data?.items ?? [];
  const pagination = data?.pagination;

  const columns: Column<AdminUserListItem>[] = [
    {
      key: "email",
      header: "Email",
      render: (row) => (
        <Typography
          variant="body2"
          sx={{ fontWeight: 500, cursor: "pointer", "&:hover": { textDecoration: "underline" } }}
        >
          {row.email}
        </Typography>
      ),
    },
    {
      key: "name",
      header: "Name",
      render: (row) => (
        <Typography variant="body2">
          {row.firstName || row.lastName ? `${row.firstName} ${row.lastName}`.trim() : "-"}
        </Typography>
      ),
    },
    {
      key: "plan",
      header: "Plan",
      width: 120,
      render: (row) => <Chip size="small" label={row.plan} variant="outlined" />,
    },
    {
      key: "status",
      header: "Status",
      width: 120,
      render: (row) =>
        row.suspended ? (
          <Chip size="small" label="suspended" color="error" variant="outlined" />
        ) : (
          <Chip size="small" label="active" color="success" variant="outlined" />
        ),
    },
    {
      key: "createdAt",
      header: "Joined",
      width: 140,
      render: (row) => (
        <Typography variant="body2Muted">{new Date(row.createdAt).toLocaleDateString()}</Typography>
      ),
    },
  ];

  return (
    <Stack spacing={3}>
      <PageHeader title="Users" description="Manage platform users, plans, and access." />

      <Stack direction={{ xs: "column", md: "row" }} spacing={2} sx={{ alignItems: "flex-start" }}>
        <TextField
          placeholder="Search by email or name..."
          size="small"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            },
          }}
          sx={{ flex: 1, maxWidth: 360 }}
        />
        <SelectInput<Plan | "">
          label="Plan"
          value={plan}
          onChange={(v) => {
            setPlan(v);
            setPage(1);
          }}
          items={[{ value: "", label: "All plans" }, ...PLANS.map((p) => ({ value: p, label: p }))]}
        />
        <SelectInput<StatusFilter>
          label="Status"
          value={status}
          onChange={(v) => {
            setStatus(v);
            setPage(1);
          }}
          items={[
            { value: "", label: "All statuses" },
            { value: "active", label: "Active" },
            { value: "suspended", label: "Suspended" },
          ]}
        />
      </Stack>

      <DataTable
        columns={columns}
        rows={items}
        rowKey={(row) => row.id}
        loading={isLoading}
        onRowClick={(row) => router.push(ROUTES.adminUserDetail(row.id))}
        empty={{
          title: "No users found",
          description:
            debouncedSearch || plan || status
              ? "No users match the current filters."
              : "No users registered yet.",
        }}
      />

      {pagination && (
        <Pagination page={page} totalPages={pagination.totalPages} onPageChange={setPage} />
      )}
    </Stack>
  );
}
