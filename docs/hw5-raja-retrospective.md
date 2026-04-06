# HW5 Retrospective — Raja Nadimpalli

Project: OGStack (OG image generation platform)
Date: April 6, 2026

---

## Part 1: How the custom skill changed my workflow

### The problem I kept running into

OGStack's frontend is empty. My teammate Sukhrob built out the whole backend — auth, projects, API keys, generation pipeline, templates — but the web app has zero pages. When I started on the frontend I hit the same thing he'd described on the backend: every page needs the same boilerplate before you've written a single line of actual product logic. A Next.js page with server-side auth, a client feature component, MUI layout, a TanStack Query hook, and a loading state is 60–80 lines before you've done anything.

The problem isn't the typing. It's that the conventions are easy to get wrong silently. Never add `"use client"` to `page.tsx`. Always use `getServerClient()`, not some other export. Import Zod from `zod/v4`, not `zod`. Destructure props in the function body, not the signature. CLAUDE.md has 15+ of these and I violated three of them in my first handwritten page. None failed loudly. They'd have shown up in code review.

### What I built

`/add-page`. You run `/add-page projects (dashboard)/projects --auth --list` and it generates `page.tsx` as a proper RSC with server-side auth guard, a `"use client"` feature component with search and table, pagination controls, and a barrel file. The `--crud` flag scaffolds a create dialog wired to a "New X" button, TanStack Form and Zod already set up. It reads the actual source files before generating, so the output matches real patterns in the repo instead of a template I wrote from memory.

### How v1 fell short, and what v2 fixed

V1 had five concrete problems I found the moment I ran it on the projects page.

The worst was a wrong API reference. I'd put `apiServer.api.users.me.get()` in the server component template, but the actual file exports `getServerClient()`. Every `--auth` page the skill generated would have been a compile error. V2 reads `api-server.ts` first and uses whatever's actually exported there.

Then: no pagination controls. The skill fetched paginated data but never rendered `<Pagination>`. Users stuck on page 1, no way forward. V2 renders MUI's `<Pagination>` tied to `totalPages`.

I'd also hardcoded `limit: 10` when `PAGINATION_DEFAULTS` already exists in `constants.ts`. The `--list` flag left a Button with no `onClick` and a TODO comment — for resource management pages you almost always need a create dialog right away, so v2 adds `--crud` to scaffold it alongside the list. And v1 skipped the typecheck, so broken scaffolds passed without complaint.

### What actually got easier

I scaffolded two fully functional pages — projects and API keys — faster than I used to scaffold one. The API keys page is more involved than projects: masked key prefix display, "show key once" dialog after creation, revoke action. Still came out correctly structured on the first pass. The thing I noticed most wasn't speed. It was that I didn't have to think about conventions at all. My attention went to actual product decisions: what columns to show, what the form needs, how the one-time key reveal should work.

---

## Part 2: What MCP integration enabled

### GitHub MCP: the backlog in the conversation

OGStack has 45 open issues. Before GitHub MCP, picking up a ticket meant: open browser, find the issue, read it, go back to terminal, create a branch with the exact naming format, start coding. Every single time.

With GitHub MCP I can ask "what's in issue #17?" and get the full description without leaving Claude Code. More useful is filtering — "what frontend issues are Ready and high priority?" — which gives me a list I can act on. With 45 issues I was losing time just figuring out what to pick up next.

The PR creation side matters too. CLAUDE.md specifies an exact branch format, commit format, and PR body format. Getting all three right from memory every time is genuinely error-prone. GitHub MCP handles it automatically.

### Context7: library docs that aren't stale

The stack uses library versions where Claude's training data is unreliable. MUI 7 renamed props from v6. TanStack Form v1 is a completely different API from v0. Elysia.js barely shows up in training data at all.

The case that mattered most was TanStack Form validators. I knew the general pattern but wasn't sure if `validators: { onSubmit: schema }` accepted a Zod v4 schema directly or needed a wrapper. Without Context7 I would have guessed, gotten it wrong, and debugged. Context7 fetched the current docs in about ten seconds and I moved on.

Same with MUI's `loading` prop on Button. Built-in from v6, no `@mui/lab` needed. I was about to add a dependency that wasn't necessary.

Before both MCP servers, I'd hop to the browser for issue context or guess on library APIs and hope. Small interruptions individually. I didn't notice how often I was doing either until it stopped.

---

## Part 3: What I'd build next

### More skills

`/add-route` for adding a single endpoint to an existing backend module. That currently means finding the right controller, matching the TypeBox pattern, making sure the route lands in the right group, and not breaking the existing ones. A skill that takes `--module project --method POST --path /:id/transfer` and drops in a typed stub would make that mechanical.

`/review-page` to check a new page against OGStack's frontend conventions — no `"use client"` on RSC, MUI barrel imports, `zod/v4`, props destructured in body. Something between a linter and a code review comment. The kind of thing you don't want to enforce in CI but also don't want to keep catching by hand.

`/og-preview` to call the local API for a given URL and display the generated PNG inline. That's the core loop during template and playground work. Right now I have to test through the browser every time.

### Hooks

Pre-commit typecheck on both `apps/api` and `apps/web`. Bun is fast enough it doesn't add real friction. Pre-push test run on changed packages for the same reason.

### Sub-agents

A conventions checker that runs on PRs and posts comments for frontend violations — wrong import style, missing `"use client"`, Zod imported from the wrong path. The stuff that currently gets caught in code review because nobody wanted to write another lint rule.

An issue triage agent that labels new issues with priority and size based on the PRD and moves them to the right column. The backlog is 45 issues now and growing.

### More MCP servers

PostgreSQL MCP. When a list page isn't showing data and I can't tell if it's the query or the seed data, I want to ask "what's actually in the projects table for this user?" without opening a separate DB client.

---

## Wrapping up

The skill saved me from convention mistakes I kept making. Writing pages by hand, getting things subtly wrong, catching them in review — the skill generates from the actual codebase so it can't drift from the real patterns the way a mental template does.

The v1 to v2 improvements weren't planned. They all came from running v1 and watching it fail. Wrong export, no pagination UI, no create dialog, no typecheck. Every fix came from something that actually broke, which is probably the only way these things get built well anyway.

GitHub MCP and Context7 both removed friction I'd stopped noticing. Which is maybe the best thing you can say about a tool.
