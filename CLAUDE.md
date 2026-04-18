# OGStack Platform

OGStack is a developer-first **branded image API platform** — Open Graph previews, blog covers, and favicon/app icon sets — with AI that reads your page content. A single meta tag or API call produces contextual, on-brand visuals for any URL.

## Tech Stack

- **Runtime**: Bun - **Backend**: Elysia.js - **DB**: PostgreSQL + Prisma 7 - **DI**: tsyringe
- **Web**: Next.js 16 + MUI 9
- **Docs**: Nextra 4
- **Shared**: `@ogstack/shared` package in `packages/shared/`

## PRD & Design References

- **PRD**: `docs/prd.md` — full product spec, API design, data model, pricing, launch plan

### UI Component Guidelines

- **Component library**: MUI 9 — prefer MUI components over custom HTML elements
- **Data tables**: Custom table components or MUI Table for data display. MUI DataGrid for complex grids with sorting/filtering
- **Forms**: MUI TextField, Select, Checkbox with `tanstack/form` + `zod` for validation.
- **Layout**: MUI Box, Stack, Grid2. App shell uses persistent sidebar + top app bar
- **Typography**: MUI Typography with semantic variants (h1–h6, body1, body2, caption)

### Key User Flows

1. **Registration**: Landing → Register (email/password or OAuth) → Dashboard
2. **Playground**: Dashboard → Paste URL → Select template → Preview OG image → Copy meta tag
3. **OG Generation (GET)**: Add `<meta>` tag with public project ID → CDN serves generated image
4. **OG Generation (POST)**: Server-side call with API key → JSON response with image URL
5. **OG Audit**: Paste URL → Score 0-100 → Platform previews → Fix recommendations

## Layout

```text
apps/api/        → Elysia REST API (port 5000)
apps/web/        → Next.js web app (port 5001)
apps/docs/       → Nextra documentation site (port 5002)
packages/shared/ → Shared types & utils
```

## Commands

```bash
# Backend (cd apps/api)
bun run dev / start / typecheck
bun test
bun run db:generate / db:migrate / db:migrate:apply
bun run build:types

# Web (cd apps/web)
bun run dev / build / start

# Docs (cd apps/docs)
bun run dev / build / start

# Root
bun run typecheck   # all workspaces
```

## Scrum & Workflow

### Branch Naming

Format: `<type>/<issue-number>-<short-description>`

Types: `feat/`, `fix/`, `chore/`, `docs/`, `refactor/`, `test/`

Examples: `feat/4-email-auth`, `fix/12-jwt-expiry`, `chore/2-ci-pipeline`

### Commit Messages

Conventional Commits format:

```text
<type>(scope): <description>

Refs #<issue-number>
```

Types: `feat`, `fix`, `chore`, `docs`, `refactor`, `test`, `ci`

Scopes: `api`, `web`, `shared`, `db`, `ci`

Examples:

- `feat(api): add email/password registration endpoint`
- `fix(web): correct template preview rendering`
- `chore(ci): add type-check step to GitHub Actions`

### Pull Request Workflow

1. Create branch from `main` using the naming convention above
2. Commit with `Refs #N` referencing the issue number
3. Open PR with title matching commit convention, body with `## Summary`, `## Test plan`, and `Closes #N`
4. PR must pass CI checks (lint, typecheck, test, build) before merge
5. Use squash merge to keep main history clean

### Issue Board Workflow

- **Backlog** → Issue created, not planned for current sprint
- **Ready** → Planned for current sprint, ready to pick up
- **In Progress** → Branch created, work started
- **In Review** → PR open, awaiting review
- **Done** → PR merged, issue closed

## Comments

- Don't add inline comments that restate what the code already says. Only comment to explain **why**, not **what**. If the code needs a comment to explain what it does, rename the variable or extract a function instead.
- Add brief JSDoc (`/** ... */`) for public functions or complex logic, but avoid over-commenting. The code should be as self-explanatory as possible.
- For multiline comments use this style:

