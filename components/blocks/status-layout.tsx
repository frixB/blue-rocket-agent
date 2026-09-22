import { Card, IconTile, Button, type Tone } from "@/components/ui";
import { OrderSummaryCard } from "./order-summary-card";
import { ProgressRail } from "./progress-rail";
import type { Order } from "@/lib/orders/types";

type Props = {
  order: Order;
  tile: { emoji: string; tone: Tone };
  heading: string;
  body: string;
  chips?: React.ReactNode;
  children: React.ReactNode;
  showClaim?: boolean;
};

/**
 * The S-06 shell every order state renders inside. States only supply the
 * header copy and one card. Summary, rail and footer never move.
 */
export function StatusLayout({ order, tile, heading, body, chips, children, showClaim = true }: Props) {
  return (
    <>
      {showClaim && !order.claimed && (
        <div className="flex flex-wrap items-center justify-between gap-3 bg-warning px-[var(--nav-padding-x)] py-3.5 type-body-sm-strong text-warning-ink">
          <p><span aria-hidden>🔖</span> Set a password and this report stays in your dashboard for good.</p>
          <Button size="sm">Set a password</Button>
        </div>
      )}
      <main className="mx-auto grid w-full max-w-app gap-8 px-5 pb-[var(--page-bottom)] pt-[var(--page-top)] lg:grid-cols-[1fr_var(--layout-column-rail)]">
        <div className="flex min-w-0 flex-col gap-[var(--page-section-gap)]">
          <Card>
            <IconTile emoji={tile.emoji} tone={tile.tone} size="xl" />
            <h1 className="type-heading-h1 text-ink">{heading}</h1>
            <p className="type-body-lg text-ink-2">{body}</p>
            {chips && <div className="flex flex-wrap gap-3">{chips}</div>}
          </Card>
          <OrderSummaryCard order={order} />
          {children}
          <Button variant="secondary" full>🔖 Save my report link</Button>
          <p className="text-center type-body-sm text-muted">Something not right? Contact us. We reply within one business hour.</p>
        </div>
        <aside className="flex flex-col gap-5"><ProgressRail order={order} /></aside>
      </main>
    </>
  );
}
