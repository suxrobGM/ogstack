const NAMED_ENTITIES: Record<string, string> = {
  amp: "&",
  lt: "<",
  gt: ">",
  quot: '"',
  apos: "'",
  nbsp: "\u00A0",
  copy: "\u00A9",
  reg: "\u00AE",
  trade: "\u2122",
  hellip: "\u2026",
  mdash: "\u2014",
  ndash: "\u2013",
  lsquo: "\u2018",
  rsquo: "\u2019",
  ldquo: "\u201C",
  rdquo: "\u201D",
};

/**
 * Decode HTML entities in a string. Covers the most common named entities plus
 * numeric (decimal and hexadecimal) character references. Unknown named entities
 * are left as-is rather than dropped, so we never silently lose text.
 */
export function decodeHtmlEntities(input: string): string {
  return input.replace(/&(#[xX]?[0-9a-fA-F]+|[a-zA-Z]+);/g, (match, entity: string) => {
    if (entity.startsWith("#x") || entity.startsWith("#X")) {
      const code = parseInt(entity.slice(2), 16);
      return Number.isFinite(code) ? String.fromCodePoint(code) : match;
    }
    if (entity.startsWith("#")) {
      const code = parseInt(entity.slice(1), 10);
      return Number.isFinite(code) ? String.fromCodePoint(code) : match;
    }
    const decoded = NAMED_ENTITIES[entity];
    return decoded ?? match;
  });
}
