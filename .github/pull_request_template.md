## What changed

<!-- One or two sentences. Which screen or state, and why. -->

## Screens and states

<!-- Link the preview for each state this PR touches, e.g. /reports/demo-blocked -->
- [ ] Preview link for every state touched
- [ ] Loading, empty, error and degraded variants exist where they apply

## For any screen a paying customer can reach

- [ ] Says where the report is
- [ ] Says where the $1,500 is (a `<Note>`), if money is involved
- [ ] Says what happens next with no action from them

## Checks

- [ ] No raw colours or pixel values (CI enforces this)
- [ ] Delivery times come from `lib/orders/sla.ts`, never typed by hand
- [ ] `design-tokens/tokens.json` untouched, unless this is a token-only PR
- [ ] Copy reads naturally to a small business owner. No jargon.
