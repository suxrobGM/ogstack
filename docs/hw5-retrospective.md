# HW5 Retrospective — Custom Skill + MCP Integration

**Project:** OGStack — Developer-first OG image generation platform
**Date:** April 5, 2026

---

## Part 1: How the Custom Skill Changed My Workflow

### The Problem

OGStack follows a strict module pattern: every backend feature requires a controller, service, schema, and index file — all wired together with specific imports, decorators, and conventions. Manually creating a new module meant:

1. Creating 4+ files with boilerplate code
2. Remembering exact import paths (`@/common/di`, `@/common/errors`, `@/generated/prisma`)
3. Setting up TypeBox schemas with the right pagination types
4. Registering the controller in `app.ts` with proper grouping
5. Adding `@singleton()` decorators, `container.resolve()` calls, auth guards, Swagger docs

This took 15–20 minutes of copy-pasting from existing modules, and errors (wrong import, missing decorator, typo in prefix) were common.

### The Solution: `/add-module` Skill

The `/add-module` skill encodes all of OGStack's backend conventions into a single slash command. Running `/add-module billing --crud --test --prisma` generates a complete, production-ready module in seconds.

### V1 → V2 Iteration

**V1** was a minimal scaffolder — it created the three core files (controller, service, schema) with placeholder TODO comments and basic structure. Testing it on a real task (adding a `billing` module) revealed several gaps:

- No pagination support in the CRUD list endpoint — had to manually add `PaginationQueryBaseSchema` every time
- No test file generation — tests are required for every service, so I always had to create one manually after scaffolding
- Pseudocode templates instead of real code — the generated files needed significant editing to compile
- No typecheck step — scaffolded code sometimes had import errors that weren't caught until later

**V2** addressed all of these:

- **`--test` flag** generates a test file with mock PrismaClient setup matching our Bun test patterns
- **`--repo` flag** creates a repository layer for modules with complex queries
- **`--prisma` flag** generates the Prisma schema file with proper conventions (UUID, timestamps, user relation)
- **Pagination built-in** — CRUD list endpoints use `PaginatedResponseSchema` and `PaginationQueryBaseSchema` from shared types
- **Concrete code templates** — generated code matches the exact style of the `project` module (our reference implementation)
- **Typecheck verification** — runs `bun run typecheck` after scaffolding to catch errors immediately
- **Reads existing modules first** — ensures generated code matches the latest patterns, preventing style drift

### What Tasks Became Easier

- **New feature development**: Adding a new domain module (e.g., `brand-kit`, `og-audit`, `analytics`) went from ~20 minutes to ~30 seconds
- **Onboarding**: A new contributor can run `/add-module` and immediately have a working module that follows all conventions
- **Consistency**: Every module now uses the same structure, imports, and patterns — no more subtle differences between modules

---

## Part 2: What MCP Integration Enabled

### Playwright MCP — Browser Testing from the Conversation

Before Playwright MCP, testing UI changes required switching to a browser, manually navigating, and visually checking. With Playwright MCP, Claude Code can:

- **Navigate the running app** at `localhost:4001` and take screenshots
- **Test user flows** end-to-end: fill forms, click buttons, verify redirects
- **Debug visual issues** by capturing what the page actually renders
- **Verify OG image generation** by testing the playground flow programmatically

This is particularly valuable for OGStack because the core product is visual (OG images). Being able to generate an image and immediately see the result in the conversation — without leaving the terminal — closes the feedback loop dramatically.

### Context7 MCP — Up-to-Date Library Documentation

OGStack uses several bleeding-edge libraries: Elysia.js, Prisma 7, Next.js 16, MUI 7, React 19. Claude's training data doesn't always cover the latest APIs. Context7 MCP solves this by fetching current documentation on demand.

Real examples where this helped:

- **Prisma 7 driver adapter API** — the `@prisma/adapter-pg` setup changed between versions; Context7 provided the current syntax
- **Elysia WebSocket plugin** — the API differs significantly from Express/Fastify patterns; real-time docs prevented incorrect implementations
- **MUI 7 component props** — new components and changed prop names were accurately resolved

### What Wasn't Possible Before

1. **Visual verification in conversation** — Playwright screenshots let Claude Code "see" the UI without the developer describing it
2. **Accurate library APIs** — Context7 eliminates the "hallucinated API" problem where Claude generates plausible but incorrect function signatures
3. **Automated permission grants** — pre-approved MCP permissions in `settings.json` mean no interruptions during testing workflows

---

## Part 3: What I Would Build Next

### More Skills

- **`/add-page`** — scaffold a Next.js page with MUI layout, auth checks, and API client hooks, mirroring the frontend conventions as `/add-module` mirrors the backend
- **`/og-test`** — generate an OG image for a given URL and display the result, combining the API call with Playwright to render the preview
- **`/db-seed`** — generate realistic seed data for any Prisma model, useful for development and demos

### Hooks

- **Pre-commit typecheck** — automatically run `bun run typecheck` before every commit to prevent type errors from landing in the repo
- **Auto-format on save** — already have this (Prettier hook on Edit/Write), but could extend to run ESLint fixes too
- **Post-scaffold validation** — after `/add-module` runs, automatically verify the new module compiles and the dev server still starts

### Sub-Agents

- **Code review agent** — a specialized agent that reviews PRs against OGStack's conventions (DI patterns, error handling, schema validation) and flags violations
- **Migration checker agent** — when a Prisma schema change is detected, automatically generates and validates the migration, checking for data loss risks
- **Security audit agent** — scans new endpoints for SSRF vulnerabilities (critical for OGStack's URL scraping feature), missing auth guards, and exposed secrets

### MCP Expansions

- **PostgreSQL MCP** — direct database queries from the conversation for debugging data issues, checking migration state, and verifying seed data
- **GitHub MCP** — deeper integration for creating issues, reviewing PRs, and managing the project board without switching to the browser

---

## Summary

The custom skill and MCP integration fundamentally changed the development workflow for OGStack. The `/add-module` skill eliminated repetitive scaffolding work and enforced consistency across the codebase. Playwright MCP enabled visual testing without leaving the terminal, and Context7 MCP ensured accurate library usage for bleeding-edge dependencies. Together, these tools reduced the feedback loop from minutes to seconds and caught errors earlier in the development process.
