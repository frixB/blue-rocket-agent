import { Timer } from "lucide-react";
import { Chip } from "@/components/ui";
import { deliveryDeadline, formatDeliveryPromise } from "@/lib/orders/sla";

/** C-13. The one place a delivery time is rendered. Never hardcode one. */
export function DeliveryPromise({ paidAt, now, prefix = "Delivered" }: { paidAt: string; now?: Date; prefix?: string }) {
  const deadline = deliveryDeadline(new Date(paidAt));
  return (
    <Chip tone="warning" icon={Timer}>
      {prefix} {formatDeliveryPromise(deadline, now)}
    </Chip>
  );
}
