import satori from 'satori';
import { Resvg } from '@resvg/resvg-js';
import type { GenerationPrompt, BrandConfig } from '@ogstack/shared';
import { createElement } from 'react';

const WIDTH = 1200;
const HEIGHT = 630;

function OGImageTemplate(props: {
  prompt: GenerationPrompt;
  brand: BrandConfig | null;
  backgroundImageUrl?: string;
}) {
  const { prompt, brand, backgroundImageUrl } = props;
  const bg = brand?.primaryColor ?? '#0f0f0f';
  const fg = brand?.secondaryColor ?? '#ffffff';
  const accent = brand?.accentColor ?? '#0070f3';
  const font = brand?.fontFamily ?? 'Inter';

  return createElement(
    'div',
    {
      style: {
        width: WIDTH,
        height: HEIGHT,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'flex-end',
        alignItems: 'flex-start',
        padding: 80,
        background: backgroundImageUrl
          ? `url(${backgroundImageUrl})`
          : `linear-gradient(135deg, ${bg} 0%, ${accent} 100%)`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        fontFamily: font,
        position: 'relative',
      },
    },
    createElement('div', {
      style: {
        position: 'absolute',
        inset: 0,
        background: 'linear-gradient(to top, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.1) 60%)',
      },
    }),
    createElement(
      'div',
      { style: { position: 'relative', zIndex: 1 } },
      createElement(
        'h1',
        {
          style: {
            margin: 0,
            fontSize: 64,
            fontWeight: 700,
            color: fg,
            lineHeight: 1.1,
            maxWidth: 900,
          },
        },
        prompt.title,
      ),
      prompt.subtitle
        ? createElement(
            'p',
            {
              style: {
                margin: '16px 0 0',
                fontSize: 28,
                color: `${fg}cc`,
                maxWidth: 700,
              },
            },
            prompt.subtitle,
          )
        : null,
    ),
  );
}

export async function renderOGImage(
  prompt: GenerationPrompt,
  brand: BrandConfig | null,
  backgroundImageUrl?: string,
): Promise<Buffer> {
  const svg = await satori(
    createElement(OGImageTemplate, {
      prompt,
      brand,
      ...(backgroundImageUrl !== undefined ? { backgroundImageUrl } : {}),
    }),
    {
      width: WIDTH,
      height: HEIGHT,
      fonts: [],
    },
  );

  const resvg = new Resvg(svg, {
    fitTo: { mode: 'width', value: WIDTH },
  });

  return Buffer.from(resvg.render().asPng());
}
