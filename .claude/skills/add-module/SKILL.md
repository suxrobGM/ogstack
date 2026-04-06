---
name: add-module
description: "Scaffold a new backend API module with controller, service, schema, test, and optional repository files following OGStack conventions."
argument-hint: "<module-name> [--crud] [--auth] [--admin] [--repo] [--test] [--prisma]"
---

# Add Module

Scaffold a new backend API module under `apps/api/src/modules/` following OGStack's established patterns. Generates production-ready code with proper TypeBox schemas, pagination, auth guards, and Swagger documentation.

## Input

`$ARGUMENTS` should contain the module name (kebab-case, e.g., `billing`, `og-audit`). Optional flags:

- `--crud`: Generate full CRUD endpoints (list with pagination, get, create, update, delete)
- `--auth`: Add auth guard to all endpoints (default: yes, unless `--admin` is set)
- `--admin`: Add admin role guard instead of regular auth guard
- `--repo`: Generate a separate repository file for complex database queries
- `--test`: Generate a service unit test file with mock setup
- `--prisma`: Also create a Prisma schema file for the module's data model

If no module name is provided, ask the user. If the user describes a feature (e.g., "I need a billing module with CRUD"), infer the flags.

## Step-by-step process

### 1. Parse arguments and validate

Extract the module name from `$ARGUMENTS`. Convert to:

- **kebab-case** for directory and file names (e.g., `og-audit`)
- **PascalCase** for class names (e.g., `OgAudit` -> `OgAuditService`, `OgAuditController`)
- **camelCase** for variable names (e.g., `ogAuditService`, `ogAuditController`)

Validate:

- Module name must be lowercase letters, numbers, and hyphens only
- Directory `apps/api/src/modules/<module-name>/` must NOT already exist
- If it exists, ask the user if they want to overwrite or pick a different name

### 2. Read existing modules for reference

Before generating code, read these files to match the exact coding style:

```
apps/api/src/modules/project/project.controller.ts
apps/api/src/modules/project/project.service.ts
apps/api/src/modules/project/project.schema.ts
```

Use these as the source of truth for import paths, formatting, and patterns.

### 3. Create the schema file

Create `apps/api/src/modules/<name>/<name>.schema.ts`.

**Always include** the base response schema with `id`, `createdAt`, `updatedAt`:

```typescript
import { t, type Static } from "elysia";

export const <PascalName>Schema = t.Object({
  id: t.String(),
  // TODO: Add domain-specific fields
  createdAt: t.Date(),
  updatedAt: t.Date(),
});

export type <PascalName> = Static<typeof <PascalName>Schema>;
```

**If `--crud` is set**, also generate these schemas with proper pagination support:

```typescript
import { t, type Static } from "elysia";
import { PaginationQueryBaseSchema } from "@/types/pagination";
import { PaginatedResponseSchema } from "@/types/response";

export const <PascalName>Schema = t.Object({
  id: t.String(),
  // TODO: Add domain-specific fields
  createdAt: t.Date(),
  updatedAt: t.Date(),
});

export const <PascalName>ListQuerySchema = t.Composite([
  PaginationQueryBaseSchema,
  t.Object({
    search: t.Optional(t.String({ description: "Filter by name" })),
  }),
]);

export const Create<PascalName>BodySchema = t.Object({
  name: t.String({ minLength: 1, maxLength: 100 }),
  // TODO: Add required fields
});

export const Update<PascalName>BodySchema = t.Object({
  name: t.Optional(t.String({ minLength: 1, maxLength: 100 })),
  // TODO: Add optional fields
});

export const <PascalName>ListResponseSchema = PaginatedResponseSchema(<PascalName>Schema);

export type <PascalName> = Static<typeof <PascalName>Schema>;
export type <PascalName>ListQuery = Static<typeof <PascalName>ListQuerySchema>;
export type Create<PascalName>Body = Static<typeof Create<PascalName>BodySchema>;
export type Update<PascalName>Body = Static<typeof Update<PascalName>BodySchema>;
```

### 4. Create the service file

Create `apps/api/src/modules/<name>/<name>.service.ts`.

**Base service** (no `--crud`):

```typescript
import { singleton } from "tsyringe";
import { PrismaClient } from "@/generated/prisma";

@singleton()
export class <PascalName>Service {
  constructor(private readonly prisma: PrismaClient) {}
}
```

**If `--crud` is set**, generate a fully functional service with all five methods, following the `project.service.ts` pattern exactly:

