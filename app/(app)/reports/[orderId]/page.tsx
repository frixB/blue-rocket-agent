import { notFound } from "next/navigation";
import { OrderState } from "@/components/states";
import { StatusPoller } from "@/components/blocks/status-poller";
import { currentUser } from "@/auth";
import { findUserByEmail } from "@/lib/db";
import { getOrder } from "@/lib/orders/fixtures";
import { isInFlight } from "@/lib/orders/status";

/** S-06. The permanent order URL. Same page for every state. */
export default async function OrderPage({ params }: { params: Promise<{ orderId: string }> }) {
  const { orderId } = await params;
  const found = await getOrder(orderId);
  if (!found) notFound();
  // Hide the "Set a password" banner once the owner has one.
  const user = await currentUser();
  const claimed = found.claimed || (user?.email.toLowerCase() === found.email.toLowerCase() && Boolean((await findUserByEmail(user.email))?.password_hash));
  const order = { ...found, claimed };
  return (
    <>
      <StatusPoller active={isInFlight(order.status)} />
      <OrderState order={order} />
    </>
  );
}
