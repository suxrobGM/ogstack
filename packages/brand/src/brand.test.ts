import { describe, it, expect } from 'vitest';
import { BrandConfigSchema } from './brand-service.js';

describe('BrandConfigSchema', () => {
  it('accepts valid brand config', () => {
    const result = BrandConfigSchema.safeParse({
      primaryColor: '#ff0000',
      secondaryColor: '#ffffff',
      accentColor: '#00ff00',
      fontFamily: 'Inter',
      logoUrl: null,
      style: 'modern',
    });
    expect(result.success).toBe(true);
  });

  it('rejects invalid hex color', () => {
    const result = BrandConfigSchema.safeParse({
      primaryColor: 'red',
    });
    expect(result.success).toBe(false);
  });

  it('rejects invalid style', () => {
    const result = BrandConfigSchema.safeParse({
      style: 'neon',
    });
    expect(result.success).toBe(false);
  });

  it('uses defaults when fields are omitted', () => {
    const result = BrandConfigSchema.parse({});
    expect(result.primaryColor).toBe('#000000');
    expect(result.style).toBe('modern');
  });
});
