# Development

This guide covers local setup, running the apps, the database, and testing.

## Prerequisites

- [Bun](https://bun.sh) 1.3 or newer
- [PostgreSQL](https://www.postgresql.org/) 15 or newer (local install or Docker)
- A `.env` file in each app directory (see `.env.example` where available)

## Install

From the repository root:

```bash
bun install
```

This installs dependencies for every workspace.

## Environment Variables

Each app has its own `.env` file. The API needs at least:

```bash
DATABASE_URL=postgresql://user:pass@localhost:5432/ogstack
JWT_SECRET=replace-me-in-production
JWT_EXPIRY=1d
REFRESH_TOKEN_EXPIRY=30d
```

The web app needs:

```bash
NEXT_PUBLIC_API_URL=http://localhost:5000
NEXT_PUBLIC_DOCS_URL=http://localhost:5002
NEXT_PUBLIC_DEMO_PROJECT_ID=
```

Additional OAuth, Stripe, R2, and FAL credentials are required for the corresponding features — see [`apps/api/src/env.ts`](../apps/api/src/env.ts) for the full list.

## Database

All database commands run from `apps/api/`:

```bash
bun run db:generate       # Regenerate the Prisma client after schema changes
bun run db:migrate        # Create a new migration from schema changes
bun run db:migrate:apply  # Apply pending migrations to the target database
```

Schema files live in [`apps/api/prisma/schema/`](../apps/api/prisma/schema/) and use Prisma's multi-file layout.

### Conventions

- UUIDs for every primary key.
- `createdAt` and `updatedAt` on every model.
- `Decimal(12,2)` for prices; `Decimal(14,2)` for balances and totals.
- Soft deletes via `deletedAt DateTime?` where applicable.

## Running the Apps

Each app runs independently. From its own directory:

```bash
# apps/api
bun run dev      # Elysia API on :5000

# apps/web
bun run dev      # Next.js dashboard on :5001

# apps/docs
bun run dev      # Nextra docs on :5002
```

Or run everything at once from the root with your process manager of choice.

## Type Checking

Typecheck every workspace at once from the root:

```bash
bun run typecheck
```

Or run it per app:

```bash
cd apps/api && bun run typecheck
cd apps/web && bun run typecheck
cd apps/docs && bun run typecheck
```

## Testing

### Backend

The API uses Bun's built-in test runner. From `apps/api/`:

```bash
bun test                    # All tests
bun test src/modules/auth   # One folder
bun test path/to/file.test.ts
```

Tests are co-located with their source files (`{module}.service.test.ts`, `{module}.controller.test.ts`). Services are tested with a mocked `PrismaClient`; controllers use Elysia's `.handle()` for integration tests.

### Frontend

The web app uses Vitest + React Testing Library. Tests are co-located as `{component}.test.tsx`.

### Coverage Targets

- Services: 80%+ line coverage
- Controllers: integration test for every endpoint
- Frontend: tests for all form submissions and key user interactions

## Building

```bash
# API (type declarations for the shared client)
cd apps/api && bun run build:types

# Web
cd apps/web && bun run build

# Docs
cd apps/docs && bun run build
```

## Docker

Dockerfiles are provided for each app. A `docker-compose.yml` in the repository root brings the full stack up for end-to-end testing.

## Troubleshooting

- **`Cannot find module '@/generated/prisma'`** — run `bun run db:generate` inside `apps/api/`.
- **Tests fail only in CI, pass locally** — Bun's `mock.module()` is process-global and persists across files. When adding a new test that mocks a shared module, remember to restore it in `afterAll` (see the pattern in [`apps/api/src/test/setup.ts`](../apps/api/src/test/setup.ts)).
