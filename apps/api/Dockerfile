FROM oven/bun:1 AS base
WORKDIR /app

# Build stage — install deps, generate Prisma client
FROM base AS build
COPY bun.lock package.json tsconfig.json ./

COPY apps/api/package.json apps/api/package.json
COPY apps/web/package.json apps/web/package.json
COPY apps/docs/package.json apps/docs/package.json
COPY packages/shared/package.json packages/shared/package.json

RUN bun install --frozen-lockfile --ignore-scripts

COPY packages/shared/ packages/shared/
COPY apps/api/ apps/api/

WORKDIR /app/apps/api
RUN DATABASE_URL="postgresql://build:build@localhost:5432/build" bun db:generate

# Runtime — reinstall without --production so sharp and prisma are available
FROM base AS runner
ENV NODE_ENV=production

COPY --from=build /app/package.json package.json
COPY --from=build /app/bun.lock bun.lock

COPY apps/api/package.json apps/api/package.json
COPY apps/web/package.json apps/web/package.json
COPY apps/docs/package.json apps/docs/package.json
COPY packages/shared/package.json packages/shared/package.json

RUN bun install --frozen-lockfile --ignore-scripts

COPY --from=build /app/packages/shared packages/shared
COPY --from=build /app/apps/api apps/api

WORKDIR /app/apps/api
RUN mkdir -p uploads

HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
  CMD bun -e "fetch('http://localhost:5000/health').then(r=>{if(!r.ok)process.exit(1)}).catch(()=>process.exit(1))"

EXPOSE 5000

CMD ["bun", "run", "start"]
