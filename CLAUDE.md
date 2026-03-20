# OGStack — Agent Context

## What This Project Is

OGStack is a developer-first SaaS API that auto-generates branded 1200×630 Open Graph images for
any URL. Developers add one `<meta>` tag; every shared link instantly gets a professional social
preview. No Figma, no manual work.

**Tagline:** "Beautiful social previews. Zero effort."
**Due:** April 20 (graded project — see rubric constraints below)

---# OGStack — Agent Context

## What This Project Is
OGStack is a developer-first SaaS API that auto-generates branded 1200×630 Open Graph images for
any URL. Developers add one `<meta>` tag; every shared link instantly gets a professional social
preview. No Figma, no manual work.

**Tagline:** "Beautiful social previews. Zero effort."
**Due:** April 20 (graded project — see rubric constraints below)

---

## Monorepo Structure
```
ogstack/
├── apps/
│   ├── web/          # Next.js 15 (App Router) — dashboard, playground, landing
│   └── api/          # Fastify + Bun — all backend services
├── packages/
│   ├── shared/       # Shared TypeScript types + Prisma client (import this first)
│   ├── scraper/      # Playwright page scraper → ScrapedPageContext
│   ├── ai-pipeline/  # Prompt builder + Claude/OpenAI calls → GenerationPrompt
│   ├── compositor/   # Satori JSX→SVG→PNG renderer → Buffer
│   ├── cache/        # Redis + Cloudflare R2 upload
│   ├── brand/        # Brand config CRUD + resolver middleware
│   ├── audit/        # Site crawler + OG tag validator + bulk regen queue
│   └── evals/        # LLM-as-judge + multi-dimensional scoring + metrics
├── infra/
│   └── docker/       # docker-compose.yml (Postgres 16, Redis 7)
├── .github/
│   └── workflows/    # CI/CD pipelines
└── docs/             # Architecture docs, API docs, parallel-agent logs
```

---

## Tech Stack
| Layer | Technology |
|---|---|
| API server | Fastify (Bun runtime) |
| Frontend | Next.js 15 App Router + Tailwind CSS |
| Database | PostgreSQL 16 + Prisma ORM |
| Cache | Redis (Upstash in prod) |
| Image storage | Cloudflare R2 |
| AI generation | Flux Schnell via FAL.ai (primary), Replicate (fallback) |
| AI prompt/eval | Claude Haiku (prompts), Claude Sonnet (evals/judge) |
| Image rendering | Satori + @resvg/resvg-js (JSX → SVG → PNG) |
| Auth | NextAuth.js (dashboard), API keys (programmatic) |
| Payments | Stripe |
| Package manager | pnpm + Turborepo |
| Language | TypeScript strict mode everywhere |

---

## Key Commands
```bash
pnpm dev              # Start all apps and packages in watch mode (Turborepo)
pnpm build            # Build all packages in dependency order
pnpm test             # Run Vitest across all packages
pnpm lint             # ESLint across workspace

# Docker (local infra)
docker compose -f infra/docker/docker-compose.yml up -d   # Start Postgres + Redis
docker compose -f infra/docker/docker-compose.yml down    # Stop

# Database
pnpm --filter shared prisma migrate dev    # Apply migrations
pnpm --filter shared prisma generate       # Regenerate Prisma client
pnpm --filter shared prisma studio         # Open Prisma Studio
```

---

## Core Data Contracts (packages/shared/src/types.ts)
These are the typed interfaces between all packages. Never break them without updating all consumers.

- `ScrapedPageContext` — output of packages/scraper
- `GenerationPrompt` — output of packages/ai-pipeline
- `BrandConfig` — resolved brand settings for a workspace
- `GenerationRequest` / `GenerationResult` — API request/response
- `OGAuditResult` — per-URL audit outcome
- `EvalScore` — multi-dimensional image quality score (legibility, brand, accuracy, layout)
- `JudgeVerdict` — LLM-as-judge structured output (score + rationale JSON)

**Always import types from `@ogstack/shared`, never redefine them locally.**

---

