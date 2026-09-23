import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const HEX = String.raw`#[0-9a-fA-F]{3,8}\b`;
const RAW_COLOUR = String.raw`\b(rgba?|hsla?|oklch)\(`;
const ARBITRARY_PX = String.raw`-\[\d+px\]`;
// `p-[var(--card-padding)]` has a utility now (`p-card`). See styles/globals.css.
const ARBITRARY_VAR = String.raw`(?:^|\s)[a-z:-]+-\[var\(--`;

const tokenMessage = "Use a token. Raw colours and pixel values live in Figma and styles/tokens.css, not in components.";

const config = [
  ...nextVitals,
  ...nextTs,
  { ignores: [".next/**", "node_modules/**", "styles/tokens.css", "styles/typography.css", "next-env.d.ts"] },
  {
    // The token wall. Components and routes may not invent visual values.
    files: ["components/**/*.{ts,tsx}", "app/**/*.{ts,tsx}"],
    rules: {
      "no-restricted-syntax": [
        "error",
        { selector: `Literal[value=/${HEX}/]`, message: tokenMessage },
        { selector: `TemplateElement[value.raw=/${HEX}/]`, message: tokenMessage },
        { selector: `Literal[value=/${RAW_COLOUR}/]`, message: tokenMessage },
        { selector: `Literal[value=/${ARBITRARY_PX}/]`, message: tokenMessage },
        { selector: `Literal[value=/${ARBITRARY_VAR}/]`, message: "Use the token utility (p-card, h-control-md, max-w-rail …) instead of [var(--…)]. Add one in styles/globals.css if it is missing." },
      ],
      "no-restricted-imports": ["error", {
        patterns: [{ group: ["@/lib/orders/fixtures"], importNames: ["FIXTURES"], message: "Fixtures are for the dev gallery and tests only." }],
      }],
    },
  },
  {
    files: ["app/dev/**", "**/*.test.ts"],
    rules: { "no-restricted-imports": "off" },
  },
  {
    // ui/ is the bottom layer. It may not reach up into blocks, states or app.
    files: ["components/ui/**"],
    rules: {
      "no-restricted-imports": ["error", { patterns: ["@/components/blocks/*", "@/components/states/*", "@/app/*"] }],
    },
  },
];

export default config;
