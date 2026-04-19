import { singleton } from "tsyringe";
import { BadRequestError, UnauthorizedError } from "@/common/errors";
import type { AuthResponse } from "./auth.schema";
import { OAuthUserService, type OAuthProfile } from "./oauth-user.service";

@singleton()
export class GoogleOAuthService {
  constructor(private readonly oauthUserService: OAuthUserService) {}

  /** Build the Google authorization URL with a random state parameter. */
  getAuthUrl(state: string): string {
    const params = new URLSearchParams({
      client_id: process.env.GOOGLE_CLIENT_ID ?? "",
      redirect_uri: `${process.env.API_PUBLIC_URL ?? "http://localhost:5000"}/api/auth/google/callback`,
      response_type: "code",
      scope: "openid email profile",
      access_type: "offline",
      state,
    });
    return `https://accounts.google.com/o/oauth2/v2/auth?${params}`;
  }

  /** Exchange Google OAuth code for user profile, then find-or-create the user. */
  async callback(code: string): Promise<AuthResponse> {
    const profile = await this.fetchProfile(code);
    return this.oauthUserService.findOrCreateUser("google", profile);
  }

  private async fetchProfile(code: string): Promise<OAuthProfile> {
    const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        client_id: process.env.GOOGLE_CLIENT_ID,
        client_secret: process.env.GOOGLE_CLIENT_SECRET,
        code,
        grant_type: "authorization_code",
        redirect_uri: `${process.env.API_PUBLIC_URL ?? "http://localhost:5000"}/api/auth/google/callback`,
      }),
    });

    const tokenData = (await tokenRes.json()) as { access_token?: string; error?: string };
    if (!tokenData.access_token) {
      throw new UnauthorizedError("Google OAuth failed: could not obtain access token");
    }

    const userRes = await fetch("https://www.googleapis.com/oauth2/v2/userinfo", {
      headers: { Authorization: `Bearer ${tokenData.access_token}` },
    });

    const userData = (await userRes.json()) as {
      id: string;
      email: string;
      verified_email: boolean;
      name: string;
      given_name?: string;
      family_name?: string;
      picture?: string;
    };

    if (!userData.email || !userData.verified_email) {
      throw new BadRequestError("No verified email found on your Google account");
    }

    return {
      id: userData.id,
      email: userData.email,
      firstName: userData.given_name || userData.name || "",
      lastName: userData.family_name || "",
      avatarUrl: userData.picture ?? null,
    };
  }
}
