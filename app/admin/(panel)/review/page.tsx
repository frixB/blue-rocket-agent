import type { Route } from "next";
import { CircleCheck } from "lucide-react";
import { AdminPage } from "@/components/blocks/admin/admin-page";
import { FilterHeader, ListEmpty } from "@/components/blocks/admin/filter-header";
import { OrderTable } from "@/components/blocks/admin/order-table";
import { CLOCK, autoSendAt, clockState, formatRelative } from "@/lib/admin/clock";
import { listOrders } from "@/lib/admin/data";
import type { AdminOrder } from "@/lib/admin/types";

export const dynamic = "force-dynamic";

const FILTERS = [
  { key: "all", label: "In review" },
  { key: "urgent", label: "Under 4h" },
  { key: "late", label: "Late" },
  { key: "unreviewed", label: "Sent unreviewed" },
] as const;
type FilterKey = (typeof FILTERS)[number]["key"];

export default async function ReviewQueue({ searchParams }: { searchParams: Promise<{ filter?: string }> }) {
  const now = new Date();
  const { filter: raw } = await searchParams;
  const filter: FilterKey = FILTERS.some((f) => f.key === raw) ? (raw as FilterKey) : "all";
  const orders = await listOrders(now);
  const inReview = orders.filter((o) => o.status === "reviewing");
  const unreviewed = orders.filter((o) => o.flags.includes("sent_unreviewed"));
  const lists: Record<FilterKey, AdminOrder[]> = {
    all: inReview,
    urgent: inReview.filter((o) => clockState(o, now) === "urgent"),
    late: inReview.filter((o) => ["late", "escalated"].includes(clockState(o, now))),
    unreviewed,
  };
  const shown = lists[filter];
  const autoSend = (o: AdminOrder) => {
    if (o.flags.includes("sent_unreviewed")) return `Auto-sent ${formatRelative(new Date(o.deliveredAt!), now)}`;
    const at = autoSendAt(o.paidAt);
    return at.getTime() > now.getTime() ? `Sends as is ${formatRelative(at, now)}` : "Sending now";
  };

  return (
    <AdminPage title="Review queue"
      intro={`Least time left first. A draft still here ${CLOCK.autoSendBeforeHours}h before its deadline sends as is and lands in Sent unreviewed.`}>
      <OrderTable orders={shown} now={now} caption="Drafts waiting for review" hrefFor={(o) => `/admin/review/${o.id}` as Route}
        extra={{ heading: "Auto-send", cell: autoSend }}
        header={
          <FilterHeader
            tabs={{ label: "Filter the queue", items: FILTERS.map((f) => ({
              href: (f.key === "all" ? "/admin/review" : `/admin/review?filter=${f.key}`) as Route, label: f.label, count: lists[f.key].length, active: filter === f.key,
            })) }}
            count={`${shown.length} ${filter === "unreviewed" ? "sent unreviewed" : shown.length === 1 ? "draft" : "drafts"}`} />
        }
        empty={
          <ListEmpty icon={CircleCheck} title={filter === "unreviewed" ? "Nothing sent unreviewed" : "Queue is clear"}
            body={filter === "unreviewed" ? "Every auto-sent report has been checked." : "No drafts match this filter. New drafts land here when compiling finishes."} />
        } />
    </AdminPage>
  );
}