- `list(userId, query)` — paginated list with search filter, returns `PaginatedResponse<T>`
- `getById(userId, id)` — single record with ownership check, throws `NotFoundError`
- `create(userId, data)` — create and return response
- `update(userId, id, data)` — ownership check, update, return response
- `delete(userId, id)` — ownership check, delete

Each method must:

- Check ownership (`userId` match) where applicable
- Throw `NotFoundError` from `@/common/errors` when record doesn't exist
- Use a private `toResponse()` method to map Prisma models to API response shape
- Import types from the schema file

**If `--repo` is also set**, inject the repository class instead of `PrismaClient` directly, and move all Prisma queries to the repository file.

### 5. Create the repository file (if `--repo`)

Create `apps/api/src/modules/<name>/<name>.repository.ts`:

```typescript
import { singleton } from "tsyringe";
import { PrismaClient } from "@/generated/prisma";

@singleton()
export class <PascalName>Repository {
  constructor(private readonly prisma: PrismaClient) {}

  // Move Prisma queries here from the service
}
```

### 6. Create the controller file

Create `apps/api/src/modules/<name>/<name>.controller.ts`.

**If `--crud` is set**, generate all five routes with full TypeBox validation and Swagger docs:

```typescript
import { Elysia } from "elysia";
import { container } from "@/common/di";
import { authGuard } from "@/common/middleware/auth-guard";
import { MessageResponseSchema } from "@/types/response";
import {
  <PascalName>Schema,
  <PascalName>ListQuerySchema,
  <PascalName>ListResponseSchema,
  Create<PascalName>BodySchema,
  Update<PascalName>BodySchema,
} from "./<name>.schema";
import { <PascalName>Service } from "./<name>.service";

const <camelName>Service = container.resolve(<PascalName>Service);

export const <camelName>Controller = new Elysia({ prefix: "/<name-plural>", tags: ["<PascalName>"] })
  .use(authGuard)
  .get("/", ({ user, query }) => <camelName>Service.list(user.id, query), {
    query: <PascalName>ListQuerySchema,
    response: <PascalName>ListResponseSchema,
    detail: {
      summary: "List <name-plural>",
      description: "Get a paginated list of <name-plural> for the authenticated user.",
    },
  })
  .get("/:id", ({ user, params }) => <camelName>Service.getById(user.id, params.id), {
    response: <PascalName>Schema,
    detail: {
      summary: "Get <name> by ID",
      description: "Get a single <name> by its ID.",
    },
  })
  .post("/", ({ user, body }) => <camelName>Service.create(user.id, body), {
    body: Create<PascalName>BodySchema,
    response: <PascalName>Schema,
    detail: {
      summary: "Create <name>",
      description: "Create a new <name>.",
    },
  })
  .patch("/:id", ({ user, params, body }) => <camelName>Service.update(user.id, params.id, body), {
    body: Update<PascalName>BodySchema,
    response: <PascalName>Schema,
    detail: {
      summary: "Update <name>",
      description: "Update an existing <name>.",
    },
  })
  .delete("/:id", async ({ user, params }) => {
    await <camelName>Service.delete(user.id, params.id);
    return { message: "<PascalName> deleted successfully" };
  }, {
    response: MessageResponseSchema,
    detail: {
      summary: "Delete <name>",
      description: "Delete a <name> by its ID.",
    },
  });
```

Rules:

- If `--auth` (default): use `authGuard` from `@/common/middleware/auth-guard`
- If `--admin`: use `roleGuard("ADMIN")` from `@/common/middleware/role-guard` instead
- Pluralize the prefix (e.g., `/projects`, `/api-keys`) — use common English pluralization
- Every route must have `detail.summary` and `detail.description`

### 7. Create the test file (if `--test`)

Create `apps/api/src/modules/<name>/<name>.service.test.ts`:

```typescript
import { describe, it, expect, beforeEach, mock } from "bun:test";

// Mock PrismaClient
const mockPrisma = {
  <camelName>: {
    findMany: mock(() => Promise.resolve([])),
    findUnique: mock(() => Promise.resolve(null)),
    count: mock(() => Promise.resolve(0)),
    create: mock(() => Promise.resolve({})),
    update: mock(() => Promise.resolve({})),
    delete: mock(() => Promise.resolve({})),
  },
};

// Reset container and register mock
import { container } from "tsyringe";
import { PrismaClient } from "@/generated/prisma";
container.registerInstance(PrismaClient, mockPrisma as unknown as PrismaClient);

import { <PascalName>Service } from "./<name>.service";

describe("<PascalName>Service", () => {
  let service: <PascalName>Service;

  beforeEach(() => {
    service = container.resolve(<PascalName>Service);
    // Reset all mocks
    Object.values(mockPrisma.<camelName>).forEach((fn) => fn.mockClear());
  });

  // TODO: Add test cases for each service method
  // Example:
  // describe("list", () => {
  //   it("should return paginated results", async () => { ... });
  // });
  //
  // describe("getById", () => {
  //   it("should throw NotFoundError when record does not exist", async () => { ... });
  // });
});
```

