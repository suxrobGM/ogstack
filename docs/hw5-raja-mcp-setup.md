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
claude mcp add github -- npx -y @modelcontextprotocol/server-github
```

Set the required environment variable (GitHub personal access token with `repo` scope):

```bash
export GITHUB_PERSONAL_ACCESS_TOKEN=<your-token>
```

**What it enables:**

- Browse the issue backlog and check priorities without opening the browser
- Read issue descriptions to understand requirements before scaffolding
- Create branches named after issues following OGStack's branch naming convention
- Open PRs with the correct title format and `Closes #N` reference
- Check CI run status after pushing

**Example workflow — Picking up issue #17:**

```
User: "What's in issue #17?"

Claude Code uses GitHub MCP to:
1. get_issue → repo: suxrobGM/ogstack, issue: 17
2. Returns: "feat(web): add projects management page" with full description
3. Claude creates branch: feat/17-projects-management-page
4. Runs /add-page to scaffold the page
5. Commits with: feat(web): add projects management page\n\nRefs #17
6. Opens PR via create_pull_request with Closes #17 in body
```

**Example workflow — Checking what's ready to pick up:**

```
User: "What frontend issues are marked Ready?"

Claude Code uses GitHub MCP to:
1. list_issues → repo: suxrobGM/ogstack, labels: ["Ready", "feature"]
2. Returns filtered list with titles and priorities
3. I pick the highest priority unassigned issue
```

### 2. Context7 MCP Server

Context7 fetches real-time, version-specific documentation for libraries. OGStack uses several libraries where Claude's training data is stale or incomplete.

**Install:**

```bash
claude mcp add context7 -- npx -y @upstash/context7-mcp
```

**What it enables:**

- Accurate MUI 7 component prop signatures (several props renamed from v6)
- Current TanStack Form v1 API (significantly different from v0)
- Elysia.js plugin patterns (not covered well in training data)
- Next.js 15/16 App Router server component patterns

**Example workflow — Correct MUI v7 Button API:**

```
User: "Add a loading button to the create dialog"

Claude Code uses Context7 MCP to:
1. resolve_library_id → "@mui/material"
2. get_library_docs → topic: "Button loading state"
3. Returns: Button has native `loading` prop in MUI v6+ (no need for @mui/lab)
4. Generates: <Button loading={isPending}>Create</Button>
```

### Permission Configuration

Both MCP servers pre-approved in `.claude/settings.json`:

```json
{
  "permissions": {
    "allow": [
      "mcp__github__*",
      "mcp__context7__*"
    ]
  }
}
```

### Verify both servers are connected

```bash
claude mcp list
```

Expected output:

```
github:   npx -y @modelcontextprotocol/server-github - ✓ Connected
context7: npx -y @upstash/context7-mcp               - ✓ Connected
```

---

## Why GitHub MCP over Playwright?

My teammate Sukhrob integrated Playwright MCP for visual UI testing. That makes sense for him since he owns the backend and needs to verify OG image rendering. My focus is frontend scaffolding and issue management — GitHub MCP is more directly useful for my workflow. I reference issue descriptions constantly to understand what needs to be built, and the branch/PR creation workflow adds up quickly across 40+ open issues.
