import Anthropic from '@anthropic-ai/sdk';
import type { JudgeVerdict, EvalScore, ScrapedPageContext } from '@ogstack/shared';

const client = new Anthropic();

export async function judgeImage(
  imageBase64: string,
  pageContext: ScrapedPageContext,
  brandPrimaryColor: string | null,
): Promise<JudgeVerdict> {
  const systemPrompt = `You are an expert OG image quality judge. Evaluate the provided image across 4 dimensions.
Respond ONLY with valid JSON matching the JudgeVerdict type. No markdown, no explanation outside JSON.`;

  const userMessage = `
Evaluate this Open Graph image for the page: ${pageContext.url}
Page title: ${pageContext.title}
Page description: ${pageContext.description}
Brand primary color: ${brandPrimaryColor ?? 'not specified'}

Score each dimension 0.0–1.0:
- legibility: Is the text readable? Good contrast?
- brandMatch: Does it match the brand color and style?
- accuracy: Does it visually represent the page content?
- layout: Is the 1200×630 space used well? Professional composition?

Return JSON:
{
  "score": {
    "legibility": number,
    "brandMatch": number,
    "accuracy": number,
    "layout": number,
    "overall": number
  },
  "rationale": string,
  "pass": boolean,
  "suggestions": string[]
}`;

  const message = await client.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 1024,
    messages: [
      {
        role: 'user',
        content: [
          {
            type: 'image',
            source: {
              type: 'base64',
              media_type: 'image/png',
              data: imageBase64,
            },
          },
          { type: 'text', text: userMessage },
        ],
      },
    ],
    system: systemPrompt,
  });

  const text = message.content[0];
  if (text?.type !== 'text') {
    throw new Error('Unexpected response type from Claude');
  }

  const verdict: JudgeVerdict = JSON.parse(text.text) as JudgeVerdict;
  return verdict;
}
