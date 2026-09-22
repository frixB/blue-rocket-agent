# Blue Rocket Agents — Architecture

**Version:** 1.0
**Last updated:** 16 September 2026
**Owners:** frixB (build) · Carlos (sales, product)
**Stack:** Next.js 16 App Router · React 19 · TypeScript · Tailwind CSS v4 · Postgres · Stripe

---

> **Repo note, 22 Sep 2026.** The code in this repo is the source of truth where it differs from the examples below. In particular: token CSS names come from `design-tokens/build.mjs` (see `styles/tokens.css`), Tailwind class names are defined in `styles/globals.css`, the default Tailwind palette is switched off, and user-facing copy lives in the state components and is reviewed in the PR diff. Figma's Variables REST API is Enterprise-only, see `design-tokens/README.md` for the MCP route.

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
│  ├─ ui/                                # primitives — the only place styling lives
│  │  ├─ button.tsx
│  │  ├─ input.tsx
│  │  ├─ select.tsx
│  │  ├─ card.tsx
│  │  ├─ chip.tsx
│  │  ├─ status-badge.tsx
│  │  ├─ icon-tile.tsx
│  │  ├─ modal.tsx
│  │  ├─ progress-bar.tsx
│  │  ├─ summary-row.tsx
│  │  ├─ timeline-step.tsx
│  │  ├─ empty-state.tsx
│  │  ├─ note.tsx                        # the tinted reassurance strip
│  │  └─ stat.tsx
│  ├─ blocks/                            # composed, still presentational
│  │  ├─ order-summary-card.tsx
│  │  ├─ progress-rail.tsx
│  │  ├─ delivery-promise.tsx            # C-13, computes and renders the date
│  │  ├─ report-section-card.tsx
│  │  ├─ finding-row.tsx
│  │  └─ app-nav.tsx
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
│  ├─ build.ts                           # tokens.json -> tokens.css
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

Plus four effect styles (`elevation/raised`, `elevation/popover`, `elevation/overlay`, `focus/ring`) and fifteen text styles (`display` through `overline`).

The two-mode Semantic collection is what encodes the product's core visual rule: **dark is where you sell, light is where the customer works.** The marketing layout sets `data-theme="marketing"`, the portal layout sets `data-theme="app"`, and no component needs to know which it is in.

### 4.2 Export

```bash
pnpm tokens:pull      # Figma REST /v1/files/:key/variables/local -> design-tokens/tokens.json
pnpm tokens:build     # tokens.json -> styles/tokens.css
```

`tokens.json` is committed. This matters: it means a token change shows up as a reviewable diff in a PR, and CI can fail a build where a token was removed but is still referenced.

### 4.3 Output: `styles/tokens.css`

```css
/* GENERATED FILE — do not edit. Run `pnpm tokens:build`. */
:root {
  /* scale — mode independent */
  --space-1: 8px;   --space-2: 16px;  --space-3: 24px;  --space-4: 32px;
  --space-5: 40px;  --space-7: 56px;  --space-9: 80px;
  --radius-md: 10px; --radius-lg: 12px; --radius-2xl: 16px; --radius-full: 999px;
  --font-size-body: 15px; --font-size-h1: 34px; --font-size-display: 40px;
  --line-height-snug: 1.25; --line-height-normal: 1.5;
  --layout-container-app: 1100px; --layout-column-main: 760px; --layout-column-rail: 340px;

  /* semantic — App (light) is the default mode */
  --surface-page: #F5F7FA;
  --surface-raised: #FFFFFF;
  --surface-sunken: #FBFCFD;
  --surface-inset: #EEF1F6;
  --surface-inverse: #0B1120;
  --border-hairline: #E5E9F0;
  --text-primary: #0F172A;
  --text-secondary: #475569;
  --text-muted: #94A3B8;
  --text-on-action: #1F2937;
  --action-primary: #F5A524;
  --status-success-surface: #DCFCE7; --status-success-ink: #166534;
  --status-warning-surface: #FEF3C7; --status-warning-ink: #92400E;
  --status-error-surface:   #FEE2E2; --status-error-ink:   #991B1B;
  --status-info-surface:    #DBEAFE; --status-info-ink:    #1E3A8A;

  /* component */
  --button-padding-x: var(--space-25);
  --card-padding: var(--space-35);
  --modal-radius: var(--radius-4xl);

  /* effects */
  --elevation-overlay: 0 18px 44px rgba(0,0,0,.20);
  --focus-ring: 0 0 0 3px rgba(245,165,36,.45);
}

[data-theme="marketing"] {
  --surface-page: #070C17;
  --surface-raised: #131C2E;
  --surface-inset: #1A2434;
  --border-hairline: #1E293B;
  --text-primary: #F8FAFC;
  --text-secondary: #CBD5E1;
}
```

### 4.4 Tailwind v4

Tailwind v4 is configured in CSS, not in a JS config. There is no `tailwind.config.js`.

