---
name: add-page
description: "Scaffold a new Next.js page with MUI layout, server-side auth guard, feature component, pagination, and optional create dialog following OGStack frontend conventions."
argument-hint: "<page-name> <route-path> [--auth] [--list] [--form] [--crud]"
---

# Add Page

Scaffold a new Next.js page under `apps/web/src/app/` following OGStack's established frontend patterns. Generates a React Server Component page with a `"use client"` feature component, optional auth protection, data list with pagination, and optional create/edit forms.

## Input

`$ARGUMENTS` should contain:

1. **Page name** (kebab-case, e.g., `projects`, `api-keys`, `playground`) — used for file names and component names
2. **Route path** (optional, e.g., `(dashboard)/projects`) — the folder path under `src/app/`. Defaults to the page name.

Optional flags:

- `--auth`: Page requires authentication. Adds a server-side auth check using `getServerClient()` and redirects to `/login` if unauthenticated. (Recommended for all dashboard pages)
- `--list`: Generate a list view with search input, data table, and **pagination controls** (Prev/Next buttons with total count).
- `--form`: Generate a standalone form page using TanStack Form + Zod v4.
- `--crud`: Implies `--list`. Also generates a create dialog component as a separate file, with a "New X" button that opens it. Best for resource management pages.

If no arguments are provided, ask the user for the page name and route.

## Step-by-step process

### 1. Parse and validate arguments

Extract from `$ARGUMENTS`:
- **page-name** → convert to:
  - **kebab-case** for file names: `api-keys`
  - **PascalCase** for component names: `ApiKeys`
  - **Title Case** for display labels: `API Keys`
  - **Singular title** for single item labels: `API Key`
- **route-path** → directory under `src/app/`

Validate:
- Page name must be lowercase letters, numbers, hyphens only
- Target directory `apps/web/src/app/<route-path>/` must NOT already exist. If it does, warn and ask user to confirm.

### 2. Read existing code for reference

Before generating any code, read:

```
apps/web/src/lib/api-server.ts     ← to get the correct server-side client function
apps/web/src/hooks/use-api-query.ts
apps/web/src/lib/constants.ts      ← for PAGINATION_DEFAULTS and ROUTES
```

**Critical**: The server-side API client is accessed via `getServerClient()` from `@/lib/api-server`, NOT via a named `apiServer` export. Always call `const client = await getServerClient({ auth: true })` in server components.

### 3. Create the page file

Create `apps/web/src/app/<route-path>/page.tsx`.

Pages are **always React Server Components** — never add `"use client"`.

**Base page (no flags):**

```tsx
import type { ReactElement } from "react";
import { <PascalName>Feature } from "@/components/features/<kebab-name>/<kebab-name>-feature";

export default function <PascalName>Page(): ReactElement {
  return <<PascalName>Feature />;
}
```

**If `--auth` is set:**

```tsx
import type { ReactElement } from "react";
import { redirect } from "next/navigation";
import { getServerClient } from "@/lib/api-server";
import { <PascalName>Feature } from "@/components/features/<kebab-name>/<kebab-name>-feature";

export default async function <PascalName>Page(): Promise<ReactElement> {
  const client = await getServerClient({ auth: true });
  const { data: user } = await client.api.users.me.get();

  if (!user) {
    redirect("/login");
  }

  return <<PascalName>Feature />;
}
```

### 4. Create the feature component

Create `apps/web/src/components/features/<kebab-name>/<kebab-name>-feature.tsx`.

Feature components have `"use client"` and hold all interactive logic.

**Base feature component (no flags):**

```tsx
"use client";

import type { ReactElement } from "react";
import { Box, Typography } from "@mui/material";

export function <PascalName>Feature(): ReactElement {
  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        <Title Case Name>
      </Typography>
      {/* TODO: Add content */}
    </Box>
  );
}
```

**If `--list` or `--crud` is set**, generate a list view with search, table, and **pagination controls**:

