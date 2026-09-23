# Blue Rocket Agents — Architecture

**Version:** 1.1
**Last updated:** 23 September 2026
**Owners:** frixB (build) · Carlos (sales, product)
**Stack:** Next.js 16 App Router · React 19 · TypeScript · Tailwind CSS v4 · Postgres · Stripe

---

> **Repo note, 22 Sep 2026.** The code in this repo is the source of truth where it differs from the examples below. In particular: token CSS names come from `design-tokens/build.mjs` (see `styles/tokens.css`), Tailwind class names are defined in `styles/globals.css`, the default Tailwind palette is switched off, and user-facing copy lives in the state components and is reviewed in the PR diff. Figma's Variables REST API is Enterprise-only, see `design-tokens/README.md` for the MCP route.
>
> **Repo note, 23 Sep 2026.** §4.3 to §5 now describe the code as built: the token-to-utility map, the lint rules, every primitive with its Figma layer and node id, the `/dev/components` gallery, and how to read a Figma screen with the MCP connector. The rest of the document is still the plan; where the repo tree in §3 and the code disagree, the code wins.

## 0. What this document is

This is the contract for building Blue Rocket Agents in code, without prototyping screens in Figma first.

Figma stops being where screens are designed. It becomes one thing only: the **source of truth for design tokens**. Tokens are exported from Figma, compiled into CSS variables, and consumed by Tailwind. Screens, states and flows are written directly as React components by a human or by an AI agent following this document.

If you only read one section, read section 4 (token pipeline) and section 11 (the AI design flow contract). Everything else supports those two.

---

## 1. Why code-first

The MVP was designed in Figma and shipped 8 artboards. Extending it to cover real states took 26 more artboards and 4 rounds of cloning. Every one of those is a static picture that a developer has to re-interpret, and every copy change means editing two places.

Three problems the Figma-first flow created here, all of which code-first removes:

| Problem in the Figma flow | How code-first removes it |
|---|---|
| A state exists only if someone drew it. Payment failure, crawler block and weekend queue were all missing because nobody drew them. | States are a TypeScript union. The compiler fails the build if a state has no UI branch. |
| The "2 hours" promise was hardcoded into 15 text layers and every one had to be found and corrected by hand. | One `SLA` constant. Change it once, 15 surfaces update. |
| Progress rails and countdowns were drawn as fixed strings. A real one-day wait needs live values. | Values come from the order record. There is nothing to redraw. |
| Figma had no variables, so every colour was a loose hex copied 21 times. | Tokens are variables. A hex in a component fails lint. |

What Figma keeps: token definition, the visual reference for the 26 states already built, and quick exploration when a genuinely new layout is needed. What it loses: being the place a screen is "finished".

---

## 2. The new flow, end to end

```
Figma variables  ──export──▶  tokens.json  ──build──▶  tokens.css (CSS custom properties)
                                                            │
                                                            ▼
                                                   Tailwind v4 @theme
                                                            │
                                                            ▼
                                       ui/ primitives  ──▶  features/ blocks  ──▶  app/ routes
                                                            ▲
                                                            │
                              order state machine (shared with the API) ─┘
```

Rules that make this hold:

1. **Nothing below the token layer contains a raw colour, radius, or spacing value.** Enforced by lint, not by discipline.
2. **Every screen is a composition of `ui/` primitives.** A screen file that defines its own visual styling is a bug.
3. **Every state a user can reach is a member of a union type**, and the union is defined once and shared by the frontend, the API and the worker.

---

## 3. Repo structure

