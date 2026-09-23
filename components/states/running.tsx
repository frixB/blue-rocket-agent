import { ChartColumn, Clock } from "lucide-react";
import { Card, CardTitle, StepList } from "@/components/ui";
import { StatusLayout } from "@/components/blocks/status-layout";
import { DeliveryPromise } from "@/components/blocks/delivery-promise";
import { formatDay, formatPrice, queueReason, workStartsAt } from "@/lib/orders/sla";
import { RunningChip, type StateProps } from "./shared";

export function Running({ order }: StateProps) {
  const queued = order.status === "queued";
  const overnight = queued && queueReason(new Date(order.paidAt)) === "overnight";
  return (
    <StatusLayout
      order={order}
      tile={{ icon: queued ? Clock : ChartColumn, tone: "warning" }}
      heading={overnight ? `Your report starts ${formatDay(workStartsAt(new Date(order.paidAt)))}` : "Your report is being generated"}
      body="Payment confirmed. Our AI agents are working through your site and compiling your SEO report. You can close this page. It will be here when you come back."
      chips={<><DeliveryPromise paidAt={order.paidAt} />{!queued && <RunningChip />}</>}
    >
      <Card>
        <CardTitle>What happens next</CardTitle>
        <StepList steps={[
          { title: "Payment confirmed", body: `Your ${formatPrice(order.amountCents)} payment was processed by Stripe.`, state: "done" },
          { title: queued ? "Agents start soon" : "AI agents are working now", body: "Our agents analyse your site across 4 SEO areas.", state: queued ? "pending" : "active" },
          { title: "Report lands here and in your inbox", body: `We email ${order.email} the moment it's ready. This page updates either way.`, state: "pending" },
        ]} />
      </Card>
    </StatusLayout>
  );
}
