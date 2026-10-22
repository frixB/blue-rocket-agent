import type { Route } from "next";
import { Users } from "lucide-react";
import { Avatar, Card, Chip } from "@/components/ui";
import { AdminPage } from "@/components/blocks/admin/admin-page";
import { AttentionList } from "@/components/blocks/admin/attention-list";
import { CardHeader } from "@/components/blocks/admin/card-header";
import { GlanceStrip } from "@/components/blocks/admin/glance-strip";
import { OnTimeChart, PipelineChart, RevenueChart } from "@/components/blocks/admin/overview-charts";
import { needsAttention } from "@/lib/admin/attention";
import { clockState, formatRelative } from "@/lib/admin/clock";
import { listDailyStats, listLeads, listOrders } from "@/lib/admin/data";
import { currentAdmin, isOwner } from "@/lib/admin/session";
import { SLA, formatPriceShort } from "@/lib/orders/sla";

export const dynamic = "force-dynamic";

const RUNNING = new Set(["on_track", "urgent", "late", "escalated"]);

export default async function AdminOverview() {
  const now = new Date();
  const [user, orders, leads, stats] = await Promise.all([currentAdmin(), listOrders(now), listLeads(), listDailyStats(now)]);
  const attention = needsAttention(orders, now);
  const attentionOrders = new Set(attention.map((item) => item.order.id)).size;
  const running = orders.filter((o) => RUNNING.has(clockState(o, now)));
  const inReview = orders.filter((o) => o.status === "reviewing").length;
  const urgent = running.filter((o) => clockState(o, now) === "urgent").length;
  const late = running.filter((o) => ["late", "escalated"].includes(clockState(o, now))).length;
  const day = now.getTime() - 24 * 3_600_000;
  const paidToday = orders.filter((o) => new Date(o.paidAt).getTime() > day && !["awaiting_payment", "payment_failed"].includes(o.status));
  const revenue = paidToday.reduce((sum, o) => sum + o.amountCents, 0);
  const newLeads = leads.filter((l) => l.hoursAgo < 24);

  return (
    <AdminPage title="Overview" intro={`Every order has ${SLA.deliveryHours} hours from payment, any day.`}>
      <GlanceStrip label="Today at a glance" items={[
        { label: "On the clock", value: String(running.length) },
        { label: "Under 4h left", value: String(urgent), tone: urgent ? "warning" : "neutral" },
        { label: "Late or escalated", value: String(late), tone: late ? "danger" : "neutral", href: "/admin/orders?status=problems" as Route },
        { label: "Waiting for review", value: String(inReview), href: "/admin/review" },
        isOwner(user)
          ? { label: `Paid in 24h · ${paidToday.length} orders`, value: formatPriceShort(revenue) }
          : { label: "New leads in 24h", value: String(newLeads.length), href: "/admin/leads" as Route },
      ]} />

      {/* One canonical work surface. Inventory stays in Orders; this list only shows work requiring intervention. */}
      <Card aria-labelledby="attention-title" className="min-w-0 gap-1">
        <CardHeader id="attention-title" title="Action queue" note="Most urgent order first"
          link={{ href: "/admin/orders", label: "View all orders" }}
          aside={<Chip tone={attentionOrders ? "danger" : "success"}>{attentionOrders} {attentionOrders === 1 ? "order" : "orders"}</Chip>} />
        {attention.length
          ? <AttentionList items={attention} visible={6} />
          : <p className="type-body-sm text-ink-2">All clear. No orders need intervention right now.</p>}
      </Card>

      {/* Trends sit under the lists: what needs doing now comes first, how the fortnight went second. */}
      <section aria-labelledby="trends-title" className="flex flex-col gap-4">
        <h2 id="trends-title" className="type-overline uppercase text-muted">Trends and leads</h2>
        <div className="grid gap-6 lg:grid-cols-2">
          <OnTimeChart stats={stats} />
          <PipelineChart orders={orders} now={now} />
          {isOwner(user) && <RevenueChart stats={stats} />}
          <Card aria-labelledby="leads-title" className={isOwner(user) ? "min-w-0 gap-2" : "min-w-0 gap-2 lg:col-span-2"}>
            <CardHeader id="leads-title" title="New leads" note="Form submissions, last 24 hours" link={{ href: "/admin/leads" as Route, label: "All leads" }} />
            {newLeads.length ? (
              <ul className="flex flex-col divide-y divide-hairline">
                {newLeads.map((l) => (
                  <li key={l.id} className="flex flex-wrap items-center justify-between gap-x-3 gap-y-2 py-3 sm:flex-nowrap">
                    <span className="flex min-w-0 flex-1 items-center gap-3">
                      <Avatar name={l.name} />
                      <span className="flex min-w-0 flex-col">
                        <span className="truncate type-body-sm-strong text-ink">{l.name} · {l.business}</span>
                        <span className="truncate type-caption text-muted">{l.email} · {formatRelative(new Date(now.getTime() - l.hoursAgo * 3_600_000), now)}</span>
                      </span>
                    </span>
                    <span className="flex shrink-0 gap-1.5">
                      <Chip tone={l.paid ? "success" : "warning"}>{l.paid ? "Paid" : "Unpaid"}</Chip>
                      {l.consent && <Chip tone="info" icon={Users}>Consented</Chip>}
                    </span>
                  </li>
                ))}
              </ul>
            ) : <p className="type-body-sm text-ink-2">No new form submissions in the last 24 hours.</p>}
          </Card>
        </div>
      </section>
    </AdminPage>
  );
}
