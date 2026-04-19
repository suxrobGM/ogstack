# MCP Integration Setup — Raja Nadimpalli

## Overview

Two MCP (Model Context Protocol) servers are integrated into my OGStack Claude Code workflow:

1. **GitHub MCP** — Issue and PR management directly from the conversation
2. **Context7 MCP** — Up-to-date documentation for libraries used in the project

---

## Setup

### Prerequisites

- Node.js 18+ (for `npx`)
- Claude Code CLI installed
- `gh` CLI authenticated as RajaNadimpalli

### 1. GitHub MCP Server

GitHub MCP lets Claude Code list issues, read issue details, create branches, open PRs, and check CI status — without leaving the terminal.

**Install:**

```bash
claude mcp add github -e GITHUB_PERSONAL_ACCESS_TOKEN="$(gh auth token)" -- npx -y @modelcontextprotocol/server-github
```

**What it enables:**

- Browse the issue backlog and check priorities without opening a browser
- Read issue descriptions to understand requirements before scaffolding
- Create branches named after issues following OGStack's branch naming convention
- Open PRs with the correct title format and `Closes #N` reference
- Check CI run status after pushing

### 2. Context7 MCP Server

Context7 fetches real-time, version-specific documentation for libraries. OGStack uses several libraries where Claude's training data is stale or incomplete.

**Install:**

```bash
claude mcp add context7 -- npx -y @upstash/context7-mcp
```

**What it enables:**

- Accurate MUI 7 component prop signatures (several props renamed from v6)
- Current TanStack Form v1 API (significantly different from v0)
- Elysia.js plugin patterns (barely covered in training data)
- Next.js 15/16 App Router server component patterns

### 3. Verify both servers are connected

```bash
claude mcp list
```

Actual output:

```
Checking MCP server health...

github:   npx -y @modelcontextprotocol/server-github - ✓ Connected
context7: npx -y @upstash/context7-mcp               - ✓ Connected
```

### 4. Permission configuration

Both servers pre-approved in `.claude/settings.json` to avoid repeated prompts during workflows:

```json
{
  "permissions": {
    "allow": ["mcp__github__*", "mcp__context7__*"]
  }
}
```

---

## Demonstrated workflows

### Workflow 1 — GitHub MCP: reading an issue before scaffolding

Before picking up issue #17, I used GitHub MCP to pull the full description:

```
User: "What's in issue #17?"

GitHub MCP → get_issue (repo: suxrobGM/ogstack, issue_number: 17)

Result:
  title:   feat(web): add projects management page
  state:   OPEN
  labels:  feature, M, P1-high
  milestone: Sprint 2

  ## Description
  Build the projects management page in the dashboard.

  ## Tasks
  - [ ] List projects with usage stats per project
  - [ ] Create project dialog (name, initial domains)
  - [ ] Edit project: update name and domain allowlist
  - [ ] Delete project with confirmation dialog

  ## Files
  - apps/web/src/app/(dashboard)/projects/page.tsx
  - apps/web/src/components/features/projects/
```

From that output I knew exactly what the page needed — list with stats, create dialog, edit, delete with confirmation — and ran `/add-page projects (dashboard)/projects --auth --crud` to scaffold it immediately.

### Workflow 2 — GitHub MCP: finding the next issue to pick up

```
User: "What frontend P0 and P1 issues are still open?"

GitHub MCP → list_issues (repo: suxrobGM/ogstack, labels: feature)

Result (filtered to P0-critical and P1-high):
  #44 feat(web): build landing page with interactive demo
  #40 feat(web): add password reset pages
  #36 feat(web): add billing and pricing UI
  #34 feat(web): add OAuth login buttons and callback pages
  #20 feat(web): add playground — parameter controls and meta tag export
  #19 feat(web): add playground — URL input and template selector
  #18 feat(web): add API keys management page
  #17 feat(web): add projects management page
  #16 feat(web): add dashboard layout and overview page
  #15 feat(web): add API client and auth provider
  #14 feat(web): add MUI 7 setup and auth pages
```

Picked up #18 (API keys) as the next highest-priority unassigned item and ran `/add-page api-keys (dashboard)/api-keys --auth --crud`.

### Workflow 3 — Context7 MCP: TanStack Form v1 validator API

While writing the create dialog form, I wasn't sure if `validators: { onSubmit: schema }` accepted a Zod v4 schema directly or needed a wrapper function:

```
User: "Does TanStack Form v1 accept a Zod v4 schema directly in validators.onSubmit?"

Context7 MCP → resolve_library_id ("tanstack form")
             → get_library_docs (topic: "zod validation validators onSubmit")

Result:
  validators.onSubmit accepts any validator with a `parse` method.
  Zod v4 schemas satisfy this interface natively.
  No wrapper needed.

  Correct usage:
    const form = useForm({
      validators: { onSubmit: z.object({ name: z.string().min(1) }) },
      ...
    })
```

Wrote it correctly on the first try instead of guessing and debugging.

---

## Why GitHub MCP over Playwright

My teammate Sukhrob uses Playwright MCP for visual OG image testing, which fits his backend focus. My work is frontend scaffolding and issue management — GitHub MCP is more directly useful. I reference issue descriptions before every new page, and branch/PR creation with the exact CLAUDE.md format adds up across 45 open issues.
