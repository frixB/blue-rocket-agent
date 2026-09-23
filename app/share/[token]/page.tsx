import Link from "next/link";
import { notFound } from "next/navigation";
import { Lock } from "lucide-react";
import { ReportView } from "@/components/blocks/report-view";
import { SystemMessage } from "@/components/blocks/system-message";
import { buttonStyles } from "@/components/ui";
import { getShare } from "@/lib/orders/fixtures";

export const metadata = { robots: { index: false, follow: false } };

/** S-15 Shared read-only view (7369:72), or S-15b Link expired (7369:321). Public, no sign-in. */
export default async function Shared({ params }: { params: Promise<{ token: string }> }) {
  const share = await getShare((await params).token);
  if (!share?.order.report) notFound();
  if (share.expired) {
    return (
      <SystemMessage icon={Lock} title="This link has expired" body={`Share links stay live for 30 days. Ask ${share.order.businessName} to send you a fresh one.`}>
        <Link href="/" className={buttonStyles()}>Get my own report</Link>
      </SystemMessage>
    );
  }
  return <div data-theme="app" className="min-h-dvh bg-page text-ink"><ReportView order={share.order} mode="shared" /></div>;
}
