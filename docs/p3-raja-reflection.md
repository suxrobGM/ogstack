# Individual Reflection — Raja Nadimpalli

## OGStack | CS7180 Spring 2026

I joined OGStack after Sukhrob had already built the backend. My job was the frontend — Next.js 16, MUI 7, TanStack Form, connecting to an API someone else designed. That setup forced me to think about something I hadn't really considered before: what happens when AI tools generate code for a codebase they haven't read?

The answer, in practice, was subtle breakage. Wrong import paths. `"use client"` in the wrong file. Zod imported from `zod` instead of `zod/v4`. None of these fail loudly. They look fine until they don't. I violated three of our CLAUDE.md conventions in my first handwritten page and caught them by accident.

Building the `/add-page` skill changed that. The idea: instead of generating from a template written from memory, the skill reads actual source files first — the real API client, real constants, real existing pages — and generates from those. The output matches the codebase because it comes from the codebase. The first time it generated a page that compiled and passed conventions on the first pass, the thing the course had been building toward clicked. It's not that the tool writes faster. It's that you stop spending energy on correctness and redirect it toward decisions.

The v1 to v2 iteration was the most useful part. V1 referenced an export that didn't exist, skipped pagination UI, and never ran a typecheck. Every fix in v2 came from watching v1 fail on a real task. I couldn't have predicted those failures by reasoning about them beforehand. I had to run it first and see what broke.

MCP servers were the other shift. I'd used Claude Code before this project mostly as autocomplete. Connecting GitHub MCP and Context7 made it feel like a different tool. GitHub MCP kept me in the terminal for issue management and PR creation — 45 open issues, strict branch naming conventions, no more context-switching to the browser for every ticket. Context7 solved a problem I hadn't named yet. When your stack is new enough that LLM training data is wrong, confident-but-wrong answers are worse than no answer. Context7 gave me accurate ones and I stopped second-guessing library APIs.

The thing that surprised me most was the hooks. The PostToolUse hook that auto-ran Prettier on every edit seems trivial. But removing that mental check — did I format that? — from every single file change compounds over a full project. Small friction is still friction.

What I'd do differently: write the skill before writing any pages by hand. I wrote one manually first, found the convention violations, then built the skill. The violations were useful — they told me what the skill needed to enforce. But I was treating the first page as a product artifact when it should have been a spec.

The larger thing this project changed is how I think about context. Most of the AI coding problems I ran into weren't about intelligence. They were about context — the tool didn't know what was already in the codebase. Once it did, via skills that read before they write and MCP servers that keep the environment in the conversation, what it produced was genuinely different. That gap is where most of the real leverage is.
