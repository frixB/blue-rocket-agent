import Link from "next/link";
import type { Route } from "next";
import { Card } from "@/components/ui";
import { cn } from "@/lib/cn";
import type { AdminOrder } from "@/lib/admin/types";
import { AdminStatusChip, ClockBadge, FlagChips } from "./badges";

const host = (url: string) => new URL(url).host;

/**
 * Orders as a table: reference, business, status, time left, flags.
 * `hrefFor` decides where a row goes (order detail, or the review screen).
 */
export function OrderTable({ orders, now, caption, hrefFor = (o) => `/admin/orders/${o.id}` as Route, extra, flags = true, header, empty, className }: {
  orders: AdminOrder[];
  now: Date;
  caption: string;
  hrefFor?: (o: AdminOrder) => Route;
  /** One extra column, e.g. the auto-send timer in the review queue. */
  extra?: { heading: string; cell: (o: AdminOrder) => React.ReactNode };
  /** Off where flags already show elsewhere, e.g. beside Needs attention on the Overview. */
  flags?: boolean;
  /** Title row inside the card, above the table. */
  header?: React.ReactNode;
  /** Shown inside the card instead of the table when there are no orders, so the header's filters stay put. */
  empty?: React.ReactNode;
  className?: string;
}) {
  return (
    <Card className={cn("min-w-0 gap-0 px-6 py-2", header && "pt-5", className)}>
      {header}
      {!orders.length && empty ? empty : <div className="overflow-x-auto">
        <table className={flags ? "w-full min-w-xl text-left" : "w-full text-left"}>
          <caption className="sr-only">{caption}</caption>
          <thead>
            <tr className="type-caption-strong text-muted">
              <th scope="col" className="py-3.5 pr-4 font-bold">Order</th>
              <th scope="col" className="py-3.5 pr-4 font-bold">Status</th>
              <th scope="col" className="py-3.5 pr-4 font-bold">Time</th>
              {extra && <th scope="col" className="py-3.5 pr-4 font-bold">{extra.heading}</th>}
              {flags && <th scope="col" className="py-3.5 font-bold">Flags</th>}
            </tr>
          </thead>
          <tbody>
            {orders.map((o) => (
              <tr key={o.id} className="relative border-t border-hairline align-top transition-colors hover:bg-sunken">
                <td className="py-4 pr-4">
                  {/* The link's ::after covers the row, so the whole row opens the order, not only the name. */}
                  <Link href={hrefFor(o)} className="flex flex-col gap-0.5 after:absolute after:inset-0 after:content-['']">
                    <span className="type-body-strong text-ink">{o.businessName}</span>
                    <span className="type-caption text-muted">#{o.reference} · {host(o.websiteUrl)}</span>
                  </Link>
                </td>
                <td className="py-4 pr-4"><AdminStatusChip status={o.status} /></td>
                <td className="py-4 pr-4"><ClockBadge order={o} now={now} /></td>
                {extra && <td className="py-4 pr-4 type-body-sm text-ink-2">{extra.cell(o)}</td>}
                {flags && <td className="py-4"><FlagChips flags={o.flags} /></td>}
              </tr>
            ))}
          </tbody>
        </table>
      </div>}
    </Card>
  );
}
