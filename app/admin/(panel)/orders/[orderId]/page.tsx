import Link from "next/link";
import { notFound } from "next/navigation";
import { CreditCard, FileDown, Link2, Mail, PenLine, RefreshCw, RotateCcw, ShieldOff, Undo2 } from "lucide-react";
import { Card, CardTitle, Chip, Icon, Note, SummaryRow, TimelineStep, type Tone } from "@/components/ui";
import { AdminAction } from "@/components/blocks/admin/admin-action";
import { AdminPage } from "@/components/blocks/admin/admin-page";
import { AdminStatusChip, ClockBadge, FlagChips } from "@/components/blocks/admin/badges";
import { ClientContext } from "@/components/blocks/admin/client-context";
import { RefundDecision } from "@/components/blocks/admin/refund-decision";
import { deadlineAt, escalatesAt, formatRelative } from "@/lib/admin/clock";
import { getOrder, listRefundRequests, listStripeMismatches } from "@/lib/admin/data";
import { currentAdmin, isOwner } from "@/lib/admin/session";
import type { AdminOrder, EmailKind, EmailRecord, RefundRequest } from "@/lib/admin/types";
import { STAGE_LABEL, type Stage } from "@/lib/orders/status";
import { formatPrice, formatPriceShort } from "@/lib/orders/sla";
import { LocalTime } from "@/components/blocks/admin/local-time";

export const dynamic = "force-dynamic";

const EMAIL: Record<EmailKind, string> = {
  payment_succeeded: "Payment received",
  crawler_blocked: "Crawler blocked, how to fix",
  deadline_missed: "Running late",
  report_ready: "Your report is ready",
  failed: "We couldn't finish your report",
  refund_issued: "Refund issued",
};
const EMAIL_STATE: Record<EmailRecord["state"], Tone> = { delivered: "success", opened: "success", bounced: "danger", queued: "neutral" };

/** For "Retry …" buttons. STAGE_LABEL is title case and "SEO" must keep its capitals. */
const RETRY_LABEL: Record<Stage, string> = { payment: "payment", crawl: "site crawl", analysis: "SEO analysis", compile: "report compile", delivery: "delivery" };

/** Times show in the viewer's own zone, labelled. */
const day = (iso?: string) => (iso ? <LocalTime iso={iso} /> : undefined);

