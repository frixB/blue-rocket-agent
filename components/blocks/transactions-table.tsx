import { Card, StatusBadge } from "@/components/ui";
import { SLA, formatDate, formatPrice } from "@/lib/orders/sla";
import type { Order } from "@/lib/orders/types";

type Tx = { id: string; at: string; description: string; cents: number; kind: "paid" | "refunded" };

const day = (iso: string) => formatDate(new Date(iso));

/** Every charge and refund, newest first, derived from the orders. */
export function transactions(orders: Order[]): Tx[] {
  return orders.flatMap((o): Tx[] => {
    const host = new URL(o.websiteUrl).host;
    const rows: Tx[] = [{ id: o.reference, at: o.paidAt, description: `${SLA.productName} · ${host}`, cents: o.amountCents, kind: "paid" }];
    if (o.refund) rows.push({ id: o.refund.reference, at: o.refund.issuedAt, kind: "refunded", cents: -o.amountCents,
      description: `Refund · ${o.refund.reason.toLowerCase()} · #${o.reference} · back in 5 to 10 business days` });
    return rows;
  }).sort((a, b) => b.at.localeCompare(a.at));
}

/**
 * Figma "Card / transactions", S-17. Receipts come from Stripe, so the
 * receipt column is empty until Stripe is connected.
 */
export function TransactionsTable({ rows }: { rows: Tx[] }) {
  return (
    <Card className="gap-0 overflow-x-auto px-6 py-2">
      <table className="w-full min-w-2xl text-left">
        <caption className="sr-only">Payments and refunds</caption>
        <thead>
          <tr className="type-caption-strong text-muted">
            <th scope="col" className="py-3.5 pr-4 font-bold">Date</th>
            <th scope="col" className="py-3.5 pr-4 font-bold">Description</th>
            <th scope="col" className="py-3.5 pr-4 text-right font-bold">Amount</th>
            <th scope="col" className="py-3.5 pl-6 font-bold">Status</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((t) => (
            <tr key={t.id} className="border-t border-hairline">
              <td className="whitespace-nowrap py-4 pr-4 type-body-sm text-ink-2">{day(t.at)}</td>
              <td className="py-4 pr-4 type-body-sm font-medium text-ink">{t.description}</td>
              <td className="whitespace-nowrap py-4 pr-4 text-right type-body-strong tabular-nums text-ink">
                {t.cents < 0 ? `−${formatPrice(-t.cents)}` : formatPrice(t.cents)}
              </td>
              <td className="py-4 pl-6">{t.kind === "paid" ? <StatusBadge kind="paid" /> : <StatusBadge kind="refunded" />}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </Card>
  );
}
