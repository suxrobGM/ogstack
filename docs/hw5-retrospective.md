# HW5 Retrospective: Custom Skill + MCP Integration

Project: OGStack (OG image generation platform)
Date: April 5, 2026

---

## Part 1: How the custom skill changed my workflow

### The problem I kept running into

Every backend feature in OGStack needs the same four files: controller, service, schema, index. They all follow the same pattern, use the same decorators, import from the same paths. I was copy-pasting from the `project` module every time, then spending 15 minutes renaming things and fixing the imports I got wrong.

The annoying part wasn't the time. It was the inconsistency. Some modules used slightly different import styles because I copied from `auth` instead of `project`. Some forgot the `@singleton()` decorator. One time I registered a controller outside the `/api` group in `app.ts` and didn't notice until the routes were missing from Swagger.

### What I built

I created an `/add-module` skill. You run `/add-module billing --crud --test --prisma` and it generates all the files, wires them into `app.ts`, and runs a typecheck to make sure everything compiles. That's it.

### How v1 fell short, and what v2 fixed

V1 was barebones. It created the three core files with TODO placeholders and called it a day. When I actually used it to scaffold a `billing` module, the gaps were obvious:

- The CRUD list endpoint had no pagination. Every module in OGStack uses `PaginationQueryBaseSchema`, so I was adding it manually after every scaffold.
- No test file. Our convention says every service needs tests, so I'd scaffold the module and immediately have to create the test file from scratch.
- The generated code was pseudocode, not real TypeScript. It didn't compile without editing.
- No typecheck at the end. Import typos would slip through and show up later.

V2 added `--test`, `--repo`, and `--prisma` flags. The generated code now matches the `project` module exactly, including pagination in list endpoints. It reads existing modules before generating to prevent style drift. And it runs `bun run typecheck` at the end so broken scaffolds get caught immediately.

### What actually got easier

Adding a new domain module (like `brand-kit` or `og-audit`) went from a 20 minute copy-paste session to a single command. More importantly, every module now looks the same. No more "why does this one import differently" moments during code review.

---

## Part 2: What MCP integration enabled

### Playwright: seeing the UI without leaving the terminal

Before Playwright MCP, checking a UI change meant switching to Chrome, navigating to the right page, logging in, and visually inspecting. For OGStack this is especially tedious because the core product is visual. You're generating OG images, and you need to see them.

With Playwright MCP, Claude Code can navigate to `localhost:4001`, fill in a login form, go to the playground, paste a URL, click generate, and screenshot the result. I can see the generated OG image right in the conversation. The whole loop of "change code, switch to browser, come back" turns into one step.

I used this to verify the landing page layout after a MUI theme change, and to test the full playground flow (login, enter URL, select template, generate image) without touching a browser.

### Context7: documentation that isn't six months stale

OGStack uses libraries where the latest version barely has blog posts yet: Elysia.js, Prisma 7, Next.js 16, MUI 7. Claude's training data lags behind. Context7 MCP fetches current documentation on demand, so when I need the Elysia WebSocket plugin API or the Prisma 7 adapter setup, I get the real syntax instead of something that looks right but doesn't exist.

Concrete cases where this mattered: the `@prisma/adapter-pg` API changed between Prisma 6 and 7, the Elysia WebSocket plugin doesn't follow Express/Fastify conventions at all, and MUI 7 renamed several component props.

### What wasn't possible before

Playwright screenshots let Claude Code "see" the UI. Before, I had to describe what was on screen. Context7 solved the stale documentation problem, where Claude would confidently generate function signatures that don't exist in the version I'm using. Both MCP servers are pre-approved in `settings.json`, so there are no permission prompts interrupting the flow.

---

## Part 3: What I'd build next

### More skills

`/add-page` for the frontend side, mirroring what `/add-module` does for the backend. Right now scaffolding a Next.js page with MUI layout, auth context, and API hooks is the same copy-paste problem I already solved on the backend.

`/og-test` to generate an OG image for a URL and display it inline. This would combine an API call with Playwright to render the preview, which is the most common thing I do during development.

`/db-seed` to generate realistic test data for any Prisma model. Writing seed scripts by hand gets old.

### Hooks

A pre-commit typecheck hook (run `bun run typecheck` before every commit) would catch type errors before they hit the repo. I already have a Prettier hook that formats on Edit/Write, but extending it to run ESLint would close another gap. A post-scaffold hook that verifies the new module compiles after `/add-module` runs would make the skill more self-contained.

### Sub-agents

A code review agent that checks PRs against OGStack conventions, specifically the DI patterns, error handling with typed errors, and schema validation. A migration checker that runs when Prisma schema files change and flags potential data loss. A security audit agent that scans new endpoints for SSRF vulnerabilities, which matters because OGStack scrapes URLs and needs to block private IP ranges.

### More MCP servers

PostgreSQL MCP for running queries directly from the conversation, useful for debugging data issues and verifying migrations. GitHub MCP for deeper issue and PR management without switching to the browser.

---

## Wrapping up

The `/add-module` skill cut out the copy-paste when adding backend features. Honestly, the consistency matters more to me than the time savings. Every module looks the same now, and code review got easier because of it. Playwright MCP let me stop switching between the terminal and browser during frontend work. Context7 stopped me from using APIs that don't exist in the library versions I'm running, which happened more often than I'd like to admit. The common thread is a shorter feedback loop. I can change code, see what happened, and fix the issue without leaving the conversation.
