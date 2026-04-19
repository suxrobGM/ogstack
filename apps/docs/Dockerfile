FROM oven/bun:1 AS base
WORKDIR /app

# Build stage — install deps, build Nextra site
FROM base AS build
COPY bun.lock package.json ./

COPY apps/api/package.json apps/api/package.json
COPY apps/web/package.json apps/web/package.json
COPY apps/docs/package.json apps/docs/package.json
COPY packages/shared/package.json packages/shared/package.json

RUN bun install --frozen-lockfile --ignore-scripts

COPY apps/docs/ apps/docs/

WORKDIR /app/apps/docs
RUN bun run build

# Runtime — standalone Next.js output
FROM oven/bun:1-slim AS runner
WORKDIR /app
ENV NODE_ENV=production

COPY --from=build /app/apps/docs/.next/standalone ./
COPY --from=build /app/apps/docs/.next/static apps/docs/.next/static
COPY --from=build /app/apps/docs/public apps/docs/public

HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
  CMD bun -e "fetch('http://localhost:5002').then(r=>{if(!r.ok)process.exit(1)}).catch(()=>process.exit(1))"

EXPOSE 5002

CMD ["bun", "run", "apps/docs/server.js"]
