---
name: add-module
description: "Scaffold a new backend API module with controller, service, schema, and optional test files following OGStack conventions."
argument-hint: "<module-name> [--crud] [--auth] [--admin]"
---

# Add Module

Scaffold a new backend API module under `apps/api/src/modules/` following OGStack's established patterns.

## Input

`$ARGUMENTS` should contain the module name (kebab-case, e.g., `billing`, `og-audit`). Optional flags:

- `--crud`: Generate full CRUD endpoints (list, get, create, update, delete)
- `--auth`: Add auth guard to all endpoints (default: yes)
- `--admin`: Add admin role guard instead of regular auth

If no module name is provided, ask the user.

## Step-by-step process

### 1. Parse arguments and validate

Extract the module name from `$ARGUMENTS`. Convert to:

- **kebab-case** for the directory and file names (e.g., `og-audit`)
- **PascalCase** for class names (e.g., `OgAudit` -> `OgAuditService`, `OgAuditController`)
- **camelCase** for variable names (e.g., `ogAuditService`, `ogAuditController`)

Validate:

- Module name must be lowercase letters, numbers, and hyphens only
- Directory `apps/api/src/modules/<module-name>/` must NOT already exist

### 2. Create the schema file

Create `apps/api/src/modules/<name>/<name>.schema.ts`:

```typescript
import { t, type Static } from "elysia";

// Define request/response schemas using TypeBox
export const <PascalName>Schema = t.Object({
  id: t.String(),
  // TODO: Add model fields
  createdAt: t.Date(),
  updatedAt: t.Date(),
});

// Add request body schemas as needed
// export const Create<PascalName>BodySchema = t.Object({ ... });
// export const Update<PascalName>BodySchema = t.Object({ ... });

// Type aliases
export type <PascalName> = Static<typeof <PascalName>Schema>;
```

If `--crud` flag is set, also generate `Create<PascalName>BodySchema` and `Update<PascalName>BodySchema` with placeholder fields.

### 3. Create the service file

Create `apps/api/src/modules/<name>/<name>.service.ts`:

```typescript
import { singleton } from "tsyringe";
import { PrismaClient } from "@/generated/prisma";

@singleton()
export class <PascalName>Service {
  constructor(private readonly prisma: PrismaClient) {}

  // TODO: Add service methods
}
```

If `--crud` is set, generate list, getById, create, update, delete methods with proper error handling using `NotFoundError` from `@/common/errors`.

### 4. Create the controller file

Create `apps/api/src/modules/<name>/<name>.controller.ts`:

```typescript
import { Elysia } from "elysia";
import { container } from "@/common/di";
import { <PascalName>Service } from "./<name>.service";

const <camelName>Service = container.resolve(<PascalName>Service);

export const <camelName>Controller = new Elysia({ prefix: "/<name>", tags: ["<PascalName>"] })
  // TODO: Add routes
```

Rules:

- If `--auth` (default): add `.use(authGuard)` import and usage
- If `--admin`: add `.use(roleGuard("ADMIN"))` instead
- If `--crud`: generate GET `/`, GET `/:id`, POST `/`, PATCH `/:id`, DELETE `/:id` routes

### 5. Create the index file

Create `apps/api/src/modules/<name>/index.ts`:

```typescript
export * from "./<name>.controller";
```

### 6. Register in app.ts

Add the import and `.use()` call in `apps/api/src/app.ts`:

- Add import: `import { <camelName>Controller } from "@/modules/<name>";`
- Add `.use(<camelName>Controller)` inside the `/api` group, after existing controllers

### 7. Report

Print a summary:

```
Created module: <name>
  - apps/api/src/modules/<name>/<name>.schema.ts
  - apps/api/src/modules/<name>/<name>.service.ts
  - apps/api/src/modules/<name>/<name>.controller.ts
  - apps/api/src/modules/<name>/index.ts
  - Updated apps/api/src/app.ts

Next steps:
  1. Define your Prisma model in apps/api/prisma/schema/
  2. Run `bun run db:generate` to regenerate the Prisma client
  3. Fill in the schema fields in <name>.schema.ts
  4. Implement service methods in <name>.service.ts
  5. Wire up controller routes in <name>.controller.ts
```

## Important notes

- Follow existing module patterns exactly — look at `auth` and `project` modules as reference
- Use TypeBox (`t.*`) for all schemas, never Zod on the backend
- Services must use `@singleton()` decorator and inject `PrismaClient`
- Controllers resolve services via `container.resolve()`
- Use error classes from `@/common/errors/` — never throw raw `Error`
- Add Swagger `detail.summary` and `detail.description` to every route
- Do NOT create test files unless the user asks for them
- Do NOT create the Prisma model — that's a separate step
