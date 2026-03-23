import type { ReactElement } from "react";
import { render } from "@react-email/render";

const templates: Record<string, ReactElement> = {};

const name = process.argv[2];

if (!name || !templates[name]) {
  console.log("Usage: bun run scripts/preview-email.tsx <template>\n");
  console.log("Templates:", Object.keys(templates).join(", ") || "(none registered)");
  process.exit(1);
}

const html = await render(templates[name]);
const outPath = `./scripts/preview-${name}.html`;
await Bun.write(outPath, html);
console.log(`Written to ${outPath} — open in browser to preview`);