/** The actions that make sense for this order right now. Refunds are owners only; Ops prepares one for approval. */
function Actions({ order, owner, pendingRefund, now }: { order: AdminOrder; owner: boolean; pendingRefund?: RefundRequest; now: Date }) {
  const s = order.status;
  const amount = formatPriceShort(order.amountCents);
  const failedStage = order.stages.find((x) => x.state === "failed");
  const refundable = !["refunded", "awaiting_payment", "payment_failed"].includes(s);
  const money = s === "escalated" || refundable;
  return (
    <div className="flex flex-col gap-3">
      {(s === "reviewing" || order.flags.includes("sent_unreviewed")) && (
        <Link href={`/admin/review/${order.id}`} className="flex min-h-control-md items-center justify-center gap-button-gap rounded-control bg-action px-button-x py-2 font-semibold text-on-action hover:bg-action-hover">
          {s === "reviewing" ? "Open the review" : "Review what was sent"}
        </Link>
      )}
      {failedStage && s !== "refunded" && (
        <AdminAction label={`Retry ${RETRY_LABEL[failedStage.stage]}`} icon={<Icon icon={RefreshCw} size="sm" />} variant="primary"
          done={`only this stage runs again and the order moves back to ${failedStage.stage === "crawl" ? "crawling" : "analysing"}.`} />
      )}
      {s === "late" && <AdminAction label="Push to review" icon={<Icon icon={PenLine} size="sm" />} done="the draft goes to the top of the review queue as it is." />}
      {s === "failed" && <AdminAction label="Re-queue from the start" icon={<Icon icon={RotateCcw} size="sm" />} confirm="Run the whole report again from the crawl?" done="the order moves to queued and starts over. The 24-hour clock does not reset." />}
      {s === "payment_failed" && <AdminAction label="Send payment link" icon={<Icon icon={CreditCard} size="sm" />} variant="primary" confirm={`Email ${order.email} a new payment link?`} done="they get a fresh Stripe link, with reminders at 1 hour and 24 hours." />}
      {s === "blocked" && <AdminAction label="Resend the fix instructions" icon={<Icon icon={Mail} size="sm" />} confirm={`Email ${order.email} the fix instructions again?`} done="they get the crawler-blocked email again, ready to forward to whoever manages the site." />}
      {(s === "ready" || s === "partial") && <AdminAction label="Resend ready email" icon={<Icon icon={Mail} size="sm" />} confirm={`Resend the ready email to ${order.email}?`} done="the ready email goes out again with the report link and the PDF." />}
      {order.pdf === "failed" && <AdminAction label="Regenerate PDF" icon={<Icon icon={FileDown} size="sm" />} done="the PDF is rebuilt from the approved report and sent in a follow-up email." />}
      <AdminAction label="Resend order page link" icon={<Icon icon={Link2} size="sm" />} variant="text" confirm={`Email ${order.email} a link to their order page?`} done="they get a signed link to their order page." />

      {money && (
        // Money moves sit apart from the everyday fixes, so a refund is never the button next to "Resend".
        <div className="flex flex-col gap-3 border-t border-hairline pt-4">
          {s === "escalated" && (owner
            ? <AdminAction label="Stop the auto-refund" icon={<Icon icon={ShieldOff} size="sm" />} confirm="Stop the auto-refund and deliver this order instead?" reason="Why stop the refund?" done="the refund is held, your reason is logged, and the order stays open for delivery." />
            : <AdminAction label="Stop the auto-refund" icon={<Icon icon={ShieldOff} size="sm" />} done="" disabledReason="Owners only. Ask Rasa or Carlos." />)}
          {pendingRefund ? (
            <div className="flex flex-col gap-3">
              <Note tone="warning">
                {formatPriceShort(pendingRefund.amountCents)} refund waiting for approval · prepared by {pendingRefund.preparedBy}, {formatRelative(new Date(pendingRefund.preparedAt), now)}
              </Note>
              {owner
                ? <RefundDecision id={pendingRefund.id} amount={formatPriceShort(pendingRefund.amountCents)} preparedBy={pendingRefund.preparedBy} />
                : <p className="type-caption text-muted">Rasa or Carlos approves or declines it. Nothing moves until then.</p>}
            </div>
          ) : refundable && (owner
            ? <AdminAction label="Refund" icon={<Icon icon={Undo2} size="sm" />} variant="danger" confirm={`Refund ${amount} to ${order.customerName}? This can't be undone.`}
                done={`Stripe refunds ${amount}, the order moves to Refunded and the customer gets the refund email.`} />
            : <AdminAction label="Prepare a refund" icon={<Icon icon={Undo2} size="sm" />} confirm={`Prepare a ${amount} refund for an owner to approve?`}
                done="Rasa and Carlos get an approval request. Nothing moves until one of them approves." />)}
        </div>
      )}
    </div>
  );
}

