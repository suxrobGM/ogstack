import { describe, it, expect } from 'vitest';
import { validateUrl } from './validate-url.js';

// ─── Group A: Valid public URLs (should PASS) ────────────────────────────────

describe('validateUrl — valid public URLs', () => {
  it('allows basic HTTPS', () => {
    expect(validateUrl('https://example.com')).toEqual({ valid: true });
  });

  it('allows HTTP with path and query', () => {
    expect(validateUrl('http://example.com/path?q=1')).toEqual({ valid: true });
  });

  it('allows subdomains', () => {
    expect(validateUrl('https://sub.domain.example.com')).toEqual({ valid: true });
  });

  it('allows public IPv4', () => {
    expect(validateUrl('https://93.184.216.34')).toEqual({ valid: true });
  });

  it('allows non-standard port', () => {
    expect(validateUrl('https://example.com:8443/path')).toEqual({ valid: true });
  });
});

// ─── Group B: Malformed URLs (should REJECT) ─────────────────────────────────

describe('validateUrl — malformed URLs', () => {
  it('rejects no-scheme string', () => {
    expect(validateUrl('not-a-url')).toMatchObject({ valid: false });
  });

  it('rejects empty string', () => {
    expect(validateUrl('')).toMatchObject({ valid: false });
  });

  it('rejects missing scheme', () => {
    expect(validateUrl('://missing-scheme')).toMatchObject({ valid: false });
  });

  it('rejects scheme-only with no host', () => {
    expect(validateUrl('http://')).toMatchObject({ valid: false });
  });
});

// ─── Group C: Blocked protocols (should REJECT) ──────────────────────────────

describe('validateUrl — blocked protocols', () => {
  it('rejects file://', () => {
    expect(validateUrl('file:///etc/passwd')).toMatchObject({ valid: false });
  });

  it('rejects ftp://', () => {
    expect(validateUrl('ftp://example.com/file')).toMatchObject({ valid: false });
  });

  it('rejects javascript:', () => {
    expect(validateUrl('javascript:alert(1)')).toMatchObject({ valid: false });
  });

  it('rejects data:', () => {
    expect(validateUrl('data:text/html,<h1>hi</h1>')).toMatchObject({ valid: false });
  });
});

// ─── Group D: Localhost (should REJECT) ──────────────────────────────────────

describe('validateUrl — localhost', () => {
  it('rejects bare localhost', () => {
    expect(validateUrl('http://localhost')).toMatchObject({ valid: false });
  });

  it('rejects localhost with port', () => {
    expect(validateUrl('http://localhost:3000')).toMatchObject({ valid: false });
  });

  it('rejects uppercase LOCALHOST', () => {
    expect(validateUrl('http://LOCALHOST')).toMatchObject({ valid: false });
  });
});

// ─── Group E: 127.x loopback (should REJECT) ────────────────────────────────

describe('validateUrl — 127.x loopback', () => {
  it('rejects 127.0.0.1', () => {
    expect(validateUrl('http://127.0.0.1')).toMatchObject({ valid: false });
  });

  it('rejects 127.0.0.1 with port', () => {
    expect(validateUrl('http://127.0.0.1:8080')).toMatchObject({ valid: false });
  });

  it('rejects 127.255.255.255 (end of /8)', () => {
    expect(validateUrl('http://127.255.255.255')).toMatchObject({ valid: false });
  });

  it('rejects short-form 127.1', () => {
    expect(validateUrl('http://127.1')).toMatchObject({ valid: false });
  });
});

// ─── Group F: 10.x private range (should REJECT) ────────────────────────────

describe('validateUrl — 10.x private range', () => {
  it('rejects 10.0.0.1', () => {
    expect(validateUrl('http://10.0.0.1')).toMatchObject({ valid: false });
  });

  it('rejects 10.255.255.255', () => {
    expect(validateUrl('http://10.255.255.255')).toMatchObject({ valid: false });
  });
});

// ─── Group G: 172.16-31.x private range ──────────────────────────────────────

describe('validateUrl — 172.16-31.x private range', () => {
  it('rejects 172.16.0.1 (start of range)', () => {
    expect(validateUrl('http://172.16.0.1')).toMatchObject({ valid: false });
  });

  it('rejects 172.31.255.255 (end of range)', () => {
    expect(validateUrl('http://172.31.255.255')).toMatchObject({ valid: false });
  });

  it('allows 172.15.0.1 (below range)', () => {
    expect(validateUrl('http://172.15.0.1')).toEqual({ valid: true });
  });

  it('allows 172.32.0.1 (above range)', () => {
    expect(validateUrl('http://172.32.0.1')).toEqual({ valid: true });
  });
});