```
blue-rocket/
├─ app/                                  # Next.js App Router
│  ├─ (marketing)/
│  │  ├─ page.tsx                        # landing — dark theme
│  │  ├─ sample/page.tsx                 # "Show me an example"
│  │  └─ layout.tsx                      # sets data-theme="marketing"
│  ├─ (app)/                             # authenticated portal — light theme
│  │  ├─ reports/
│  │  │  ├─ page.tsx                     # S-16 My Reports
│  │  │  └─ [orderId]/
│  │  │     ├─ page.tsx                  # S-06 order status, all states
│  │  │     └─ report/page.tsx           # S-14 report detail
│  │  ├─ billing/page.tsx                # S-17
│  │  ├─ account/page.tsx
│  │  └─ layout.tsx                      # AppNav + tabs
│  ├─ order/
│  │  ├─ page.tsx                        # form step 1 + 2
│  │  └─ recover/page.tsx                # S-05
│  ├─ share/[token]/page.tsx             # S-15 read-only, unauthenticated
│  ├─ (auth)/sign-in, reset              # S-18, S-19
│  ├─ api/
│  │  ├─ stripe/webhook/route.ts
│  │  ├─ orders/route.ts
│  │  ├─ orders/[id]/status/route.ts     # polled by the status page
│  │  ├─ verify-url/route.ts             # S-01
│  │  └─ share/[token]/route.ts
│  ├─ not-found.tsx                      # S-21a
│  └─ layout.tsx
│
├─ components/
│  ├─ ui/                                # primitives — the only place styling lives, see §5.2
│  │  ├─ avatar.tsx       banner.tsx       button.tsx
│  │  ├─ card.tsx         checkbox.tsx     chip.tsx
│  │  ├─ code-block.tsx   empty-state.tsx  field.tsx
│  │  ├─ heading.tsx      icon.tsx         icon-tile.tsx
│  │  ├─ input.tsx        modal.tsx        note.tsx
│  │  ├─ progress-bar.tsx select.tsx       stat.tsx
│  │  ├─ status-badge.tsx summary-row.tsx  tabs.tsx
│  │  ├─ timeline-step.tsx
│  │  └─ index.ts                        # the only import path: "@/components/ui"
│  ├─ blocks/                            # composed, still presentational, see §5.3
│  │  ├─ app-nav.tsx  status-layout.tsx  order-summary-card.tsx
│  │  ├─ progress-rail.tsx  delivery-promise.tsx  finding-row.tsx
│  │  ├─ report-sections.ts               # the four sections: names, icons, contents
│  │  ├─ marketing-section.tsx  landing.tsx
│  │  └─ status-poller.tsx
│  └─ states/                            # one file per order state, see §6
│     ├─ running.tsx      queued.tsx      weekend-queued.tsx
│     ├─ blocked.tsx      partial.tsx     late.tsx
│     ├─ escalated.tsx    failed.tsx      ready.tsx
│     └─ index.tsx                        # the exhaustive switch
│
├─ lib/
│  ├─ orders/
│  │  ├─ status.ts                       # OrderStatus union + copy map
│  │  ├─ sla.ts                          # business-day maths, single source
│  │  └─ transitions.ts                  # legal state transitions
│  ├─ stripe.ts
│  ├─ mail/                              # every email mirrors a screen state
│  └─ db.ts
│
├─ design-tokens/
│  ├─ tokens.json                        # exported from Figma, committed
│  ├─ build.mjs                          # tokens.json -> tokens.css + typography.css
│  └─ README.md
│
├─ styles/
│  ├─ tokens.css                         # GENERATED — never hand-edited
│  └─ globals.css                        # @import tokens + @theme
│
├─ workers/
│  ├─ crawl.ts  analyse.ts  compile.ts  deliver.ts
│  └─ sla-watchdog.ts                    # fires late / escalated / auto-refund
│
├─ prisma/schema.prisma
└─ docs/
   ├─ architecture.md                    # this file
   ├─ ux-extension-spec.md               # the 21-screen spec
   └─ copy.md                            # every user-facing string, reviewed
```

Three rules about placement:

- `ui/` may import from `ui/` and nothing else. No business logic, no data fetching.
- `blocks/` may import `ui/` and types. Still no data fetching.
- `app/` fetches data and composes `blocks/`. It never writes a class that sets a colour.

---

## 4. Token pipeline

### 4.1 Source: the Figma variable collections

Four collections now exist in the Figma file, in dependency order:

| Collection | Contains | Modes | Published |
|---|---|---|---|
| `1. Primitives` | Raw ramps: `colour/neutral/0–1050`, `colour/amber`, `green`, `red`, `blue`, `navy` | Value | Hidden |
| `2. Semantic` | `surface/*`, `border/*`, `text/*`, `action/*`, `status/*` — all aliases to primitives | **App (light)**, **Marketing (dark)** | Yes |
| `3. Scale` | `space/*`, `radius/*`, `size/*`, `border-width/*`, `font-size/*`, `line-height/*`, `layout/*` | Value | Yes |
| `4. Component` | `button/*`, `input/*`, `card/*`, `chip/*`, `modal/*`, `nav/*`, `rail/*` — aliases to Scale and Semantic | Value | Yes |

Plus four effect styles (`elevation/raised`, `elevation/popover`, `elevation/overlay`, `focus/ring`) and 23 text styles: eight `BRA/*` brand styles (Instrument Serif headings, Plus Jakarta Sans labels, Inter body) and fifteen Inter UI styles (`display` through `overline`).

Two older unnumbered collections, `Space` and `Radius`, are still in the file. The build emits them as `--legacy-*` and warns. Nothing uses them; they can be deleted in Figma.

