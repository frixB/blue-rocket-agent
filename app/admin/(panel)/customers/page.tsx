import Link from "next/link";
import type { Route } from "next";
import { ShieldAlert } from "lucide-react";
import { Card, Chip, Note } from "@/components/ui";
import { AdminPage } from "@/components/blocks/admin/admin-page";
import { FilterHeader, FilterSearch, ListEmpty, listCard } from "@/components/blocks/admin/filter-header";
import { LocalTime } from "@/components/blocks/admin/local-time";
import { customerId, listCustomers, listDataRequests, type Customer } from "@/lib/admin/data";
import { formatPriceShort } from "@/lib/orders/sla";

export const dynamic = "force-dynamic";

const FILTERS: { key: string; label: string; test: (c: Customer) => boolean }[] = [
  { key: "all", label: "All", test: () => true },
  { key: "account", label: "Has an account", test: (c) => c.account.claimed },
  { key: "guest", label: "No account yet", test: (c) => !c.account.claimed },
  { key: "credit", label: "Has credit", test: (c) => Boolean(c.account.creditsCents) },
  { key: "refunded", label: "Refunded", test: (c) => c.refundedCents > 0 },
];

/** Everyone who has paid or tried to, one row per email, newest order first. */
export default async function Customers({ searchParams }: { searchParams: Promise<{ filter?: string; q?: string }> }) {
  const now = new Date();
  const [sp, all, requests] = await Promise.all([searchParams, listCustomers(now), listDataRequests()]);
  const filter = FILTERS.find((f) => f.key === sp.filter) ?? FILTERS[0]!;
  const q = sp.q?.trim().toLowerCase();
  const shown = all.filter((c) => filter.test(c) && (!q || [c.name, c.email, c.business].some((v) => v.toLowerCase().includes(q))));

  return (
    <AdminPage title="Customers" intro="Everyone who has ordered, newest first. Open one for their account, orders and links.">
      {requests.length > 0 && (
        <Note tone="warning" icon={ShieldAlert}>
          {requests.length} data {requests.length === 1 ? "request" : "requests"} waiting:{" "}
          {requests.map((r, i) => (
            <span key={r.id}>{i > 0 && ", "}
              <Link href={`/admin/customers/${customerId(r.email)}#data-requests` as Route} className="underline">
                {r.kind === "delete" ? "delete" : "export"} for {r.email}
              </Link>, due in {r.dueInDays} days
            </span>
          ))}.
        </Note>
      )}
      <Card className={listCard}>
        <FilterHeader
          tabs={{ label: "Filter customers", items: FILTERS.map((f) => ({
            href: (f.key === "all" ? "/admin/customers" : `/admin/customers?filter=${f.key}`) as Route,
            label: f.label, count: all.filter(f.test).length, active: filter.key === f.key,
          })) }}
          refiners={<FilterSearch id="customer-q" action="/admin/customers" label="Search customers by name, email or business"
            placeholder="Name, email or business" value={sp.q} keep={{ filter: filter.key === "all" ? undefined : filter.key }} />}
          count={`${shown.length === all.length ? shown.length : `${shown.length} of ${all.length}`} ${all.length === 1 ? "customer" : "customers"}`}
          clearHref={filter.key !== "all" || q ? "/admin/customers" : undefined} />
        {shown.length ? (
          <div className="overflow-x-auto">
            <table className="w-full min-w-2xl text-left">
              <caption className="sr-only">Customers, newest order first</caption>
              <thead>
                <tr className="type-caption-strong text-muted">
                  <th scope="col" className="py-3.5 pr-4">Customer</th>
                  <th scope="col" className="py-3.5 pr-4">Account</th>
                  <th scope="col" className="py-3.5 pr-4 text-right">Orders</th>
                  <th scope="col" className="py-3.5 pr-4 text-right">Paid</th>
                  <th scope="col" className="py-3.5">Last order</th>
                </tr>
              </thead>
              <tbody>
                {shown.map((c) => (
                  <tr key={c.id} className="relative border-t border-hairline align-top transition-colors hover:bg-sunken">
                    <td className="py-4 pr-4">
                      <Link href={`/admin/customers/${c.id}` as Route} className="flex flex-col gap-0.5 after:absolute after:inset-0 after:content-['']">
                        <span className="type-body-strong text-ink">{c.name} · {c.business}</span>
                        <span className="type-caption text-muted">{c.email}</span>
                      </Link>
                    </td>
                    <td className="py-4 pr-4">
                      <span className="flex flex-wrap gap-1.5">
                        <Chip tone={c.account.claimed ? "success" : "neutral"} className="whitespace-nowrap">{c.account.claimed ? "Account" : "No account"}</Chip>
                        {c.account.creditsCents ? <Chip tone="info" className="whitespace-nowrap">{formatPriceShort(c.account.creditsCents)} credit</Chip> : null}
                      </span>
                    </td>
                    <td className="py-4 pr-4 text-right type-body-sm tabular-nums text-ink-2">{c.orders.length}</td>
                    <td className="py-4 pr-4 text-right type-body-sm tabular-nums text-ink-2">
                      {formatPriceShort(c.spentCents)}
                      {c.refundedCents > 0 && <span className="block type-caption text-muted">{formatPriceShort(c.refundedCents)} refunded</span>}
                    </td>
                    <td className="py-4 type-body-sm text-ink-2"><LocalTime iso={c.lastOrderAt} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <ListEmpty title="No customers match" body="Try another filter, or search by name, email or business." clearHref="/admin/customers" />
        )}
      </Card>
    </AdminPage>
  );
}
