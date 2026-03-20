import { describe, it, expect } from 'vitest';
import { buildCacheKey, buildImageKey } from './index.js';

describe('buildCacheKey', () => {
  it('returns a stable key for the same URL', () => {
    const key1 = buildCacheKey('https://example.com/page');
    const key2 = buildCacheKey('https://example.com/page');
    expect(key1).toBe(key2);
  });

  it('returns different keys for different URLs', () => {
    expect(buildCacheKey('https://example.com/a')).not.toBe(
      buildCacheKey('https://example.com/b'),
    );
  });

  it('starts with og: prefix', () => {
    expect(buildCacheKey('https://example.com')).toMatch(/^og:/);
  });
});

describe('buildImageKey', () => {
  it('includes the workspaceId', () => {
    const key = buildImageKey('ws_123', 'https://example.com');
    expect(key).toMatch(/^ws_123\//);
  });

  it('ends with .png', () => {
    const key = buildImageKey('ws_123', 'https://example.com');
    expect(key).toMatch(/\.png$/);
  });
});
