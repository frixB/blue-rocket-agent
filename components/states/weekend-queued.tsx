import { Calendar } from "lucide-react";
import { Button, Card, CardTitle, Chip, Note } from "@/components/ui";
import { StatusLayout } from "@/components/blocks/status-layout";
import { DeliveryPromise } from "@/components/blocks/delivery-promise";
import { formatDay, workStartsAt } from "@/lib/orders/sla";
import type { StateProps } from "./shared";

export function WeekendQueued({ order }: StateProps) {
  const start = formatDay(workStartsAt(new Date(order.paidAt)));
  return (
    <StatusLayout
      order={order}
      tile={{ icon: Calendar, tone: "warning" }}
      heading="You're first in the queue for Monday"
      body={`Our agents run Monday to Friday, so your report starts ${start} and lands the same day. Nothing more is needed from you.`}
      chips={<><DeliveryPromise paidAt={order.paidAt} /><Chip>● Queued, starts {start}</Chip></>}
    >
      <Card>
        <CardTitle>Why Monday?</CardTitle>
        <p className="type-body text-ink-2">Our agents and the person who checks every report both work Monday to Friday. Rather than rush a half-checked report over the weekend, we start yours first thing Monday. You&apos;re at the front of the queue.</p>
        <Note tone="success">Your order is confirmed and paid. Nothing is waiting on you.</Note>
        <Button variant="ghost" full>Need it sooner? Reply to your receipt</Button>
      </Card>
    </StatusLayout>
  );
}
