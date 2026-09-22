// design-tokens/pull.mjs
// Pulls local variables from Figma into tokens.json.
// Needs FIGMA_TOKEN (personal access token with file_variables:read).
// NOTE: Figma's Variables REST API is Enterprise-only. On other plans this
// returns 403. Use the MCP export described in design-tokens/README.md instead.
import { writeFileSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const FILE = process.env.FIGMA_FILE_KEY ?? "43WfRGUtWOHJa3Q7fAZFj7";
const TOKEN = process.env.FIGMA_TOKEN;
if (!TOKEN) { console.error("Set FIGMA_TOKEN first."); process.exit(1); }

const res = await fetch(`https://api.figma.com/v1/files/${FILE}/variables/local`, { headers: { "X-Figma-Token": TOKEN } });
if (res.status === 403) { console.error("403 from Figma. The Variables REST API needs an Enterprise plan. See design-tokens/README.md."); process.exit(1); }
if (!res.ok) { console.error(`Figma returned ${res.status}`); process.exit(1); }
const { meta } = await res.json();

const hex = ({ r, g, b }) => "#" + [r, g, b].map((x) => Math.round(x * 255).toString(16).padStart(2, "0")).join("").toUpperCase();
const vars = meta.variables;
const collections = {};
for (const c of Object.values(meta.variableCollections)) {
  const modeName = Object.fromEntries(c.modes.map((m) => [m.modeId, m.name]));
  const tokens = {};
  for (const id of c.variableIds) {
    const v = vars[id];
    const values = {};
    for (const [mid, val] of Object.entries(v.valuesByMode)) {
      values[modeName[mid]] = val?.type === "VARIABLE_ALIAS" ? { alias: vars[val.id].name }
        : v.resolvedType === "COLOR" ? hex(val) : val;
    }
    tokens[v.name] = { type: v.resolvedType, values };
  }
  collections[c.name] = { modes: c.modes.map((m) => m.name), tokens };
}

// Effects and text styles are not in the variables API; keep the last export's.
const path = join(dirname(fileURLToPath(import.meta.url)), "tokens.json");
const prev = JSON.parse(readFileSync(path, "utf8"));
writeFileSync(path, JSON.stringify({ source: { file: FILE, exportedAt: new Date().toISOString().slice(0, 10) }, collections, effects: prev.effects, text: prev.text }, null, 2) + "\n");
console.log(`Pulled ${Object.keys(collections).length} collections.`);