The two-mode Semantic collection is what encodes the product's core visual rule: **dark is where you sell, light is where the customer works.** The marketing layout sets `data-theme="marketing"`, the portal layout sets `data-theme="app"`, and no component needs to know which it is in.

### 4.2 Export

```bash
npm run tokens:pull   # Figma REST /v1/files/:key/variables/local -> design-tokens/tokens.json (Enterprise only)
npm run tokens:build  # tokens.json -> styles/tokens.css + styles/typography.css
```

`tokens.json` is committed. This matters: it means a token change shows up as a reviewable diff in a PR, and CI can fail a build where a token was removed but is still referenced.

### 4.3 Output: `styles/tokens.css` and `styles/typography.css`

Both files are generated by `design-tokens/build.mjs` and never edited by hand. Token names are the Figma variable path, slugged: `2. Semantic / surface/page` becomes `--surface-page`, `4. Component / input/border` becomes `--input-border`.

```css
/* styles/tokens.css (excerpt) */
:root, [data-theme="app"] {
  --space-05: 4px;  --space-2: 16px;  --space-35: 28px;
  --radius-md: 10px; --radius-2xl: 16px; --radius-full: 999px;
  --surface-page: var(--colour-neutral-100);      /* #F5F7FA */
  --action-primary: var(--colour-blue-500);       /* #2563EB */
  --border-focus: var(--colour-blue-500);
  --card-padding: var(--space-35);
  --input-border: var(--border-strong);
}
[data-theme="marketing"] {
  --surface-page: var(--colour-neutral-1050);     /* #070C17 */
  --text-primary: var(--colour-neutral-50);
}
```

Text styles become Tailwind utilities in `typography.css`: `type-bra-display`, `type-bra-heading-1…3` (Instrument Serif), `type-bra-label` and `type-bra-caption` (Plus Jakarta Sans), and the Inter scale `type-display-lg` through `type-overline`. All three families are loaded in `app/layout.tsx` through `@fontsource`; the build warns if a text style uses a family that layout does not import.

In the Figma MCP output these same variables appear as `--bra-surface-page`, `--bra-action-primary` and so on. That `bra-` prefix is only Figma's code syntax. The values are identical.

### 4.4 Tailwind v4: tokens become utilities

Tailwind is configured in CSS (`styles/globals.css`), not a JS config. The default palette is switched off (`--color-*: initial`), so the only colours that exist are token colours. Every scale and component token a component needs has a named utility:

| Utility | Token | Figma variable |
|---|---|---|
| `bg-page` `bg-raised` `bg-sunken` `bg-inset` `bg-inverse` | `--surface-*` | `2. Semantic / surface/*` |
| `text-ink` `text-ink-2` `text-muted` `text-on-action` | `--text-*` | `text/*` |
| `bg-action` `hover:bg-action-hover` `bg-action-2` | `--action-*` | `action/*` |
| `bg-success` `text-success-ink` `text-success-accent` (and warning, danger, info, pending) | `--status-*` | `status/*` |
| `border-hairline` `border-strong` | `--border-*` | `border/*` |
| `bg-input` `border-input-border` `bg-input-error` `border-input-valid-border` … | `--input-*` | `4. Component / input/*` |
| `p-4`, `gap-2.5`, every numeric step | `--spacing: var(--space-05)` (4px) | `3. Scale / space/05` |
| `p-card` `p-card-compact` `gap-card-gap` | `--card-*` | `card/*` |
| `px-chip-x` `py-chip-y` | `--chip-*` | `chip/*` |
| `px-button-x` `gap-button-gap` | `--button-*` | `button/*` |
| `h-control-sm/md/lg/xl` `h-input` | `--size-control-*`, `--input-height` | `size/control/*` |
| `size-tile-sm … size-tile-5xl` `size-avatar` | `--size-icon-*`, `--size-avatar` | `size/icon/*` |
| `p-modal` `gap-modal-gap` `rounded-modal` | `--modal-*` | `modal/*` |
| `px-nav-x` `py-nav-y` `pt-page-top` `pb-page-bottom` `gap-section` | `--nav-*`, `--page-*` | `nav/*`, `page/*` |
| `size-rail-marker` `h-rail-connector` `gap-rail-gap` | `--rail-*` | `rail/*` |
| `h-bar` | `--border-width-bar` | `border-width/bar` |
| `rounded-control` `rounded-input` `rounded-card` `rounded-chip` `rounded-tile` | component radii | `button/radius` … |
| `rounded-xs … rounded-full` | `--radius-*` | `3. Scale / radius/*` |
| `max-w-app` `max-w-report` `max-w-main` `max-w-wide` `max-w-rail` `max-w-modal-sm…xl` | `--layout-*` | `layout/*` |
| `shadow-raised` `shadow-popover` `shadow-overlay` `shadow-focus` | effect styles | `elevation/*`, `focus/ring` |

