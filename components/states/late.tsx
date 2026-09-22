import { Button, Card, CardTitle, Chip } from "@/components/ui";
import { StatusLayout } from "@/components/blocks/status-layout";
import { RefundNote, type StateProps } from "./shared";

export function Late({ order }: StateProps) {
  return (
    <StatusLayout
      order={order}
      tile={{ emoji: "⏱", tone: "warning" }}
      heading="We're past the day we promised"
      body="Your site is larger than average and the analysis is taking longer than usual. Everything is running normally. Nothing is stuck and nothing is waiting on you."
      chips={<><Chip tone="warning">⏱ Running over</Chip><Chip>● Still running, no action needed</Chip></>}
    >
      <Card>
        <CardTitle>What we&apos;re doing about it</CardTitle>
        <p className="type-body text-ink-2">We emailed you rather than leave you to find this by refreshing. The progress on the right is real, not an estimate.</p>
        <RefundNote order={order} lead="Because we missed our deadline, your report is free. Your refund was issued" />
        <Button variant="secondary" full>Talk to a person about this</Button>
      </Card>
    </StatusLayout>
  );
}
