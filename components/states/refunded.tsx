import { RefreshCw, Undo2 } from "lucide-react";
import Link from "next/link";
import { Card, CardTitle, Chip, buttonStyles } from "@/components/ui";
import { StatusLayout } from "@/components/blocks/status-layout";
import { RefundNote, type StateProps } from "./shared";

export function Refunded({ order }: StateProps) {
  return (
    <StatusLayout order={order} showClaim={false} tile={{ icon: RefreshCw, tone: "info" }}
      heading="Your payment has been refunded"
      body={order.refund?.reason ?? "This order was refunded."}
      chips={<Chip tone="info" icon={Undo2}>Refunded</Chip>}>
      <Card>
        <RefundNote order={order} lead="Refund issued" />
        <CardTitle>Want to try again?</CardTitle>
        <p className="type-body text-ink-2">Your business details are saved. Starting a new report takes about a minute.</p>
        <Link href="/order" className={buttonStyles({ full: true })}>Start a new report</Link>
      </Card>
    </StatusLayout>
  );
}
