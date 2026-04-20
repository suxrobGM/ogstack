FROM oven/bun:1 AS base
WORKDIR /app

# Build stage - install deps, generate backend types for Eden Treaty, build Next.js
FROM base AS build

ARG NEXT_PUBLIC_API_URL
ARG NEXT_PUBLIC_DEMO_PROJECT_ID
ARG NEXT_PUBLIC_DOCS_URL

ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_DEMO_PROJECT_ID=$NEXT_PUBLIC_DEMO_PROJECT_ID
ENV NEXT_PUBLIC_DOCS_URL=$NEXT_PUBLIC_DOCS_URL

COPY bun.lock package.json tsconfig.json ./
COPY apps/api/package.json apps/api/package.json
COPY apps/web/package.json apps/web/package.json
COPY apps/docs/package.json apps/docs/package.json
COPY packages/shared/package.json packages/shared/package.json

RUN bun install --frozen-lockfile --ignore-scripts

COPY packages/shared/ packages/shared/
COPY apps/api/ apps/api/
COPY apps/web/ apps/web/

# Generate Prisma client and backend type declarations so the web app can
# import Eden Treaty types from @ogstack/api
WORKDIR /app/apps/api
RUN DATABASE_URL="postgresql://build:build@localhost:5432/build" bun db:generate
RUN bun build:types

WORKDIR /app/apps/web
RUN bun run build

# Runtime - standalone Next.js output
FROM oven/bun:1-slim AS runner
WORKDIR /app
ENV NODE_ENV=production

COPY --from=build /app/apps/web/.next/standalone ./
COPY --from=build /app/apps/web/.next/static apps/web/.next/static
COPY --from=build /app/apps/web/public apps/web/public

HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
  CMD bun -e "fetch('http://localhost:5001').then(r=>{if(!r.ok)process.exit(1)}).catch(()=>process.exit(1))"

EXPOSE 5001

CMD ["bun", "run", "apps/web/server.js"]
