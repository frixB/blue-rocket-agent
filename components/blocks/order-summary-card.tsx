import { Card, SummaryRow } from "@/components/ui";
import { SLA, formatPrice } from "@/lib/orders/sla";
import type { Order } from "@/lib/orders/types";

export function OrderSummaryCard({ order }: { order: Order }) {
  return (
    <Card aria-labelledby="summary-title" className="gap-0">
      <h2 id="summary-title" className="type-overline uppercase text-muted">Order summary</h2>
      <dl className="mt-2 flex flex-col divide-y divide-hairline">
        <SummaryRow label="Report type" value={SLA.productName} />
        <SummaryRow label="Business" value={order.businessName} />
        <SummaryRow label="Website" value={order.websiteUrl} />
        <SummaryRow label="Delivering to" value={order.email} />
        <SummaryRow label="Order reference" value={`#${order.reference}`} />
        <SummaryRow label="Amount paid" value={formatPrice(order.amountCents)} emphasis />
      </dl>
    </Card>
  );
}
