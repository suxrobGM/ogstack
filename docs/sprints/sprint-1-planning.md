# Sprint 1 Planning

**Milestone:** [Sprint 1](https://github.com/suxrobGM/ogstack/milestone/1)
**Dates:** 2026-03-24 to 2026-03-31 (1 week)
**Team:** Sukhrob Ilyosbekov (backend lead), Raja Nadimpalli (frontend lead)
**Planning date:** 2026-03-23

---

## Sprint goal

Stand up the OGStack backend end-to-end so a user can register, create a project, receive an API key, and generate an OG image from a URL. Ship the frontend shell (MUI 7, auth pages, API client) so Sprint 2 can build screens on top of it.

In one sentence: **a working POST /generate that takes a URL and returns a PNG, with auth in front of it and a logged-in UI shell around it.**

## Committed issues

13 issues total. 12 backend plus 2 frontend. P0-critical items below are gating for Sprint 2.

### Backend (Sukhrob)

| #                                                    | Title                                                            | Priority | Size |
| ---------------------------------------------------- | ---------------------------------------------------------------- | -------- | ---- |
| [#3](https://github.com/suxrobGM/ogstack/issues/3)   | chore(db): update Prisma schema to match full PRD data model     | P0       | M    |
| [#4](https://github.com/suxrobGM/ogstack/issues/4)   | feat(api): add project module, CRUD endpoints                    | P0       | M    |
| [#5](https://github.com/suxrobGM/ogstack/issues/5)   | feat(api): add API key module, create/revoke/list                | P0       | M    |
| [#6](https://github.com/suxrobGM/ogstack/issues/6)   | feat(api): add URL metadata extraction service                   | P0       | L    |
| [#7](https://github.com/suxrobGM/ogstack/issues/7)   | feat(api): add template rendering pipeline (Satori plus resvg)   | P0       | L    |
| [#8](https://github.com/suxrobGM/ogstack/issues/8)   | feat(api): implement MVP templates (5 built-in designs)          | P0       | L    |
| [#9](https://github.com/suxrobGM/ogstack/issues/9)   | feat(api): add OG generation service, core logic                 | P0       | L    |
| [#10](https://github.com/suxrobGM/ogstack/issues/10) | feat(api): add OG generation GET endpoint with domain validation | P0       | M    |
| [#11](https://github.com/suxrobGM/ogstack/issues/11) | feat(api): add OG generation POST endpoint with API key auth     | P0       | M    |
| [#12](https://github.com/suxrobGM/ogstack/issues/12) | feat(api): add image caching and storage service                 | P1       | L    |
| [#13](https://github.com/suxrobGM/ogstack/issues/13) | feat(api): add usage tracking and quota enforcement              | P1       | M    |

### Frontend (Raja)

| #                                                    | Title                                                       | Priority | Size |
| ---------------------------------------------------- | ----------------------------------------------------------- | -------- | ---- |
| [#14](https://github.com/suxrobGM/ogstack/issues/14) | feat(web): add MUI 7 setup and auth pages (login, register) | P0       | L    |
| [#15](https://github.com/suxrobGM/ogstack/issues/15) | feat(web): add API client and auth provider                 | P0       | M    |

## Capacity and sizing

- **Sukhrob:** about 30h, primarily backend.
- **Raja:** about 20h, frontend shell.
- Sizes use S/M/L labels from the backlog (XS=1h, S=3h, M=6h, L=12h). Committed work adds to about 95h nominally. Team accepts that 60-70% of L tasks will bleed into buffer time.

## Definition of done

1. All committed issues **Closed** with PRs merged to `main`.
2. `bun run typecheck` passes across all workspaces.
3. `bun test` green for the API. Auth, project, API key, template, and generation services unit-tested.
4. A manual smoke test of `POST /api/og/generate` returns a valid PNG.
5. Each PR follows the `<type>/<issue-number>-<slug>` branch format and Conventional Commit footer `Refs #N`.
6. At least one reviewer other than the author on every PR, applying the **C.L.E.A.R.** framework.

## Risks and mitigations

| Risk                                                                                             | Mitigation                                                                                                            |
| ------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------- |
| Satori plus resvg produce different output across platforms (WSL vs macOS)                       | Pin library versions. Test output byte-for-byte against a checked-in reference PNG.                                   |
| URL metadata extraction is open-ended (dozens of edge-case sites)                                | Scope to og:title, og:image, og:description plus `<title>` and `<meta>` fallback. Defer JSON-LD to Sprint 2.          |
| API key hashing choice (bcrypt vs HMAC-SHA-256)                                                  | Use HMAC-SHA-256. We need constant-time comparison for every request, bcrypt is too slow on the hot path.             |
| Prisma 7 driver adapter API is new (Prisma moved to adapters-first in v7)                        | Validate `@prisma/adapter-pg` pattern against Context7 docs before writing the singleton.                             |
| SSRF on `/metadata`. Attacker points URL at `169.254.169.254` and exfiltrates instance metadata. | Build the IP-range plus scheme allowlist in the same PR as the extraction service. Do not ship one without the other. |

## Claude Code usage plan

- **`/add-module` skill v1** should cover #4, #5, #12, #13. Expect to iterate the skill as gaps emerge.
- **Context7 MCP** for Prisma 7 adapter API, Elysia schema patterns, Satori/resvg signatures.
- **CLAUDE.md** already codifies DI, error classes, schema conventions. Rely on those rather than writing PRs that re-invent the patterns.

## Out of scope (deferred)

- Web dashboard pages (projects/API keys/playground). Sprint 2.
- OG Score Audit tool. Sprint 2.
- OAuth, billing, AI-generated images. Sprint 3.
- Admin panel. Sprint 2.
- Docs site. Sprint 2.
