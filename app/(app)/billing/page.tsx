import { PageHeader } from "@/components/blocks/page-header";
import { PortalTabs } from "@/components/blocks/portal-tabs";
import { TransactionsTable, transactions } from "@/components/blocks/transactions-table";
import { Note } from "@/components/ui";
import { listOrders } from "@/lib/orders/fixtures";

/** S-17 Billing and receipts (7366:102). */
export default async function Billing() {
  const rows = transactions(await listOrders());
  return (
    <>
      <PortalTabs />
      <main id="main" className="mx-auto flex w-full max-w-app flex-col gap-5 px-5 pb-page-bottom pt-12">
        <PageHeader title="Billing" intro="Every payment and refund on your account." />
        <TransactionsTable rows={rows} />
        <Note>Receipts are emailed by Stripe when you pay. Need a copy? Reply to your receipt email and we&apos;ll resend it.</Note>
      </main>
    </>
  );
}
