# Design tokens

`tokens.json` is an export of the Figma variables in file `43WfRGUtWOHJa3Q7fAZFj7`. It's the only place design values enter the repo.

```
Figma variables ─▶ tokens.json ─▶ npm run tokens:build ─▶ styles/tokens.css + styles/typography.css ─▶ Tailwind @theme
```

## Collections

| Collection | What | Modes |
|---|---|---|
| `1. Primitives` | Raw colour ramps. Never used directly. | Value |
| `2. Semantic` | `surface/*`, `border/*`, `text/*`, `action/*`, `status/*` | App (light), Marketing (dark) |
| `3. Scale` | spacing, radius, sizes, font sizes, line heights, layout | Value |
| `4. Component` | button, input, card, chip, modal, nav, rail | Value |

Numbered collections are canonical. Any collection without a number prefix is emitted under `--legacy-*` so it can't collide with or override the real system. The build warns when that happens.

The second mode of any collection becomes a `[data-theme="..."]` block. `Marketing (dark)` becomes `[data-theme="marketing"]`.

## Updating tokens

**Option A: Figma REST API.** `FIGMA_TOKEN=... npm run tokens:pull`. The Variables REST API is Enterprise-only. On other plans it returns 403.

**Option B: Figma MCP (any plan).** Ask Claude, with the Figma connector enabled, to "export the local variables, effect styles and text styles from file 43WfRGUtWOHJa3Q7fAZFj7 into design-tokens/tokens.json using the existing schema". Then run `npm run tokens:build`.

Either way, commit `tokens.json` and the regenerated `styles/` files in a PR on their own.

## Never

- Edit `styles/tokens.css` or `styles/typography.css` by hand. They're overwritten on every build and CI fails if they drift.
- Add a colour in a component. Add it in Figma.
