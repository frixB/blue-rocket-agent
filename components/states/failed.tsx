import { TriangleAlert } from "lucide-react";
import { Button, Card, CardTitle, Chip } from "@/components/ui";
import { StatusLayout } from "@/components/blocks/status-layout";
import { formatTime } from "@/lib/orders/sla";
import { RefundNote, type StateProps } from "./shared";

export function Failed({ order }: StateProps) {
  const failedAt = order.stages.find((s) => s.state === "failed")?.at;
  return (
    <StatusLayout
      order={order}
      showClaim={false}
      tile={{ icon: TriangleAlert, tone: "danger" }}
      heading="We couldn't complete your report"
      body="Our analysis failed partway through and retrying hasn't fixed it. This is our problem, not yours, and not something you did wrong."
      chips={<><Chip tone="danger">✕ Failed{failedAt ? ` at ${formatTime(new Date(failedAt))}` : ""}</Chip><Chip tone="success">● Refunded automatically</Chip></>}
    >
      <Card>
        <RefundNote order={order} />
        <CardTitle>What happens now</CardTitle>
        <p className="type-body text-ink-2">{order.owner?.name ?? "Our team"} has been told and will email you personally within the hour with what went wrong. You don&apos;t need to chase anything: the refund is already moving and the explanation is coming to you.</p>
        <div className="flex flex-col gap-2.5">
          <Button full>Try again free, we&apos;ll cover it</Button>
          <Button variant="ghost" full>Just refund me, no retry</Button>
        </div>
      </Card>
    </StatusLayout>
  );
}
