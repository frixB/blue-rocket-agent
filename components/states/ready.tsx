import { Bookmark, Check, FileText, Gift, PartyPopper } from "lucide-react";
import Link from "next/link";
import { Card, CardTitle, Chip, Note, Stat, buttonStyles } from "@/components/ui";
import { CopyShareLink } from "@/components/blocks/copy-share-link";
import { PdfDownload } from "@/components/blocks/pdf-download";
import { SectionStatusList } from "@/components/blocks/section-status";
import { StatusLayout } from "@/components/blocks/status-layout";
import { deliveryDeadline, formatDay, formatDuration } from "@/lib/orders/sla";
import type { StateProps } from "./shared";

const SECTION_NAME = { technical: "Technical SEO", on_page: "On-Page SEO", off_page: "Off-Page & Backlinks", competitive: "Competitive Analysis" } as const;
/** "A, B and C". */
const list = (xs: string[]) => (xs.length < 2 ? xs.join("") : `${xs.slice(0, -1).join(", ")} and ${xs.at(-1)}`);

/** S-13 Report ready and S-09 Partial report. */
export function Ready({ order }: StateProps) {
  const r = order.report!;
  const partial = order.status === "partial";
  const missing = r.sections.filter((s) => s.state === "unavailable");
  const done = r.sections.filter((s) => s.state === "complete");
  const paid = new Date(order.paidAt);
  const delivered = new Date(r.deliveredAt);
  const early = delivered.getTime() <= deliveryDeadline(paid).getTime();
  return (
    <StatusLayout
      order={order}
      tile={{ icon: partial ? FileText : PartyPopper, tone: partial ? "warning" : "success" }}
      heading={partial ? "Your report is ready, with one section we couldn't complete" : "Your report is ready"}
      body={partial
        ? `${list(done.map((d) => SECTION_NAME[d.key]))} ${done.length === 1 ? "is" : "are all"} done. We couldn't complete ${list(missing.map((m) => SECTION_NAME[m.key]))}. ${missing[0]?.reason ?? ""}`
        : `Delivered in ${formatDuration(paid, delivered)}. We found ${r.issues} issues across your site, ${r.critical} of them critical. A copy is on its way to ${order.email}.`}
      chips={
        <>
          <Chip tone={partial ? "warning" : "success"} icon={Check}>
            Delivered {formatDay(delivered)}{early && !partial ? ", ahead of schedule" : ""}{partial ? ` · ${r.sections.length - missing.length} of ${r.sections.length} sections` : ""}
          </Chip>
          {partial
            ? <Chip tone="success" icon={Gift}>Credit added to your account</Chip>
            : order.claimed && <Chip icon={Bookmark}>Saved to My Reports</Chip>}
        </>
      }
    >
      <Card>
        {partial ? (
          <>
            <CardTitle>What&apos;s in your report</CardTitle>
            <SectionStatusList sections={r.sections} />
            <Note tone="success">We&apos;ve credited you a free backlink report, redeemable any time after your domain is 90 days old. It&apos;s already in My Reports.</Note>
          </>
        ) : (
          <>
            <CardTitle>What we found</CardTitle>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Stat value={String(r.issues)} label="issues found across your site" />
              <Stat value={String(r.critical)} label="critical, fix these first" tone="danger" />
              <Stat value={`~${r.monthlyVisitsLost.toLocaleString("en-US")}`} label="monthly visits you're likely losing" tone="warning" />
            </div>
            <p className="type-body text-ink-2">Your report ranks every finding by impact, so you know what to fix first.</p>
          </>
        )}
        <div className="flex flex-col gap-2.5">
          <Link href={`/reports/${order.id}/report`} className={buttonStyles({ full: true })}>Read your report</Link>
          <PdfDownload id={order.id} full />
          {!partial && <CopyShareLink token={order.shareToken} label="Copy a link to share it" variant="text" full />}
        </div>
      </Card>
    </StatusLayout>
  );
}
