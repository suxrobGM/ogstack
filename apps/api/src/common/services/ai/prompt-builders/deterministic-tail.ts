import { SIZE_ANCHOR, type PromptAssetKind } from "./constants";
import { formatPalette } from "./helpers";

/**
 * Appended to LLM-authored (or override) prompt bodies so FLUX always sees an
 * explicit size anchor and exact brand hex palette. LLMs drift on precise hex
 * values — this locks them in even when the model paraphrases.
 */
export function buildDeterministicTail(
  kind: PromptAssetKind,
  palette: string[] | null | undefined,
  accent: string | null | undefined,
): string {
  const parts: string[] = [SIZE_ANCHOR[kind]];
  const paletteLine = formatPalette(palette, accent);
  if (paletteLine) {
    parts.push(paletteLine);
  }
  return parts.join(", ");
}
