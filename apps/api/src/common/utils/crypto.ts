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
