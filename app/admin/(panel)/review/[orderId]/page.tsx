import { notFound } from "next/navigation";
import Link from "next/link";
import { Note, SummaryRow } from "@/components/ui";
import { AdminPage } from "@/components/blocks/admin/admin-page";
import { AdminStatusChip, ClockBadge, FlagChips, statusLabel } from "@/components/blocks/admin/badges";
import { ClientContext } from "@/components/blocks/admin/client-context";
import { FindingEditor } from "@/components/blocks/admin/finding-editor";
import { autoSendAt, deadlineAt, formatRelative } from "@/lib/admin/clock";
import { getOrder } from "@/lib/admin/data";
import { currentAdmin } from "@/lib/admin/session";
import { LocalTime } from "@/components/blocks/admin/local-time";

export const dynamic = "force-dynamic";

export default async function ReviewOrder({ params }: { params: Promise<{ orderId: string }> }) {
  const now = new Date();
  const { orderId } = await params;
  const [order, user] = await Promise.all([getOrder(orderId, now), currentAdmin()]);
  if (!order) notFound();
  const postSend = order.flags.includes("sent_unreviewed");
  if (!order.review || (order.status !== "reviewing" && !postSend)) {
    return (
      <AdminPage title={order.businessName} intro={`#${order.reference} isn't waiting for review.`} back={{ href: "/admin/review", label: "Review queue" }}>
        <Note>This order is {statusLabel(order.status).toLowerCase()}. <Link href={`/admin/orders/${order.id}`} className="underline">Open the order</Link> instead.</Note>
      </AdminPage>
    );
  }
  const deadline = deadlineAt(order.paidAt);
  const autoSend = autoSendAt(order.paidAt);

  return (
    <AdminPage title={order.businessName} back={{ href: "/admin/review", label: "Review queue" }}
      intro={`#${order.reference} · ${postSend ? "Sent unreviewed. Check it now the customer has it." : "Draft ready for review."}`}
      action={<span className="flex flex-wrap gap-2"><AdminStatusChip status={order.status} /><ClockBadge order={order} now={now} /><FlagChips flags={order.flags} /></span>}>
      <FindingEditor review={order.review} reviewer={user.name} mode={postSend ? "post_send" : "review"}
        clock={
          <div className="flex flex-col gap-2 border-t border-hairline pt-2">
            <dl className="flex flex-col divide-y divide-hairline">
              <SummaryRow label="Deadline" value={<><LocalTime iso={deadline.toISOString()} /> · {formatRelative(deadline, now)}</>} />
              {postSend
                ? <SummaryRow label="Auto-sent" value={<LocalTime iso={order.deliveredAt!} />} />
                : <SummaryRow label="Auto-send" value={<><LocalTime iso={autoSend.toISOString()} /> · {formatRelative(autoSend, now)}</>} />}
            </dl>
            {!postSend && <p className="type-caption text-muted">Not approved by then, it sends as is and is flagged Sent unreviewed.</p>}
          </div>
        }
        aside={<ClientContext order={order} />} />
    </AdminPage>
  );
}
