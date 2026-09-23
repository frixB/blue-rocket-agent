import { notFound } from "next/navigation";
import { ContextLayout } from "@/components/blocks/context-layout";
import { ClaimAccountForm } from "@/components/blocks/auth-forms";
import { Modal } from "@/components/ui";
import { getOrder } from "@/lib/orders/fixtures";

/** S-07 Claim your account (7368:2). Reached from the "Set a password" banner on any order page. */
export default async function Claim({ params }: { params: Promise<{ orderId: string }> }) {
  const order = await getOrder((await params).orderId);
  if (!order) notFound();
  return (
    <ContextLayout title={<>Keep your next<br />steps close.</>} lead="Create an account to return to your report and its recommendations.">
      <Modal aria-label="Save your report"><ClaimAccountForm email={order.email} orderId={order.id} /></Modal>
    </ContextLayout>
  );
}
