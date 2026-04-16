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

  R2_ACCOUNT_ID: t.Optional(t.String()),
  R2_BUCKET_NAME: t.Optional(t.String({ default: "ogstack-images" })),
  R2_ACCESS_KEY_ID: t.Optional(t.String()),
  R2_SECRET_ACCESS_KEY: t.Optional(t.String()),
  R2_PUBLIC_URL: t.Optional(t.String()),

  ADMIN_EMAIL: t.Optional(t.String()),
  ADMIN_PASSWORD: t.Optional(t.String()),

  RESEND_API_KEY: t.Optional(t.String()),
  EMAIL_FROM_NAME: t.Optional(t.String({ default: "OGStack Team" })),
  EMAIL_FROM_ADDRESS: t.Optional(t.String({ default: "noreply@ogstack.dev" })),
  WEBSITE_URL: t.Optional(t.String({ default: "http://localhost:4001" })),

  GITHUB_CLIENT_ID: t.Optional(t.String()),
  GITHUB_CLIENT_SECRET: t.Optional(t.String()),

  GOOGLE_CLIENT_ID: t.Optional(t.String()),
  GOOGLE_CLIENT_SECRET: t.Optional(t.String()),

  STRIPE_SECRET_KEY: t.Optional(t.String()),
  STRIPE_WEBHOOK_SECRET: t.Optional(t.String()),

  FAL_API_KEY: t.Optional(t.String()),

  PROMPT_PROVIDER: t.Optional(t.String()),

  ANTHROPIC_API_KEY: t.Optional(t.String()),
  ANTHROPIC_MODEL: t.Optional(t.String()),
  ANTHROPIC_BASE_URL: t.Optional(t.String()),

  OPENAI_API_KEY: t.Optional(t.String()),
  OPENAI_MODEL: t.Optional(t.String()),
  OPENAI_BASE_URL: t.Optional(t.String()),

  DEEPSEEK_API_KEY: t.Optional(t.String()),
  DEEPSEEK_MODEL: t.Optional(t.String()),
  DEEPSEEK_BASE_URL: t.Optional(t.String()),

  OLLAMA_BASE_URL: t.Optional(t.String()),
  OLLAMA_MODEL: t.Optional(t.String()),

  LLAMACPP_BASE_URL: t.Optional(t.String()),
  LLAMACPP_API_KEY: t.Optional(t.String()),
  LLAMACPP_MODEL: t.Optional(t.String()),

  RENDER_PROVIDER: t.Optional(t.String()),
  BROWSERLESS_URL: t.Optional(t.String()),
  BROWSERLESS_TOKEN: t.Optional(t.String()),
  SCRAPINGBEE_API_KEY: t.Optional(t.String()),
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
