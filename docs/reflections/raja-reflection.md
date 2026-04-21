# Individual Reflection - Raja Nadimpalli

**Project:** OGStack
**Duration:** 3 sprints (2026-03-24 to 2026-04-19)
**Role:** Frontend lead
**Date:** 2026-04-21

---

## What I shipped

OGStack's web app went from zero pages to a full dashboard plus a landing page plus an OG audit tool over three sprints. My track: MUI 7 theme, auth flow, dashboard shell, projects page, API keys page, playground (URL + template + parameters), templates gallery, settings, admin panel, Brand Kit, OG Score Audit page, OAuth callback pages, billing UI, password reset, images gallery, and the landing page at ogstack.dev with its embedded interactive audit.

That's a lot to get through in three weeks on top of learning our specific conventions. The `/add-page` skill I built was the thing that made it plausible.

## The honest thing about working this fast

I've used AI assistants before. Copilot-style autocomplete, chat-in-a-sidebar. Claude Code is different because it can work inside the conventions I'm supposed to follow. CLAUDE.md says use `zod/v4` not `zod`. Claude Code, with that rule loaded, generates `zod/v4` imports. That one difference is what let me write 11 pages in three weeks without landing convention violations in code review.

Before Claude Code my frontend velocity was gated by two things. How fast I could remember all the micro-conventions of a codebase (import paths, file naming, server-vs-client boundaries). And how fast I could verify changes in the browser. The skills plus MCPs killed both bottlenecks.

## How `/add-page` evolved

I built the skill in Sprint 2 because I realized 9 web pages in a week was only going to work if the boilerplate compressed to near-zero. V1 shipped on day 1 of Sprint 2 and got used on the projects page. It failed in five specific, concrete ways:

1. Used `apiServer.api.users.me.get()` instead of the actual `getServerClient()` export.
2. No pagination controls rendered, even though the data fetch returned `totalPages`.
3. Hardcoded `limit: 10` instead of importing `PAGINATION_DEFAULTS`.
4. `--list` dropped a New-X Button with no `onClick`.
5. No typecheck at the end.

V2 (which I wrote after the projects page) fixed all five by reading the existing source files before generating. By the API keys page I was writing product logic rather than wiring. By the OG Audit page I barely touched the generated scaffold.

What I took from that: every useful skill I've written started as something that broke the first time I used it. V1 is the tool that teaches you what v2 should be. Designing v1 perfectly is a trap. It makes you guess at gaps you can't see yet.

## MCP servers that earned their place

**Playwright MCP.** I used this constantly. For a product where the output is visual (OG images, template previews, audit results), "does this look right?" can't be answered by reading the DOM. Being able to ask Claude Code to navigate, click through, and screenshot the result meant I could verify PRs without switching to a browser. For the landing page, Playwright walked me through the hero, features, pricing, and FAQ flow on desktop and mobile breakpoints in one pass.

**Context7 MCP.** This is an "invisible" tool. You don't notice when it's there, but you notice the absence of bugs from invented APIs. MUI 7 renamed `loadingPosition` to `loading`. TanStack Form v1 changed the validator API from v0. Both would have cost me an hour of debugging each. Context7 caught them in seconds.

**GitHub MCP.** With 45 issues across 3 milestones, flipping to the browser to read an issue body added up. GitHub MCP let me ask "what's in #17?" inline. The PR creation flow also handled our specific branch naming, commit format, and PR body template without me remembering the specifics each time.

## C.L.E.A.R. reviews

The rubric wants C.L.E.A.R. in PR reviews. We used it inconsistently. Big PRs got the framework, small PRs didn't. Looking back that was wrong. The framework is more useful for small PRs because small PRs are the ones reviewers tend to skim. A one-line fix can still have a non-obvious edge case, and the "E" in C.L.E.A.R. is the prompt to find it.

What I'd do differently next time: put the C.L.E.A.R. checklist in the PR template so the author fills it in before review, rather than the reviewer. That front-loads the thinking and makes the reviewer's job much lighter.

## The sprint that changed how I think about scope

Sprint 2 committed to 16 issues including 9 new web pages. We shipped all 16 but it took two weeks instead of one. Sprint 3 committed to 14 issues on a more realistic sizing and closed closer to on-time. The shift that mattered wasn't working harder. It was trusting the velocity data we already had.

I used to treat "definition of done" as aspirational. Now I treat it as a contract with the other person on the team. If we sign up for 16 items, we owe each other 16 items on the other end. If we can't make that true, we should commit to 10 and over-deliver instead of committing to 16 and under-delivering.

## What I'm taking forward

- Frontend work is painful when the codebase has unstated conventions. CLAUDE.md and `.claude/rules/` fix this by making the conventions part of what Claude sees.
- Skills are second-iteration tools. Ship v1 as a learning artifact. V2 is the one you actually use.
- Playwright MCP is worth setting up on day 1 of any frontend project. The compounding return on "see what you built without leaving the terminal" is bigger than you'd expect going in.
- Real sprint sizing beats optimistic sprint sizing. Every time.
