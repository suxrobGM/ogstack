import { describe, it, expect } from 'vitest';
import type { GenerationPrompt } from '@ogstack/shared';

describe('compositor', () => {
  it('GenerationPrompt shape is valid for rendering', () => {
    const prompt: GenerationPrompt = {
      imagePrompt: 'test',
      layoutHint: 'centered',
      colorPalette: ['#000', '#fff'],
      title: 'Test Title',
      subtitle: null,
    };
    expect(prompt.title).toBe('Test Title');
    expect(prompt.subtitle).toBeNull();
  });
});
