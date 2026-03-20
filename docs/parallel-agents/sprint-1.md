# Sprint 1 — Parallel Agent Session Log

**Date:** 2026-03-20
**Sprint:** 1 (Mar 20–30) — Monorepo scaffold + AI generation pipeline
**Execution environment:** Antigravity Manager View (parallel agent execution)
**Agents spawned:** 4 simultaneous agents

---

## Overview

The monorepo scaffold and all Sprint 1 packages were built by spawning 4 agents in parallel inside Antigravity Manager View. Each agent owned a distinct vertical slice of the codebase with no file overlap, allowing all work to proceed simultaneously without merge conflicts.

---

## Agent Assignments

### Agent A — Root config + infrastructure
**Scope:** Monorepo tooling and local dev infrastructure

Produced:
- `package.json` — pnpm workspace root with Turborepo scripts (`dev`, `build`, `test`, `lint`)
- `pnpm-workspace.yaml` — workspace globs for `apps/*` and `packages/*`
- `turbo.json` — pipeline config with `build`, `dev`, `lint`, `test`, `typecheck` tasks
- `tsconfig.base.json` — strict TypeScript base config shared across all packages
- `infra/docker/docker-compose.yml` — Postgres 16 + Redis 7 containers with named volumes
- `.env.example` — all required environment variable keys with placeholder values
- `.github/workflows/` — CI pipeline (lint, typecheck, test on push/PR)

### Agent B — packages/scraper, packages/ai-pipeline, packages/compositor, packages/cache
**Scope:** The full AI image generation pipeline (Feature 1, 4 packages)

Produced:
- **packages/scraper** (`src/scraper.ts`, `src/index.ts`) — Playwright-based page scraper; launches headless Chromium, extracts title, description, headings, body text, existing OG tags, and favicon URL; outputs `ScrapedPageContext`; SSRF protection via `validateUrl()` from `@ogstack/shared`
- **packages/ai-pipeline** (`src/prompt-builder.ts`, `src/ai-client.ts`, `src/index.ts`) — Builds a `GenerationPrompt` from scraped context using Claude Haiku; calls Flux Schnell via FAL.ai `fal.subscribe()` to generate the background image; returns `FluxImageResult`
- **packages/compositor** (`src/renderer.ts`, `src/index.ts`) — React + Satori JSX-to-SVG renderer; `OGImageTemplate` component lays out title, subtitle, and brand colors at 1200×630; converts SVG to PNG buffer via `@resvg/resvg-js`
- **packages/cache** (`src/redis.ts`, `src/r2.ts`, `src/index.ts`) — Redis (ioredis) for URL-keyed cache get/set/delete with 24h TTL; Cloudflare R2 via `@aws-sdk/client-s3` for PNG upload, delete, and presigned URL generation

All packages include:
- `package.json` with `@ogstack/shared: workspace:*` dependency
- `tsconfig.json` extending `tsconfig.base.json`
- `src/index.ts` exporting the public API
- `vitest.config.ts` + at least one test file

### Agent C — packages/brand, packages/audit, packages/evals
**Scope:** Brand config, OG audit engine, and eval/judge system (Features 2–4 stubs)

Produced:
- **packages/brand** — Brand config CRUD types and resolver middleware; `BrandConfig` type consumed from `@ogstack/shared`; middleware resolves brand by `workspaceId` and attaches to request context
- **packages/audit** — Site crawler (sitemap.xml + recursive link crawl), OG tag validator (checks existence, dimensions, HTTP status), and `OGAuditResult` output type
- **packages/evals** — Multi-dimensional eval pipeline (legibility, brand accuracy, layout, content relevance); Claude Sonnet LLM-as-judge returns `JudgeVerdict` with score + rationale JSON; `EvalScore` type consumed from `@ogstack/shared`

### Agent D — apps/api, apps/web
**Scope:** Fastify API server and Next.js dashboard/landing

Produced:
- **apps/api** (`src/index.ts`, `src/routes/`, `src/middleware/`) — Fastify server on Bun runtime; all 5 endpoints wired (`GET /p/:projectId/generate`, `POST /v1/generate`, `DELETE /v1/cache`, `GET /v1/usage`, `POST /v1/audit`); `requireAuth()` middleware with bcrypt API key verification; Zod input validation on every route; `@fastify/rate-limit` with 10 req/min on public endpoints; Pino structured logging
- **apps/web** (`src/app/`) — Next.js 15 App Router; landing page (`/`) with hero, code snippet, feature grid; dashboard shell (`/dashboard/layout.tsx`) with sidebar nav; stub pages for `/dashboard`, `/dashboard/brand`, `/dashboard/audit`, `/dashboard/evals`; Tailwind CSS with brand color tokens

