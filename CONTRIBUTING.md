# Contributing

Short version: branch from `main`, keep it small, open a PR, get it reviewed on the preview, merge.

## Branches

Never commit to `main`. It's protected: CI must pass and one person must approve.

Name branches after the spec so anything can be traced back:

```
feat/s08-crawler-blocked
feat/s16-dashboard-empty
fix/s11-late-timer
chore/tokens-2026-09-22
```

One screen or one state group per branch. Not one phase per branch. If a branch lives longer than two or three days it starts fighting token changes, and token changes touch every component. Merge small and often.

Hotfixes branch from `main` and merge back to `main`. There is no `develop` or release branch. We have one environment and a small team, so git flow would be pure overhead.

## Reviewing a screen

Review on the Vercel preview, not in Figma. Every PR gets its own URL. Set `NEXT_PUBLIC_SHOW_STATE_GALLERY=true` on preview deployments and `/dev/states` lists every order state as a clickable link, so Carlos can check them on his phone without touching Stripe.

## Tokens

Design values come from Figma, never from a component.

1. Change the variable in Figma.
2. Export it (see `design-tokens/README.md`).
3. Run `npm run tokens:build`.
4. Commit `tokens.json` and the generated `styles/` files together, **in their own PR**, with nothing else.

CI fails a PR that changes `tokens.json` alongside feature files. The diff should be readable on its own, and a token quietly edited to make one screen look right breaks every other screen.

## Building a screen with an AI agent

Give the agent four things, every time:

1. The state: a member of `OrderStatus`, or a named page like `billing`.
2. The data type it receives. The real TypeScript type, not a description.
3. The three answers: where the report is, where the money is, what happens next unattended.
4. The Figma node for the matching state, if one exists.

And these rules, word for word:

```
Compose from components/ui and components/blocks. Do not write new visual styling.
If a primitive you need doesn't exist, stop and propose it. Do not inline it.
No hex, rgb, hsl or arbitrary px values. Token classes only.
No dark: variants. Theme comes from data-theme on the layout.
Plain language, for a small business owner, not a developer.
Every failure state says what happened to the money, in a <Note>.
Never invent a delivery time. Call lib/orders/sla.
```

## Before you open a PR

```bash
npm run check   # tokens, typecheck, lint, tests
npm run build
```