So a component writes `bg-raised border-hairline text-ink rounded-card p-card`, and the same markup renders light in the portal and dark on the landing page. No `dark:` variants anywhere, and no theme prop threaded through components. A band of a page can switch theme on its own by setting `data-theme` (the landing page does this: dark hero, light content, dark footer).

If a component needs a value that has no utility, add the mapping to `globals.css`. If the value has no token either, add the variable in Figma first (§11.4).

### 4.5 The lint rules that hold the line

`eslint.config.mjs` applies these to `components/**` and `app/**`:

| Pattern | Example that fails |
|---|---|
| Raw hex, in literals and template strings | `"text-[#2563eb]"` |
| Raw colour functions | `"bg-[rgba(0,0,0,.2)]"` |
| Arbitrary pixel values | `"p-[28px]"` |
| Hand-written token variables where a utility exists | `"p-[var(--card-padding)]"` → use `p-card` |
| `ui/` importing from `blocks/`, `states/` or `app/` | layer violation |
| `FIXTURES` imported outside `app/dev` and tests | fixture leak |

Grid templates may still reference a layout token (`lg:grid-cols-[1fr_var(--container-rail)]`), since Tailwind has no utility for a two-track template.

---

## 5. Component layer

### 5.1 Principles

- **Every primitive mirrors a named Figma layer.** The Figma file has no published components; screens are frames with consistent layer names (`Button / primary`, `Card / order summary`, `Rail step / done`). Those names are the component names here.
- **Variant names match Figma.** `Button` variants are `primary`, `ghost` (filled surface, hairline border), `text` (no chrome) and `darkghost` (transparent, strong border, for dark system screens), exactly as the layers are named.
- **Icons are Lucide.** Figma's icon layers are Lucide glyphs (`Icon / file-text`, `Icon / Lucide rocket`), so `components/ui/icon.tsx` renders the same glyph from `lucide-react` at 22px, the size every Figma screen uses. Do not draw SVGs by hand and do not use emoji where Figma has an icon.
- **Two type families, two jobs.** Screen and section titles use the BRA serif (`<Heading>`, Instrument Serif). Card titles, labels and body use Inter (`<CardTitle>`, `type-body*`). This is what the Figma status headers, modals and marketing page do.
- **Tokens win over loose frames.** Some Figma frames use loose hex values that are not bound to variables (Form Step 1 uses `#e2e8f0` borders and a 6px radius; the landing page uses a few one-off tints). Where a frame and a token disagree, the component uses the token, and the frame is logged in §13.

### 5.2 Primitives (`components/ui`)

| Component | Variants / props | Figma layer | Reference node |
|---|---|---|---|
| `Button`, `buttonStyles` | `primary` `ghost` `text` `darkghost` `danger` × `sm` `md` `lg` × `full`, `loading`, `disabled` | `Button / primary · ghost · text · darkghost` | S-13 `7364:178` |
| `Card`, `CardTitle` | default, `compact`; `as` section/article/div | `Card / *` | S-13 `7364:23` |
| `Heading` | `display` `h1` `h2` `h3`; `as` | text styles `BRA/*` | S-13 `7364:26` |
| `Chip` | `neutral` `success` `warning` `danger` `info` | `Chip / status`, `Chip / delivery promise` | S-13 `7364:29` |
| `StatusBadge` | `queued` `running` `ready` `delayed` `blocked` `failed` `refunded` `credit` (glyph + word) | `Status badge` | S-16 `7366:44` |
| `Icon` | any Lucide icon; `sm` 16, `md` 22, `lg` 28; `label` for meaningful icons | `Icon / *` | |
| `IconTile` | `icon` or `emoji`; tone + `action`; `xs` 34, `sm` 40, `md` 48, `lg` 56, `xl` 64 | `Icon tile`, `Icon tile / status` | S-13 `7364:24` |
| `Avatar` | initials, `md` 34, `lg` 56 | nav initials tile | S-16 `7366:11` |
| `Note` | five tones, default icon per tone, `icon` or `glyph` override | `Note` | S-03 `7358:12` |
| `Banner` | tone, `icon`, `inset` (rounded) or full-bleed, `actions` | `Banner / claim account · unverified email · shared` | S-13 `7364:13`, S-16 `7366:30` |
| `Input`, `inputStyles` | `default` `valid` `warning` `error`; `trailing` status icon | `Input`, `Text Input`, `URL Input`, `Password Input` | S-01 `7369:2` |
| `Select` | same states as `Input`; native select | `Dropdown` | Form Step 1 `7203:2784` |
| `Checkbox` | native, with label | `Checkbox` | Create your account `7236:131` |
| `Field` | `label`, `hint`, `required`, `message` (neutral/success/warning/danger) | `Field` | S-18b `7368:50`, S-01 |
| `Modal` | `sm` 412 `md` 440 `lg` 480 `xl` 580; presentational panel | `Modal`, `Modal / *` | S-03 `7358:6` |
| `ProgressBar` | 0–100, labelled | Form Step 1 progress, S-16 row bar | `7203:2747` |
| `Tabs` | link tabs with `aria-current` | `Portal tabs` | S-16 `7366:13` |
| `SummaryRow` | default, `emphasis` | `Summary row` | S-13 `7364:36` |
| `Stat` | `neutral` `danger` `warning` | `Stat` | S-13 `7364:167` |
| `TimelineStep` | `done` `active` `pending` `scheduled` `failed` | `Rail step / *` | S-13 `7364:125` |
| `CodeBlock` | string content | `Code block` | S-08 `7361:2` |
| `EmptyState` | icon, title, body, action | `Empty state` | S-16 `7366:70` |

