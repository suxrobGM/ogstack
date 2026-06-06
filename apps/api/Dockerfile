FROM oven/bun:1-alpine AS build
WORKDIR /app

RUN apk add --no-cache openssl

COPY package.json bun.lock tsconfig.json ./
COPY apps/api/package.json ./apps/api/
COPY apps/web/package.json ./apps/web/
COPY apps/docs/package.json ./apps/docs/
COPY packages/shared/package.json ./packages/shared/

RUN bun install --frozen-lockfile --filter @ogstack/api

COPY packages/shared/ packages/shared/
COPY apps/api/ apps/api/

WORKDIR /app/apps/api
RUN DATABASE_URL="postgresql://build:build@localhost:5432/build" bun run db:generate

# tsc first: --compile drops emitDecoratorMetadata (needed by tsyringe) when fed TS.
RUN ./node_modules/.bin/tsc
RUN cp -r src/generated dist/apps/api/src/generated
RUN bun build --compile --minify-whitespace --minify-syntax \
    --define 'process.env.NODE_ENV="production"' \
    --target bun-linux-x64 \
    --outfile /app/server \
    dist/apps/api/src/app.js

FROM alpine:latest AS runner
WORKDIR /app/apps/api

RUN apk add --no-cache openssl curl libstdc++ libgcc

COPY --from=build /app/server ./server
COPY --from=build /app/apps/api/prisma ./prisma

RUN mkdir -p uploads

ENV NODE_ENV=production
ENV PORT=5000
EXPOSE 5000

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
    CMD curl -f http://localhost:5000/health || exit 1

CMD ["./server"]