export default async function OrderDetail({ params }: { params: Promise<{ orderId: string }> }) {
  const now = new Date();
  const { orderId } = await params;
  const [order, user, requests, mismatches] = await Promise.all([getOrder(orderId, now), currentAdmin(), listRefundRequests(now), listStripeMismatches(now)]);
  if (!order) notFound();
  const pendingRefund = requests.find((r) => r.target.kind === "order" && r.target.orderId === order.id);
  const mismatch = mismatches.find((m) => m.orderId === order.id);
  const owner = isOwner(user);
  const paid = !["awaiting_payment", "payment_failed"].includes(order.status);

  return (
    <AdminPage title={order.businessName} back={{ href: "/admin/orders", label: "Orders" }}
      intro={`#${order.reference} · ${new URL(order.websiteUrl).host} · ${order.customerName}`}
      action={<span className="flex flex-wrap gap-2"><AdminStatusChip status={order.status} /><ClockBadge order={order} now={now} /><FlagChips flags={order.flags} /></span>}>
      <div className="grid gap-8 xl:grid-cols-[minmax(0,1fr)_var(--container-rail)]">
        <div className="flex flex-col gap-6">
          {order.failure && (
            <Note tone={order.status === "blocked" ? "warning" : "danger"}>
              {order.failure.stage} stopped: {order.failure.message} <span className="font-normal">Code {order.failure.code}.</span>
            </Note>
          )}
          {mismatch?.expectedCents && (
            <Note tone="danger">
              Stripe charged {formatPriceShort(mismatch.amountCents)}, but the price is {formatPriceShort(mismatch.expectedCents)}. Check the discount, or refund and re-charge. <span className="font-normal">Charge {mismatch.charge}.</span>
            </Note>
          )}
          {order.status === "escalated" && (
            <Note tone="danger">Escalated {formatRelative(escalatesAt(order.paidAt), now)}, 48 hours after payment. The {formatPriceShort(order.amountCents)} auto-refund runs on the next watchdog pass unless an owner stops it.</Note>
          )}
          {order.refund && (
            <Note tone="info">Refunded {formatPriceShort(order.amountCents)} on {day(order.refund.issuedAt)} · {order.refund.reason} · {order.refund.automatic ? "automatic" : "by an owner"} · {order.refund.reference}</Note>
          )}

          <Card aria-labelledby="stages-title">
            <CardTitle id="stages-title">Stages</CardTitle>
            <ol className="flex flex-col">
              {order.stages.map((s, i) => (
                <TimelineStep key={s.stage} index={i + 1} label={STAGE_LABEL[s.stage]} state={s.state} last={i === order.stages.length - 1}
                  meta={s.at ? <>{s.state === "failed" ? "Stopped" : "Done"} {day(s.at)}</> : s.state === "active" ? "Running now" : "Waiting"} />
              ))}
            </ol>
            {order.review && (
              <p className="type-body-sm text-ink-2">
                Review: {order.review.approvedAt ? <>approved by {order.review.reviewer}, {day(order.review.approvedAt)}</> : order.flags.includes("sent_unreviewed") ? "auto-sent before anyone approved it" : "waiting"}.
              </p>
            )}
          </Card>

          <Card aria-labelledby="emails-title" className="gap-2">
            <CardTitle id="emails-title">Delivery log</CardTitle>
            {order.emails.length ? (
              <ul className="flex flex-col divide-y divide-hairline">
                {order.emails.map((e) => (
                  <li key={`${e.kind}-${e.at}`} className="flex flex-wrap items-center justify-between gap-2 py-3">
                    <span className="flex flex-col">
                      <span className="type-body-strong text-ink">{EMAIL[e.kind]}</span>
                      <span className="type-caption text-muted">{e.to} · {day(e.at)}</span>
                    </span>
                    <Chip tone={EMAIL_STATE[e.state]}>{e.state[0]!.toUpperCase() + e.state.slice(1)}</Chip>
                  </li>
                ))}
              </ul>
            ) : <p className="type-body-sm text-ink-2">No emails yet. The first one goes out when Stripe confirms payment.</p>}
            <div className="flex items-center justify-between gap-2 border-t border-hairline pt-3">
              <span className="type-body-sm text-ink-2">PDF</span>
              <Chip tone={order.pdf === "built" ? "success" : order.pdf === "failed" ? "danger" : "neutral"}>
                {order.pdf === "built" ? "Built" : order.pdf === "failed" ? "Failed. The web report is still live." : "Not built yet"}
              </Chip>
            </div>
          </Card>

          <Card aria-labelledby="audit-title" className="gap-2">
            <CardTitle id="audit-title">Activity</CardTitle>
            <ul className="flex flex-col divide-y divide-hairline">
              {order.audit.map((a) => (
                <li key={a.at + a.action} className="flex flex-wrap justify-between gap-2 py-3">
                  <span className="type-body-sm text-ink"><span className="font-semibold">{a.who}</span> · {a.action}</span>
                  <span className="type-caption text-muted">{day(a.at)}</span>
                </li>
              ))}
            </ul>
          </Card>
        </div>

        <aside className="flex flex-col gap-6">
          <Card aria-labelledby="actions-title">
            <CardTitle id="actions-title">Actions</CardTitle>
            <Actions order={order} owner={owner} pendingRefund={pendingRefund} now={now} />
          </Card>

          <Card aria-labelledby="money-title" className="gap-0">
            <CardTitle id="money-title" className="pb-2">Payment</CardTitle>
            <dl className="flex flex-col divide-y divide-hairline">
              <SummaryRow label="Status" value={order.refund ? "Refunded" : paid ? "Paid" : order.status === "payment_failed" ? "Card declined" : "Checkout open"} />
              {paid && <SummaryRow label="Paid" value={day(order.paidAt)} />}
              {paid && <SummaryRow label="Deadline" value={day(deadlineAt(order.paidAt).toISOString())} />}
              <SummaryRow label="Card" value={order.payment.card} />
              <SummaryRow label="Stripe" value={order.payment.stripeIntent} />
              {owner && <SummaryRow label="Amount" value={formatPrice(order.amountCents)} />}
              {owner && paid && <SummaryRow label="Stripe fee" value={`−${formatPrice(order.payment.feeCents)}`} />}
              {owner && paid && <SummaryRow label="Net" value={formatPrice(order.refund ? 0 : order.amountCents - order.payment.feeCents)} emphasis />}
            </dl>
            {!owner && <p className="pt-3 type-caption text-muted">Amounts and refunds are visible to owners only.</p>}
          </Card>

          <ClientContext order={order} />
        </aside>
      </div>
    </AdminPage>
  );
}
