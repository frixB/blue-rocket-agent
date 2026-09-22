import { notFound } from "next/navigation";
import { OrderState } from "@/components/states";
import { StatusPoller } from "@/components/blocks/status-poller";
import { getOrder } from "@/lib/orders/fixtures";
import { isInFlight } from "@/lib/orders/status";

/** S-06. The permanent order URL. Same page for every state. */
export default async function OrderPage({ params }: { params: Promise<{ orderId: string }> }) {
  const { orderId } = await params;
  const order = await getOrder(orderId);
  if (!order) notFound();
  return (
    <>
      <StatusPoller active={isInFlight(order.status)} />
      <OrderState order={order} />
    </>
  );
}