```tsx
"use client";

import type { ReactElement } from "react";
import { useState } from "react";
import {
  Box,
  Button,
  CircularProgress,
  InputAdornment,
  Pagination,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import { useApiQuery } from "@/hooks";
import { client } from "@/lib/api";
import { PAGINATION_DEFAULTS } from "@/lib/constants";

export function <PascalName>Feature(): ReactElement {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(PAGINATION_DEFAULTS.page);

  const { data, isLoading } = useApiQuery(
    ["<kebab-name>", { page, search }],
    () => client.api["<kebab-name>"].get({ query: { page, limit: PAGINATION_DEFAULTS.limit, search } }),
    { errorMessage: "Failed to load <title case>." },
  );

  const items = data?.items ?? [];
  const totalPages = data?.pagination?.totalPages ?? 1;

  return (
    <Box>
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4"><Title Case Name></Typography>
        {/* [if --crud] <Button variant="contained" onClick={() => setCreateOpen(true)}>New <Singular Title></Button> */}
      </Stack>

      <TextField
        placeholder="Search <title case>..."
        size="small"
        value={search}
        onChange={(e) => { setSearch(e.target.value); setPage(1); }}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon />
            </InputAdornment>
          ),
        }}
        sx={{ mb: 2 }}
      />

      {isLoading ? (
        <CircularProgress />
      ) : items.length === 0 ? (
        <Typography color="text.secondary">No <title case> found.</Typography>
      ) : (
        <>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Created</TableCell>
                <TableCell align="right">Actions</TableCell>
                {/* TODO: Add domain-specific columns */}
              </TableRow>
            </TableHead>
            <TableBody>
              {items.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>{item.name}</TableCell>
                  <TableCell>{new Date(item.createdAt).toLocaleDateString()}</TableCell>
                  <TableCell align="right">
                    {/* TODO: Add action buttons */}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {totalPages > 1 && (
            <Stack alignItems="center" mt={2}>
              <Pagination
                count={totalPages}
                page={page}
                onChange={(_, value) => setPage(value)}
                color="primary"
              />
            </Stack>
          )}
        </>
      )}
    </Box>
  );
}
```

**If `--crud` is set**, also add dialog state at the top and the create dialog import:

```tsx
const [createOpen, setCreateOpen] = useState(false);

// In JSX, add after the closing </Box>:
<Create<PascalName>Dialog open={createOpen} onClose={() => setCreateOpen(false)} />
```

**If `--form` is set** (standalone form page, not --crud), generate:

```tsx
"use client";

import type { ReactElement } from "react";
import { Box, Button, Stack, Typography } from "@mui/material";
import { useForm } from "@tanstack/react-form";
import { z } from "zod/v4";
import { FormTextField } from "@/components/ui/form";
import { useApiMutation } from "@/hooks";
import { client } from "@/lib/api";

const schema = z.object({
  name: z.string().min(1, "Name is required"),
  // TODO: Add fields matching the API schema
});

type FormValues = z.infer<typeof schema>;

export function <PascalName>Feature(): ReactElement {
  const mutation = useApiMutation(
    (data: FormValues) => client.api["<kebab-name>"].post(data),
    { successMessage: "<Singular Title> created.", invalidateKeys: [["<kebab-name>"]] },
  );

  const form = useForm({
    defaultValues: { name: "" } as FormValues,
    validators: { onSubmit: schema },
    onSubmit: async ({ value }) => mutation.mutate(value),
  });

  return (
    <Box maxWidth={480}>
      <Typography variant="h4" gutterBottom>New <Singular Title></Typography>
      <form onSubmit={(e) => { e.preventDefault(); form.handleSubmit(); }}>
        <Stack spacing={2}>
          <form.Field name="name">
            {(field) => <FormTextField field={field} label="Name" required />}
          </form.Field>
          {/* TODO: Add remaining form fields */}
          <Button type="submit" variant="contained" loading={mutation.isPending}>
            Create <Singular Title>
          </Button>
        </Stack>
      </form>
    </Box>
  );
}
```

### 5. Create the create dialog (if `--crud`)

Create `apps/web/src/components/features/<kebab-name>/create-<kebab-name>-dialog.tsx`:

