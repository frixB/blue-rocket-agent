import { Card, CardTitle, Note, TimelineStep } from "@/components/ui";
import { STAGE_LABEL } from "@/lib/orders/status";
import { deliveryDeadline, formatDay, formatDeliveryPromise, workStartsAt } from "@/lib/orders/sla";
import type { Order } from "@/lib/orders/types";

export function ProgressRail({ order, now }: { order: Order; now?: Date }) {
  const deadline = deliveryDeadline(new Date(order.paidAt));
  const start = workStartsAt(new Date(order.paidAt));
  const meta = (i: number) => {
    const s = order.stages[i]!;
    if (s.note && s.state !== "done") return s.note;
    switch (s.state) {
      case "done": return `Completed ${formatDay(new Date(s.at!))}${s.note ? ` \u00B7 ${s.note}` : ""}`;
      case "active": return "\u26A1 Running now";
      case "scheduled": return `Starts ${formatDay(start)}`;
      case "failed": return s.at ? `Stopped ${formatDay(new Date(s.at))}` : "Stopped";
      case "pending": return s.stage === "delivery" ? formatDeliveryPromise(deadline, now) : "Waiting";
    }
  };
  return (
    <Card aria-labelledby="rail-title">
      <CardTitle id="rail-title" className="type-body-lg font-bold">Report progress</CardTitle>
      <ol className="flex flex-col">
        {order.stages.map((s, i) => (
          <TimelineStep key={s.stage} index={i + 1} label={STAGE_LABEL[s.stage]} meta={meta(i)} state={s.state} last={i === order.stages.length - 1} />
        ))}
      </ol>
      <Note>Timestamps are real. You don&apos;t need to keep this page open.</Note>
    </Card>
  );
}
