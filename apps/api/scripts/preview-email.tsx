import { render } from "@react-email/render";

const templates = {
  
};

const name = process.argv[2] as keyof typeof templates;
const lang = (process.argv[3] as "EN" | "RU" | "UZ") ?? undefined;

if (!name || !templates[name]) {
  console.log("Usage: bun run scripts/preview-email.tsx <template> [lang]\n");
  console.log("Templates:", Object.keys(templates).join(", "));
  console.log("Languages: EN, RU, UZ (default: EN)");
  process.exit(1);
}

let element = templates[name];

// Override lang if provided
if (lang) {
  const props = { ...element.props, lang };
  element = { ...element, props };
}

const html = await render(element);
const outPath = `./scripts/preview-${name}.html`;
await Bun.write(outPath, html);
console.log(`Written to ${outPath} — open in browser to preview`);
