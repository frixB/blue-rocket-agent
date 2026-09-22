import { FileText, PartyPopper } from "lucide-react";
import Link from "next/link";
import { Button, Card, CardTitle, Chip, Note, Stat, buttonStyles } from "@/components/ui";
import { StatusLayout } from "@/components/blocks/status-layout";
import { deliveryDeadline, formatDay, formatDuration } from "@/lib/orders/sla";
import type { StateProps } from "./shared";

const SECTION_NAME = { technical: "Technical SEO", on_page: "On-Page SEO", off_page: "Off-Page & Backlinks", competitive: "Competitive Analysis" } as const;

/** S-13 Report ready and S-09 Partial report. */
export function Ready({ order }: StateProps) {
  const r = order.report!;
  const partial = order.status === "partial";
  const missing = r.sections.filter((s) => s.state === "unavailable");
  const paid = new Date(order.paidAt);
  const delivered = new Date(r.deliveredAt);
  const early = delivered.getTime() <= deliveryDeadline(paid).getTime();
  return (
    <StatusLayout
      order={order}
      tile={{ icon: partial ? FileText : PartyPopper, tone: partial ? "warning" : "success" }}
      heading={partial ? "Your report is ready, with one section we couldn't complete" : "Your report is ready"}
      body={`Delivered in ${formatDuration(paid, delivered)}. We found ${r.issues} issues across your site, ${r.critical} of them critical. A copy is on its way to ${order.email}.`}
      chips={
        <>
          <Chip tone={partial ? "warning" : "success"}>
            ✓ Delivered {formatDay(delivered)}{early && !partial ? ", ahead of schedule" : ""}{partial ? ` · ${r.sections.length - missing.length} of ${r.sections.length} sections` : ""}
          </Chip>
          {order.claimed && <Chip><span aria-hidden>●</span> Saved to your dashboard</Chip>}
        </>
      }
    >
      <Card>
        <CardTitle>What we found</CardTitle>
        <div className="flex flex-col gap-3 sm:flex-row">
          <Stat value={String(r.issues)} label="issues found across your site" />
          <Stat value={String(r.critical)} label="critical, fix these first" tone="danger" />
          <Stat value={`~${r.monthlyVisitsLost.toLocaleString("en-US")}`} label="monthly visits you're likely losing" tone="warning" />
        </div>
        <p className="type-body text-ink-2">Your report ranks every finding by impact, so you know what to fix first.</p>
        {missing.map((s) => (
          <Note key={s.key} tone="warning">{SECTION_NAME[s.key]} is unavailable. {s.reason}</Note>
        ))}
        {partial && <Note tone="success" glyph="🎁">We&apos;ve credited you a free backlink report once your domain is 90 days old. It&apos;s already in your dashboard.</Note>}
        <div className="flex flex-col gap-2.5">
          <Link href={`/reports/${order.id}/report`} className={buttonStyles({ full: true })}>Read your report</Link>
          <Button variant="ghost" full>Download PDF</Button>
          <Button variant="text" full>Email it to someone else</Button>
        </div>
      </Card>
    </StatusLayout>
  );
}
