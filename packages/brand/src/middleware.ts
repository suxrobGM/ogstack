import type { BrandConfig } from '@ogstack/shared';
import { getBrandConfig } from './brand-service.js';

export async function resolveBrand(
  workspaceId: string | null,
): Promise<BrandConfig | null> {
  if (!workspaceId) return null;
  return getBrandConfig(workspaceId);
}

export function getDefaultBrand(): BrandConfig {
  return {
    workspaceId: 'default',
    primaryColor: '#0f0f0f',
    secondaryColor: '#ffffff',
    accentColor: '#0070f3',
    fontFamily: 'Inter',
    logoUrl: null,
    style: 'modern',
  };
}
