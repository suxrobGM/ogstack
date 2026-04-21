# C.L.E.A.R. Review - Worked Examples

The C.L.E.A.R. framework (Context, Logic, Edge cases, Architecture, Readability) is the review lens OGStack uses on PRs. This doc shows the framework applied to three real merged changes so reviewers can see what a solid C.L.E.A.R. review looks like on this codebase.

The `.github/PULL_REQUEST_TEMPLATE.md` is set up so **authors fill in C.L.E.A.R. as a self-review** before requesting a second reviewer. The examples below show what the author should write and what a second-reviewer's additional C.L.E.A.R. comments would look like.

A note on workflow: a portion of our work landed trunk-based during the initial MVP push. For submission, we've established the template so that post-MVP work (carryover, bug fixes, new features) follows the formal flow with PR plus C.L.E.A.R. review.

---

## Example 1 - Tiered Rate Limiting (Sprint 3, commit `5269a02`)

> `feat: enhance API key and authentication middleware to include user plan information, implement tiered rate limiting, and update plan configurations`

**Files touched:** `apps/api/src/common/middleware/tiered-rate-limiter.ts`, `apps/api/src/common/middleware/tiered-rate-limiter.test.ts`, `apps/api/src/modules/auth/auth.middleware.ts`, `apps/api/src/modules/api-key/api-key.service.ts`, `apps/api/src/constants/plans.ts`.

### Author's C.L.E.A.R. self-review (Sukhrob)

- **Context** - Free-tier abuse was possible. The baseline rate limiter was per-endpoint, not per-user-plan. Users on Free could hammer /generate harder than intended, and paying users could be rate-limited the same as free. We need plan-aware quotas: per-minute, per-hour, monthly.
- **Logic** - Auth/API-key middleware now injects `user.plan` into the Elysia context. The tiered limiter reads `user.plan` and checks three nested counters (minute/hour/month) against the plan's quota in `constants/plans.ts`. If any counter is over, return 429 with a `Retry-After` header computed from the next window boundary. Crawlers (user-agent match on Googlebot/Slackbot/Facebook) bypass all counters.
- **Edge cases**
  - Anonymous requests to the public GET endpoint (no API key, no user): use Free-tier quotas, key counters by IP.
  - Plan downgrade mid-month: existing monthly counter persists. User doesn't get a "fresh" counter when they downgrade.
  - Clock skew across replicas: counters live in the DB, not in-memory, so no skew risk.
  - Crawler UA spoofing: intentional tradeoff. We prefer open meta-tag access for real crawlers over strict bot mitigation, and reverse DNS check would cost a round-trip per request.
- **Architecture** - Uses the existing middleware chain (`authGuard`, then `tieredRateLimiter`). Plan config is a single source of truth in `constants/plans.ts` consumed by seed, billing sync, and this middleware. No new patterns introduced.
- **Readability** - `tiered-rate-limiter.ts` is about 180 lines. Split into three small functions (`getEffectivePlan`, `checkCounter`, `incrementCounter`). Tests cover each branch. Names mirror the plan config keys.

### Second reviewer's additional C.L.E.A.R. notes (Raja)

- **Edge cases addition** - Suggested testing: what happens when a user has a stale API key whose cached plan disagrees with the current user plan (e.g., user upgraded but API key was cached)? Confirmed: `api-key.service.ts` re-reads `user.plan` on each resolve, no stale cache. Good.
- **Readability nit** - `constants/plans.ts` uses object spread to share base quotas between tiers. Works, but it took me a minute to trace which tier inherits what. Adding a one-line comment above the spread would save future-readers.

### Outcome

Merged with a single readability tweak (the constants comment). No logic changes.

---

## Example 2 - SSRF Guard plus URL Metadata (Sprint 1, commit `f2b6a9d`-like, from #6)

> `feat(api): add URL metadata extraction service with SSRF protection`

**Files touched:** `apps/api/src/common/utils/url.ts`, `apps/api/src/common/utils/url.test.ts`, `apps/api/src/modules/metadata/metadata.service.ts`, `apps/api/src/modules/metadata/metadata.service.test.ts`.

### Author's C.L.E.A.R. self-review (Sukhrob)

