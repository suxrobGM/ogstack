import type { EvalScore } from '@ogstack/shared';

const WEIGHTS = {
  legibility: 0.35,
  brandMatch: 0.2,
  accuracy: 0.3,
  layout: 0.15,
};

export function computeOverallScore(scores: Omit<EvalScore, 'overall'>): EvalScore {
  const overall =
    scores.legibility * WEIGHTS.legibility +
    scores.brandMatch * WEIGHTS.brandMatch +
    scores.accuracy * WEIGHTS.accuracy +
    scores.layout * WEIGHTS.layout;

  return { ...scores, overall: Math.round(overall * 100) / 100 };
}

export function scoreToGrade(score: number): 'A' | 'B' | 'C' | 'D' | 'F' {
  if (score >= 0.9) return 'A';
  if (score >= 0.8) return 'B';
  if (score >= 0.7) return 'C';
  if (score >= 0.6) return 'D';
  return 'F';
}
