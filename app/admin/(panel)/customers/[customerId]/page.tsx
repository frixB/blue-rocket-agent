import { notFound } from "next/navigation";
import { KeyRound, Link2, Link2Off, Mail, Receipt, Trash2, FileDown } from "lucide-react";
import { Card, CardTitle, Chip, Icon, SummaryRow } from "@/components/ui";
import { AdminAction } from "@/components/blocks/admin/admin-action";
import { AdminPage } from "@/components/blocks/admin/admin-page";
import { CardHeader } from "@/components/blocks/admin/card-header";
import { LocalTime } from "@/components/blocks/admin/local-time";
import { OrderTable } from "@/components/blocks/admin/order-table";
import { getCustomer } from "@/lib/admin/data";
import { currentAdmin, isOwner } from "@/lib/admin/session";
import { formatPriceShort } from "@/lib/orders/sla";

export const dynamic = "force-dynamic";

const HOUR = 3_600_000;

/**
 * One customer: their account, every order, credits, share links and data
 * requests. Ops can resend links and receipts; deleting data is owners only.
 */
export default async function CustomerDetail({ params }: { params: Promise<{ customerId: string }> }) {
  const now = new Date();
  const { customerId } = await params;
  const [found, user] = await Promise.all([getCustomer(customerId, now), currentAdmin()]);
  if (!found) notFound();
  const { customer: c, shareLinks, dataRequests } = found;
  const owner = isOwner(user);
  const latest = c.orders[0]!;
  const agoIso = (h: number) => new Date(now.getTime() - h * HOUR).toISOString();

  return (
    <AdminPage title={c.name} back={{ href: "/admin/customers", label: "Customers" }} intro={`${c.business} · ${c.email}`}
      action={<Chip tone={c.account.claimed ? "success" : "neutral"}>{c.account.claimed ? "Has an account" : "No account yet"}</Chip>}>
      <div className="grid gap-8 xl:grid-cols-[minmax(0,1fr)_var(--container-rail)]">
        <div className="flex min-w-0 flex-col gap-6">
          <OrderTable orders={c.orders} now={now} caption={`Orders from ${c.name}`}
            header={<CardHeader id="orders-title" title="Orders" note={`${c.orders.length} ${c.orders.length === 1 ? "order" : "orders"}, ${formatPriceShort(c.spentCents)} paid`} />} />

          <Card aria-labelledby="shares-title" className="gap-1">
            <CardHeader id="shares-title" title="Share links" note="Links the customer made to show their report to someone else." />
            {shareLinks.length ? (
              <ul className="flex flex-col divide-y divide-hairline">
                {shareLinks.map((s) => (
                  <li key={s.id} className="flex flex-col gap-3 py-3 sm:flex-row sm:items-center sm:justify-between">
                    <span className="flex min-w-0 flex-col gap-0.5">
                      <span className="flex items-center gap-2 type-body-sm-strong text-ink"><Icon icon={Link2} size="sm" className="text-muted" /> Report #{s.reference}</span>
                      <span className="type-caption text-muted">Made <LocalTime iso={agoIso(s.createdHoursAgo)} /> · {s.views} {s.views === 1 ? "view" : "views"} · expires in {s.expiresInDays} days</span>
                    </span>
                    <AdminAction label="Revoke link" icon={<Icon icon={Link2Off} size="sm" />} variant="ghost"
                      confirm="Revoke this link? Anyone who has it will see a 'link expired' page." done="the link stops working at once and the customer can make a new one." />
                  </li>
                ))}
              </ul>
            ) : <p className="type-body-sm text-ink-2">No share links.</p>}
          </Card>

          <Card aria-labelledby="data-requests-title" id="data-requests" className="scroll-mt-24 gap-1">
            <CardHeader id="data-requests-title" title="Data requests" note="Requests to export or delete what we hold about them. Each shows when it's due." />
            {dataRequests.length ? (
              <ul className="flex flex-col divide-y divide-hairline">
                {dataRequests.map((d) => (
                  <li key={d.id} className="flex flex-col gap-3 py-3 sm:flex-row sm:items-start sm:justify-between">
                    <span className="flex flex-col gap-0.5">
                      <span className="type-body-sm-strong text-ink">{d.kind === "delete" ? "Delete everything we hold" : "Send a copy of their data"}</span>
                      <span className="type-caption text-muted">Received <LocalTime iso={agoIso(d.receivedHoursAgo)} /> · due in {d.dueInDays} days</span>
                    </span>
                    {d.kind === "export"
                      ? <AdminAction label="Send data export" icon={<Icon icon={FileDown} size="sm" />} confirm={`Email ${c.email} a copy of their data?`}
                          done="they get a download link to their orders, reports and account details, valid for 7 days." />
                      : owner
                        ? <AdminAction label="Delete their data" icon={<Icon icon={Trash2} size="sm" />} variant="danger" reason="Why is this safe to delete now?"
                            confirm={`Delete everything we hold for ${c.email}? Reports, account and contact details go. Paid invoices are kept for tax records.`}
                            done="their account, reports and contact details are deleted, invoices are kept, and they get a confirmation email." />
                        : <AdminAction label="Delete their data" icon={<Icon icon={Trash2} size="sm" />} variant="danger" done="" disabledReason="Owners only. Ask Rasa or Carlos." />}
                  </li>
                ))}
              </ul>
            ) : <p className="type-body-sm text-ink-2">No data requests.</p>}
          </Card>
        </div>

        <aside className="flex flex-col gap-6">
          <Card aria-labelledby="account-title" className="gap-0">
            <CardTitle id="account-title" className="pb-2">Account</CardTitle>
            <dl className="flex flex-col divide-y divide-hairline">
              <SummaryRow label="Status" value={c.account.claimed ? "Claimed" : "Not claimed yet"} />
              <SummaryRow label="Signs in with" value={c.account.signIn === "password" ? "Password" : c.account.signIn === "magic_link" ? "Email link" : "Nothing yet"} />
              {c.account.lastSignInHoursAgo !== undefined && <SummaryRow label="Last sign-in" value={<LocalTime iso={agoIso(c.account.lastSignInHoursAgo)} />} />}
              <SummaryRow label="Credit" value={c.account.creditsCents ? `${formatPriceShort(c.account.creditsCents)} backlink credit` : "None"} />
            </dl>
          </Card>

          <Card aria-labelledby="help-title">
            <CardTitle id="help-title">Help them</CardTitle>
            <div className="flex flex-col gap-3">
              {c.account.claimed
                ? <AdminAction label="Send a sign-in link" icon={<Icon icon={KeyRound} size="sm" />} confirm={`Email ${c.email} a sign-in link?`} done="they get a one-time sign-in link, valid for 60 minutes." />
                : <AdminAction label="Send an account link" icon={<Icon icon={KeyRound} size="sm" />} confirm={`Email ${c.email} a link to set up their account?`} done="they get a link to set a password, so their reports stay in My Reports." />}
              <AdminAction label="Resend the latest receipt" icon={<Icon icon={Receipt} size="sm" />} confirm={`Resend the receipt for #${latest.reference} to ${c.email}?`} done="the Stripe receipt for that order goes out again." />
              <AdminAction label="Resend order page link" icon={<Icon icon={Mail} size="sm" />} variant="text" confirm={`Email ${c.email} a link to #${latest.reference}?`} done="they get a signed link to their latest order page." />
            </div>
          </Card>
        </aside>
      </div>
    </AdminPage>
  );
}