```tsx
"use client";

import type { ReactElement } from "react";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
} from "@mui/material";
import { useForm } from "@tanstack/react-form";
import { z } from "zod/v4";
import { FormTextField } from "@/components/ui/form";
import { useApiMutation } from "@/hooks";
import { client } from "@/lib/api";

interface Create<PascalName>DialogProps {
  open: boolean;
  onClose: () => void;
}

const schema = z.object({
  name: z.string().min(1, "Name is required"),
  // TODO: Add fields
});

type FormValues = z.infer<typeof schema>;

export function Create<PascalName>Dialog(props: Create<PascalName>DialogProps): ReactElement {
  const { open, onClose } = props;

  const mutation = useApiMutation(
    (data: FormValues) => client.api["<kebab-name>"].post(data),
    {
      successMessage: "<Singular Title> created.",
      invalidateKeys: [["<kebab-name>"]],
      onSuccess: onClose,
    },
  );

  const form = useForm({
    defaultValues: { name: "" } as FormValues,
    validators: { onSubmit: schema },
    onSubmit: async ({ value }) => mutation.mutate(value),
  });

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <form onSubmit={(e) => { e.preventDefault(); form.handleSubmit(); }}>
        <DialogTitle>New <Singular Title></DialogTitle>
        <DialogContent>
          <Stack spacing={2} mt={1}>
            <form.Field name="name">
              {(field) => <FormTextField field={field} label="Name" required />}
            </form.Field>
            {/* TODO: Add remaining fields */}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Cancel</Button>
          <Button type="submit" variant="contained" loading={mutation.isPending}>
            Create
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
```

### 6. Create the feature index file

Create `apps/web/src/components/features/<kebab-name>/index.ts`:

```ts
export * from "./<kebab-name>-feature";
// [if --crud] export * from "./create-<kebab-name>-dialog";
```

### 7. Update ROUTES constant (if `--auth`)

Add the new route to `apps/web/src/lib/constants.ts` under the `ROUTES` object:

```ts
<camelName>: "/<route-path>" as Route,
```

### 8. Run typecheck

```bash
cd apps/web && bun run typecheck
```

Fix any errors before reporting. Common issues:
- Wrong import path for `getServerClient` (must come from `@/lib/api-server`)
- MUI component props that changed in v7 (e.g., `loading` prop on Button requires `@mui/lab` or MUI v7+)
- Missing `"use client"` on feature component

### 9. Report

```
Page "<page-name>" scaffolded successfully!

Files created:
  - apps/web/src/app/<route-path>/page.tsx
  - apps/web/src/components/features/<kebab-name>/<kebab-name>-feature.tsx
  [if --crud]  - apps/web/src/components/features/<kebab-name>/create-<kebab-name>-dialog.tsx
  - apps/web/src/components/features/<kebab-name>/index.ts

Files modified:
  [if --auth]  - apps/web/src/lib/constants.ts (added route)

Next steps:
  1. Update the API route key in useApiQuery to match the exact endpoint path
  2. [if --list/--crud] Add columns matching your data model fields
  3. [if --crud] Fill in the form fields in the create dialog
  4. Run: cd apps/web && bun run dev
```

## V2 Changelog (improvements over v1)

- **Fixed server-side client**: v1 used a non-existent `apiServer` export. v2 reads `api-server.ts` first and correctly uses `getServerClient({ auth: true })`.
- **Added `--crud` flag**: Generates a create dialog component alongside the list, wired to a "New X" button. v1 had a TODO comment; v2 scaffolds the full dialog.
- **Added pagination controls**: v1 fetched paginated data but never rendered page navigation. v2 renders MUI `<Pagination>` tied to the `totalPages` from the API response.
- **Resets page on search**: v1 kept the current page when search changed, which could return empty results. v2 resets to page 1 on search input.
- **Uses `PAGINATION_DEFAULTS`**: v1 hardcoded `limit: 10`. v2 imports from `constants.ts` for consistency.
- **Generates ROUTES entry**: v1 left routing up to the developer. v2 adds the route to `constants.ts` automatically.
- **Typecheck step**: v1 skipped verification. v2 runs `bun run typecheck` at the end and lists common failure modes.

## Important notes

- **Never** add `"use client"` to `page.tsx` or `layout.tsx`
- Feature components always have `"use client"` at the top
- Use MUI consolidated barrel imports: `import { Box, Button } from "@mui/material"` — never deep imports
- Use `@/` path alias, never relative `../../` paths
- Import Zod from `zod/v4`, not `zod`
- Destructure props inside the function body, not in function parameters
- Named exports for all components; default export only for Next.js pages (`page.tsx`, `layout.tsx`)
- Never use `useCallback`, `useMemo`, or `memo` — React 19 compiler handles memoization
