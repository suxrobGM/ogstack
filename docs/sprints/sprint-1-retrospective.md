# Sprint 1 Retrospective

**Milestone:** [Sprint 1](https://github.com/suxrobGM/ogstack/milestone/1)
**Dates:** 2026-03-24 to 2026-03-31 (closed 2026-04-11 after slippage)
**Retro facilitator:** Sukhrob
**Format:** Async. Sukhrob drafted Tue morning, Raja responded Tue evening.

---

## What we finished

All 13 committed issues **closed** (#3-#15), but not all on time. Sprint 1 actually closed **April 11**, 11 days past the milestone due date. The first 9 issues (schema plus core API modules) wrapped up close to on time. The last 4 (image caching, usage tracking, web MUI setup, API client) slipped.

- DB schema migrated. Prisma 7 driver-adapter pattern in place.
- Project and API key CRUD shipped.
- Satori plus resvg template pipeline working.
- 5 built-in templates usable end-to-end.
- Generation service. GET endpoint (public) and POST endpoint (API-key-auth) both live.
- Image cache and R2 upload path working.
- Web: MUI 7 theme, login/register screens, auth provider, API client.

## Velocity

Committed: about 95h nominal. Delivered: 13/13 issues, but with the 11-day slip the effective velocity was more like 70% of the stated target. This became the honest baseline for Sprint 2's sizing.

## What went well

1. **`/add-module` skill had outsized ROI.** Sukhrob built v1 for Project, used it for API Key, then iterated based on gaps (#4 took 2h, #5 took 40 min). By the time he scaffolded the Brand Kit module speculative spike at the sprint edge it was a single command. Consistency across modules made code review trivial.

2. **The SSRF guard plus URL extraction shipped in one PR (#6).** Resisted the temptation to split them. The guard is useless if an earlier PR adds extraction without it. Keeping them together meant security was never "pending."

3. **Context7 MCP saved real time on Prisma 7 adapter syntax.** Prisma 6 to 7 changed the `@prisma/adapter-pg` signature. Claude's training data had the old pattern. Context7 returned the v7 pattern on first ask. Would have been an hour of fumbling.

4. **TDD on auth was worth the upfront cost.** The test-first commits on auth (registration, login, refresh) paid off immediately when we later refactored to extract token helpers. The existing tests caught a signing-key bug that would have gone out unnoticed.

## What didn't go well

1. **Template rendering (#7) went wider than estimated.** Satori has its own opinions about CSS (no flex-wrap, no grid, no calc), and resvg has cross-platform rendering quirks. What was sized "L" (about 12h) took about 18h. We didn't add a reference-image regression test until the tail end of the sprint, so early refactors were blind.

2. **The POST generation endpoint (#11) contract churned twice.** First version returned a URL. Second version returned the raw PNG. Third (shipped) returns a URL plus metadata JSON. Every change required both a backend and a frontend PR. We should have locked the contract in the planning doc.

3. **Web shell (#14, #15) got deprioritized mid-sprint.** Sukhrob was heads-down on generation. Raja was waiting on the API client type exports. The Eden Treaty type inference needed a `build:types` step in the API, which wasn't written until day 5. Shell work got compressed into the last 2 days and bled into the following week.

4. **No CI yet.** We were relying on each other to run typecheck plus test locally. Every PR was a small trust exercise. Booked for Sprint 3.

## Action items

| Action                                                                         | Owner   | Status          |
| ------------------------------------------------------------------------------ | ------- | --------------- |
| Add `build:types` target to `apps/api` early. Gates the web type inference.    | Sukhrob | Done 2026-03-28 |
| Add Satori rendering regression tests (checked-in reference PNGs per template) | Sukhrob | Done 2026-03-30 |
| Lock API response contracts in the planning doc before starting backend work   | Both    | Ongoing         |
| Build `/add-page` skill to cut Raja's boilerplate on Sprint 2's 9 web pages    | Raja    | Sprint 2        |
| Set up GitHub Actions CI pipeline                                              | Sukhrob | Sprint 3 (#45)  |

## Claude Code insights

- Skills are worth building **after you've felt the pain twice**. Sukhrob built `/add-module` after the third manual module. Would have been premature after the second, wasted after the first.
- The HMAC-SHA-256 vs bcrypt call for API key hashing was informed by a quick Context7 lookup on `timingSafeEqual` in Node crypto. Without it we'd have used bcrypt and paid about 50ms per request on the hot path.
- The Playwright MCP was installed this sprint but barely used. There were no UI pages worth screenshotting yet. Expect Sprint 2 to be the first real workout.

## Team health check

- **Momentum:** High. The product came together fast once Satori stopped fighting us.
- **Energy:** Medium. The tail of the sprint had too much context-switching between backend and frontend for Sukhrob.
- **Blockers we want to see fewer of next sprint:** API contracts landing late. No CI to catch type regressions.
