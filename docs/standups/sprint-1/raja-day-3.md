# Async Standup - Raja

**Sprint:** 1
**Date:** 2026-03-26 (day 3)
**Channel:** Shared doc

## Yesterday plus day before

- #14 mostly done. Login, register, forgot-password, and reset-password screens built. MUI 7 theme configured (`theme/palette.ts`, `theme/typography.ts`). Used Claude Code to check the theme through Playwright MCP. Looks right on localhost:5001.
- TanStack Form v1 plus Zod v4 validator pattern confirmed via Context7 (schemas pass directly, no adapter needed). Saved an hour of reading docs.
- MUI `Button` has a built-in `loading` prop in v7. No `@mui/lab` dependency needed. Another Context7 win.

## Today

- Wrap up #14. Email verification page stub, form polish, AuthCard component finalized.
- Start #15: typed API client using Eden Treaty once Sukhrob lands `build:types`.
- If blocked on #15, start prepping the auth context plus cookie-based JWT storage pattern.

## Blockers

- Still on `build:types`. Sukhrob said it's shipping today. Mocking my fetch calls in the meantime.

## Notes for Sukhrob

- When `POST /auth/login` succeeds, is the refresh token set via `Set-Cookie` or returned in the body? The PRD says httpOnly cookie. The implementation looked like body-return when I last glanced. Please confirm before I wire the provider.
