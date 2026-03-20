import { describe, it, expect } from 'vitest';
import { validateUrl } from './types.js';

describe('validateUrl', () => {
  it('allows public HTTPS URLs', () => {
    expect(validateUrl('https://example.com')).toEqual({ valid: true });
  });

  it('allows public HTTP URLs', () => {
    expect(validateUrl('http://example.com/path')).toEqual({ valid: true });
  });

  it('blocks localhost', () => {
    const result = validateUrl('http://localhost:3000');
    expect(result.valid).toBe(false);
  });

  it('blocks 127.x', () => {
    expect(validateUrl('http://127.0.0.1')).toMatchObject({ valid: false });
  });

  it('blocks 10.x private range', () => {
    expect(validateUrl('http://10.0.0.1')).toMatchObject({ valid: false });
  });

  it('blocks 192.168.x', () => {
    expect(validateUrl('http://192.168.1.1')).toMatchObject({ valid: false });
  });

  it('blocks AWS metadata IP', () => {
    expect(validateUrl('http://169.254.169.254')).toMatchObject({ valid: false });
  });

  it('blocks file:// protocol', () => {
    expect(validateUrl('file:///etc/passwd')).toMatchObject({ valid: false });
  });

  it('blocks ftp:// protocol', () => {
    expect(validateUrl('ftp://example.com')).toMatchObject({ valid: false });
  });

  it('rejects malformed URL', () => {
    expect(validateUrl('not-a-url')).toMatchObject({ valid: false });
  });
});