- **Context** - The generation pipeline needs to fetch a user-supplied URL to extract OG tags. Any endpoint that fetches a URL-of-your-choice from a server is a SSRF target. This PR ships the extraction service _and_ the guard in a single commit so we never have an intermediate state where extraction exists without the guard.
- **Logic** - `validateUrl()` does: parse, scheme check (http/https only), hostname extraction, DNS resolution, IP-range check for each resolved IP (v4: RFC1918, loopback, link-local; v6: loopback, link-local, unique-local). Fetch only happens after all checks pass.
- **Edge cases**
  - IP literal in URL (`http://10.0.0.5/`): blocked at parse step before DNS.
  - Hostname that resolves to multiple IPs: every A/AAAA record is checked. Reject if any is private.
  - DNS rebinding: not fully mitigated (DNS could change between validation and fetch). Accepted risk with a short fetch timeout.
  - Non-http scheme (ftp, file, javascript): blocked.
  - Port: no port allowlist. Any port over http(s) is allowed. Intentional (some sites run on 8080).
- **Architecture** - `validateUrl` lives in `common/utils/url.ts` so other modules (future audit tool, preview generator) can reuse. Throws `BadRequestError` on failure so the middleware handles the HTTP response consistently with the rest of the app.
- **Readability** - 19 test cases covering each IP range boundary (172.15 allowed, 172.16 blocked, 172.31 blocked, 172.32 allowed). Error messages name the specific reject reason.

### Second reviewer's additional C.L.E.A.R. notes (Raja)

- **Logic note** - Worth documenting in CLAUDE.md (not this PR) that SSRF guards must ship in the same commit as any URL-fetch addition. This is a pattern we'll repeat for the audit tool later.
- **Edge cases addition** - Suggested a property-based test (fast-check) for the IP-range logic since the boundary cases are easy to miss. Deferred to a follow-up. `url.property.test.ts` lands in the bonus work for the final submission.

### Outcome

Merged as-is. CLAUDE.md updated in a follow-up commit. Property-based tests added as bonus work (`url.property.test.ts`).

---

## Example 3 - `/add-page` skill v2 (Sprint 2, `.claude/skills/add-page/SKILL.md`)

> `feat(claude): /add-page v2, reads existing source, --crud flag, --list pagination, typecheck`

**Files touched:** `.claude/skills/add-page/SKILL.md`.

### Author's C.L.E.A.R. self-review (Raja)

- **Context** - V1 of the skill had five concrete gaps: wrong `getServerClient` reference, no pagination controls, hardcoded `limit: 10`, empty create-flow button, no typecheck. Using v1 on the projects page surfaced all five. This is v2.
- **Logic** - The skill now reads `apps/web/src/lib/api-server.ts` before generating to catch the actual export name. It reads `apps/web/src/lib/constants.ts` to use `PAGINATION_DEFAULTS`. The `--crud` flag (new, was `--list` only) scaffolds a `CreateXDialog` wired to the New-X button. A `cd apps/web && bun run typecheck` runs at the end and the skill reports pass/fail.
- **Edge cases**
  - Skill invoked on an existing page: first step is a directory-exists check. Abort with a clear error before writing.
  - `api-server.ts` export name differs from expectation: the read step is meant exactly for this. Catch drift rather than assume.
  - `--crud` without `--list`: implicit `--list` is enabled because CRUD without list makes no sense.
  - No `--auth`: page is generated as a public RSC. No `redirect('/login')` guard.
- **Architecture** - Skill follows the same pattern as `/add-module` (read existing source, generate, typecheck). Makes skills consistent in behavior.
- **Readability** - `SKILL.md` uses explicit section headers (Parse, Validate, Read, Generate, Register, Verify). Reviewer can follow the skill flow step by step.

### Second reviewer's additional C.L.E.A.R. notes (Sukhrob)

- **Readability** - The skill body has a lot of inline code snippets. Suggested pulling long snippets into a template block at the bottom and referencing them by name. Deferred. V3 candidate.
- **Logic** - Wondered if the typecheck should gate the write (fail = revert files) rather than just report. Raja's view: typecheck as a signal, not a gate. The generated code may need manual edits and forcing a revert on every failure adds friction. Accepted.

### Outcome

Merged. V3 cleanup deferred to when the next real gap surfaces.

---

## Patterns that surfaced across these reviews

1. **Authors who self-review honestly get faster reviews.** Both partners wrote the "E" (edge cases) section even when some items were explicitly deferred. Naming a deferred item is much better than not naming it.
2. **Security changes should ship with their guards in the same commit.** The SSRF example makes this concrete. If extraction and guard land separately, the gap between the two commits is a vulnerability window.
3. **Tooling PRs (skills, configs) deserve C.L.E.A.R. too.** We were tempted to skip the framework on "it's just a skill update" PRs. The example above shows why it's worth doing. The reviewer catches things the author misses.
