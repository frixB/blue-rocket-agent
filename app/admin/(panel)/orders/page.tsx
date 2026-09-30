import type { Route } from "next";
import { AdminPage } from "@/components/blocks/admin/admin-page";
import { flagLabel } from "@/components/blocks/admin/badges";
import { FilterSelect } from "@/components/blocks/admin/filter-select";
import { FilterHeader, FilterSearch, ListEmpty } from "@/components/blocks/admin/filter-header";
import { OrderTable } from "@/components/blocks/admin/order-table";
import { listOrders } from "@/lib/admin/data";
import { FLAGS, type AdminStatus, type Flag } from "@/lib/admin/types";

export const dynamic = "force-dynamic";

const GROUPS: { key: string; label: string; statuses?: AdminStatus[] }[] = [
  { key: "all", label: "All" },
  { key: "running", label: "Running", statuses: ["queued", "crawling", "analysing", "compiling"] },
  { key: "review", label: "In review", statuses: ["reviewing"] },
  { key: "problems", label: "Late or failed", statuses: ["late", "escalated", "failed"] },
  { key: "customer", label: "Waiting on customer", statuses: ["blocked", "payment_failed", "awaiting_payment"] },
  { key: "delivered", label: "Delivered", statuses: ["ready", "partial"] },
  { key: "refunded", label: "Refunded", statuses: ["refunded"] },
];

export default async function Orders({ searchParams }: { searchParams: Promise<{ status?: string; flag?: string; q?: string }> }) {
  const now = new Date();
  const sp = await searchParams;
  const group = GROUPS.find((g) => g.key === sp.status) ?? GROUPS[0]!;
  const flag = FLAGS.includes(sp.flag as Flag) ? (sp.flag as Flag) : undefined;
  const q = sp.q?.trim().toLowerCase().replace(/^#/, "");
  const all = await listOrders(now);
  const orders = all.filter((o) =>
    (!group.statuses || group.statuses.includes(o.status)) &&
    (!flag || o.flags.includes(flag)) &&
    (!q || [o.reference, o.email, o.businessName, o.websiteUrl].some((v) => v.toLowerCase().includes(q))));
  const href = (next: { status?: string; flag?: string }) => {
    const p = new URLSearchParams();
    const status = "status" in next ? next.status : group.key;
    const f = "flag" in next ? next.flag : flag;
    if (status && status !== "all") p.set("status", status);
    if (f) p.set("flag", f);
    if (q) p.set("q", q);
    const s = p.toString();
    return (s ? `/admin/orders?${s}` : "/admin/orders") as Route;
  };

  // Only flags some order carries today, plus the one in use: a filter that can only return nothing is noise.
  const flagItems = FLAGS
    .map((f) => ({ f, count: all.filter((o) => o.flags.includes(f)).length }))
    .filter(({ f, count }) => count > 0 || flag === f);
  const filtered = group.key !== "all" || flag || q;
  const shownLabel = `${orders.length === all.length ? orders.length : `${orders.length} of ${all.length}`} ${all.length === 1 ? "order" : "orders"}`;

  return (
    <AdminPage title="Orders" intro="Least time left first.">
      <OrderTable orders={orders} now={now} caption={`Orders: ${group.label}${flag ? `, flagged ${flagLabel(flag)}` : ""}${q ? `, matching ${sp.q}` : ""}`}
        header={
          <FilterHeader
            tabs={{ label: "Filter by status", items: GROUPS.map((g) => ({
              href: href({ status: g.key }), label: g.label, active: group.key === g.key,
              count: all.filter((o) => !g.statuses || g.statuses.includes(o.status)).length,
            })) }}
            refiners={<>
              {flagItems.length > 0 && (
                <FilterSelect id="orders-flag" label="Flag" value={flag ?? ""} options={[
                  { value: "", label: "Any flag", href: href({ flag: undefined }) },
                  ...flagItems.map(({ f, count }) => ({ value: f, label: `${flagLabel(f)} (${count})`, href: href({ flag: f }) })),
                ]} />
              )}
              <FilterSearch id="orders-q" action="/admin/orders" label="Search these orders by reference, email or business"
                placeholder="Search BRA ref, email, business" value={sp.q} keep={{ status: group.key === "all" ? undefined : group.key, flag }} />
            </>}
            count={shownLabel} clearHref={filtered ? "/admin/orders" : undefined} />
        }
        empty={<ListEmpty title="No orders match" body="Try another status or flag, or search by BRA reference, email or business name." clearHref="/admin/orders" />} />
    </AdminPage>
  );
}