## API Endpoints (apps/api)
```
GET  /p/:projectId/generate?url=...    Public, no auth — meta tag integration
POST /v1/generate                      Auth: Bearer API key — programmatic
DELETE /v1/cache?url=...               Auth: Bearer API key — cache purge
GET  /v1/usage?period=...             Auth: Bearer API key — usage stats
POST /v1/audit                         Public — OG audit for a URL
```

All inputs validated with Zod. All errors return `{ error: string, code: string }`.

---

## Security Rules (OWASP — never skip these)
- **SSRF**: ALL user-supplied URLs must pass `validateUrl()` from packages/shared before fetch.
  Block: 127.x, 10.x, 172.16-31.x, 192.168.x, 169.254.x (AWS metadata), file://, ftp://
- **Secrets**: Never hardcode. Read from `process.env`. Never commit `.env` files.
- **API keys**: Stored as bcrypt hashes in DB. Shown to user only once on creation.
- **SQL injection**: Use Prisma parameterized queries only. No raw SQL with user input.
- **Input validation**: Every route uses a Zod schema. Reject unknown fields.
- **Auth**: Every non-public route must call `requireAuth()` middleware first.
- **Rate limiting**: Every endpoint has a rate limiter. Public endpoints: 10 req/min.

---

## Parallel Agent Feature Builds (Rubric Requirement)
This project uses parallel agents as a BUILD methodology (not just runtime calls).
Each feature was built by spawning multiple agents simultaneously in Antigravity Manager View.

**Feature 1 — AI Image Generation Pipeline**
- Agent A: packages/scraper (ScrapedPageContext output)
- Agent B: packages/ai-pipeline (prompt builder + AI call)
- Agent C: packages/compositor (Satori renderer)
- Agent D: packages/cache (Redis + R2)

**Feature 2 — Brand Configuration System**
- Agent A: Brand config REST API (CRUD + Zod)
- Agent B: Brand dashboard UI (/dashboard/brand)
- Agent C: Brand resolver middleware

**Feature 3 — OG Audit Engine**
- Agent A: Site crawler (sitemap.xml + link crawler)
- Agent B: OG tag validator (dimensions, status, existence)
- Agent C: Audit dashboard UI (/dashboard/audit)
- Agent D: Bulk regen queue (BullMQ)

**Feature 4 — Eval System + LLM-as-Judge**
- Agent A: Multi-dimensional eval pipeline (4 scoring dimensions)
- Agent B: Claude LLM-as-judge (structured JSON verdict)
- Agent C: Historical metrics dashboard (/dashboard/evals)

Log all agent sessions to docs/parallel-agents/ — these are graded.

---

## Coding Conventions
- All files: TypeScript strict. No `any`. No `ts-ignore` without a comment explaining why.
- Async: `async/await` only. No raw `.then()` chains.
- Errors: Always throw typed errors. Never swallow with empty `catch {}`.
- Tests: Vitest. Every package in packages/ needs at least one test file.
- Commits: Conventional commits (`feat:`, `fix:`, `chore:`, `test:`, `docs:`).
- PRs: No direct pushes to `main`. Every change goes through a PR with 1 approval.
- Logging: Use Pino structured logger. `logger.info({ url, ms }, 'generated image')` style.

---

## Environment Variables (never commit actual values)
```
DATABASE_URL          PostgreSQL connection string
REDIS_URL             Redis connection string
ANTHROPIC_API_KEY     Claude API key (evals + prompt generation)
FAL_API_KEY           Flux image generation (FAL.ai)
CLOUDFLARE_R2_BUCKET  R2 bucket name
CLOUDFLARE_R2_KEY     R2 access key
CLOUDFLARE_R2_SECRET  R2 secret key
JWT_SECRET            NextAuth.js secret
STRIPE_SECRET_KEY     Stripe API key
STRIPE_WEBHOOK_SECRET Stripe webhook signing secret
```

---

