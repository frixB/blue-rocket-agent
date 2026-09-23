import { Clock } from "lucide-react";
import { Button, Card, CardTitle, Chip } from "@/components/ui";
import { StatusLayout } from "@/components/blocks/status-layout";
import { RefundNote, type StateProps } from "./shared";

export function Late({ order }: StateProps) {
  const pages = order.stages.find((s) => s.stage === "crawl")?.note?.match(/(\d[\d,]*) pages/)?.[1];
  const step = order.stages.findIndex((s) => s.state === "active") + 1;
  const body = `${pages ? `Your site has ${pages} pages, which is well above average, and the analysis is taking longer than usual.` : "Your site is larger than average and the analysis is taking longer than usual."} Everything is running normally${step ? `: we're at step ${step} of ${order.stages.length}` : ""}. Nothing is waiting on you.`;
  return (
    <StatusLayout
      order={order}
      tile={{ icon: Clock, tone: "warning" }}
      heading="We're past the day we promised"
      body={body}
      chips={<><Chip tone="warning">⏱ Running over</Chip><Chip>● Still running, no action needed</Chip></>}
    >
      <Card>
        <CardTitle>What we&apos;re doing about it</CardTitle>
        <p className="type-body text-ink-2">We emailed you rather than leave you to find this by refreshing. The progress on the right is real, not an estimate.</p>
        <RefundNote order={order} lead="Because we missed our deadline, your report is free. Your refund was issued" />
        <Button variant="ghost" full>Talk to a person about this</Button>
      </Card>
    </StatusLayout>
  );
}
