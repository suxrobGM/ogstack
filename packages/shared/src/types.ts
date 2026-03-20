import { z } from 'zod';

// ─── Scraper ─────────────────────────────────────────────────────────────────

export interface ScrapedPageContext {
  url: string;
  title: string;
  description: string;
  headings: string[];
  bodyText: string;
  existingOgTags: Record<string, string>;
  faviconUrl: string | null;
  dominantColors: string[];
  screenshotBase64: string | null;
}

// ─── AI Pipeline ─────────────────────────────────────────────────────────────

export interface GenerationPrompt {
  imagePrompt: string;
  layoutHint: 'centered' | 'left-aligned' | 'split' | 'minimal';
  colorPalette: string[];
  title: string;
  subtitle: string | null;
}

// ─── Brand ───────────────────────────────────────────────────────────────────

export interface BrandConfig {
  workspaceId: string;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  fontFamily: string;
  logoUrl: string | null;
  style: 'modern' | 'minimal' | 'bold' | 'elegant';
}

// ─── Generation ──────────────────────────────────────────────────────────────

export const GenerationRequestSchema = z.object({
  url: z.string().url(),
  projectId: z.string().optional(),
  forceRegenerate: z.boolean().optional().default(false),
});

export type GenerationRequest = z.infer<typeof GenerationRequestSchema>;

export interface GenerationResult {
  imageUrl: string;
  cached: boolean;
  durationMs: number;
  generationId: string;
}

// ─── Audit ───────────────────────────────────────────────────────────────────

export interface OGAuditResult {
  url: string;
  status: 'pass' | 'fail' | 'warning';
  issues: OGIssue[];
  existingTags: Record<string, string>;
  imageWidth: number | null;
  imageHeight: number | null;
}

export interface OGIssue {
  code: string;
  severity: 'error' | 'warning' | 'info';
  message: string;
}

// ─── Evals ───────────────────────────────────────────────────────────────────

export interface EvalScore {
  legibility: number;   // 0–1
  brandMatch: number;   // 0–1
  accuracy: number;     // 0–1
  layout: number;       // 0–1
  overall: number;      // weighted average
}

export interface JudgeVerdict {
  score: EvalScore;
  rationale: string;
  pass: boolean;
  suggestions: string[];
}

// ─── API Error ───────────────────────────────────────────────────────────────

export interface ApiError {
  error: string;
  code: string;
}

// ─── URL Validation ──────────────────────────────────────────────────────────

const BLOCKED_PATTERNS = [
  /^https?:\/\/127\./,
  /^https?:\/\/10\./,
  /^https?:\/\/172\.(1[6-9]|2\d|3[01])\./,
  /^https?:\/\/192\.168\./,
  /^https?:\/\/169\.254\./,
  /^https?:\/\/localhost/i,
  /^file:\/\//i,
  /^ftp:\/\//i,
];

export function validateUrl(url: string): { valid: boolean; reason?: string } {
  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    return { valid: false, reason: 'Invalid URL format' };
  }

  if (!['http:', 'https:'].includes(parsed.protocol)) {
    return { valid: false, reason: `Disallowed protocol: ${parsed.protocol}` };
  }

  for (const pattern of BLOCKED_PATTERNS) {
    if (pattern.test(url)) {
      return { valid: false, reason: 'URL resolves to a blocked address range' };
    }
  }

  return { valid: true };
}
