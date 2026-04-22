# The AI tool that reads your codebase before it writes

This post is about building [OGStack](https://ogstack.dev) with Claude Code — specifically, what we learned about AI-assisted development when conventions actually mattered. My teammate Sukhrob Ilyosbekov built the entire backend from scratch: Elysia.js on Bun, Prisma 7, PostgreSQL, a full OG image generation pipeline, ten production-ready templates, and a clean API layer. That foundation made everything else possible. His writeup on what OGStack does is [here](https://www.linkedin.com/pulse/ogstack-automatic-open-graph-images-blog-covers-from-any-ilyosbekov-c5aye/) — this one picks up where his leaves off.

Most AI coding tools work from the internet. They've seen millions of repositories, so when you ask for a Next.js component, they give you one that looks right — roughly. The imports are plausible. The structure is familiar. But it's built from patterns averaged across every version of every library that ever got pushed to GitHub, not from the actual conventions in your codebase.

That gap is small at first. It gets expensive fast.

---

## The problem with joining mid-project

We built [OGStack](https://ogstack.dev) as a two-person team — a service that generates Open Graph images, blog covers, and favicons from any URL. One of us built the backend: Elysia.js on Bun, Prisma 7, PostgreSQL, full generation pipeline. The other joined to build the frontend once the API contracts were stable.

That handoff is where the convention problem shows up.

Every codebase develops opinions over time. Which components live where. How server components interact with client components. Which library version's API is canonical. By the time a second developer arrives, those opinions are already baked in. There are 15+ rules in our CLAUDE.md covering import paths, file structure, MUI patterns, form state, and more. Reasonable rules — the kind that keep a codebase coherent when two people aren't always working at the same time.

The problem isn't learning them. The problem is that they're easy to violate silently. Wrong import path, `"use client"` in the wrong file, Zod imported from `zod` instead of `zod/v4` — none of these fail loudly. They pass a quick look and show up in code review, or they cause a confusing bug later. On a newer stack like ours (MUI 7, TanStack Form v1, Next.js 16 App Router), even relying on your own memory isn't safe. These libraries changed significantly from their previous versions, and most LLM training data is for those older versions.

---

## What we built instead

The solution we landed on: a Claude Code skill called `/add-page` that reads the repository before it generates anything.

When invoked, the skill opens actual source files — existing pages, shared hooks, form patterns, the API client — and generates new code from what it finds. Not from a template written from memory. Not from patterns averaged across the internet. From the files that already work in this specific codebase.

The output is structurally compatible by default. Imports come from files that already compile. Component structure mirrors files that already exist. The first time it generated a page that needed zero structural edits, the developer just kept going — no correction cycle, no convention check, just forward momentum.

This is a different model from how most people think about AI code generation. The value isn't speed. It's that conventions get enforced at generation time instead of review time. The tool can't drift from the real patterns because it's reading them fresh on every invocation.

---

## MCP servers: removing the browser

Two MCP servers changed the texture of day-to-day development.

GitHub MCP handles issue lookup and pull request creation without leaving the terminal. That sounds like a minor convenience. In practice, every context switch to the browser is a small tax on focus, and they stack. With 45 open issues and a strict branch naming convention (we document exact formats in CLAUDE.md), staying inside the development environment for those operations keeps you in a different mental state than the one you're in after tabbing over to GitHub, finding the PR template, tabbing back.

Context7 addresses the stale documentation problem directly. It fetches current, version-specific library docs on demand. For a stack where the libraries are recent enough that LLM training data is incomplete or wrong, that matters more than it sounds. Confidently wrong answers about deprecated APIs aren't useful — they're just a different kind of friction. Context7 replaced most of that friction with accurate answers and kept the developer in the editor.

---

## What shipped

The templates gallery, OG audit tool, analytics dashboard, projects page, and API key management are live at [ogstack.dev](https://ogstack.dev). Sukhrob's product writeup covers what OGStack does in full [here](https://www.linkedin.com/pulse/ogstack-automatic-open-graph-images-blog-covers-from-any-ilyosbekov-c5aye/). The [repo is public](https://github.com/suxrobGM/ogstack).

---

## The actual shift

We came in expecting AI tools to speed up writing code. What we observed instead is that they shifted where attention went. Less time correcting convention violations, less time chasing documentation, less time switching context. More time on the decisions that actually matter — what should exist, how it should behave, what the user actually needs.

That's a more useful frame than productivity. The tools got out of the way in the places where they most often don't.
