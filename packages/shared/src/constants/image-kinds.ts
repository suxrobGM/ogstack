/**
 * Discriminator for the different image products OGStack generates. Stored
 * lowercase on the wire and converted to the Prisma `ImageKind` enum at the
 * DB boundary (same pattern as template slugs).
 */
export const IMAGE_KINDS = ["og", "blog_hero", "icon_set"] as const;

export type ImageKind = (typeof IMAGE_KINDS)[number];

export const DEFAULT_IMAGE_KIND: ImageKind = "og";

export function isImageKind(value: unknown): value is ImageKind {
  return typeof value === "string" && (IMAGE_KINDS as readonly string[]).includes(value);
}
