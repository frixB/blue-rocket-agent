# Blue Rocket Agents

A full SEO report for small businesses. $1,500 flat, delivered within one business day (Mon to Fri).

This repo is built code-first. Screens are designed directly in React against design tokens exported from Figma. Figma holds the tokens and the visual reference; it isn't where screens get finished.

## Start

```bash
nvm use            # Node 22
npm install
npm run dev        # http://localhost:3000
```

Every order state has a fixture. Open `/dev/states` locally to click through all of them.

## Scripts

| | |
|---|---|
| `npm run dev` | Local dev server |
| `npm run check` | Tokens, typecheck, lint, tests. Run before every PR. |
| `npm run build` | Production build |
| `npm run tokens:build` | Regenerate CSS from `design-tokens/tokens.json` |
| `npm test` | Unit tests, including the business-day SLA maths |

## Where things live

```
app/                 routes. Fetch data, compose blocks. No styling decisions.
components/ui/       primitives. The only place visual styling lives.
components/blocks/   composed pieces: progress rail, order summary, delivery promise
components/states/   one screen per order state, behind an exhaustive switch
lib/orders/          status union, state machine, SLA maths, types, fixtures
design-tokens/       Figma export and the build script
styles/              generated token CSS + the Tailwind theme
docs/                architecture.md
```

## Read next

- `docs/architecture.md` for how it all fits together
- `CONTRIBUTING.md` for branches, reviews and building screens with an AI agent
- `design-tokens/README.md` for updating tokens
