import { notFound } from "next/navigation";
import { ReportView } from "@/components/blocks/report-view";
import { getOrder } from "@/lib/orders/fixtures";

/** S-14 Report detail (7365:2). Same four sections, same order, same names as the landing page. */
export default async function ReportPage({ params }: { params: Promise<{ orderId: string }> }) {
  const order = await getOrder((await params).orderId);
  if (!order?.report) notFound();
  return <ReportView order={order} mode="owner" />;
}