`Note` deserves a mention. It is the small tinted strip that states what happened to the money. It appears on nine of the state screens and it is the component most responsible for whether a failure feels handled or feels like theft. It is a primitive, and `blocks/` is not allowed to reimplement it.

### 5.3 Blocks (`components/blocks`)

| Block | What it composes | Figma |
|---|---|---|
| `AppNav` | rocket `IconTile`, links, optional `Avatar` | `App nav bar` |
| `StatusLayout` | claim `Banner`, status header `Card` + `Heading`, `OrderSummaryCard`, `ProgressRail` | the S-06 shell, all order states |
| `OrderSummaryCard` | `Card` + `SummaryRow` | `Card / order summary` |
| `ProgressRail` | `Card` + `TimelineStep` + `Note` | `Card / report progress` |
| `DeliveryPromise` | `Chip`, date from `lib/orders/sla` | `Chip / delivery promise` |
| `FindingRow` | `Chip` + text | `Finding / critical · warn · ok` |
| `REPORT_SECTIONS` | names, icons and contents of the four sections | landing page, S-09, S-14 |
| `MarketingSection` | a themed band with eyebrow, `Heading`, intro | landing page sections |
| `LandingHero` … `SiteFooter` | the landing page bands | `7203:2155` |

### 5.4 Reviewing components

`/dev/components` renders every primitive in both themes, with the Figma layer name beside each one. `/dev/states` lists every order state. Both are hidden in production unless `NEXT_PUBLIC_SHOW_STATE_GALLERY=true`. Review token and primitive changes on the PR preview there, not in Figma.

### 5.5 Getting details from a Figma screen

With the Figma connector enabled, an agent reads a screen with `get_design_context` on its node id (for example S-13 is `7364:2` in file `43WfRGUtWOHJa3Q7fAZFj7`). The response is React + Tailwind with Figma's own variable names and pixel values. Treat it as a reference, never as code to paste:

1. Map each `data-name` to the primitive in §5.2. `Button / ghost` is `<Button variant="ghost">`, `Card / status header` is the header card inside `StatusLayout`.
2. Map each `var(--bra-…)` to the utility in §4.4. `bg-[var(--bra-surface-raised)]` is `bg-raised`; `px-[28px]` on a card is `p-card`.
3. Map `Icon / <name>` to the Lucide icon of the same name.
4. If a value has no token, it is either a loose frame (use the nearest token and note it in §13) or a genuinely new token (add it in Figma first).
5. Copy about time, price or refunds always comes from `lib/orders/sla`, even when the Figma text says something different.

---

## 6. The order state machine

This is the backbone. Get it right and most of the UI writes itself.

```ts
// lib/orders/status.ts
export const ORDER_STATUS = [
  "awaiting_payment",   // Stripe session open
  "payment_failed",     // S-03
  "queued",             // paid, worker not started
  "weekend_queued",     // paid outside business hours — S-22
  "crawling",           // S-06
  "analysing",          // S-06
  "compiling",          // S-06
  "reviewing",          // S-06 — remove this member if there is no human review
  "blocked",            // S-08, customer action can fix it
  "late",               // S-11, past the promised delivery moment
  "escalated",          // S-12, past 2 business days
  "partial",            // S-09
  "ready",              // S-13
  "failed",             // S-10
  "refunded",           // terminal
] as const;

export type OrderStatus = (typeof ORDER_STATUS)[number];

export const IN_FLIGHT: OrderStatus[] =
  ["queued","weekend_queued","crawling","analysing","compiling","reviewing","late"];

export const NEEDS_CUSTOMER: OrderStatus[] = ["payment_failed","blocked"];

export const MONEY_RETURNED: OrderStatus[] = ["refunded","failed","escalated"];
```