```css
/* styles/globals.css */
@import "tailwindcss";
@import "./tokens.css";

@theme inline {
  --color-surface:        var(--surface-page);
  --color-raised:         var(--surface-raised);
  --color-sunken:         var(--surface-sunken);
  --color-inset:          var(--surface-inset);
  --color-inverse:        var(--surface-inverse);
  --color-hairline:       var(--border-hairline);
  --color-ink:            var(--text-primary);
  --color-ink-2:          var(--text-secondary);
  --color-muted:          var(--text-muted);
  --color-action:         var(--action-primary);
  --color-on-action:      var(--text-on-action);
  --color-success:        var(--status-success-surface);
  --color-success-ink:    var(--status-success-ink);
  --color-warning:        var(--status-warning-surface);
  --color-warning-ink:    var(--status-warning-ink);
  --color-danger:         var(--status-error-surface);
  --color-danger-ink:     var(--status-error-ink);

  --radius-card:   var(--radius-2xl);
  --radius-control: var(--radius-md);
  --shadow-overlay: var(--elevation-overlay);
}
```

So a component writes `bg-raised border-hairline text-ink rounded-card`, and the same markup renders light in the portal and dark on the landing page. No `dark:` variants anywhere, and no theme prop threaded through components.

### 4.5 The lint rule that holds the line

```js
// eslint.config.js (excerpt)
{
  files: ["components/**/*.tsx", "app/**/*.tsx"],
  rules: {
    "no-restricted-syntax": [
      "error",
      {
        selector: "Literal[value=/#[0-9a-fA-F]{3,8}\\b/]",
        message: "Raw hex is not allowed. Use a token class or a CSS variable from styles/tokens.css."
      },
      {
        selector: "Literal[value=/\\b(rgb|rgba|hsl)\\(/]",
        message: "Raw colour functions are not allowed. Use a token."
      }
    ]
  }
}
```

Add an arbitrary-value guard too: `className` strings matching `\[(#|rgb|\d+px)` fail review. Spacing exceptions go in the token file, not in a component.

---

## 5. Component layer

Every primitive maps 1:1 to something that already exists in the Figma file, so there is a visual reference for each.

```tsx
// components/ui/button.tsx
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/cn";

const button = cva(
  "inline-flex items-center justify-center gap-2 rounded-control font-semibold " +
  "transition-colors focus-visible:outline-none focus-visible:shadow-[var(--focus-ring)] " +
  "disabled:opacity-50 disabled:pointer-events-none",
  {
    variants: {
      variant: {
        primary:   "bg-action text-on-action hover:brightness-95",
        secondary: "bg-raised text-ink-2 border border-hairline hover:bg-inset",
        ghost:     "text-muted hover:text-ink",
        danger:    "bg-danger text-danger-ink hover:brightness-95",
      },
      size: {
        sm: "h-9  px-4 text-[length:var(--font-size-body-sm)]",
        md: "h-12 px-5 text-[length:var(--font-size-body-lg)]",
        lg: "h-[60px] px-5 text-[length:var(--font-size-body-lg)]",
      },
      full: { true: "w-full" },
    },
    defaultVariants: { variant: "primary", size: "md" },
  }
);

export type ButtonProps =
  React.ButtonHTMLAttributes<HTMLButtonElement> &
  VariantProps<typeof button> & { loading?: boolean };

export function Button({ className, variant, size, full, loading, children, ...props }: ButtonProps) {
  return (
    <button className={cn(button({ variant, size, full }), className)} aria-busy={loading} {...props}>
      {loading ? <Spinner className="size-4" /> : null}
      {children}
    </button>
  );
}
```

The full primitive list, with the Figma component each mirrors:

| `ui/` component | Variants | Mirrors |
|---|---|---|
| `Button` | primary, secondary, ghost, danger × sm/md/lg × loading, disabled | Hero CTA |
| `Input` | default, focus, valid, error, locked; optional suffix + helper | Form Step 1 URL field |
| `Select` | same states as Input | Form Step 1 Industry |
| `Card` | default, compact; `as` for section vs article | Order Summary |
| `Chip` | neutral, success, warning, error, info | Hero chips |
| `StatusBadge` | queued, running, ready, delayed, blocked, failed, refunded | S-16 row badges |
| `TimelineStep` | complete, active, pending, scheduled, failed | Report Progress rail |
| `IconTile` | 32/40/48/56/64/72/80 × 5 tints | Section tiles |
| `Modal` | 412/440/480/580 | Signup modal |
| `ProgressBar` | determinate, indeterminate | "Step 1 of 2" |
| `SummaryRow` | default, emphasised | Order summary line |
| `Note` | success, warning, error, info, neutral | The green money strip |
| `EmptyState` | — | S-16 empty |
| `Stat` | neutral, danger, warning | S-13 findings preview |

**`Note` deserves a mention.** It is the small tinted strip that states what happened to the money. It appears on nine of the state screens and it is the component most responsible for whether a failure feels handled or feels like theft. It is a primitive, not an afterthought, and `blocks/` is not allowed to reimplement it.

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
- Focus is visible everywhere. `--focus-ring` is a 3px amber ring, tested at 3:1 against both `surface/page` values.
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
