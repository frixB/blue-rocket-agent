import { redirect } from "next/navigation";
import type { StateProps } from "./shared";

/**
 * Unpaid orders have no status page yet. They live on the order flow:
 * /order/[id] renders "finish paying" or S-03 (payment failed).
 */
export function PaymentPending({ order }: StateProps): never {
  redirect(`/order/${order.id}`);
}
