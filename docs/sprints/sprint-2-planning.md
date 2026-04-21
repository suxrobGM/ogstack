# Sprint 2 Planning

**Milestone:** [Sprint 2](https://github.com/suxrobGM/ogstack/milestone/2)
**Dates:** 2026-03-31 to 2026-04-07 (1 week)
**Team:** Sukhrob Ilyosbekov, Raja Nadimpalli
**Planning date:** 2026-03-30

---

## Sprint goal

Turn the Sprint 1 backend into a **product a user can actually open and use**. Build the whole dashboard (layout, projects, API keys, playground), ship the OG Score Audit tool (the acquisition loop), and publish the Nextra docs site so there's a single place to send anyone we pitch.

By end of sprint a user can: register, log in, create a project, generate an image from the playground, copy the meta tag, and read the docs.

## Committed issues

16 issues. Frontend-heavy (9 web, 6 API, 1 docs) because Sprint 1 left the web shell waiting for pages.

### Backend (Sukhrob)

| #                                                    | Title                                                      | Priority | Size |
| ---------------------------------------------------- | ---------------------------------------------------------- | -------- | ---- |
| [#23](https://github.com/suxrobGM/ogstack/issues/23) | feat(api): add admin module, backend endpoints             | P1       | L    |
| [#25](https://github.com/suxrobGM/ogstack/issues/25) | feat(api): add email verification flow                     | P1       | M    |
| [#26](https://github.com/suxrobGM/ogstack/issues/26) | feat(api): add Brand Kit module, backend CRUD              | P2       | M    |
| [#28](https://github.com/suxrobGM/ogstack/issues/28) | feat(api): add OG Score Audit, scoring engine              | P2       | L    |
| [#29](https://github.com/suxrobGM/ogstack/issues/29) | feat(api): add OG Score Audit, platform preview generation | P2       | M    |

### Frontend (Raja)

| #                                                    | Title                                                             | Priority | Size |
| ---------------------------------------------------- | ----------------------------------------------------------------- | -------- | ---- |
| [#16](https://github.com/suxrobGM/ogstack/issues/16) | feat(web): add dashboard layout and overview page                 | P0       | L    |
| [#17](https://github.com/suxrobGM/ogstack/issues/17) | feat(web): add projects management page                           | P1       | M    |
| [#18](https://github.com/suxrobGM/ogstack/issues/18) | feat(web): add API keys management page                           | P1       | M    |
| [#19](https://github.com/suxrobGM/ogstack/issues/19) | feat(web): add playground, URL input and template selector        | P1       | L    |
| [#20](https://github.com/suxrobGM/ogstack/issues/20) | feat(web): add playground, parameter controls and meta tag export | P1       | M    |
| [#21](https://github.com/suxrobGM/ogstack/issues/21) | feat(web): add templates gallery page                             | P2       | M    |
| [#22](https://github.com/suxrobGM/ogstack/issues/22) | feat(web): add settings page                                      | P2       | S    |
| [#24](https://github.com/suxrobGM/ogstack/issues/24) | feat(web): add admin panel pages                                  | P1       | L    |
| [#27](https://github.com/suxrobGM/ogstack/issues/27) | feat(web): add Brand Kit page                                     | P2       | M    |
| [#30](https://github.com/suxrobGM/ogstack/issues/30) | feat(web): add OG Score Audit page                                | P2       | L    |

### Docs (shared)

| #                                                    | Title                                   | Priority | Size |
| ---------------------------------------------------- | --------------------------------------- | -------- | ---- |
| [#31](https://github.com/suxrobGM/ogstack/issues/31) | docs: set up OGStack documentation site | P1       | M    |

## Capacity and sizing

- **Sukhrob:** about 25h. Admin plus email plus OG Audit scoring engine is the heaviest track.
- **Raja:** about 30h. 9 web pages is a lot. We're hoping the new `/add-page` skill pays for itself.
- Sprint 2 is overcommitted relative to Sprint 1. The plan is that `/add-page` automation saves 30-40% of per-page setup time. If it doesn't, Brand Kit and Settings slip to Sprint 3.

## Definition of done

1. All committed issues **Closed** with PRs merged to `main`.
2. Every web page has a working happy-path interaction (create, list, detail, delete where applicable).
3. `bun run typecheck` across all workspaces.
4. Nextra docs site builds cleanly and shows at least: Quickstart, API reference, Templates.
5. Manual smoke test: create account, create project, generate a playground image, run an audit, check out the docs site. Full loop must work.
6. PR reviews apply **C.L.E.A.R.** checklist. PRs disclose AI-assisted changes.

## Risks and mitigations

| Risk                                                                        | Mitigation                                                                                                                                                              |
| --------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 9 web pages is a lot. If each takes 2+h of boilerplate, we blow the sprint. | Build `/add-page` skill v1 before page #3. Commit to v2 after the first three pages surface gaps.                                                                       |
| OG Score Audit scoring is subjective. No gold standard.                     | Fix a 0-100 rubric tied to objective signals (has og:image, dimensions, title length, description length, Twitter card, canonical URL). Document the rubric in the PRD. |
| Nextra 4 is brand new. Docs for it are thin.                                | Use Context7 MCP. Fall back to the Nextra 4 GitHub README if results are stale.                                                                                         |
| Admin panel plus admin API are 2-person touchpoints                         | Align on the admin endpoint shapes in day 1 so Raja can start on the frontend with mocked data.                                                                         |

## Claude Code usage plan

- **New skill:** `/add-page` for the frontend. Scaffolds RSC plus client feature component plus barrel plus routes. Expect v1 to be wrong in 3-5 specific ways. Plan a v2 pass midweek.
- **GitHub MCP** for fast issue triage. 16 issues is enough that flipping to the browser for each one adds up.
- **Playwright MCP** to verify each new page visually without leaving Claude Code.
- **Context7 MCP** for MUI 7 prop renames, TanStack Form v1 validator API, Nextra 4 theme config.

## Out of scope (deferred)

- OAuth logins. Sprint 3.
- Billing/Stripe. Sprint 3.
- AI-generated images (FAL.ai). Sprint 3.
- Landing page. Sprint 3.
- CI pipeline. Sprint 3.
- Rate limiting. Sprint 3.