// ─── Group H: 192.168.x private range (should REJECT) ───────────────────────

describe('validateUrl — 192.168.x private range', () => {
  it('rejects 192.168.0.1', () => {
    expect(validateUrl('http://192.168.0.1')).toMatchObject({ valid: false });
  });

  it('rejects 192.168.255.255', () => {
    expect(validateUrl('http://192.168.255.255')).toMatchObject({ valid: false });
  });
});

// ─── Group I: Link-local / AWS metadata (should REJECT) ─────────────────────

describe('validateUrl — link-local / AWS metadata', () => {
  it('rejects 169.254.169.254 (AWS metadata)', () => {
    expect(validateUrl('http://169.254.169.254')).toMatchObject({ valid: false });
  });

  it('rejects 169.254.169.254 with path', () => {
    expect(validateUrl('http://169.254.169.254/latest/meta-data/')).toMatchObject({ valid: false });
  });

  it('rejects other link-local 169.254.0.1', () => {
    expect(validateUrl('http://169.254.0.1')).toMatchObject({ valid: false });
  });
});

// ─── Group J: 0.0.0.0 (should REJECT) ───────────────────────────────────────

describe('validateUrl — 0.0.0.0', () => {
  it('rejects 0.0.0.0', () => {
    expect(validateUrl('http://0.0.0.0')).toMatchObject({ valid: false });
  });
});

// ─── Group K: Encoding bypasses (should REJECT — URL constructor normalizes) ─

describe('validateUrl — encoding bypasses', () => {
  it('rejects hex-encoded 127.0.0.1 (0x7f000001)', () => {
    expect(validateUrl('http://0x7f000001')).toMatchObject({ valid: false });
  });

  it('rejects decimal-encoded 127.0.0.1 (2130706433)', () => {
    expect(validateUrl('http://2130706433')).toMatchObject({ valid: false });
  });

  it('rejects octal-encoded 127.0.0.1 (0177.0.0.1)', () => {
    expect(validateUrl('http://0177.0.0.1')).toMatchObject({ valid: false });
  });

  it('rejects URL-encoded 127.0.0.1 (%31%32%37.0.0.1)', () => {
    expect(validateUrl('http://%31%32%37.0.0.1')).toMatchObject({ valid: false });
  });
});

// ─── Group L: IPv6 loopback (should REJECT) ──────────────────────────────────

describe('validateUrl — IPv6 loopback', () => {
  it('rejects [::1]', () => {
    expect(validateUrl('http://[::1]')).toMatchObject({ valid: false });
  });

  it('rejects [::1] with port', () => {
    expect(validateUrl('http://[::1]:8080')).toMatchObject({ valid: false });
  });

  it('rejects expanded [0:0:0:0:0:0:0:1]', () => {
    expect(validateUrl('http://[0:0:0:0:0:0:0:1]')).toMatchObject({ valid: false });
  });
});

// ─── Group M: IPv6 link-local (should REJECT) ───────────────────────────────

describe('validateUrl — IPv6 link-local', () => {
  it('rejects [fe80::1]', () => {
    expect(validateUrl('http://[fe80::1]')).toMatchObject({ valid: false });
  });
});

// ─── Group N: IPv4-mapped IPv6 ───────────────────────────────────────────────

describe('validateUrl — IPv4-mapped IPv6', () => {
  it('rejects [::ffff:127.0.0.1]', () => {
    expect(validateUrl('http://[::ffff:127.0.0.1]')).toMatchObject({ valid: false });
  });

  it('rejects [::ffff:7f00:1] (pre-normalized)', () => {
    expect(validateUrl('http://[::ffff:7f00:1]')).toMatchObject({ valid: false });
  });

  it('rejects [::ffff:10.0.0.1]', () => {
    expect(validateUrl('http://[::ffff:10.0.0.1]')).toMatchObject({ valid: false });
  });

  it('rejects [::ffff:192.168.1.1]', () => {
    expect(validateUrl('http://[::ffff:192.168.1.1]')).toMatchObject({ valid: false });
  });

  it('rejects [::ffff:172.16.0.1]', () => {
    expect(validateUrl('http://[::ffff:172.16.0.1]')).toMatchObject({ valid: false });
  });

  it('rejects [::ffff:169.254.169.254] (AWS metadata via IPv6)', () => {
    expect(validateUrl('http://[::ffff:169.254.169.254]')).toMatchObject({ valid: false });
  });

  it('allows [::ffff:93.184.216.34] (public IP)', () => {
    expect(validateUrl('http://[::ffff:93.184.216.34]')).toEqual({ valid: true });
  });
});
