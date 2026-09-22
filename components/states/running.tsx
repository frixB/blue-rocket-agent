import { ChartColumn, Clock } from "lucide-react";
import { Card, CardTitle } from "@/components/ui";
import { StatusLayout } from "@/components/blocks/status-layout";
import { DeliveryPromise } from "@/components/blocks/delivery-promise";
import { queueReason, workStartsAt, formatDay } from "@/lib/orders/sla";
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
        <ol className="flex flex-col gap-4 type-body-sm text-ink-2">
          <li><strong className="text-ink">Payment confirmed.</strong> Stripe processed your payment.</li>
          <li><strong className="text-ink">Agents are working.</strong> We analyse your site across 4 SEO areas.</li>
          <li><strong className="text-ink">Your report lands here and in your inbox.</strong> We email {order.email} the moment it&apos;s ready. This page updates either way.</li>
        </ol>
      </Card>
    </StatusLayout>
  );
}