### 8. Create the Prisma schema file (if `--prisma`)

Create `apps/api/prisma/schema/<name>.prisma`:

```prisma
model <PascalName> {
  id        String   @id @default(uuid())
  userId    String
  // TODO: Add model fields
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  user User @relation(fields: [userId], references: [id])

  @@map("<name_plural_snake>")
}
```

After creating the file, remind the user to:

1. Add the relation to the `User` model in `user.prisma`
2. Run `bun run db:generate` to regenerate the client
3. Run `bun run db:migrate` to create the migration

### 9. Create the index file

Create `apps/api/src/modules/<name>/index.ts`:

```typescript
export * from "./<name>.controller";
```

### 10. Register in app.ts

Add the import and `.use()` call in `apps/api/src/app.ts`:

- Add import: `import { <camelName>Controller } from "@/modules/<name>";`
- Add `.use(<camelName>Controller)` inside the `/api` group, after existing controllers
- Maintain alphabetical ordering of imports

### 11. Verify

Run a quick typecheck to catch any issues:

```bash
cd apps/api && bun run typecheck
```

If there are errors, fix them before reporting success.

### 12. Report

Print a summary of everything created:

```
Module "<name>" scaffolded successfully!

Files created:
  - apps/api/src/modules/<name>/<name>.schema.ts
  - apps/api/src/modules/<name>/<name>.service.ts
  - apps/api/src/modules/<name>/<name>.controller.ts
  - apps/api/src/modules/<name>/index.ts
  [if --repo]  - apps/api/src/modules/<name>/<name>.repository.ts
  [if --test]  - apps/api/src/modules/<name>/<name>.service.test.ts
  [if --prisma] - apps/api/prisma/schema/<name>.prisma

Files modified:
  - apps/api/src/app.ts (added controller registration)

Next steps:
  1. [if not --prisma] Define your Prisma model in apps/api/prisma/schema/
  2. [if --prisma] Add the relation to the User model, then run:
     bun run db:generate && bun run db:migrate
  3. Fill in the TODO fields in <name>.schema.ts
  4. Implement service methods in <name>.service.ts
  5. [if --test] Add test cases in <name>.service.test.ts
```

## V2 Changelog (improvements over v1)

- **Added `--test` flag**: Generates service test file with mock PrismaClient setup and Bun test scaffolding
- **Added `--repo` flag**: Generates a separate repository file for modules with complex queries
- **Added `--prisma` flag**: Creates a Prisma schema file with proper model conventions (UUID, timestamps, user relation)
- **Added pagination support**: CRUD list endpoints now use `PaginationQueryBaseSchema` and `PaginatedResponseSchema` from shared types
- **Added typecheck verification**: Runs `bun run typecheck` after scaffolding to catch errors immediately
- **Concrete code templates**: Replaced pseudocode placeholders with production-ready code matching existing `project` module patterns
- **Read existing modules first**: Step 2 reads real module files to match exact coding style, preventing drift
- **Smarter argument parsing**: Infers flags from natural language descriptions (e.g., "billing module with CRUD" → `--crud`)
- **Alphabetical import ordering**: Maintains consistent import order in `app.ts`
- **Conflict detection**: Asks user before overwriting existing modules

## Important notes

- Follow existing module patterns exactly — read `project` module as reference before generating
- Use TypeBox (`t.*`) for all schemas, never Zod on the backend
- Services must use `@singleton()` decorator and inject `PrismaClient` (or repository)
- Controllers resolve services via `container.resolve()`
- Use error classes from `@/common/errors/` — never throw raw `Error`
- Add Swagger `detail.summary` and `detail.description` to every route
- Pluralize controller prefixes (e.g., `/billing` -> `/billings`, `/api-key` -> `/api-keys`)
- Keep generated files under 300 LOC — split if needed
- All generated code must pass `bun run typecheck` without errors
