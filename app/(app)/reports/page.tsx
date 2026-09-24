import Link from "next/link";
import { Mail, Plus, Rocket } from "lucide-react";
import { Banner, EmptyState, Icon, buttonStyles } from "@/components/ui";
import { supportHref } from "@/lib/support";
import { PageHeader } from "@/components/blocks/page-header";
import { PortalTabs } from "@/components/blocks/portal-tabs";
import { CreditRow, ReportRow } from "@/components/blocks/report-row";
import { getAccount, listOrders } from "@/lib/orders/fixtures";
import { SLA, formatPriceShort } from "@/lib/orders/sla";

/**
 * S-16 My Reports: populated (7366:2) and empty (7366:70).
 * `?view=empty` shows the empty state until real accounts exist.
 */
export default async function MyReports({ searchParams }: { searchParams: Promise<{ view?: string }> }) {
  const { view } = await searchParams;
  const [account, all] = await Promise.all([getAccount(), listOrders()]);
  const orders = view === "empty" ? [] : all;
  const credits = orders.filter((o) => o.status === "partial");
  return (
    <>
      <PortalTabs />
      <main id="main" className="mx-auto flex w-full max-w-app flex-col gap-5 px-5 pb-page-bottom pt-12">
        <PageHeader title="My Reports"
          intro={orders.length ? "Every report you have bought, newest first." : "Every report you buy will live here."}
          action={orders.length ? <Link href="/order" className={buttonStyles()}><Icon icon={Plus} size="sm" /> New report</Link> : undefined} />
        {orders.length > 0 && !account.emailVerified && (
          <Banner inset icon={Mail} actions={<a href={supportHref("Please resend my verification email")} className="inline-block py-3 type-body-sm-strong text-warning-ink underline-offset-2 hover:underline">Resend email</a>}>
            Verify your email so we can deliver reports to you. Check {account.email}.
          </Banner>
        )}
        {orders.length ? (
          <ul className="flex flex-col gap-3">
            {orders.map((o) => <ReportRow key={o.id} order={o} />)}
            {credits.map((o) => <CreditRow key={`credit-${o.id}`} order={o} />)}
          </ul>
        ) : (
          <EmptyState icon={Rocket} title="No reports yet"
            body={`Your first SEO report is delivered within one business day. Flat ${formatPriceShort(SLA.priceCents)}, no subscription, full refund if we can't audit your site.`}
            action={<Link href="/order" className={buttonStyles()}>Get your first report</Link>} />
        )}
      </main>
    </>
  );
}
