# Sprint 2 Retrospective

**Milestone:** [Sprint 2](https://github.com/suxrobGM/ogstack/milestone/2)
**Dates:** 2026-03-31 to 2026-04-07 (closed 2026-04-19 after carryover)
**Retro facilitator:** Raja
**Format:** Async. 20-minute voice note plus written responses in a shared doc.

---

## What we finished

All 16 committed issues **closed** (#16-#31). The milestone closed on April 19, two weeks past its due date. We got hit by a combination of template-system rework and a bigger-than-expected OG Audit scoring engine. Partial deliverables went to `main` along the way, so users weren't blocked on a big-bang merge.

- Dashboard shell: layout, overview, all primary nav items wired.
- 9 web pages shipped: projects, API keys, playground (URL plus parameters), templates, settings, admin panel, Brand Kit, OG Score Audit.
- 6 API modules: admin endpoints, email verification, Brand Kit, OG Audit scoring, platform preview generation.
- Nextra 4 docs site live with Quickstart plus API reference plus templates section.
- The `/add-page` skill got 4 iterations over the sprint.

## Velocity

Committed: about 55h nominal. Delivered: all 16 issues, but with about 2 weeks of spill. Velocity reality: we ship roughly the committed count, but the due date is a lie. Adding about 50% to the window has historically been accurate.

## What went well

1. **`/add-page` v1 to v2 to v3 paid for itself by page #4.** V1's problems (wrong `getServerClient` reference, no pagination controls, hardcoded limits, no `--crud` flag, no typecheck) got fixed in v2. By the API Keys page Raja was spending time on "what columns should this show" instead of "what's the RSC boilerplate." By the Audit page (a large page with state-heavy interactions), the skill handled the scaffolding and Raja added only the tool-specific logic.

2. **Brand Kit as a spike paid off.** The `/add-module brand-kit` scaffold during Sprint 1's tail surfaced gaps in v1 that were fixed by the time we did real module work. We got the skill-improvement benefit without it being on the critical path.

3. **Playwright MCP changed how we verified frontend work.** Raja didn't open Chrome once during the projects page build. Claude Code navigated, logged in, clicked through the flow, and screenshot-confirmed the result. The feedback loop on UI changes compressed from "change code, alt-tab, refresh, stare" to "change code, ask Claude to verify."

4. **OG Audit scoring rubric was nailed down before the code started.** We wrote the 0-100 rubric into the PRD first (og:image presence: 20pt, dimensions correct: 15pt, title length: 10pt, description presence and length: 15pt, Twitter card: 10pt, canonical: 10pt, HTTPS: 10pt, favicon: 10pt). This meant the scoring engine was mostly mechanical.

5. **Nextra 4 MDX setup was faster than expected.** Context7 returned the current config. It works.

## What didn't go well

1. **Admin panel (#23, #24) had two-sided coordination cost.** Sukhrob shipped the admin endpoints, then Raja had to wait for the OpenAPI types to regenerate before the Eden Treaty client picked them up. This happened twice. Agreed: run `bun run build:types` as part of any backend PR that adds endpoints Raja is actively consuming.

2. **Template system got a mid-sprint refactor.** Initial split was OG-only vs Hero-only. Halfway through we unified into "universal aspect-aware templates" (commits `e891fd7`, `246cbb9`). The right call in the long run, but it rewrote work from Sprint 1. We should have caught the aspect-ratio requirement during Sprint 1 planning.

3. **OG Audit platform preview generation (#29) was harder than scoped.** Rendering what the page looks like in Facebook vs LinkedIn vs Twitter vs Discord vs Slack means mimicking 5 different card layouts. Sized M, really an L.

4. **Brand Kit frontend (#27) shipped without strong integration with the playground.** It's a standalone page. Users still have to manually copy colors into the playground. Deferred to post-MVP.

5. **Sprint goal was too ambitious.** 16 issues in 1 week, 9 of which are new web pages, was not realistic. Closing the milestone 2 weeks late confirms it. Sprint 3 should trim.

## Action items

| Action                                                                        | Owner    | Status            |
| ----------------------------------------------------------------------------- | -------- | ----------------- |
| Run `bun run build:types` as part of any backend PR touching public contracts | Both     | In practice now   |
| Add a template regression test harness (render output byte-diff)              | Sukhrob  | Done 2026-04-08   |
| Apply the C.L.E.A.R. framework more consistently. We skipped it on small PRs. | Both     | Sprint 3 priority |
| Add AI disclosure line to PR bodies by default                                | Both     | Sprint 3 priority |
| Reduce Sprint 3 commitment. Last 2 sprints slipped by the same pattern.       | Planning | Sprint 3          |

## Claude Code insights

- **Second-iteration skills beat first-iteration skills by a large factor.** Both `/add-module` and `/add-page` made the biggest dent on their v2 release. The v1 gaps were the unit of learning. Without using v1 we'd have guessed at v2.
- **Playwright MCP is most useful when the UI is non-obvious to describe in text.** A list page with 4 columns is easy to verify without Playwright. A playground with live image rendering is not.
- **Context7 MCP blunts one specific failure mode: invented APIs.** MUI 7 renamed `loadingPosition` to `loading`. Claude's training had the old name. Context7 caught it in seconds.
- **The `.claude/rules/*` convention docs actually work as a guardrail.** When a scaffold drifted (e.g., Zod imported from `zod` instead of `zod/v4`), pointing at the rule file got it corrected faster than spelling the correction.

## Team health check

- **Momentum:** Good. The app is visible for the first time. Feels like a real product, not an API.
- **Energy:** Mixed. The template refactor was demoralizing mid-sprint. The audit tool finishing was re-energizing.
- **Blockers we want to see fewer of next sprint:** two-sided types blocked. Contract drift. Not trimming scope.
