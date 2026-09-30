import Link from "next/link";
import type { Route } from "next";
import { Bell, ExternalLink, Rocket } from "lucide-react";
import { Card, CardTitle, Chip, Icon, SummaryRow } from "@/components/ui";
import { AdminAction } from "@/components/blocks/admin/admin-action";
import { AdminPage } from "@/components/blocks/admin/admin-page";
import { OwnersOnlyPage } from "@/components/blocks/admin/owners-only";
import { listContacts, listOrders, listReportTypes } from "@/lib/admin/data";
import { currentAdmin, isOwner } from "@/lib/admin/session";
import { formatPriceShort } from "@/lib/orders/sla";

export const dynamic = "force-dynamic";

/**
 * The catalogue: what's live and what's coming. A report goes live only with
 * a price; launching one can email its waitlist.
 */
export default async function ReportTypes() {
  const user = await currentAdmin();
  if (!isOwner(user)) return <OwnersOnlyPage title="Report types" />;
  const now = new Date();
  const [reports, contacts, orders] = await Promise.all([listReportTypes(), listContacts(), listOrders(now)]);
  const paidOrders = orders.filter((o) => !["awaiting_payment", "payment_failed"].includes(o.status)).length;

  return (
    <AdminPage title="Report types" intro="What customers can buy today, and what's coming next.">
      <ul className="grid gap-6 lg:grid-cols-2">
        {reports.map((r) => {
          const waiting = contacts.filter((c) => c.waitlist?.includes(r.name));
          const consented = waiting.filter((c) => c.consent).length;
          const live = r.state === "live";
          return (
            <li key={r.key}>
              <Card as="article" aria-labelledby={`rt-${r.key}`} className="h-full">
                <div className="flex items-start justify-between gap-3">
                  <CardTitle id={`rt-${r.key}`}>{r.name}</CardTitle>
                  <Chip tone={live ? "success" : "neutral"} className="shrink-0">{live ? "Live" : "Coming soon"}</Chip>
                </div>
                <p className="type-body-sm text-ink-2">{r.blurb}</p>
                <dl className="flex flex-col divide-y divide-hairline">
                  <SummaryRow label="Price" value={r.priceCents ? formatPriceShort(r.priceCents) : "Not set"} />
                  {live
                    ? <>
                        <SummaryRow label="Delivered" value={r.promise} />
                        <SummaryRow label="Orders so far" value={String(paidOrders)} />
                      </>
                    : <SummaryRow label="Waitlist" value={`${waiting.length} ${waiting.length === 1 ? "person" : "people"}, ${consented} OK to email`} />}
                </dl>
                <div className="mt-auto flex flex-wrap gap-3">
                  {live ? (
                    <>
                      {r.sample && (
                        <Link href={r.sample as Route} className="flex items-center gap-1.5 py-2 type-body-sm font-semibold text-ink-2 underline hover:text-ink pointer-coarse:min-h-11">
                          <Icon icon={ExternalLink} size="sm" /> See the sample report
                        </Link>
                      )}
                      <Link href="/admin/settings#pricing" className="py-2 type-body-sm font-semibold text-ink-2 underline hover:text-ink pointer-coarse:min-h-11">Change the price</Link>
                    </>
                  ) : (
                    <>
                      <AdminAction label="Launch" icon={<Icon icon={Rocket} size="sm" />} variant="ghost" done="" disabledReason="Set a price and a sample report first." />
                      <AdminAction label={`Email the waitlist (${consented})`} icon={<Icon icon={Bell} size="sm" />} variant="text"
                        confirm={`Email ${consented} people that ${r.name} is live? Only send this on launch day.`}
                        done={`the ${consented} people on the ${r.name} waitlist who agreed to email get the launch email with their early-access discount.`} />
                    </>
                  )}
                </div>
              </Card>
            </li>
          );
        })}
      </ul>
    </AdminPage>
  );
}
