import { ContextLayout } from "@/components/blocks/context-layout";
import { OrderForm } from "@/components/blocks/order-form";
import { Modal } from "@/components/ui";
import { SLA, formatPrice } from "@/lib/orders/sla";

/** Form steps 1 and 2. Intake is saved BEFORE Stripe so leads survive a failed payment (architecture.md §8.2). */
export default function OrderPage() {
  return (
    <ContextLayout
      title={<>A clearer picture.<br />A better next step.</>}
      lead="Turn your website into a focused plan for better search visibility."
      steps={["Share your business", "Add your report details", "Get a prioritised action plan"]}
    >
      <Modal aria-label="Order your report">
        <OrderForm price={formatPrice(SLA.priceCents)} productName={SLA.productName} />
      </Modal>
    </ContextLayout>
  );
}
