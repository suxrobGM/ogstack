import { jwtVerify, SignJWT, type JWTPayload } from "jose";

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET ?? "dev-secret");
const ACCESS_TOKEN_EXPIRY = process.env.JWT_EXPIRY ?? "1d";
const REFRESH_TOKEN_EXPIRY = process.env.REFRESH_TOKEN_EXPIRY ?? "30d";

export interface AccessTokenUser {
  id: string;
  role: string;
  email: string;
}

/** Sign a short-lived access token. */
export function generateAccessToken(user: AccessTokenUser): Promise<string> {
  return new SignJWT({ role: user.role, email: user.email, type: "access" })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(user.id)
    .setExpirationTime(ACCESS_TOKEN_EXPIRY)
    .sign(JWT_SECRET);
}

/** Sign a long-lived refresh token. */
export function generateRefreshToken(userId: string): Promise<string> {
  return new SignJWT({ type: "refresh" })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(userId)
    .setExpirationTime(REFRESH_TOKEN_EXPIRY)
    .sign(JWT_SECRET);
}

/** Verify a JWT and return its payload. Throws on invalid/expired tokens. */
export async function verifyToken(token: string): Promise<JWTPayload> {
  const { payload } = await jwtVerify(token, JWT_SECRET);
  return payload;
}
