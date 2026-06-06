FROM oven/bun:1-slim AS build
WORKDIR /app

COPY bun.lock package.json ./
COPY apps/api/package.json ./apps/api/
COPY apps/web/package.json ./apps/web/
COPY apps/docs/package.json ./apps/docs/
COPY packages/shared/package.json ./packages/shared/

RUN bun install --frozen-lockfile --ignore-scripts

COPY apps/docs/ apps/docs/

WORKDIR /app/apps/docs
RUN bun run build

FROM node:26-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

COPY --from=build /app/apps/docs/.next/standalone ./
COPY --from=build /app/apps/docs/.next/static apps/docs/.next/static
COPY --from=build /app/apps/docs/public apps/docs/public

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD node -e "fetch('http://localhost:5002').then(r=>{if(!r.ok)process.exit(1)}).catch(()=>process.exit(1))"

EXPOSE 5002

CMD ["node", "apps/docs/server.js"]
