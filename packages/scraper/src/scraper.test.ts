import { describe, it, expect } from 'vitest';
import { validateUrl } from '@ogstack/shared';

describe('scraper SSRF protection', () => {
  it('rejects localhost URLs', () => {
    expect(validateUrl('http://localhost:3000')).toMatchObject({ valid: false });
  });

  it('rejects private IP ranges', () => {
    expect(validateUrl('http://192.168.1.1')).toMatchObject({ valid: false });
    expect(validateUrl('http://10.0.0.1')).toMatchObject({ valid: false });
  });

  it('allows public URLs', () => {
    expect(validateUrl('https://example.com')).toEqual({ valid: true });
  });
});