---

## Post-Build Errors and Fixes

After all agents completed, `pnpm build --concurrency=15` was run. The following errors surfaced and were resolved in a single fix pass:

### 1. `packages/scraper` — `HTMLMetaElement` / `HTMLLinkElement` not in scope
**Error:** TypeScript could not resolve `HTMLMetaElement` and `HTMLLinkElement` inside `$eval` / `$$eval` callbacks — the project tsconfig does not include `lib: ["dom"]` since it targets Node.js/Bun.

**Fix:** Cast all DOM element references to `any` inside the Playwright browser-context callbacks. Added `// eslint-disable-next-line @typescript-eslint/no-explicit-any` comments to document the intentional cast (callbacks run in the browser, not in Node).

### 2. `packages/ai-pipeline` — `fal.config` / `fal.subscribe` not on namespace import
**Error:** `import * as fal from '@fal-ai/client'` was used, but @fal-ai/client v1.x exports a named `fal` object — the namespace import does not expose `.config()` or `.subscribe()`.

**Fix:** Changed import to `import { fal } from '@fal-ai/client'` to use the named export directly.

### 3. `packages/compositor` — `exactOptionalPropertyTypes` violation on `backgroundImageUrl`
**Error:** `tsconfig.base.json` enables `exactOptionalPropertyTypes: true`. Passing `backgroundImageUrl: string | undefined` to a prop typed `backgroundImageUrl?: string` is disallowed under this flag — optional means the key may be absent, not that it may be `undefined`.

**Fix:** Changed the `createElement` call to use a conditional spread:
```ts
...(backgroundImageUrl !== undefined ? { backgroundImageUrl } : {})
```
This ensures the key is omitted entirely when there is no value.

### 4. `packages/cache` — ioredis namespace vs. class import
**Error:** `import Redis from 'ioredis'` in a project using `"type": "module"` resolved to the ioredis module namespace, not the `Redis` class. TypeScript reported: *Cannot use namespace 'Redis' as a type* and *has no construct signatures*.

**Fix:** Changed to named import `import { Redis } from 'ioredis'`, which correctly resolves to the `Redis` class.

### 5. `packages/cache` — `@aws-sdk/s3-request-presigner` not installed
**Error:** `r2.ts` imports `getSignedUrl` from `@aws-sdk/s3-request-presigner`, but that package was absent from `packages/cache/package.json`.

**Fix:** Ran `pnpm --filter cache add @aws-sdk/s3-request-presigner` to install the package.

### 6. `apps/api` — `bcryptjs` missing from dependencies
**Error:** `src/middleware/auth.ts` imports `bcryptjs` for API key verification, but the package was not listed in `apps/api/package.json`.

**Fix:** Ran `pnpm --filter api add bcryptjs` and `pnpm --filter api add -D @types/bcryptjs`.

### 7. `apps/api` — `bun build` trying to bundle Playwright internals
**Error:** `bun build src/index.ts --outdir dist --target bun` attempted to statically bundle all transitive dependencies, including Playwright's optional native modules (`chromium-bidi`, `electron`), which are not installed and should not be bundled.

**Fix:** Added `--packages external` to the bun build command so all node_modules are treated as runtime externals (correct for a server-side Bun application).

### 8. `apps/web` — `typedRoutes` API move + `/docs` route not found
**Errors:**
- Next.js 15 warned that `experimental.typedRoutes` has been moved to top-level `typedRoutes`.
- `typedRoutes` validation rejected `href="/docs"` in `page.tsx` because the `/docs` route does not yet exist in the app router.
- `href={item.href}` in `dashboard/layout.tsx` was inferred as `string` rather than a literal type union.

**Fixes:**
- Moved `typedRoutes: true` out of the `experimental` block in `next.config.ts`.
- Added `import type { Route } from 'next'` to `page.tsx` and cast both `/docs` links to `href={"/docs" as Route}`.
- Added `as const` to the `navItems` array in `dashboard/layout.tsx` so TypeScript infers the literal route types `/dashboard`, `/dashboard/brand`, etc.

---

## Final Build Result

```
Tasks:    10 successful, 10 total
Cached:    9 cached, 10 total
Time:    17.773s
```

All 10 packages and apps compiled with zero errors.

---

## turbo.json note

During this session `turbo.json` was also updated to add `"dependsOn": ["^build"]` to the `dev` task, ensuring `@ogstack/shared` (and all other upstream packages) are fully compiled before any app's dev server starts.
