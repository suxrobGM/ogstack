import type { client } from "@/lib/api/client";
import type { Body, Data } from "./utils";

export type AuthResponse = Data<(typeof client)["api"]["auth"]["login"]["post"]>;
export type AuthUser = AuthResponse["user"];

export type LoginBody = Body<(typeof client)["api"]["auth"]["login"]["post"]>;
export type RegisterBody = Body<(typeof client)["api"]["auth"]["register"]["post"]>;
export type ForgotPasswordBody = Body<(typeof client)["api"]["auth"]["forgot-password"]["post"]>;
export type ResendVerificationBody = Body<
  (typeof client)["api"]["auth"]["resend-verification"]["post"]
>;
export type RegisterResponse = Data<(typeof client)["api"]["auth"]["register"]["post"]>;
export type MessageResponse = Data<(typeof client)["api"]["auth"]["forgot-password"]["post"]>;
