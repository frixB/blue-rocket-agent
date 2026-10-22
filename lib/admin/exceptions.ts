import type { Route } from "next";
import { needsAttention, type AttentionKind } from "./attention";
import { clockState, minutesLeft } from "./clock";
import type { AdminOrder, StripeMismatch } from "./types";
import { formatPriceShort } from "@/lib/orders/sla";

export type ExceptionKind = "escalated" | "late" | "stripe" | "failed" | "blocked" | "payment" | "disputed" | "duplicate" | "partial";

export const EXCEPTION_LABEL: Record<ExceptionKind, string> = {
  escalated: "Escalated", late: "Late", stripe: "Stripe mismatch", failed: "Failed", blocked: "Blocked",
  payment: "Payment failed", disputed: "Disputed", duplicate: "Duplicate", partial: "Partial",
};

export type ExceptionItem = {
  key: string;
  kind: ExceptionKind;
  title: string;
  detail: string;
  /** "Riverbend Auto Repair · #BRA-4499" or the Stripe charge. */
  subject: string;
  href: Route;
  order?: AdminOrder;
  assignee?: string;
  /** Minutes left on the delivery clock, when one is running. */
  minutesLeft?: number;
};

/** The Action queue kinds that are exceptions. Under 4h, unreviewed and PDF stay review and delivery work. */
const FROM_ATTENTION: Partial<Record<AttentionKind, ExceptionKind>> = {
  escalated: "escalated", late: "late", failed: "failed", blocked: "blocked", payment: "payment", disputed: "disputed", duplicate: "duplicate",
};
const RANK: ExceptionKind[] = ["escalated", "late", "stripe", "failed", "blocked", "payment", "disputed", "duplicate", "partial"];

/**
 * Exceptions, as the blueprint defines them: blocked, partial, failed, late
 * and escalated orders, payment problems, disputes, duplicates and Stripe
 * mismatches. Orders on the clock come first, least time left first; the
 * rest follow by how much they cost to leave.
 */
export function listExceptions(orders: AdminOrder[], mismatches: StripeMismatch[], now: Date): ExceptionItem[] {
  const clock = (o: AdminOrder) => (["on_track", "urgent", "late", "escalated"].includes(clockState(o, now)) ? minutesLeft(o.paidAt, now) : undefined);
  const subject = (o: AdminOrder) => `${o.businessName} · #${o.reference}`;
  const items: ExceptionItem[] = [];

  for (const a of needsAttention(orders, now)) {
    const kind = FROM_ATTENTION[a.kind];
    if (!kind) continue;
    items.push({ key: `${a.order.id}-${kind}`, kind, title: a.title, detail: a.detail, subject: subject(a.order), href: a.href,
      order: a.order, assignee: a.order.assignee, minutesLeft: clock(a.order) });
  }
  for (const o of orders.filter((x) => x.status === "partial")) {
    const missing = o.review?.sections.filter((s) => s.state === "unavailable").length ?? 1;
    items.push({ key: `${o.id}-partial`, kind: "partial", title: "Delivered as a partial report",
      detail: `${missing} ${missing === 1 ? "section" : "sections"} had no data. Check the customer got the backlink credit and the reason reads well.`,
      subject: subject(o), href: `/admin/orders/${o.id}` as Route, order: o, assignee: o.assignee });
  }
  for (const m of mismatches) {
    items.push(m.kind === "no_order"
      ? { key: m.id, kind: "stripe", title: `${formatPriceShort(m.amountCents)} paid, no order`, subject: `${m.email} · ${m.charge}`,
          detail: "Stripe took the payment but no order was created. Link it to an order or refund it.",
          href: "/admin/exceptions?type=stripe" as Route, assignee: m.assignee }
      : { key: m.id, kind: "stripe", title: `Charged ${formatPriceShort(m.amountCents)}, price is ${formatPriceShort(m.expectedCents ?? 0)}`,
          subject: `${m.businessName} · #${m.reference}`,
          detail: `Stripe charged ${formatPriceShort((m.expectedCents ?? 0) - m.amountCents)} less than the order price. Check the discount, or refund and re-charge.`,
          href: `/admin/orders/${m.orderId}` as Route, assignee: m.assignee });
  }

  const far = Number.MAX_SAFE_INTEGER;
  return items.sort((a, b) => (a.minutesLeft ?? far) - (b.minutesLeft ?? far) || RANK.indexOf(a.kind) - RANK.indexOf(b.kind));
}
