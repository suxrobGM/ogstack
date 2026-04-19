# Architecture

OGStack is a monorepo made up of three apps and a shared package, all running on Bun.

## Repository Layout

```text
apps/api/         Elysia REST API (port 5000)
apps/web/         Next.js dashboard and marketing site (port 5001)
apps/docs/        Nextra documentation site (port 5002)
packages/shared/  Shared TypeScript types and utilities
```

## Tech Stack

| Layer                | Technology                                                    |
| -------------------- | ------------------------------------------------------------- |
| Runtime              | Bun                                                           |
| Backend framework    | Elysia.js                                                     |
| Database             | PostgreSQL + Prisma 7                                         |
| Dependency injection | tsyringe                                                      |
| Web UI               | Next.js 16 + MUI 9 + React Server Components                  |
| Documentation UI     | Nextra 4                                                      |
| Forms                | TanStack Form + Zod                                           |
| Data fetching        | TanStack Query                                                |
| Template rendering   | Satori + @resvg/resvg-js (JSX → SVG → PNG)                    |
| AI image generation  | Flux 2 / Flux 2 Pro                                           |
| AI page analysis     | Multi-provider: DeepSeek, Claude, GPT, Llama_cpp, Ollama      |
| Object storage & CDN | Cloudflare R2 + Cloudflare CDN                                |
| Authentication       | JWT access + refresh tokens, OAuth (GitHub, Google), API keys |
| Payments             | Stripe                                                        |

## Backend Structure

```text
apps/api/src/
├── app.ts              # Elysia bootstrap and controller registration
├── env.ts              # TypeBox-validated environment config
├── common/
│   ├── di/             # tsyringe container
│   ├── errors/         # Typed HTTP error classes
│   ├── middleware/     # Auth guard, role guard, error handler
│   ├── plugins/        # Swagger and CORS plugins
│   ├── services/       # Email, storage, scraper, connection manager
│   ├── utils/          # Password, JWT, logger, date helpers
│   └── database/       # Prisma client singleton
├── modules/            # Feature modules (domain-driven)
├── jobs/               # Background and scheduled tasks
└── types/              # Shared Elysia schemas
```

### Module Pattern

Each module has a three-file core, plus optional extras:

- `{module}.controller.ts` — Elysia route group (thin HTTP layer).
- `{module}.service.ts` — `@singleton()` class with business logic.
- `{module}.schema.ts` — TypeBox request/response schemas.
- `{module}.repository.ts` — Optional, for complex queries.
- `{module}.mapper.ts` — Optional, pure functions that shape Prisma models into API responses.

Services inject `PrismaClient` (or a repository) through the tsyringe container. Controllers resolve services via `container.resolve()`. Errors are thrown as typed `HttpError` subclasses and mapped to consistent JSON responses by global middleware.

## Frontend Structure

```text
apps/web/src/
├── app/              # Next.js App Router
│   ├── (auth)/       # Login, register, password reset
│   ├── (dashboard)/  # Authenticated pages
│   └── layout.tsx    # Root layout with theme provider
├── components/       # Reusable UI components
├── hooks/            # Custom React hooks
├── lib/              # API client, utilities, constants
├── providers/        # Context providers (auth, theme)
└── types/            # Frontend-specific types
```

React Server Components are the default. `"use client"` is added only where state, effects, or browser APIs are required. The MUI component library is used throughout; raw HTML elements are avoided in favour of MUI equivalents.

## Data Flow: OG Image Generation

1. Request arrives at the API — either a public `GET /og/:publicId` (meta-tag flow) or authenticated `POST /images/generate` (programmatic flow).
2. Project is resolved, rate limits and quotas are checked.
3. A cache key is computed from `projectId + url + kind + template + options + aiModel + watermark`.
4. On cache hit, the CDN serves the image in under 100 ms.
5. On cache miss, the target URL is scraped for metadata. With AI enabled, a page analysis runs (cached for 24 hours) to extract theme, brand hints, and content signals.
6. The appropriate renderer runs: Satori for templates, Flux for AI artwork, Sharp for icon resizing.
7. The output is uploaded to Cloudflare R2, warmed on the CDN, and returned to the caller.

## Security Model

- All endpoints sit behind an authentication guard except `/auth/register`, `/auth/login`, OAuth callbacks, and public OG/hero routes.
- Only the project owner can delete the project or manage its API keys.
- Auth endpoints are rate-limited at the application layer (not at nginx).
- URL scraping blocks private IP ranges, localhost, and link-local addresses to prevent SSRF.
- Public project IDs are domain-allowlisted.
- Passwords are hashed with bcrypt; API keys are hashed before storage and never logged in plaintext.
