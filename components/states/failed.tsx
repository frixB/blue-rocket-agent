import { TriangleAlert, Undo2, X } from "lucide-react";
import { Card, CardTitle, Chip, buttonStyles } from "@/components/ui";
import { supportHref } from "@/lib/support";
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
      chips={<><Chip tone="danger" icon={X}>Failed{failedAt ? ` at ${formatTime(new Date(failedAt))}` : ""}</Chip><Chip tone="success" icon={Undo2}>Refunded automatically</Chip></>}
    >
      <Card>
        <RefundNote order={order} />
        <CardTitle>What happens now</CardTitle>
        <p className="type-body text-ink-2">{order.owner?.name ?? "Our team"} has been told and will email you personally within the hour with what went wrong. You don&apos;t need to chase anything: the refund is already moving and the explanation is coming to you.</p>
        <div className="flex flex-col gap-2.5">
          <a href={supportHref("Please try my report again", order.reference)} className={buttonStyles({ full: true })}>Try again for free</a>
          <p className="text-center type-body-sm text-muted">Rather leave it? You don&apos;t need to do anything. Your refund stands.</p>
        </div>
      </Card>
    </StatusLayout>
  );
}
