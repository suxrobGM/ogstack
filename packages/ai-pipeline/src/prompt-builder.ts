import Anthropic from '@anthropic-ai/sdk';
import type { ScrapedPageContext, BrandConfig, GenerationPrompt } from '@ogstack/shared';

const client = new Anthropic();

export async function buildGenerationPrompt(
  page: ScrapedPageContext,
  brand: BrandConfig | null,
): Promise<GenerationPrompt> {
  const systemPrompt = `You are an expert UI/UX designer specializing in Open Graph social preview images.
Given page context and optional brand config, output a JSON GenerationPrompt.
Respond ONLY with valid JSON, no markdown fences.`;

  const userMessage = `
Page URL: ${page.url}
Title: ${page.title}
Description: ${page.description}
Headings: ${page.headings.join(' | ')}
Body excerpt: ${page.bodyText.slice(0, 500)}
${brand ? `Brand: primaryColor=${brand.primaryColor} fontFamily=${brand.fontFamily} style=${brand.style}` : 'No brand config.'}

Return JSON matching this TypeScript type:
{
  imagePrompt: string;       // Flux image generation prompt, vivid, 50-100 words
  layoutHint: "centered" | "left-aligned" | "split" | "minimal";
  colorPalette: string[];    // 3-5 hex colors
  title: string;             // display title, max 60 chars
  subtitle: string | null;   // supporting text, max 80 chars
}`;

  const message = await client.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 512,
    messages: [{ role: 'user', content: userMessage }],
    system: systemPrompt,
  });

  const text = message.content[0];
  if (text?.type !== 'text') {
    throw new Error('Unexpected response type from Claude');
  }

  const parsed: GenerationPrompt = JSON.parse(text.text) as GenerationPrompt;
  return parsed;
}
