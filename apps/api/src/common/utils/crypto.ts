const API_KEY_PREFIX = "og_live_";

/** Generate a short public ID (12 hex chars) for project URLs. */
export function generatePublicId(): string {
  return crypto.randomUUID().replace(/-/g, "").slice(0, 12);
}

/** Generate a cryptographically random hex token (64 chars). */
export function generateRandomToken(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(32));
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

/** Generate an API key with a recognizable prefix (e.g. `og_live_a1b2c3...`). */
export function generateApiKey(): { raw: string; prefix: string } {
  const token = generateRandomToken();
  const raw = `${API_KEY_PREFIX}${token}`;
  const prefix = `${API_KEY_PREFIX}${token.slice(0, 8)}...`;
  return { raw, prefix };
}

/** SHA-256 hash a string and return the hex digest. */
export async function hashSha256(input: string): Promise<string> {
  const encoded = new TextEncoder().encode(input);
  const buffer = await crypto.subtle.digest("SHA-256", encoded);
  return Array.from(new Uint8Array(buffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}
