# Async Standup - Raja

**Sprint:** 1
**Date:** 2026-03-24 (day 1)
**Channel:** Shared doc

## Yesterday

- Planning with Sukhrob. Agreed that my Sprint 1 is narrow (#14 MUI setup plus auth pages, #15 API client plus auth provider) because the backend is the critical path. No UI to build on until the generation endpoint exists.
- Read through `.claude/rules/web/*` convention docs. CLAUDE.md has specific rules about `"use client"`, Zod imports (`zod/v4` not `zod`), and MUI barrel imports that are easy to get wrong.

## Today

- Start #14: MUI 7 theme plus `(auth)` route group plus login plus register pages.
- Use `@tanstack/form` plus `zod/v4` for the form state. Schema files in `features/auth/schemas/`.
- Don't wire the API yet. The auth controller may still change shape. Forms submit to a stub for now.

## Blockers

- Waiting on stable `/auth/*` endpoint contracts before I can finish #15 (the typed API client). Sukhrob said mid-sprint for `build:types`.

## Notes for Sukhrob

- Please ping me the moment the auth response shape is locked. I can build #15 against mocks until then but don't want to rework the provider once real types arrive.
