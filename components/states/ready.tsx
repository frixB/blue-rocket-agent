import Link from "next/link";
import { Button, Card, CardTitle, Chip, Note, Stat, buttonStyles } from "@/components/ui";
import { StatusLayout } from "@/components/blocks/status-layout";
import { formatDay } from "@/lib/orders/sla";
import type { StateProps } from "./shared";

const SECTION_NAME = { technical: "Technical SEO", on_page: "On-Page SEO", off_page: "Off-Page & Backlinks", competitive: "Competitive Analysis" } as const;

export function Ready({ order }: StateProps) {
  const r = order.report!;
  const partial = order.status === "partial";
  const missing = r.sections.filter((s) => s.state === "unavailable");
  return (
    <StatusLayout
      order={order}
      tile={{ emoji: partial ? "📗" : "🎉", tone: partial ? "warning" : "success" }}
      heading={partial ? "Your report is ready, with one section we couldn't complete" : "Your report is ready"}
      body={`We found ${r.issues} issues across your site, ${r.critical} of them critical. A copy is on its way to ${order.email}.`}
      chips={<><Chip tone={partial ? "warning" : "success"}>✓ Delivered {formatDay(new Date(r.deliveredAt))}{partial ? ` · ${r.sections.length - missing.length} of ${r.sections.length} sections` : ""}</Chip></>}
    >
      <Card>
        <CardTitle>What we found</CardTitle>
        <div className="flex flex-col gap-3 sm:flex-row">
          <Stat value={String(r.issues)} label="issues found across your site" />
          <Stat value={String(r.critical)} label="critical, fix these first" tone="danger" />
          <Stat value={`~${r.monthlyVisitsLost.toLocaleString("en-US")}`} label="monthly visits you're likely losing" tone="warning" />
        </div>
        {missing.map((s) => (
          <Note key={s.key} tone="warning">{SECTION_NAME[s.key]} is unavailable. {s.reason}</Note>
        ))}
        {partial && <Note tone="success" glyph="🎁">We&apos;ve credited you a free backlink report once your domain is 90 days old. It&apos;s already in your dashboard.</Note>}
        <div className="flex flex-col gap-2.5">
          <Link href={`/reports/${order.id}/report`} className={buttonStyles({ full: true })}>Read your report</Link>
          <Button variant="secondary" full>Download PDF</Button>
        </div>
      </Card>
    </StatusLayout>
  );
}