## Sprint Plan (Due April 20)
- **Sprint 1** (Mar 20–30): Monorepo setup + Feature 1 (AI generation pipeline, 4 parallel agents)
- **Sprint 2** (Mar 31–Apr 10): Feature 2 (Brand), Feature 3 (Audit), CI/CD pipeline
- **Sprint 3** (Apr 11–18): Feature 4 (Evals), monitoring, polish, all docs

**Buffer:** Apr 18–20 for final testing and presentation prep.

## Monorepo Structure

```
ogstack/
├── apps/
│   ├── web/          # Next.js 15 (App Router) — dashboard, playground, landing
│   └── api/          # Fastify + Bun — all backend services
├── packages/
│   ├── shared/       # Shared TypeScript types + Prisma client (import this first)
│   ├── scraper/      # Playwright page scraper → ScrapedPageContext
│   ├── ai-pipeline/  # Prompt builder + Claude/OpenAI calls → GenerationPrompt
│   ├── compositor/   # Satori JSX→SVG→PNG renderer → Buffer
│   ├── cache/        # Redis + Cloudflare R2 upload
│   ├── brand/        # Brand config CRUD + resolver middleware
│   ├── audit/        # Site crawler + OG tag validator + bulk regen queue
│   └── evals/        # LLM-as-judge + multi-dimensional scoring + metrics
├── infra/
│   └── docker/       # docker-compose.yml (Postgres 16, Redis 7)
├── .github/
│   └── workflows/    # CI/CD pipelines
└── docs/             # Architecture docs, API docs, parallel-agent logs
```

---

## Tech Stack

| Layer           | Technology                                              |
| --------------- | ------------------------------------------------------- |
| API server      | Fastify (Bun runtime)                                   |
| Frontend        | Next.js 15 App Router + Tailwind CSS                    |
| Database        | PostgreSQL 16 + Prisma ORM                              |
| Cache           | Redis (Upstash in prod)                                 |
| Image storage   | Cloudflare R2                                           |
| AI generation   | Flux Schnell via FAL.ai (primary), Replicate (fallback) |
| AI prompt/eval  | Claude Haiku (prompts), Claude Sonnet (evals/judge)     |
| Image rendering | Satori + @resvg/resvg-js (JSX → SVG → PNG)              |
| Auth            | NextAuth.js (dashboard), API keys (programmatic)        |
| Payments        | Stripe                                                  |
| Package manager | pnpm + Turborepo                                        |
| Language        | TypeScript strict mode everywhere                       |

---

## Key Commands

```bash
pnpm dev              # Start all apps and packages in watch mode (Turborepo)
pnpm build            # Build all packages in dependency order
pnpm test             # Run Vitest across all packages
pnpm lint             # ESLint across workspace

# Docker (local infra)
docker compose -f infra/docker/docker-compose.yml up -d   # Start Postgres + Redis
docker compose -f infra/docker/docker-compose.yml down    # Stop

# Database
pnpm --filter shared prisma migrate dev    # Apply migrations
pnpm --filter shared prisma generate       # Regenerate Prisma client
pnpm --filter shared prisma studio         # Open Prisma Studio
```

---

## Core Data Contracts (packages/shared/src/types.ts)

These are the typed interfaces between all packages. Never break them without updating all consumers.

- `ScrapedPageContext` — output of packages/scraper
- `GenerationPrompt` — output of packages/ai-pipeline
- `BrandConfig` — resolved brand settings for a workspace
- `GenerationRequest` / `GenerationResult` — API request/response
- `OGAuditResult` — per-URL audit outcome
- `EvalScore` — multi-dimensional image quality score (legibility, brand, accuracy, layout)
- `JudgeVerdict` — LLM-as-judge structured output (score + rationale JSON)

**Always import types from `@ogstack/shared`, never redefine them locally.**

---

## API Endpoints (apps/api)

```
GET  /p/:projectId/generate?url=...    Public, no auth — meta tag integration
POST /v1/generate                      Auth: Bearer API key — programmatic
DELETE /v1/cache?url=...               Auth: Bearer API key — cache purge
GET  /v1/usage?period=...             Auth: Bearer API key — usage stats
POST /v1/audit                         Public — OG audit for a URL
```

