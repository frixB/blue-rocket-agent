import Link from "next/link";
import { notFound } from "next/navigation";
import { Card, CardTitle, Chip, IconTile, Note, Stat, buttonStyles } from "@/components/ui";
import { FindingRow } from "@/components/blocks/finding-row";
import { getOrder } from "@/lib/orders/fixtures";

const META = {
  technical: { name: "Technical SEO", emoji: "🔧" },
  on_page: { name: "On-Page SEO", emoji: "📝" },
  off_page: { name: "Off-Page & Backlinks", emoji: "🔗" },
  competitive: { name: "Competitive Analysis", emoji: "🏆" },
} as const;

/** S-14. Same four sections, same order, same names as the landing page. */
export default async function ReportPage({ params }: { params: Promise<{ orderId: string }> }) {
  const { orderId } = await params;
  const order = await getOrder(orderId);
  if (!order?.report) notFound();
  const r = order.report;
  const critical = r.sections.flatMap((s) => s.findings).filter((f) => f.severity === "critical");
  return (
    <main className="mx-auto flex w-full max-w-report flex-col gap-5 px-5 pb-[var(--page-bottom)] pt-12">
      <Card>
        <Link href={`/reports/${order.id}`} className="type-body-sm text-muted hover:text-ink">← Order status</Link>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <IconTile emoji="🔎" tone="warning" size="xl" />
            <div>
              <h1 className="type-heading-h2 text-ink">{order.businessName}</h1>
              <p className="type-body-sm text-muted">{new URL(order.websiteUrl).host} · Detailed SEO Report</p>
            </div>
          </div>
          <button type="button" className={buttonStyles()}>⬇ Download PDF</button>
        </div>
        <div className="flex flex-wrap gap-2">
          <Chip tone="danger">{r.critical} critical issues</Chip>
          <Chip tone="success">Delivered</Chip>
        </div>
      </Card>

      <Card>
        <CardTitle>Start here</CardTitle>
        <div className="flex flex-col gap-3 sm:flex-row">
          <Stat value={String(r.issues)} label="issues found" />
          <Stat value={String(r.critical)} label="critical" tone="danger" />
          <Stat value={`~${r.monthlyVisitsLost.toLocaleString("en-US")}`} label="monthly visits lost" tone="warning" />
        </div>
        <p className="type-body text-ink-2">If you only fix a few things this month, fix these. They&apos;re ranked by how much traffic each is costing you.</p>
        <ul className="flex flex-col gap-2.5">{critical.map((f) => <FindingRow key={f.title} finding={f} />)}</ul>
      </Card>

      {r.sections.map((s) => (
        <Card key={s.key} aria-labelledby={`sec-${s.key}`}>
          <div className="flex items-center gap-3.5">
            <IconTile emoji={META[s.key].emoji} />
            <div>
              <h2 id={`sec-${s.key}`} className="type-heading-h4 text-ink">{META[s.key].name}</h2>
              <p className="type-body-sm text-muted">{s.state === "complete" ? `${s.findings.length} findings` : "Unavailable"}</p>
            </div>
          </div>
          {s.state === "unavailable"
            ? <Note tone="warning">{s.reason}</Note>
            : <ul className="flex flex-col gap-2.5">{s.findings.map((f) => <FindingRow key={f.title} finding={f} />)}</ul>}
        </Card>
      ))}
    </main>
  );
}
