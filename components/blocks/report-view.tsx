import Link from "next/link";
import { ArrowLeft, Download, Rocket, Search } from "lucide-react";
import { Button, Card, Chip, Heading, Icon, IconTile, Note, Stat, SummaryRow, buttonStyles } from "@/components/ui";
import { SLA, formatDate, formatDuration, formatPrice } from "@/lib/orders/sla";
import type { Order } from "@/lib/orders/types";
import { CopyShareLink } from "./copy-share-link";
import { FindingRow } from "./finding-row";
import { REPORT_SECTIONS } from "./report-sections";

type Mode = "owner" | "shared";
const CONTACT = "hello@bluerocketagents.com";

/**
 * The report itself. `owner` is S-14 Report detail (7365:2); `shared` is
 * S-15 Shared read-only view (7369:72): no actions, a "shared by" banner,
 * and a card inviting the reader to get their own.
 */
export function ReportView({ order, mode }: { order: Order; mode: Mode }) {
  const r = order.report!;
  const host = new URL(order.websiteUrl).host;
  const all = r.sections.flatMap((s) => s.findings);
  const critical = all.filter((f) => f.severity === "critical");
  const nav = [
    ...(mode === "owner" ? [{ id: "fix-first", label: "What to fix first" }] : []),
    { id: "overview", label: mode === "owner" ? "Overview" : "Start here" },
    ...r.sections.map((s) => ({ id: `sec-${s.key}`, label: REPORT_SECTIONS[s.key].name })),
    ...(mode === "shared" ? [{ id: "fix-first", label: "What to fix first" }] : []),
  ];

  const fixFirst = (
    <Card id="fix-first" aria-labelledby="fix-first-title" className="scroll-mt-6 border-info bg-info">
      <Heading as="h2" variant="h2" id="fix-first-title">What should I fix first?</Heading>
      <ol className="flex list-decimal flex-col gap-2 pl-5 type-body text-ink-2">{r.fixFirst.map((x) => <li key={x}>{x}</li>)}</ol>
      <a href={`mailto:${CONTACT}?subject=${encodeURIComponent(`Walk through report #${order.reference}`)}`} className={buttonStyles({ variant: "ghost", full: true })}>
        Book a call to walk through this
      </a>
    </Card>
  );

  return (
    <>
      {mode === "shared" && (
        <div data-theme="marketing" className="flex flex-wrap items-center justify-between gap-3 bg-page px-nav-x py-4.5 text-ink">
          <div className="flex items-center gap-3">
            <IconTile icon={Rocket} tone="action" size="xs" />
            <div className="flex flex-col">
              <span className="type-body-strong">Shared by {order.businessName}</span>
              <span className="type-caption text-muted">Blue Rocket Agents · {SLA.productName} · read-only</span>
            </div>
          </div>
          <span className="type-body-sm text-muted">View only</span>
        </div>
      )}
      <div className="mx-auto grid w-full max-w-report gap-8 px-5 pb-page-bottom pt-12 lg:grid-cols-[1fr_var(--container-side)]">
        <main className="flex min-w-0 flex-col gap-section">
          <Card>
            {mode === "owner"
              ? <Link href="/reports" className="flex items-center gap-1.5 self-start type-body-sm text-muted hover:text-ink"><Icon icon={ArrowLeft} size="sm" /> My Reports</Link>
              : <p className="type-body-sm text-muted">{SLA.productName}</p>}
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <IconTile icon={Search} tone="warning" size="lg" />
                <div className="flex flex-col gap-1">
                  <Heading>{order.businessName}</Heading>
                  <p className="type-body-sm text-muted">{host} · {SLA.productName} · generated {formatDate(new Date(r.deliveredAt))}</p>
                </div>
              </div>
              {mode === "owner" && (
                <div className="flex gap-2.5">
                  <Button><Icon icon={Download} size="sm" /> Download PDF</Button>
                  <CopyShareLink token={order.shareToken} />
                </div>
              )}
            </div>
            <div className="flex flex-wrap gap-2.5">
              <Chip tone="warning">Overall health {r.score} / 100</Chip>
              <Chip tone="danger">{r.critical} critical issues</Chip>
              <Chip tone="success">Delivered in {formatDuration(new Date(order.paidAt), new Date(r.deliveredAt))}</Chip>
            </div>
          </Card>

          {mode === "owner" && fixFirst}

          <Card id="overview" aria-labelledby="overview-title" className="scroll-mt-6">
            <Heading as="h2" variant="h2" id="overview-title">{mode === "owner" ? "Your SEO at a glance" : "Start here"}</Heading>
            <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
              <Stat value={String(r.issues)} label="issues found" />
              <Stat value={String(r.critical)} label="critical" tone="danger" />
              <Stat value={`~${r.monthlyVisitsLost.toLocaleString("en-US")}`} label="monthly visits lost" tone="warning" />
              <Stat value={`#${r.localRank}`} label="avg. local rank" />
            </div>
            <p className="type-body text-ink-2">
              If you only fix {critical.length === 1 ? "one thing" : `${critical.length} things`} this month, fix these. They&apos;re ranked by how much traffic each is costing you, not by how hard they are.
            </p>
            <ul className="flex flex-col gap-2.5">{critical.map((f) => <FindingRow key={f.title} finding={f} />)}</ul>
          </Card>

          {r.sections.map((s) => {
            const meta = REPORT_SECTIONS[s.key];
            const crit = s.findings.filter((f) => f.severity === "critical").length;
            return (
              <Card key={s.key} id={`sec-${s.key}`} aria-labelledby={`sec-${s.key}-title`} className="scroll-mt-6">
                <div className="flex items-center gap-3.5">
                  <IconTile icon={meta.icon} />
                  <div className="flex flex-col">
                    <Heading as="h2" variant="h3" id={`sec-${s.key}-title`}>{meta.name}</Heading>
                    <p className="type-body-sm text-muted">
                      {s.state === "complete" ? `${s.findings.length} ${s.findings.length === 1 ? "finding" : "findings"} · ${crit} critical` : "Unavailable"}
                    </p>
                  </div>
                </div>
                {s.state === "unavailable"
                  ? <Note tone="warning">{s.reason}</Note>
                  : <ul className="flex flex-col gap-2.5">{s.findings.map((f) => <FindingRow key={f.title} finding={f} />)}</ul>}
              </Card>
            );
          })}

          {mode === "shared" && fixFirst}

          {mode === "shared" && (
            <section data-theme="marketing" aria-labelledby="cta-title" className="flex flex-col items-center gap-3.5 rounded-card bg-page px-card py-9 text-center text-ink">
              <Heading as="h2" variant="h2" id="cta-title">Want one for your own site?</Heading>
              <p className="max-w-xl type-body text-ink-2">Full SEO report, {formatPrice(SLA.priceCents)} flat, delivered within one business day. No subscription, no agency retainer.</p>
              <Link href="/" className={buttonStyles()}>Get my report</Link>
            </section>
          )}
        </main>

        <aside className="flex flex-col gap-5 lg:sticky lg:top-6 lg:self-start">
          <Card compact className="gap-2.5">
            <p className="type-caption-strong text-muted">In this report</p>
            <nav aria-label="Report sections">
              <ul className="flex flex-col gap-1">
                {nav.map((n) => (
                  <li key={n.id}><a href={`#${n.id}`} className="block rounded-sm px-3 py-2 type-body-sm text-ink-2 hover:bg-warning hover:text-warning-ink">{n.label}</a></li>
                ))}
              </ul>
            </nav>
          </Card>
          {mode === "owner" && (
            <Card compact className="gap-0">
              <p className="type-caption-strong text-muted">Report details</p>
              <dl className="flex flex-col">
                <SummaryRow label="Reference" value={`#${order.reference}`} />
                <SummaryRow label="Generated" value={formatDate(new Date(r.deliveredAt))} />
                <SummaryRow label="Paid" value={formatPrice(order.amountCents)} />
                <SummaryRow label="Pages crawled" value={String(r.pagesCrawled)} />
              </dl>
            </Card>
          )}
        </aside>
      </div>
    </>
  );
}
