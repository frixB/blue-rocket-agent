import { Card, CardTitle, Note, SummaryRow } from "@/components/ui";
import type { AdminOrder, UrlCheck } from "@/lib/admin/types";

const URL_CHECK: Record<UrlCheck, { tone: "success" | "warning" | "danger"; text: string }> = {
  verified: { tone: "success", text: "URL check passed. The site loaded and matched the business name." },
  name_mismatch: { tone: "warning", text: "URL check found a different business name on the site. Check the findings are about the right business." },
  unreachable: { tone: "warning", text: "The site didn't load during the URL check and the customer continued anyway. Expect thin data; a partial report may be fairer." },
  skipped: { tone: "warning", text: "The customer skipped the URL check." },
};

/** What the customer told us, beside the draft, so the reviewer checks findings against the brief. */
export function ClientContext({ order }: { order: AdminOrder }) {
  const i = order.intake;
  const u = URL_CHECK[i.urlCheck];
  return (
    <Card aria-labelledby="context-title" className="gap-3">
      <CardTitle id="context-title">Client context</CardTitle>
      <Note tone={u.tone}>{u.text}</Note>
      <dl className="flex flex-col divide-y divide-hairline">
        <SummaryRow label="Business" value={order.businessName} />
        <SummaryRow label="Website" value={<a href={order.websiteUrl} target="_blank" rel="noreferrer" className="underline">{new URL(order.websiteUrl).host}</a>} />
        <SummaryRow label="Industry" value={i.industry} />
        <SummaryRow label="Location" value={`${i.city}, ${i.country}`} />
        <SummaryRow label="Annual revenue" value={i.annualRevenue} />
        <SummaryRow label="Employees" value={i.employees} />
        <SummaryRow label="Contact" value={`${order.customerName} · ${order.email}`} />
      </dl>
    </Card>
  );
}
