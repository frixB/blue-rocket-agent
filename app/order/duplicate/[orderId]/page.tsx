import Link from "next/link";
import { notFound } from "next/navigation";
import { ChartColumn } from "lucide-react";
import { ContextLayout } from "@/components/blocks/context-layout";
import { Heading, IconTile, Modal, Note, buttonStyles } from "@/components/ui";
import { getOrder } from "@/lib/orders/fixtures";
import { deliveryDeadline, formatDay, formatDeliveryPromise, formatPrice } from "@/lib/orders/sla";

/**
 * S-04 (7368:102). Shown instead of Stripe when the same email already has a
 * report in flight for the same site. `orderId` is that existing order.
 */
export default async function DuplicateGuard({ params }: { params: Promise<{ orderId: string }> }) {
  const { orderId } = await params;
  const order = await getOrder(orderId);
  if (!order) notFound();
  const paid = new Date(order.paidAt);
  return (
    <ContextLayout title={<>Your report is<br />already underway.</>} lead="Return to your current order to follow its progress.">
      <Modal aria-labelledby="dup-title">
        <IconTile icon={ChartColumn} tone="warning" size="lg" />
        <div className="flex flex-col gap-2.5">
          <Heading as="h2" id="dup-title">You already have a report running</Heading>
          <p className="type-body text-ink-2">
            Started {formatDay(paid)} for {new URL(order.websiteUrl).host}, delivering {formatDeliveryPromise(deliveryDeadline(paid))}. You don&apos;t need to pay again.
          </p>
        </div>
        <Note tone="success">Your {formatPrice(order.amountCents)} from the first order covers this report. Nothing extra has been charged.</Note>
        <Link href={`/reports/${order.id}`} className={buttonStyles({ full: true })}>View my report</Link>
        <Link href="/order" className={buttonStyles({ variant: "ghost", full: true })}>No, this is a different site. Continue anyway</Link>
      </Modal>
    </ContextLayout>
  );
}
