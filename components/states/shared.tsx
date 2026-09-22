import { Chip, Note } from "@/components/ui";
import { formatDay } from "@/lib/orders/sla";
import type { Order } from "@/lib/orders/types";

export type StateProps = { order: Order };

export function RefundNote({ order, lead }: { order: Order; lead?: string }) {
  if (!order.refund) return null;
  return (
    <Note tone="success">
      {lead ?? "Your refund was issued automatically"} on {formatDay(new Date(order.refund.issuedAt))}. It reaches your card in 5 to 10 business days, depending on your bank. Reference #{order.refund.reference}.
    </Note>
  );
}

export const RunningChip = () => <Chip tone="success"><span aria-hidden>●</span> Running now</Chip>;
