import { Mail, TriangleAlert, User } from "lucide-react";
import { Avatar, Card, CardTitle, Chip, buttonStyles } from "@/components/ui";
import { StatusLayout } from "@/components/blocks/status-layout";
import { RefundNote, type StateProps } from "./shared";

export function Escalated({ order }: StateProps) {
  const owner = order.owner ?? { name: "Our team", email: "hello@bluerocketagents.com" };
  return (
    <StatusLayout
      order={order}
      showClaim={false}
      tile={{ icon: Mail, tone: "danger" }}
      heading="This has taken far too long"
      body="Your report has run a full business day past what we promised. We've stopped giving you estimates because ours have clearly been wrong."
      chips={<><Chip tone="danger" icon={TriangleAlert}>Overdue</Chip><Chip tone="warning" icon={User}>Escalated to a person</Chip></>}
    >
      <Card>
        <RefundNote order={order} lead="Your $1,500 has been refunded in full, automatically. You didn't have to ask. Issued" />
        <CardTitle>{owner.name} is handling this personally</CardTitle>
        <div className="flex items-center gap-3.5">
          <Avatar name={owner.name} size="lg" />
          <div className="flex flex-col"><span className="type-body-strong text-ink">{owner.name} · Blue Rocket Agents</span><span className="type-body-sm text-muted">{owner.email} · replies within 1 business hour</span></div>
        </div>
        <p className="type-body text-ink-2">You&apos;ll get either the finished report or a straight answer about why it isn&apos;t possible. You get the report either way. The refund stands.</p>
        <a className={buttonStyles({ variant: "ghost", full: true })} href={`mailto:${owner.email}`}>Email {owner.name.split(" ")[0]} directly</a>
      </Card>
    </StatusLayout>
  );
}
