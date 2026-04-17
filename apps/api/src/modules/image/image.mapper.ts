import type { ImageKind as WireImageKind } from "@ogstack/shared/constants";
import { ImageKind, Prisma, type Image } from "@/generated/prisma";
import type { ImageAsset, ImageItem } from "./image.schema";

const PRISMA_TO_WIRE: Record<ImageKind, WireImageKind> = {
  [ImageKind.OG]: "og",
  [ImageKind.BLOG_HERO]: "blog_hero",
  [ImageKind.ICON_SET]: "icon_set",
};

const WIRE_TO_PRISMA: Record<WireImageKind, ImageKind> = {
  og: ImageKind.OG,
  blog_hero: ImageKind.BLOG_HERO,
  icon_set: ImageKind.ICON_SET,
};

export function toPrismaImageKind(kind: WireImageKind): ImageKind {
  return WIRE_TO_PRISMA[kind];
}

export function fromPrismaImageKind(kind: ImageKind): WireImageKind {
  return PRISMA_TO_WIRE[kind];
}

/**
 * Storage key used to persist a generated image. Kept here so CRUD deletion
 * and pipeline eviction agree on the format. Icon sets live under a
 * per-generation prefix; everything else is a single `.png` file.
 */
export function storageKeyFor(kind: ImageKind, cacheKey: string): string {
  return kind === ImageKind.ICON_SET ? `${cacheKey}/` : `${cacheKey}.png`;
}

export const imageWithRelationsInclude = {
  template: { select: { slug: true, name: true } },
  project: { select: { name: true, publicId: true } },
} satisfies Prisma.ImageInclude;

type ImageWithRelations = Prisma.ImageGetPayload<{ include: typeof imageWithRelationsInclude }>;

function assetsFrom(assets: Prisma.JsonValue | null): ImageAsset[] | null {
  if (!assets || !Array.isArray(assets)) return null;
  return assets as unknown as ImageAsset[];
}

export function toImageItem(row: ImageWithRelations): ImageItem {
  return {
    id: row.id,
    sourceUrl: row.sourceUrl,
    imageUrl: row.imageUrl,
    cdnUrl: row.cdnUrl,
    title: row.title,
    description: row.description,
    faviconUrl: row.faviconUrl,
    kind: fromPrismaImageKind(row.kind),
    category: row.category,
    template: row.template ? { slug: row.template.slug, name: row.template.name } : null,
    projectId: row.projectId,
    projectName: row.project?.name ?? null,
    publicProjectId: row.project?.publicId ?? null,
    aiModel: row.aiModel,
    generatedOnPlan: row.generatedOnPlan,
    width: row.width,
    height: row.height,
    format: row.format,
    generationMs: row.generationMs,
    serveCount: row.serveCount,
    assets: assetsFrom(row.assets),
    createdAt: row.createdAt,
  };
}

export function assetsFromImage(image: Image): ImageAsset[] | null {
  return assetsFrom(image.assets);
}
