---
description: API client setup and auth architecture
paths: [apps/web/src/**]
---

# API Client & Auth

All API-layer code lives under `src/api/`: client, server client, constants, query functions (`api/queries/`), query keys (`api/query-keys.ts`), the fetch-refresh interceptor, the generic React Query hook wrappers (`api/hooks/`), and the API type definitions (`api/types/`).

## Client-Side API Client

Located at `src/api/client.ts`. Uses Eden Treaty via `createApiClient()` from `@ogstack/shared/api` with `credentials: "include"` for cookie auth. Import as `import { client } from "@/api/client"`.

## Server-Side API Client

Located at `src/api/server.ts` (`getServerClient()`). Reads cookies from `next/headers` and forwards them. No `server-only` directive.

## Auth Flow

- Backend sets httpOnly cookies (`access_token`, `refresh_token`) on login/register/refresh/github-callback
- Frontend sends cookies automatically via `credentials: "include"`
- Auth middleware on backend has cookie fallback: checks `Authorization` header first, then `cookie.access_token`
- Logout is a POST endpoint that clears cookies

## Auth Provider

- Auth logic lives under `src/auth/`: `auth-provider.tsx` (context + `AuthProvider`), `use-auth.ts` (the `useAuth` hook), and an `index.ts` barrel. Import from `@/auth`.
- `AuthProvider` manages user state with SSR hydration via the `user` prop; the dashboard layout fetches the user server-side and passes it in
- `useAuth()` (`src/auth/use-auth.ts`) uses React 19 `use(AuthContext)`

## Backend Type Inference

- Run `bun run build:types` in `apps/api/` to generate declaration files in `dist/`
- `@elysiajs/eden` must be a devDependency in the frontend for Treaty types to work
- `@ogstack/shared` is a `workspace:*` dependency (not from npm)

## API Fetching

- Never use `fetch` API directly in components. Use `useApiQuery` and `useApiMutation` hooks (from `@/api/hooks`) that wrap API calls with React Query.
- Use Eden Treaty API client for all API calls, never direct `fetch`.
