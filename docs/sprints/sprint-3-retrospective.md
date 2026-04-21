# Sprint 3 Retrospective

**Milestone:** [Sprint 3](https://github.com/suxrobGM/ogstack/milestone/3)
**Dates:** 2026-04-07 to 2026-04-14 (closed 2026-04-19)
**Retro facilitator:** Sukhrob
**Format:** Async. Both partners wrote their own sections, reconciled in a single doc.

---

## What we finished

All 14 committed issues **closed** (#32-#45). Milestone closed 2026-04-19, five days past the due date. The shortest slip of the three sprints.

- GitHub plus Google OAuth flows live and tested end-to-end.
- Stripe subscription billing integrated (Free, Pro, Business, Enterprise tiers). Checkout plus portal working in Stripe test mode.
- FAL.ai Flux integrated. Playground can now produce true AI-generated imagery.
- 5 more template designs added. Universal aspect-aware renderer covers OG, Hero, and Icon sizes from the same codebase.
- Password reset flow (request, email, set-new) shipped end-to-end.
- Plan-based rate limiting: per-minute, per-hour, and monthly quotas, with crawler allowlist bypass.
- Landing page with interactive demo (live audit tool embedded at ogstack.dev/audit).
- Images gallery page.
- **CI pipeline green on `main`** (ci.yml plus deploy.yml).
- **Live at https://ogstack.dev** behind the VPS plus Caddy reverse proxy.

## Velocity

Committed: about 60h nominal. Delivered: all 14 issues with a 5-day slip. Sprint 3 was our cleanest. Sizing learned from Sprint 1 plus 2 seems to have converged.

## What went well

1. **The CI plus deploy pipeline came together fast.** Pipeline configs in `.github/workflows/ci.yml` and `deploy.yml`, Dockerfile per app, docker-compose for the VPS, GHCR image registry. All in a single day. The multi-stage Docker builds with Bun runtime deserve a shout-out. Image sizes dropped about 40% from a naive single-stage approach.

2. **Stripe integration was boring, in a good way.** Context7 MCP returned the current Stripe Node SDK v18 patterns (Payment Element plus pricing table). The webhook flow was straightforward once we settled on `stripe listen` for local forwarding.

3. **Tiered rate limiting was tested heavily.** We wrote HTTP-handler integration tests (`tiered-rate-limiter.test.ts`) that actually exercise the middleware via `app.handle()`, not just the service in isolation. The crawler-bypass logic was caught in review (user-agent matching for Googlebot, Slackbot, Facebookbot) and confirmed working before merge.

4. **OAuth happy paths worked on the first try because of `/pr` plus Playwright MCP.** After Sukhrob shipped the GitHub and Google endpoints, Raja used Playwright MCP to run each callback flow end-to-end (click button, consent screen, callback, session established). Two follow-up fixes (the "redundant api prefix" in callback URLs, commit `41cd113`; OAuth callback URL env var, commit `b771375`), both caught before users.

5. **Cadence was highest of any sprint.** Commit log shows about 100 commits over the last 4 days of the sprint. A lot of this was polish. Watermarks (`35a372b`), responsive layouts (`21e5d4e`), social preview, cache purge, password reset UI. Velocity on small polish items was unusually high, which we attribute to a more settled codebase plus second-iteration skills.

## What didn't go well

1. **Billing UI (#36) scope creep.** The issue said "billing and pricing UI." The reality: pricing page plus checkout redirect plus subscription management dashboard plus invoice history plus quota display plus plan-change flow plus cancellation flow. We hit the main path. Invoice history and cancellation flow are post-MVP debt.

2. **E2E tests still not in CI.** Rubric-wise this is the missing 8th pipeline stage. We chose not to add Playwright to CI this sprint because setting up the full browser plus DB seed plus test fixtures cycle reliably would have cost 4-6h we didn't have. Documented as process debt.

3. **The ESLint step in CI had to be disabled** (commit `04aa6fa`). `eslint-plugin-react` is not yet compatible with ESLint 10. We could have pinned to ESLint 9 but chose to defer. Commit is explicit about it being temporary.

4. **Email verification (Sprint 2) and password reset (Sprint 3) have near-duplicate plumbing.** We should have noticed the pattern and extracted a shared "one-time email token" helper. We didn't. Each ships its own token table. Small debt.

5. **`fix: replace em dashes with hyphens`** (`e6a714e`) went out as a standalone commit because Claude's AI-generated copy kept putting em-dashes in UI text. Not a big deal, just amusing.

## Action items

| Action                                                                                        | Owner    | Status            |
| --------------------------------------------------------------------------------------------- | -------- | ----------------- |
| Add Playwright E2E tests plus CI job for the three critical flows (register, generate, audit) | Post-MVP | Debt logged       |
| Add CodeQL plus Dependabot for security gate expansion                                        | Post-MVP | Debt logged       |
| Re-enable ESLint once `eslint-plugin-react` supports ESLint 10                                | Post-MVP | Upstream tracking |
| Extract shared "one-time email token" helper from email-verify plus password-reset            | Post-MVP | Refactor          |
| Document the OWASP Top 10 to OGStack control mapping in CLAUDE.md                             | Both     | Submission prep   |

## Claude Code insights

- **The compounding returns on skills plus MCP plus rules files were obvious this sprint.** Velocity on commit count tripled in the last third of the sprint because the setup cost was behind us.
- **Claude Code prompt provider** got integrated this sprint (commit `aa3488f`) so the product itself uses Claude Opus to generate AI image prompts. That closes a nice loop: we built the tool with Claude Code, and the tool now calls Claude from inside.
- **`/commit` and `/pr` skills** became load-bearing once we were merging multiple PRs per day. Correct conventional commit format without thinking about it.
- **The PR template and C.L.E.A.R. adoption was uneven.** We got it right on bigger PRs, skipped it on tiny ones. A template-by-default enforcement (`.github/PULL_REQUEST_TEMPLATE.md`) would make it non-optional. We ended up adding this as part of final submission prep.

## Team health check

- **Momentum:** Peaked. We shipped a live, paid-tier-ready product.
- **Energy:** Tired but satisfied. The demo-able moment of seeing the landing page go live at ogstack.dev was a real high point.
- **What we'd do differently on a hypothetical Sprint 4:** E2E test infrastructure up front, not at the end. Take the scope-trim pledge seriously. We said we would in Sprint 2's retro and didn't.
