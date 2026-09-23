import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { CreditCard, Lock } from "lucide-react";
import { ContextLayout } from "@/components/blocks/context-layout";
import { Heading, IconTile, Modal, Note, SummaryRow, buttonStyles } from "@/components/ui";
import { getOrder } from "@/lib/orders/fixtures";
import { SLA, formatPrice } from "@/lib/orders/sla";

/**
 * An unpaid order. S-03 (7358:5) when the card was declined, otherwise the
 * "finish paying" screen. Paid orders go to their status page.
 */
export default async function UnpaidOrder({ params }: { params: Promise<{ orderId: string }> }) {
  const { orderId } = await params;
  const order = await getOrder(orderId);
  if (!order) notFound();
  if (order.status !== "awaiting_payment" && order.status !== "payment_failed") redirect(`/reports/${order.id}`);
  const failed = order.status === "payment_failed";
  return (
    <ContextLayout
      title={failed ? <>Let&apos;s get you<br />back on course.</> : "One step closer."}
      lead={failed ? "Your business details are saved. Choose the next step to complete your order." : "Your details are saved. Finish paying to start your report."}
    >
      <Modal aria-labelledby="pay-title">
        <IconTile icon={failed ? CreditCard : Lock} tone={failed ? "danger" : "warning"} size="lg" />
        <div className="flex flex-col gap-2.5">
          <Heading as="h2" id="pay-title">{failed ? "Your bank declined the payment" : "Finish paying to start your report"}</Heading>
          <p className="type-body text-ink-2">
            {failed
              ? "This is usually a fraud check on a large one-off amount, not a problem with your card. Calling your bank and retrying almost always works. Your details are saved, so you won't need to fill anything in again."
              : "Your report starts as soon as payment goes through."}
          </p>
        </div>
        <Note tone="success">No charge was made. Your card has not been debited.</Note>
        <dl className="flex flex-col divide-y divide-hairline rounded-lg border border-hairline bg-sunken px-4.5 py-1.5">
          <SummaryRow label="Report type" value={SLA.productName} />
          <SummaryRow label="Business" value={order.businessName} />
          <SummaryRow label="Website" value={new URL(order.websiteUrl).host} />
          <SummaryRow label="Amount" value={formatPrice(order.amountCents)} />
        </dl>
        <div className="flex flex-col gap-2.5">
          <Link href="/order/checkout" className={buttonStyles({ full: true })}>{failed ? "Try again" : "Continue to payment"}</Link>
          {failed && <Link href="/order/checkout" className={buttonStyles({ variant: "ghost", full: true })}>Use a different card</Link>}
        </div>
      </Modal>
    </ContextLayout>
  );
}