The status page renders through one exhaustive switch. Adding a status without a UI branch is a compile error, which is the whole point:

```tsx
// components/states/index.tsx
export function OrderState({ order }: { order: Order }) {
  switch (order.status) {
    case "queued":
    case "crawling":
    case "analysing":
    case "compiling":
    case "reviewing":   return <Running order={order} />;
    case "weekend_queued": return <WeekendQueued order={order} />;
    case "late":        return <Late order={order} />;
    case "blocked":     return <Blocked order={order} />;
    case "partial":     return <Partial order={order} />;
    case "ready":       return <Ready order={order} />;
    case "failed":      return <Failed order={order} />;
    case "escalated":   return <Escalated order={order} />;
    case "refunded":    return <Refunded order={order} />;
    case "payment_failed":
    case "awaiting_payment": redirect(`/order?resume=${order.id}`);
    default: {
      const _exhaustive: never = order.status;
      throw new Error(`Unhandled order status: ${_exhaustive}`);
    }
  }
}
```

Every state component is required to render three things. This is a review checklist item, not a suggestion:

1. Where the report is
2. Where the customer's $1,500 is (a `<Note>`)
3. What happens next with no action from them

---

## 7. The SLA module

One report, $1,500, delivered within **one business day**, where a business day is Monday to Friday. This rule appears on the landing page, in the form, on the status page, in three emails, and in two background timers. It is defined once.

```ts
// lib/orders/sla.ts
export const SLA = {
  productName: "Detailed SEO Report",
  priceUsd: 1500,
  businessDays: 1,          // delivery window
  workStartHour: 9,
  workEndHour: 17,
  workDays: [1, 2, 3, 4, 5],  // Mon–Fri
  lateAfterBusinessDays: 1,   // -> "late"
  escalateAfterBusinessDays: 2, // -> "escalated" + auto-refund
  timezone: "America/New_York", // the business's clock, not the customer's
} as const;

/** The promised delivery moment for an order paid at `paidAt`. */
export function deliveryDeadline(paidAt: Date): Date { /* … */ }

/** True when the order was paid outside working hours and will not start today. */
export function isWeekendQueued(paidAt: Date): boolean { /* … */ }

/** Business-hours elapsed, NOT wall clock. Used by the watchdog. */
export function businessHoursSince(from: Date, to = new Date()): number { /* … */ }
```

**The bug this module exists to prevent:** a wall-clock 48-hour escalation timer fires on Sunday morning and auto-refunds a perfectly healthy job that was paid for on Friday evening. Every timer in `workers/sla-watchdog.ts` uses `businessHoursSince`, never `Date.now() - paidAt`.

**The rendering rule:** never show a raw hour count on a weekend order. "In 66 hours" is technically accurate and reads as an insult at this price. `<DeliveryPromise>` renders a date and time, and only switches to a countdown once inside the final working day.

---

## 8. Backend

### 8.1 Data model

```prisma
model Order {
  id              String       @id @default(cuid())
  reference       String       @unique          // BRA-4471, shown on every screen
  status          OrderStatus
  email           String
  businessName    String
  websiteUrl      String
  industry        String
  city            String?
  country         String?
  stripeSessionId String?
  stripeIntentId  String?
  amountCents     Int          @default(150000)
  paidAt          DateTime?
  deadlineAt      DateTime?                     // computed at payment, stored
  startedAt       DateTime?
  deliveredAt     DateTime?
  failureCode     FailureCode?                  // ROBOTS, CLOUDFLARE, TIMEOUT, …
  userId          String?
  report          Report?
  refunds         Refund[]
  events          OrderEvent[]                  // append-only audit
  shareTokens     ShareToken[]
}

model Report {
  id        String          @id @default(cuid())
  orderId   String          @unique
  score     Int
  sections  ReportSection[]
  pdfUrl    String?
  pdfStatus PdfStatus       @default(PENDING)
}

model ReportSection {
  id         String        @id @default(cuid())
  reportId   String
  key        SectionKey    // TECHNICAL, ON_PAGE, OFF_PAGE, COMPETITIVE
  state      SectionState  // COMPLETE | UNAVAILABLE
  reason     String?       // "domain is 41 days old" — rendered verbatim on S-09
  findings   Finding[]
}

model Finding {
  id        String   @id @default(cuid())
  sectionId String
  severity  Severity // CRITICAL | MEDIUM | PASS
  title     String
  body      String
  impact    Int      // ranking weight for "what to fix first"
}

model Refund {
  id         String   @id @default(cuid())
  orderId    String
  reference  String   @unique
  reason     RefundReason  // MISSED_SLA | GENERATION_FAILED | CUSTOMER_REQUEST | UNAUDITABLE
  automatic  Boolean
  issuedAt   DateTime
}
```

