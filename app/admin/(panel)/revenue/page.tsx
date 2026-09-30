import Link from "next/link";
import type { Route } from "next";
import { FileText, Receipt } from "lucide-react";
import { Card, CardTitle, Chip, Icon, SummaryRow } from "@/components/ui";
import { AdminAction } from "@/components/blocks/admin/admin-action";
import { AdminPage } from "@/components/blocks/admin/admin-page";
import { CardHeader } from "@/components/blocks/admin/card-header";
import { GlanceStrip } from "@/components/blocks/admin/glance-strip";
import { LocalTime } from "@/components/blocks/admin/local-time";
import { OwnersOnlyPage } from "@/components/blocks/admin/owners-only";
import { RevenueChart } from "@/components/blocks/admin/overview-charts";
import { listCustomers, listDailyStats, listInvoices, listOrders, listPayouts } from "@/lib/admin/data";
import { FEE_CENTS, SPLIT } from "@/lib/admin/fixtures-modules";
import { currentAdmin, isOwner } from "@/lib/admin/session";
import { formatPrice, formatPriceShort } from "@/lib/orders/sla";

export const dynamic = "force-dynamic";

const DAY = 86_400_000;
const HOUR = 3_600_000;

/**
 * Money over the last 14 days: gross, Stripe fees, refunds, disputes and net,
 * the owners' 30/35/35 split of net, payouts, credits, receipts and invoices.
 */
export default async function Revenue() {
  const user = await currentAdmin();
  if (!isOwner(user)) return <OwnersOnlyPage title="Revenue" />;
  const now = new Date();
  const [stats, orders, payouts, invoices, customers] = await Promise.all([listDailyStats(now), listOrders(now), listPayouts(), listInvoices(), listCustomers(now)]);

  const gross = stats.reduce((s, d) => s + d.grossCents, 0);
  const refunded = stats.reduce((s, d) => s + d.refundedCents, 0);
  const paidOrders = Math.round(gross / 150_000);
  const fees = paidOrders * FEE_CENTS;
  const net = gross - fees - refunded;
  const disputed = orders.filter((o) => o.flags.includes("disputed"));
  const atRisk = disputed.reduce((s, o) => s + o.amountCents, 0);
  const credits = customers.filter((c) => c.account.creditsCents);
  const creditTotal = credits.reduce((s, c) => s + (c.account.creditsCents ?? 0), 0);

  return (
    <AdminPage title="Revenue" intro="The last 14 days. Net is after Stripe fees and refunds; money in disputes isn't taken off until it's lost.">
      <GlanceStrip label="Money, last 14 days" items={[
        { label: `Gross · ${paidOrders} orders`, value: formatPriceShort(gross) },
        { label: "Stripe fees", value: `−${formatPriceShort(fees)}` },
        { label: "Refunded", value: `−${formatPriceShort(refunded)}`, tone: refunded ? "warning" : "neutral" },
        { label: `In dispute · ${disputed.length}`, value: formatPriceShort(atRisk), tone: atRisk ? "danger" : "neutral", href: "/admin/exceptions?type=disputed" as Route },
        { label: "Net", value: formatPriceShort(net) },
      ]} />

      <div className="grid gap-6 xl:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
        <RevenueChart stats={stats} />
        <div className="flex min-w-0 flex-col gap-6">
          <Card aria-labelledby="split-title" className="gap-0">
            <CardTitle id="split-title" className="pb-1">Split of net</CardTitle>
            <p className="pb-2 type-caption text-muted">{formatPrice(net)} net, split as agreed.</p>
            <dl className="flex flex-col divide-y divide-hairline">
              {SPLIT.map((s) => (
                <SummaryRow key={s.who} label={`${s.who} · ${Math.round(s.share * 100)}%`} value={<span className="tabular-nums">{formatPrice(Math.round(net * s.share))}</span>} />
              ))}
            </dl>
          </Card>
          <Card aria-labelledby="credits-title" className="gap-1">
            <CardTitle id="credits-title">Credits outstanding</CardTitle>
            <p className="type-body-sm text-ink-2">
              {creditTotal
                ? <>{formatPriceShort(creditTotal)} in backlink credit across {credits.length} {credits.length === 1 ? "customer" : "customers"}, from partial reports. Used on their next order.</>
                : "No credit outstanding."}
            </p>
            {credits.map((c) => (
              <Link key={c.id} href={`/admin/customers/${c.id}` as Route} className="w-fit type-caption text-ink-2 underline hover:text-ink">{c.name} · {formatPriceShort(c.account.creditsCents!)}</Link>
            ))}
          </Card>
        </div>
      </div>

      <Card aria-labelledby="payouts-title" className="gap-1">
        <CardHeader id="payouts-title" title="Payouts" note="What Stripe sends to the bank, after fees and refunds." />
        <ul className="flex flex-col divide-y divide-hairline">
          {payouts.map((p) => (
            <li key={p.id} className="flex items-center justify-between gap-3 py-3">
              <span className="flex min-w-0 flex-col gap-0.5">
                <span className="type-body-sm-strong tabular-nums text-ink">{formatPrice(p.amountCents)}</span>
                <span className="type-caption text-muted">{p.state === "paid" ? "Arrived" : "Arrives"} <LocalTime iso={new Date(now.getTime() + p.arrivesInDays * DAY).toISOString()} /> · {p.id}</span>
              </span>
              <Chip tone={p.state === "paid" ? "success" : "info"}>{p.state === "paid" ? "Paid" : "On its way"}</Chip>
            </li>
          ))}
        </ul>
      </Card>

      <Card aria-labelledby="invoices-title" className="gap-1">
        <CardHeader id="invoices-title" title="Receipts and VAT invoices" note="Stripe sends a receipt with every payment. Business customers can ask for a VAT invoice." />
        <ul className="flex flex-col divide-y divide-hairline">
          {invoices.map((i) => (
            <li key={i.id} className="flex flex-col gap-3 py-3 md:flex-row md:items-center md:justify-between">
              <span className="flex min-w-0 flex-col gap-0.5">
                <span className="type-body-sm-strong text-ink">{i.business} · #{i.reference}</span>
                <span className="type-caption text-muted">{formatPrice(i.amountCents)} · {i.kind === "vat" ? "VAT invoice" : "Receipt"} issued <LocalTime iso={new Date(now.getTime() - i.issuedHoursAgo * HOUR).toISOString()} /></span>
              </span>
              <span className="flex flex-wrap gap-2">
                <AdminAction label="Resend" icon={<Icon icon={Receipt} size="sm" />} variant="text" confirm={`Resend this ${i.kind === "vat" ? "VAT invoice" : "receipt"} to ${i.email}?`} done={`the ${i.kind === "vat" ? "VAT invoice" : "receipt"} goes to ${i.email} again.`} />
                {i.kind === "receipt" && (
                  <AdminAction label="Issue VAT invoice" icon={<Icon icon={FileText} size="sm" />} variant="ghost" confirm={`Issue a VAT invoice for #${i.reference}? You'll need their business name and VAT number from them first.`}
                    done="a numbered VAT invoice is created in Stripe and emailed to the customer." />
                )}
              </span>
            </li>
          ))}
        </ul>
      </Card>
    </AdminPage>
  );
}
