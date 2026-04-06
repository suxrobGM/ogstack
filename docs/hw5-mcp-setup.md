# MCP Integration Setup — OGStack

## Overview

Two MCP (Model Context Protocol) servers are integrated into the OGStack Claude Code workflow:

1. **Playwright MCP** — Browser automation for testing UI flows and taking screenshots
2. **Context7 MCP** — Up-to-date library documentation lookup (Elysia, Prisma, Next.js, MUI, etc.)

## Setup Instructions

### Prerequisites

- Node.js 18+ (for `npx`)
- Claude Code CLI installed

### 1. Playwright MCP Server

Playwright MCP enables Claude Code to launch a browser, navigate pages, fill forms, click buttons, and take screenshots — directly from the conversation.

**Install:**

```bash
claude mcp add playwright -- npx @playwright/mcp@latest
```

**What it enables:**

- Automated browser testing of the OGStack web app (Next.js on port 4001)
- Visual verification of OG image generation results
- Screenshot capture for debugging UI issues
- End-to-end testing of user flows (registration, login, playground)

**Example workflow — Testing the landing page:**

```
User: "Check if the landing page renders correctly at localhost:4001"

Claude Code uses Playwright MCP to:
1. browser_navigate → http://localhost:4001
2. browser_screenshot → captures the page
3. Reports what it sees, flags any visual issues
```

**Example workflow — Testing OG image generation:**

```
User: "Test the OG playground flow"

Claude Code uses Playwright MCP to:
1. browser_navigate → http://localhost:4001/login
2. browser_type → fills in email and password
3. browser_click → submits the login form
4. browser_navigate → http://localhost:4001/playground
5. browser_type → enters a URL in the playground input
6. browser_click → clicks "Generate"
7. browser_screenshot → captures the generated OG image preview
8. Reports the result
```

### 2. Context7 MCP Server

Context7 provides real-time, version-aware documentation for libraries used in the project. Instead of relying on training data (which may be outdated), Claude Code fetches the latest docs on demand.

**Install:**

```bash
claude mcp add context7 -- npx -y @upstash/context7-mcp
```

**What it enables:**

- Accurate API references for Elysia.js, Prisma 7, Next.js 16, MUI 7
- Up-to-date TypeBox schema syntax
- Current tsyringe DI patterns
- Latest React 19 hooks and patterns

**Example workflow — Looking up Elysia WebSocket API:**

```
User: "Add WebSocket support to the generation module"

Claude Code uses Context7 MCP to:
1. resolve_library_id → "elysiajs" → finds the correct library
2. get_library_docs → fetches current WebSocket plugin documentation
3. Implements the feature using accurate, current API signatures
```

### 3. Permission Configuration

Both MCP servers are pre-approved in `.claude/settings.json` to avoid repeated permission prompts:

```json
{
  "permissions": {
    "allow": ["mcp__plugin_playwright_playwright__browser_*", "mcp__plugin_context7_context7__*"]
  }
}
```

### Verification

To verify both servers are connected:

```bash
claude mcp list
```

Expected output:

```
plugin:context7:context7: npx -y @upstash/context7-mcp - ✓ Connected
plugin:playwright:playwright: npx @playwright/mcp@latest - ✓ Connected
```
