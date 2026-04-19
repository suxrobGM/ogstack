import { singleton } from "tsyringe";
import { BadRequestError, UnauthorizedError } from "@/common/errors";
import type { AuthResponse } from "./auth.schema";
import { OAuthUserService, type OAuthProfile } from "./oauth-user.service";

@singleton()
export class GitHubOAuthService {
  constructor(private readonly oauthUserService: OAuthUserService) {}

  /** Build the GitHub authorization URL with a random state parameter. */
  getAuthUrl(state: string): string {
    const params = new URLSearchParams({
      client_id: process.env.GITHUB_CLIENT_ID ?? "",
      redirect_uri: `${process.env.API_PUBLIC_URL ?? "http://localhost:5000"}/api/auth/github/callback`,
      scope: "user:email",
      state,
    });
    return `https://github.com/login/oauth/authorize?${params}`;
  }

  /** Exchange GitHub OAuth code for user profile, then find-or-create the user. */
  async callback(code: string): Promise<AuthResponse> {
    const profile = await this.fetchProfile(code);
    return this.oauthUserService.findOrCreateUser("github", profile);
  }

  private async fetchProfile(code: string): Promise<OAuthProfile> {
    const tokenRes = await fetch("https://github.com/login/oauth/access_token", {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({
        client_id: process.env.GITHUB_CLIENT_ID,
        client_secret: process.env.GITHUB_CLIENT_SECRET,
        code,
      }),
    });

    const tokenData = (await tokenRes.json()) as { access_token?: string; error?: string };
    if (!tokenData.access_token) {
      throw new UnauthorizedError("GitHub OAuth failed: could not obtain access token");
    }

    const [userRes, emailsRes] = await Promise.all([
      fetch("https://api.github.com/user", {
        headers: { Authorization: `Bearer ${tokenData.access_token}`, Accept: "application/json" },
      }),
      fetch("https://api.github.com/user/emails", {
        headers: { Authorization: `Bearer ${tokenData.access_token}`, Accept: "application/json" },
      }),
    ]);

    const userData = (await userRes.json()) as {
      id: number;
      name?: string;
      login: string;
      avatar_url?: string;
    };
    const emailsData = (await emailsRes.json()) as Array<{
      email: string;
      primary: boolean;
      verified: boolean;
    }>;

    const primaryEmail = emailsData.find((e) => e.primary && e.verified);
    if (!primaryEmail) {
      throw new BadRequestError("No verified primary email found on your GitHub account");
    }

    const fullName = userData.name || userData.login;
    const spaceIdx = fullName.indexOf(" ");

    return {
      id: String(userData.id),
      email: primaryEmail.email,
      firstName: spaceIdx > 0 ? fullName.slice(0, spaceIdx) : fullName,
      lastName: spaceIdx > 0 ? fullName.slice(spaceIdx + 1) : "",
      avatarUrl: userData.avatar_url ?? null,
    };
  }
}
