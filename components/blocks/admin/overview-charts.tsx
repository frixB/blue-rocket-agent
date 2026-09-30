import type { Route } from "next";
import { format } from "date-fns";
import { BarList, ColumnChart } from "@/components/ui";
import { clockState } from "@/lib/admin/clock";
import type { DailyStat } from "@/lib/admin/fixtures";
import type { AdminOrder, AdminStatus } from "@/lib/admin/types";
import { formatPriceShort } from "@/lib/orders/sla";
import { ChartCard } from "./chart-card";

const tick = (iso: string) => format(new Date(iso), "d");
const title = (iso: string) => format(new Date(iso), "EEE d MMM");
const usdCompact = (cents: number) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", notation: "compact" }).format(cents / 100);

/** The 24-hour promise, day by day. On time in the action blue, late in danger red: the pair passes the colour-blind check. */
export function OnTimeChart({ stats }: { stats: DailyStat[] }) {
  const delivered = stats.reduce((a, d) => a + d.delivered, 0);
  const late = stats.reduce((a, d) => a + d.late, 0);
  const rate = delivered ? Math.round(((delivered - late) / delivered) * 100) : 100;
  return (
    <ChartCard id="ontime" title="Delivered within 24 hours" note="Reports sent per day, last 14 days"
      headline={{ value: `${rate}%`, label: `on time · ${late} of ${delivered} late` }}
      table={{ caption: "Reports delivered per day, on time and late", columns: ["Day", "On time", "Late"],
        rows: stats.map((d) => [title(d.day), d.delivered - d.late, d.late]) }}>
      <ColumnChart label={`Reports delivered per day over the last 14 days. ${rate}% on time.`}
        series={[{ name: "On time", fill: "bg-action" }, { name: "Late", fill: "bg-danger-accent" }]}
        data={stats.map((d) => ({ key: d.day, tick: tick(d.day), title: title(d.day), values: [d.delivered - d.late, d.late] }))} />
    </ChartCard>
  );
}

const STAGES: { label: string; statuses: AdminStatus[]; href: Route; fill?: string }[] = [
  { label: "Queued", statuses: ["queued"], href: "/admin/orders?status=running" as Route },
  { label: "Crawling", statuses: ["crawling"], href: "/admin/orders?status=running" as Route },
  { label: "Analysing", statuses: ["analysing"], href: "/admin/orders?status=running" as Route },
  { label: "Compiling", statuses: ["compiling"], href: "/admin/orders?status=running" as Route },
  { label: "In review", statuses: ["reviewing"], href: "/admin/review" },
  { label: "Blocked", statuses: ["blocked"], href: "/admin/orders?status=customer" as Route },
  { label: "Late or escalated", statuses: ["late", "escalated"], href: "/admin/orders?status=problems" as Route, fill: "bg-danger-accent" },
];

/** Where the orders on the clock are sitting right now. A pile-up in one stage is a pipeline problem. */
export function PipelineChart({ orders, now }: { orders: AdminOrder[]; now: Date }) {
  const live = orders.filter((o) => !["unpaid", "delivered", "closed"].includes(clockState(o, now)) && o.status !== "failed");
  const rows = STAGES.map((s) => ({ label: s.label, value: live.filter((o) => s.statuses.includes(o.status)).length, href: s.href, fill: s.fill }));
  const busiest = rows.slice(0, 5).reduce((a, b) => (b.value > a.value ? b : a));
  return (
    <ChartCard id="pipeline" title="Where orders are now" note="Paid orders not yet delivered. Select a row to see them."
      headline={{ value: String(live.length), label: busiest.value ? `on the clock, ${busiest.value} ${busiest.label.toLowerCase()}` : "on the clock" }}>
      <BarList label="Orders on the clock by stage" rows={rows} />
    </ChartCard>
  );
}

/** Money in per day. Owners only. One series, so no legend: the title names it. */
export function RevenueChart({ stats }: { stats: DailyStat[] }) {
  const gross = stats.reduce((a, d) => a + d.grossCents, 0);
  const refunded = stats.reduce((a, d) => a + d.refundedCents, 0);
  return (
    <ChartCard id="revenue" title="Money in" note={`Paid orders per day, last 14 days · ${formatPriceShort(refunded)} refunded`}
      headline={{ value: formatPriceShort(gross - refunded), label: "after refunds, before Stripe fees" }}
      table={{ caption: "Money in and refunded per day", columns: ["Day", "Paid", "Refunded"],
        rows: stats.map((d) => [title(d.day), formatPriceShort(d.grossCents), d.refundedCents ? formatPriceShort(d.refundedCents) : "—"]) }}>
      <ColumnChart label={`Money in per day over the last 14 days. ${formatPriceShort(gross)} in total.`} format={usdCompact}
        series={[{ name: "Paid", fill: "bg-action" }]}
        data={stats.map((d) => ({ key: d.day, tick: tick(d.day), title: title(d.day), values: [d.grossCents] }))} />
    </ChartCard>
  );
}
