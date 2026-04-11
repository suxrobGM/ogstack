import type { z } from "zod/v4";
import type {
  forgotPasswordSchema,
  loginSchema,
  registerSchema,
  resetPasswordSchema,
} from "./schema";

export type LoginPayload = z.infer<typeof loginSchema>;
export type RegisterPayload = z.infer<typeof registerSchema>;
export type ForgotPasswordPayload = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordPayload = z.infer<typeof resetPasswordSchema>;

export type VerifyEmailPayload = { token: string };
export type ResetPasswordApiPayload = { token: string; password: string };
