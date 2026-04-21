# Individual Reflection - Sukhrob Ilyosbekov

**Project:** OGStack
**Duration:** 3 sprints (2026-03-24 to 2026-04-19)
**Role:** Backend lead, CI/CD, deployment
**Date:** 2026-04-21

---

## What I set out to build

OGStack started as a frustration. Every project I ship to production eventually needs Open Graph images, and every time I end up hand-rolling them or relying on templated services that produce the same generic look as everyone else. I wanted a platform where adding a single meta tag gave you branded, contextual previews that felt like they belonged to your site. That's the product in one sentence.

Three sprints in, OGStack is live at ogstack.dev. It has auth, projects, API keys, templated rendering, AI-generated images, an OG score audit tool, Stripe billing, OAuth for GitHub and Google, tiered rate limiting with crawler bypass, and a documentation site. All of that is real, running, and reachable from the open internet.

## How Claude Code changed the work

I've used Claude in chat windows for a year. Using Claude Code inside the IDE, with skills, hooks, MCP servers, and CLAUDE.md to shape it, is a different tool. The gap between the two is larger than I expected going in.

**Skills were the biggest surprise.** I built `/add-module` after I'd manually scaffolded three backend modules. V1 was bad. TODO placeholders, no test file, didn't match the DI pattern. I used it once, saw the gaps, and wrote v2 that reads an existing module before generating and runs a typecheck at the end. By the time I scaffolded the OG Audit module in Sprint 2 the skill produced code I didn't have to edit. That compounded. Every module in the repo looks the same now, and code review got faster because of it.

**Hooks are quieter but they matter.** The Prettier-on-write hook means every file I edit lands formatted without me thinking about it. One of those things that disappears into the background until you work on a project without it.

**MCP integration changed what "current" means.** Claude's training data lags. For Prisma 7, MUI 7, Nextra 4, Elysia, the versions we're using, Claude will confidently generate function signatures that don't exist. Context7 MCP fixes this specifically: "use the current docs for X." The hours saved on the Prisma 7 driver adapter migration alone were real. I caught at least three cases where the hallucinated API would have compiled but failed at runtime.

**Playwright MCP changed frontend verification.** I don't work on the frontend as much as Raja, but when I did (auth flow tweaks, Stripe checkout redirect verification), asking Claude Code to navigate the flow and screenshot the result was faster than manually opening a browser.

## C.L.E.A.R. and PR reviews

The C.L.E.A.R. framework (Context, Logic, Edge cases, Architecture, Readability) was the review lens we used inconsistently across the project. The Sprint 2 retro called this out honestly: big PRs got the framework, small PRs didn't. I ended up writing a `.github/PULL_REQUEST_TEMPLATE.md` as part of submission prep so future PRs follow the framework by default.

The specific moment that stuck with me. Raja's playground PR had a section called "Edge cases" where he listed four states (no URL, invalid URL, API error, cache hit). One of those, cache hit, I hadn't thought about on the backend and we caught a bug there before merge. That's the value of the framework: it forces the questions that would otherwise get skipped.

## What I'd do differently

**Lock API contracts in the planning doc.** The POST generation endpoint churned twice in Sprint 1. Every change required both a backend and a frontend PR. I should have written the contract in the planning doc before touching code. I did this for admin endpoints in Sprint 2 and the rework disappeared.

**Trim Sprint 2's scope.** 16 issues in one week, 9 of which were new web pages. We overcommitted, knew it going in, and shipped two weeks late. The lesson wasn't "try harder next time." It was "trust the sizing data we already had from Sprint 1."

**Add E2E tests earlier.** We're missing Playwright E2E in CI, and the reason is that we deferred it to Sprint 3, then deferred it again because we ran out of time. Setting up Playwright in CI costs about 4h up front and 30 minutes per new test after that. That cost should have been paid in Sprint 1 when it was cheapest.

## What surprised me

How much of the value came from tooling that I built to help me build the thing. The skills, the `.claude/rules/*` files, the MCP configuration. Those aren't the product, but without them the product doesn't exist on this timeline. Three sprints is very little time for something this ambitious. The tools I built for myself are what made the deadline plausible.

One other thing: the Claude Code prompt provider lands in the product itself. OGStack uses Claude Opus to generate AI image prompts on behalf of users. We built the tool with Claude Code, and the tool now calls Claude from inside. I didn't plan this loop at the start. It emerged because we already had the plumbing.

## Taking forward

- Skills pay off on the second iteration. Build v1 cheap and rewrite.
- Write CLAUDE.md before the code, not after. The rules shape what gets generated, and you want the shaping happening before the bad habits form.
- Context7 MCP is non-optional for stacks on the frontier of library versions.
- The hardest part of Claude Code work isn't code generation. It's the setup that makes the generation consistent.
