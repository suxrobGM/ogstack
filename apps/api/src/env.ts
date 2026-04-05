import { Value } from "@sinclair/typebox/value";
import { t, type Static } from "elysia";

const EnvSchema = t.Object({
  DATABASE_URL: t.String(),
  JWT_SECRET: t.String(),
  JWT_EXPIRY: t.Optional(t.String({ default: "1d" })),
  REFRESH_TOKEN_EXPIRY: t.Optional(t.String({ default: "30d" })),
  PORT: t.Optional(t.String({ default: "4000" })),
  NODE_ENV: t.Optional(
    t.Union([t.Literal("development"), t.Literal("production"), t.Literal("staging")]),
  ),
  CORS_ORIGINS: t.Optional(t.String({ default: "http://localhost:4001" })),
  LOG_LEVEL: t.Optional(t.String({ default: "info" })),
  UPLOAD_DIR: t.Optional(t.String({ default: "./uploads" })),
  ADMIN_EMAIL: t.Optional(t.String()),
  ADMIN_PASSWORD: t.Optional(t.String()),
  RESEND_API_KEY: t.Optional(t.String()),
  EMAIL_FROM_NAME: t.Optional(t.String({ default: "OGStack Team" })),
  EMAIL_FROM_ADDRESS: t.Optional(t.String({ default: "noreply@ogstack.dev" })),
  WEBSITE_URL: t.Optional(t.String({ default: "http://localhost:4001" })),
});

export type Env = Static<typeof EnvSchema>;

declare global {
  namespace NodeJS {
    interface ProcessEnv extends Env {}
  }
}

/**
 * Validates environment variables against the defined schema.
 * Throws an error if validation fails, preventing the application from starting with invalid configuration.
 */
export function validateEnv(): void {
  const converted = Value.Convert(EnvSchema, { ...process.env });
  const defaults = Value.Default(EnvSchema, converted);
  const errors = [...Value.Errors(EnvSchema, defaults)];

  if (errors.length) {
    const messages = errors.map((e) => `  ${e.path.slice(1)}: ${e.message}`).join("\n");
    throw new Error(`Environment validation failed:\n${messages}`);
  }
}