```ts
/**
 * This function does X, Y, and Z. It takes A and B as parameters and returns C.
 * The reason we do this is because of D and E.
 */
function example(a: TypeA, b: TypeB): TypeC {...}
```

- Don't use this style:

```ts
/** This function does X, Y, and Z. It takes A and B as parameters and returns C.
 *  The reason we do this is because of D and E. */
function example(a: TypeA, b: TypeB): TypeC {...}
```

## File Size Guideline

Aim for ~300–350 LOC per file as a soft ceiling. If a service or controller grows past this, look for extraction opportunities (repository, helper, or splitting the module). Schema and repository files are naturally shorter.

---

## Frontend Architecture

### Folder Structure (apps/web/)

```text
src/
├── app/                 # Next.js App Router pages
│   ├── (auth)/          # Auth pages (login, register, reset-password)
│   ├── (dashboard)/     # Authenticated pages (projects, playground, settings)
│   └── layout.tsx       # Root layout with theme provider
├── components/          # Reusable UI components
│   ├── ui/              # Generic components (buttons, modals, forms)
│   └── features/        # Feature-specific components
├── hooks/               # Custom React hooks
├── lib/                 # API client, utils, constants
├── providers/           # React context providers (auth, theme)
└── types/               # Frontend-specific TypeScript types
```

### Frontend Conventions

- Use React Server Components by default; add `"use client"` only when needed (state, effects, browser APIs)
- API calls go through a centralized API client in `lib/api.ts`
- Auth state managed via React context with JWT stored in httpOnly cookie
- Use `tanstack/react-query` for data fetching, caching, and mutations.
- Use `tanstack/form` + `zod` for form state management and validation.
- Page components are thin — delegate to feature components

---

## Backend Architecture

## Folder Structure

```text
src/
├── app.ts              # Elysia bootstrap, plugin + controller registration
├── env.ts              # Environment config with TypeBox validation
├── common/
│   ├── di/             # tsyringe container — registers PrismaClient as instance
│   ├── errors/         # HttpError classes (400, 401, 403, 404, 409)
│   ├── middleware/      # auth guard, role guard, global error handler
│   ├── plugins/        # swagger + cors Elysia plugins
│   ├── utils/          # password, logger, date helpers
│   ├── services/       # email service, connection manager
│   └── database/       # Prisma client singleton with pg adapter
├── modules/            # Feature modules (domain-driven)
├── jobs/               # Background/scheduled tasks
├── types/              # Shared Elysia schemas (pagination, request, response)
└── constants/
```

## DI Pattern

- Services: `@singleton` or `@injectable()` class, constructor-injects `PrismaClient` (or a repository)
- Repositories: `@singleton()` class with pure Prisma queries
- Controllers: resolve service via `container.resolve(ServiceClass)`
- PrismaClient registered in `common/di/container.ts` via `container.registerInstance()`

## Auth

- **Auth guard**: Elysia `derive({ as: "scoped" })` — verifies JWT and injects typed `user` into context. Only applies to modules that `.use(authGuard)`.
- **Role guard**: chains auth guard and checks `user.role`. Usage: `.use(roleGuard("ADMIN"))`.

## Error Handling

Throw from services: `NotFoundError`, `BadRequestError`, `UnauthorizedError`, `ForbiddenError`, `ConflictError`. Global error middleware maps them to HTTP responses.

---

## Database Conventions

Applies when modifying Prisma schema files or writing database queries.

## Schema

- **ORM**: Prisma 7 with PostgreSQL driver adapter (`@prisma/adapter-pg`)
- **Schema location**: `apps/api/prisma/schema/` (multi-file via `prismaSchemaFolder`)

## Model Rules

- **IDs**: UUID for all primary keys
- **Money**: `Decimal(12,2)` for prices, `Decimal(14,2)` for balances/totals
- **Soft deletes**: `deletedAt DateTime?` on User model
- **Timestamps**: every model must have `createdAt DateTime @default(now())` and `updatedAt DateTime @updatedAt`

## Workflow