`ReportSection.reason` being a stored string, rendered verbatim, is deliberate. S-09 shows the missing section with its reason rather than hiding it. A customer who paid for four sections and silently receives three will notice, and will assume worse is being hidden.

### 8.2 Payment and the webhook race

Stripe Checkout, redirect flow. The one thing that must not break: **the order page must exist before the customer lands on it**, and it must still exist if they never land on it at all.

```
POST /api/orders                 → creates Order(awaiting_payment), returns Stripe session
Stripe redirect success          → /reports/{id} — may arrive BEFORE the webhook
POST /api/stripe/webhook         → marks paid, computes deadlineAt, enqueues crawl
GET  /api/orders/{id}/status     → polled by the page every 15s while IN_FLIGHT
```

Three guards:

1. The success page polls. If the webhook has not landed yet it shows `queued`, never an error.
2. A reconciliation job runs every 10 minutes against Stripe for charges with no matching paid order. This is what makes S-05 recoverable.
3. Webhook handlers are idempotent on `stripeIntentId`. Stripe retries and so must we.

### 8.3 Workers

Each pipeline stage is a separate job so a failure is attributable to a stage, which is what the progress rail renders.

| Worker | Writes | Failure becomes |
|---|---|---|
| `crawl` | page inventory, response times | `blocked` (ROBOTS / CLOUDFLARE) or retry ×3 then `failed` |
| `analyse` | findings for 4 sections | `partial` if a section has no data, `failed` if all do |
| `compile` | report record, score, PDF | `ready` with `pdfStatus=FAILED` if only the PDF broke |
| `deliver` | email + status flip | logged, never blocks `ready` |
| `sla-watchdog` | `late`, `escalated`, auto-`Refund` | runs every 15 min, business hours aware |

**A PDF failure must never block `ready`.** The web report is the product. The PDF is a convenience. S-14 handles a failed PDF as an inline error under the download button, not as a page-level failure.

### 8.4 Email

Every email mirrors a screen state and links to it. The email is a pointer, never the delivery mechanism. On a one-business-day window the customer is away from the machine when the report lands, so these matter more than they would on a two-hour promise.

| Trigger | Mirrors | Contains |
|---|---|---|
| Payment succeeded | S-06 | Order page link, delivery moment, reference |
| Monday start (weekend orders) | S-22 → running | "Your report just started, landing by 5pm today" |
| Crawler blocked | S-08 | The fix, forwardable to whoever manages the site |
| Deadline missed | S-11 | New estimate, refund status if the guarantee ships |
| Report ready | S-13 | Three headline numbers, link, PDF attached |
| Failed | S-10 | Refund reference, named human, reply-to a real inbox |

---

## 9. Routing and auth

Account is created **after** payment, silently, from the email captured at checkout (Option B in the UX spec). Access is by signed magic link until the customer sets a password. This keeps zero friction in front of the $1,500 button and still gives everyone a portal.

- `/reports/{id}` is readable with a valid session **or** a signed link token. The link is the thing in the receipt email.
- `/share/{token}` is public, read-only, 30-day expiry, revocable. It renders S-15 with actions stripped and a conversion card appended. Every customer who shares this markets to exactly the right audience, so it is a real surface, not a fallback.
- Sign-in leads with "email me a sign-in link". Customers who never chose a password would otherwise be stranded.

---

## 10. Accessibility and quality gates

Non-negotiable, checked in CI:

- WCAG 2.2 AA. Both theme modes are contrast-tested, since the same component renders on both.
- Focus is visible everywhere. `shadow-focus` is the Figma `focus/ring` effect, a 3px ring, and must reach 3:1 against both `surface/page` values. It is currently amber at 45% opacity, left over from the old brand, while `border/focus` is blue (see §13).
- Status is never colour alone. Every `StatusBadge` carries a glyph and a word.
- Touch targets 44px minimum. `Button size="sm"` is 36px and is therefore desktop-only, enforced by a prop guard.
- Polling respects `prefers-reduced-motion`: the progress rail stops animating, values still update.
- Plain language, roughly 8th grade. `docs/copy.md` is the review surface for this.

