import { describe, it, expect } from 'vitest';
import { computeOverallScore, scoreToGrade } from './scorer.js';

describe('computeOverallScore', () => {
  it('computes weighted average correctly', () => {
    const result = computeOverallScore({
      legibility: 1.0,
      brandMatch: 1.0,
      accuracy: 1.0,
      layout: 1.0,
    });
    expect(result.overall).toBe(1.0);
  });

  it('weights legibility highest', () => {
    const highLeg = computeOverallScore({ legibility: 1, brandMatch: 0, accuracy: 0, layout: 0 });
    const highBrand = computeOverallScore({ legibility: 0, brandMatch: 1, accuracy: 0, layout: 0 });
    expect(highLeg.overall).toBeGreaterThan(highBrand.overall);
  });
});

describe('scoreToGrade', () => {
  it('gives A for >= 0.9', () => expect(scoreToGrade(0.95)).toBe('A'));
  it('gives B for >= 0.8', () => expect(scoreToGrade(0.85)).toBe('B'));
  it('gives F for < 0.6', () => expect(scoreToGrade(0.5)).toBe('F'));
});