```bash
bun run db:generate       # After schema edits — regenerate client
bun run db:migrate        # Create migration file
bun run db:migrate:apply  # Apply pending migrations
```

---

## File Pattern

Each module uses a 3-file core with optional extras:

- `{module}.controller.ts` — Elysia route group (thin HTTP layer), resolves service via `container.resolve()`
- `{module}.service.ts` — `@singleton()` or `@injectable()` class with business logic, injects `PrismaClient` for simple queries
- `{module}.schema.ts` — Elysia `t.*` (TypeBox) request/response schemas, type aliases grouped at end of file

### Optional Files

- `{module}.repository.ts` — Only when the module has dynamic WHERE clauses, raw SQL, or multi-table upserts. Skip for simple `findUnique`/`create`/`update`/`delete`.
- `{module}.mapper.ts` — Pure exported functions (not class methods) that convert Prisma models to API response shapes. Extract when the service has 3+ mapping functions.

## Registration

Every module exports an Elysia plugin. Register it in `src/app.ts`:

```ts
import { authController } from "./modules/auth";

app.use(authController);
```

---

## Do's and Don'ts

### Do

- Use `@singleton()` or `@injectable()` on all service and repository classes
- Use `container.resolve()` in controllers to get service instances
- Use TypeBox (`t.*`) schemas for all request/response validation in Elysia
- Use error classes from `common/errors/` — never throw raw `Error`
- Use UUID for all primary keys
- Add `createdAt` and `updatedAt` to every Prisma model
- Hash passwords with bcrypt, never store plaintext
- Hash API keys before storage — never store raw keys in the database
- Keep controllers thin — business logic belongs in services
- Use MUI components for all UI elements in the web app
- Use `next/link` for navigation, `next/image` for images
- Validate user input on both client and server
- Return consistent API response shapes using shared types from `packages/shared/`

### Don't

- Don't install packages without checking if MUI or existing deps already solve the problem
- Don't use `any` — use `unknown` and narrow, or define proper interfaces
- Don't store secrets (API keys, passwords, encryption keys) in code or git
- Don't skip error handling — every service method should handle failure cases
- Don't use `console.log` in production code — use the logger utility from `common/utils/`
- Don't write raw SQL unless the query is too complex for Prisma's query builder
- Don't exceed ~350 LOC per file — extract to separate modules
- Don't use `var` — always `const`, use `let` only when mutation is needed
- Don't commit `.env` files or any file containing real secrets

### Security Rules

- All API endpoints behind auth guard except `/auth/register`, `/auth/login`, `/auth/refresh`
- Only project owner can delete project or manage API keys
- Rate-limit auth endpoints (login, register, password reset)
- SSRF protection on URL scraping — block private IP ranges, localhost, link-local addresses
- Domain allowlisting on public project IDs to prevent abuse
- Never log raw API keys or decrypted secrets
- Validate and sanitize all user-provided URLs before fetching

---

## Testing Strategy

### Backend

- **Framework**: Bun's built-in test runner (`bun test`)
- **Unit tests**: Test service methods with mocked PrismaClient
- **Integration tests**: Test API endpoints using Elysia's `.handle()` method
- **Location**: Co-locate next to source — `{module}.service.test.ts`, `{module}.controller.test.ts`
- **Naming**: `describe("ServiceName")` → `describe("methodName")` → `it("should ...")`

### Frontend

- **Framework**: Vitest + React Testing Library
- **Unit tests**: Utility functions and custom hooks
- **Component tests**: User interactions and rendered output
- **Location**: Co-locate as `{component}.test.tsx`

### Coverage Goals

- Services: 80%+ line coverage
- Controllers: integration test for each endpoint
- Frontend: test all form submissions and key user interactions

### What to Test

- Service business logic (validation, transformation, error cases)
- API endpoint request/response contracts
- URL metadata extraction (valid input, malformed HTML, edge cases)
- Template rendering pipeline
- Auth flows (registration, login, token validation, role checks)

### What NOT to Test

- Prisma queries directly (test through service layer)
- MUI component internals
- Third-party library behavior
- Trivial getters/setters