CI runs: `tsc --noEmit`, ESLint including the no-hex rule, `axe` on every route, Playwright screenshots of all 26 states against committed baselines, and a token-drift check that fails if `tokens.json` differs from Figma.

---

## 11. The AI design flow

This is how a screen gets built now. The agent is not asked to "design a screen". It is asked to compose known primitives against a known state.

### 11.1 The prompt contract

Every request to build or change a surface supplies exactly four things:

1. **The state.** A member of `OrderStatus`, or a named non-order surface (`sign-in`, `billing`, `404`).
2. **The data shape.** The TypeScript type the component receives. Not a description, the actual type.
3. **The three answers.** For any paid-customer surface: where the report is, where the money is, what happens next unattended.
4. **The reference.** The Figma node for the equivalent state, if one of the 26 exists.

### 11.2 Hard rules given to the agent

```
- Compose from components/ui and components/blocks. Do not write new visual styling.
- If a needed primitive does not exist, stop and propose it. Do not inline it.
- No hex, rgb, hsl, or arbitrary px values. Token classes only.
- No `dark:` variants. Theming is handled by data-theme at the layout level.
- Copy is plain language, written for a small-business owner, not a developer.
- Every failure state names what happened to the money, in a <Note>.
- Every user-facing string goes in docs/copy.md in the same PR.
- Never invent a delivery time. Call lib/orders/sla.
```

### 11.3 Definition of done for a new surface

- [ ] Renders from a real type, not mock props inline
- [ ] Loading, empty, error and degraded variants all exist
- [ ] Reachable from a permanent URL, not only from a redirect
- [ ] Money status stated where money is involved
- [ ] Mirrors an email if the state can occur while the customer is away
- [ ] Passes `tsc`, ESLint, axe, and has a Playwright baseline
- [ ] Copy added to `docs/copy.md`

### 11.4 What still goes back to Figma

Three things, and only three:

1. A token change. Edit the variable, run `tokens:pull`, commit the diff.
2. A genuinely new layout pattern with no precedent in the 26 states. Explore it in Figma, then build it.
3. Client-facing presentation. The Figma file stays the artifact Carlos shows people.

Bug fixes, copy changes, new states of an existing pattern and every responsive adjustment happen in code. They do not go back to Figma, and the Figma file is allowed to drift on those. Trying to keep 26 artboards in sync with a live app is the failure mode this whole change exists to avoid.

---

## 12. Build order

| Phase | Scope | Depends on |
|---|---|---|
| 0 | Token pipeline, `ui/` primitives, theming, lint rules | — |
| 1 | Order state machine, SLA module, status page with all 11 states | 0 |
| 2 | Stripe, webhook, reconciliation, recovery, emails | 1 |
| 3 | Workers, report model, S-14 report detail | 2 |
| 4 | Portal: dashboard, billing, auth, share view | 3 |
| 5 | Landing page and the six trust moves | 0 |

Phase 1 before Phase 2 is deliberate. Building the states first, against fixture data, means the payment integration slots into a UI that already handles every way it can fail.

---

## 13. Open decisions

These block specific files and should be answered before the phase that needs them.

| # | Question | Blocks |
|---|---|---|
| 1 | Is the refund automatic when the deadline is missed? | `sla-watchdog.ts`, S-11 copy, landing chip |
| 2 | Is there a human review step, or is it fully automated? | `reviewing` status, progress rail, FAQ copy |
| 3 | Whose name and face is on S-10, S-12 and the pricing card? | copy.md, escalation email |
| 4 | Bank transfer fallback for declined cards? | S-03, highest-value recovery path |
| 5 | Report retention period, and what happens after it | S-14 stale state, data policy |
| 6 | Does the FigJam research contradict anything here? | everything, research wins |
| 7 | The Figma landing page says reports "run every day, including weekends". The SLA and S-22 say Monday to Friday. The code follows the SLA. Which is right? | landing FAQ and chips, `SLA.workDays` |
| 8 | Form Step 1 in Figma draws inputs with a hairline border and 6px radius; the `input/*` tokens say `border/strong` and 10px. The code follows the tokens (strong also meets the 3:1 contrast rule for form borders). Update the frame, or change the token? | `Input`, `Select` |
| 9 | Figma's landing page has a newsletter "Subscribe" field and a "Notify me" waitlist. There is no mailing-list backend yet, so the code links to email instead. Which provider? | footer, pricing card |
| 10 | The unnumbered `Space` and `Radius` collections in Figma duplicate `3. Scale`. Delete them? | token build warnings |
| 11 | The `focus/ring` effect is amber `rgba(245,165,36,.45)` from the old brand; everything else focus-related is blue. Change it to blue in Figma? | every focusable element |
