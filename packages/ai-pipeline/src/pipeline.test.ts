import { describe, it, expect } from 'vitest';
import type { ScrapedPageContext, GenerationPrompt } from '@ogstack/shared';

describe('ai-pipeline types', () => {
  it('GenerationPrompt has required fields', () => {
    const prompt: GenerationPrompt = {
      imagePrompt: 'A modern tech company dashboard with blue accents',
      layoutHint: 'centered',
      colorPalette: ['#0070f3', '#ffffff', '#000000'],
      title: 'My SaaS Product',
      subtitle: 'The best tool for developers',
    };

    expect(prompt.imagePrompt).toBeTruthy();
    expect(['centered', 'left-aligned', 'split', 'minimal']).toContain(prompt.layoutHint);
    expect(prompt.colorPalette.length).toBeGreaterThan(0);
  });

  it('ScrapedPageContext has required fields', () => {
    const ctx: ScrapedPageContext = {
      url: 'https://example.com',
      title: 'Example',
      description: 'An example page',
      headings: ['Hello World'],
      bodyText: 'Some text content',
      existingOgTags: {},
      faviconUrl: null,
      dominantColors: [],
      screenshotBase64: null,
    };

    expect(ctx.url).toBe('https://example.com');
  });
});