All inputs validated with Zod. All errors return `{ error: string, code: string }`.

---

## Security Rules (OWASP — never skip these)

- **SSRF**: ALL user-supplied URLs must pass `validateUrl()` from packages/shared before fetch.
  Block: 127.x, 10.x, 172.16-31.x, 192.168.x, 169.254.x (AWS metadata), file://, ftp://
- **Secrets**: Never hardcode. Read from `process.env`. Never commit `.env` files.
- **API keys**: Stored as bcrypt hashes in DB. Shown to user only once on creation.
- **SQL injection**: Use Prisma parameterized queries only. No raw SQL with user input.
- **Input validation**: Every route uses a Zod schema. Reject unknown fields.
- **Auth**: Every non-public route must call `requireAuth()` middleware first.
- **Rate limiting**: Every endpoint has a rate limiter. Public endpoints: 10 req/min.

---

## Parallel Agent Feature Builds (Rubric Requirement)

This project uses parallel agents as a BUILD methodology (not just runtime calls).
Each feature was built by spawning multiple agents simultaneously in Antigravity Manager View.

**Feature 1 — AI Image Generation Pipeline**

- Agent A: packages/scraper (ScrapedPageContext output)
- Agent B: packages/ai-pipeline (prompt builder + AI call)
- Agent C: packages/compositor (Satori renderer)
- Agent D: packages/cache (Redis + R2)

**Feature 2 — Brand Configuration System**

- Agent A: Brand config REST API (CRUD + Zod)
- Agent B: Brand dashboard UI (/dashboard/brand)
- Agent C: Brand resolver middleware

**Feature 3 — OG Audit Engine**

- Agent A: Site crawler (sitemap.xml + link crawler)
- Agent B: OG tag validator (dimensions, status, existence)
- Agent C: Audit dashboard UI (/dashboard/audit)
- Agent D: Bulk regen queue (BullMQ)

**Feature 4 — Eval System + LLM-as-Judge**

- Agent A: Multi-dimensional eval pipeline (4 scoring dimensions)
- Agent B: Claude LLM-as-judge (structured JSON verdict)
- Agent C: Historical metrics dashboard (/dashboard/evals)

Log all agent sessions to docs/parallel-agents/ — these are graded.

---

## Coding Conventions

- All files: TypeScript strict. No `any`. No `ts-ignore` without a comment explaining why.
- Async: `async/await` only. No raw `.then()` chains.
- Errors: Always throw typed errors. Never swallow with empty `catch {}`.
- Tests: Vitest. Every package in packages/ needs at least one test file.
- Commits: Conventional commits (`feat:`, `fix:`, `chore:`, `test:`, `docs:`).
- PRs: No direct pushes to `main`. Every change goes through a PR with 1 approval.
- Logging: Use Pino structured logger. `logger.info({ url, ms }, 'generated image')` style.

---

## Environment Variables (never commit actual values)

```
DATABASE_URL          PostgreSQL connection string
REDIS_URL             Redis connection string
ANTHROPIC_API_KEY     Claude API key (evals + prompt generation)
FAL_API_KEY           Flux image generation (FAL.ai)
CLOUDFLARE_R2_BUCKET  R2 bucket name
CLOUDFLARE_R2_KEY     R2 access key
CLOUDFLARE_R2_SECRET  R2 secret key
JWT_SECRET            NextAuth.js secret
STRIPE_SECRET_KEY     Stripe API key
STRIPE_WEBHOOK_SECRET Stripe webhook signing secret
```

---

## Sprint Plan (Due April 20)

- **Sprint 1** (Mar 20–30): Monorepo setup + Feature 1 (AI generation pipeline, 4 parallel agents)
- **Sprint 2** (Mar 31–Apr 10): Feature 2 (Brand), Feature 3 (Audit), CI/CD pipeline
- **Sprint 3** (Apr 11–18): Feature 4 (Evals), monitoring, polish, all docs

**Buffer:** Apr 18–20 for final testing and presentation prep.
