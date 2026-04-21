# Sprint 3 Planning

**Milestone:** [Sprint 3](https://github.com/suxrobGM/ogstack/milestone/3)
**Dates:** 2026-04-07 to 2026-04-14 (1 week)
**Team:** Sukhrob Ilyosbekov, Raja Nadimpalli
**Planning date:** 2026-04-06

---

## Sprint goal

Take OGStack from "logged-in users can generate images" to **deployable, paid, and public-facing**. Ship OAuth logins, Stripe billing, AI-generated images (FAL.ai Flux), the landing page, CI/CD on GitHub Actions, and the deploy pipeline to the production VPS.

End-state: anyone on the internet can land on ogstack.dev, sign up with GitHub or Google, subscribe to a paid tier, and generate AI-driven branded images.

## Committed issues

14 issues. The "launchability" list. OAuth plus billing plus landing plus CI plus deploy are all gating for a public release.

### Backend (Sukhrob)

| #                                                    | Title                                                          | Priority | Size |
| ---------------------------------------------------- | -------------------------------------------------------------- | -------- | ---- |
| [#32](https://github.com/suxrobGM/ogstack/issues/32) | feat(api): add GitHub OAuth login                              | P1       | M    |
| [#33](https://github.com/suxrobGM/ogstack/issues/33) | feat(api): add Google OAuth login                              | P1       | M    |
| [#35](https://github.com/suxrobGM/ogstack/issues/35) | feat(api): add Stripe subscription billing integration         | P0       | L    |
| [#37](https://github.com/suxrobGM/ogstack/issues/37) | feat(api): add AI image generation integration (FAL.ai Flux)   | P1       | L    |
| [#38](https://github.com/suxrobGM/ogstack/issues/38) | feat(api): implement additional MVP templates (5 more designs) | P1       | L    |
| [#39](https://github.com/suxrobGM/ogstack/issues/39) | feat(api): add password reset flow                             | P1       | M    |
| [#41](https://github.com/suxrobGM/ogstack/issues/41) | feat(api): add cache purge and usage stats API endpoints       | P1       | M    |
| [#42](https://github.com/suxrobGM/ogstack/issues/42) | feat(api): add plan-based rate limiting                        | P1       | M    |

### Frontend (Raja)

| #                                                    | Title                                                 | Priority | Size |
| ---------------------------------------------------- | ----------------------------------------------------- | -------- | ---- |
| [#34](https://github.com/suxrobGM/ogstack/issues/34) | feat(web): add OAuth login buttons and callback pages | P1       | M    |
| [#36](https://github.com/suxrobGM/ogstack/issues/36) | feat(web): add billing and pricing UI                 | P0       | L    |
| [#40](https://github.com/suxrobGM/ogstack/issues/40) | feat(web): add password reset pages                   | P1       | M    |
| [#43](https://github.com/suxrobGM/ogstack/issues/43) | feat(web): add images gallery page                    | P2       | M    |
| [#44](https://github.com/suxrobGM/ogstack/issues/44) | feat(web): build landing page with interactive demo   | P0       | L    |

### CI (shared)

| #                                                    | Title                                        | Priority | Size |
| ---------------------------------------------------- | -------------------------------------------- | -------- | ---- |
| [#45](https://github.com/suxrobGM/ogstack/issues/45) | chore(ci): set up GitHub Actions CI pipeline | P1       | M    |

## Capacity and sizing

- **Sukhrob:** about 30h. OAuth (2 providers) plus Stripe plus FAL.ai plus rate limiting is the critical path.
- **Raja:** about 25h. Landing page is the biggest single item. Billing UI is the riskiest.
- We are knowingly overcommitting again. Priority order if we slip: rate limiting, then password reset, then Brand Kit carryover, then extra templates.

## Definition of done

1. All P0 plus P1 issues **Closed** with PRs merged to `main`.
2. **Live at https://ogstack.dev** behind HTTPS.
3. CI pipeline green on `main` for every push: lint, typecheck, test, secret scan, dependency audit, build.
4. Deploy pipeline builds Docker images to GHCR and rolls out to the VPS via SSH.
5. A paid-tier subscription purchase works end-to-end in Stripe test mode.
6. An AI image can be generated through the playground and served from R2/CDN.
7. Every PR uses the new `.github/PULL_REQUEST_TEMPLATE.md` with C.L.E.A.R. plus AI disclosure.

## Risks and mitigations

| Risk                                                                          | Mitigation                                                                                                                                |
| ----------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| Stripe webhooks require a public URL in dev. Local iteration is painful.      | Use `stripe listen` CLI for local forwarding. Keep Stripe code gated behind a clear service boundary so most testing can mock the client. |
| FAL.ai Flux has multi-second generation time. Blocking the request is bad UX. | Return a job id, publish progress via Elysia WebSocket, poll from the playground UI.                                                      |
| Deploy via SSH is fragile (host fingerprint drift, key rotation)              | Document the exact GH Secrets needed. Make the deploy workflow idempotent (force-recreate on pull).                                       |
| Rate limiting will hit legitimate users if tiers are wrong                    | Crawler user agents (Googlebot, Slackbot, Facebook) must bypass the per-user cap. They're shared traffic.                                 |
| CI stalls on a slow `bun install`                                             | Enable Bun lockfile cache. Verify frozen-lockfile is respected.                                                                           |

## Claude Code usage plan

- **Playwright MCP** to verify the Stripe checkout redirect and OAuth callback happy paths end-to-end.
- **Context7 MCP** for Stripe Node SDK v18 (the pricing table plus Payment Element APIs both changed recently) and FAL.ai Flux model parameters.
- **GitHub MCP** for final issue cleanup plus milestone close plus PR triage on sprint end.
- **`/commit` plus `/pr` skills** to keep commit and PR messages consistent under a higher merge cadence.

## Out of scope (explicit)

- E2E test infrastructure (Playwright in CI). Accepted as a process-debt item to document in the retrospective.
- CodeQL, Snyk, Dependabot. Documented debt, not this sprint.
- Multi-region deployment.
- A mobile app wrapper.
