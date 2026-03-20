import { z } from 'zod';
import type { BrandConfig } from '@ogstack/shared';
import { PrismaClient } from '@ogstack/shared';

const prisma = new PrismaClient();

export const BrandConfigSchema = z.object({
  primaryColor: z.string().regex(/^#[0-9a-fA-F]{6}$/).default('#000000'),
  secondaryColor: z.string().regex(/^#[0-9a-fA-F]{6}$/).default('#ffffff'),
  accentColor: z.string().regex(/^#[0-9a-fA-F]{6}$/).default('#0070f3'),
  fontFamily: z.string().min(1).max(100).default('Inter'),
  logoUrl: z.string().url().nullable().default(null),
  style: z.enum(['modern', 'minimal', 'bold', 'elegant']).default('modern'),
});

export type BrandConfigInput = z.infer<typeof BrandConfigSchema>;

export async function getBrandConfig(workspaceId: string): Promise<BrandConfig | null> {
  const config = await prisma.brandConfig.findUnique({
    where: { workspaceId },
  });

  if (!config) return null;

  return {
    workspaceId: config.workspaceId,
    primaryColor: config.primaryColor,
    secondaryColor: config.secondaryColor,
    accentColor: config.accentColor,
    fontFamily: config.fontFamily,
    logoUrl: config.logoUrl,
    style: config.style as BrandConfig['style'],
  };
}

export async function upsertBrandConfig(
  workspaceId: string,
  input: BrandConfigInput,
): Promise<BrandConfig> {
  const data = BrandConfigSchema.parse(input);

  const config = await prisma.brandConfig.upsert({
    where: { workspaceId },
    create: { workspaceId, ...data },
    update: data,
  });

  return {
    workspaceId: config.workspaceId,
    primaryColor: config.primaryColor,
    secondaryColor: config.secondaryColor,
    accentColor: config.accentColor,
    fontFamily: config.fontFamily,
    logoUrl: config.logoUrl,
    style: config.style as BrandConfig['style'],
  };
}

export async function deleteBrandConfig(workspaceId: string): Promise<void> {
  await prisma.brandConfig.deleteMany({ where: { workspaceId } });
}
