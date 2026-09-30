import type { Route } from "next";
import { autoSendAt, clockState, escalatesAt, formatRelative, formatTimeLeft } from "./clock";
import type { AdminOrder } from "./types";

export type AttentionKind = "escalated" | "late" | "urgent" | "blocked" | "failed" | "payment" | "unreviewed" | "pdf" | "duplicate" | "disputed";

export type AttentionItem = { order: AdminOrder; kind: AttentionKind; title: string; detail: string; href: Route };

/**
 * "Needs attention", as the blueprint defines it: under 4h left, late,
 * escalated, blocked, failed, payment problems, sent unreviewed, plus the
 * PDF, duplicate and dispute flags. Most urgent first.
 */
export function needsAttention(orders: AdminOrder[], now: Date): AttentionItem[] {
  const items: AttentionItem[] = [];
  const detail = (o: AdminOrder) => `/admin/orders/${o.id}` as Route;
  for (const o of orders) {
    const clock = clockState(o, now);
    if (o.status === "escalated") {
      items.push({ order: o, kind: "escalated", href: detail(o), title: "Escalated, auto-refund running",
        detail: `Past 48 hours. Refund fires unless an owner stops it. Stuck at ${o.failure?.stage ?? "a stage"}.` });
    } else if (o.status === "late" || clock === "late") {
      items.push({ order: o, kind: "late", href: detail(o), title: formatTimeLeft(o.paidAt, now),
        detail: `Escalates and starts the auto-refund ${formatRelative(escalatesAt(o.paidAt), now)}.` });
    } else if (clock === "urgent") {
      const review = o.status === "reviewing";
      items.push({ order: o, kind: "urgent", href: review ? (`/admin/review/${o.id}` as Route) : detail(o), title: `Under 4h · ${formatTimeLeft(o.paidAt, now)}`,
        detail: review ? `In review. Auto-sends ${formatRelative(autoSendAt(o.paidAt), now)} if nobody approves it.` : `Still ${o.status}.` });
    }
    if (o.status === "blocked") items.push({ order: o, kind: "blocked", href: detail(o), title: "Blocked, waiting on the customer",
      detail: o.failure?.message ?? "The crawler couldn't get in." });
    if (o.status === "failed") items.push({ order: o, kind: "failed", href: detail(o), title: "Failed, re-queue or refund",
      detail: o.failure?.message ?? "Generation failed." });
    if (o.status === "payment_failed") items.push({ order: o, kind: "payment", href: detail(o), title: "Payment failed",
      detail: "Card declined at checkout. Send a payment link." });
    for (const f of o.flags) {
      if (f === "sent_unreviewed") items.push({ order: o, kind: "unreviewed", href: `/admin/review/${o.id}` as Route, title: "Sent unreviewed",
        detail: "Auto-sent before anyone approved it. Check it and mark it reviewed." });
      if (f === "pdf_failed") items.push({ order: o, kind: "pdf", href: detail(o), title: "PDF failed",
        detail: "The web report is live. Regenerate the PDF and send it in a follow-up." });
      if (f === "possible_duplicate") items.push({ order: o, kind: "duplicate", href: detail(o), title: "Possible duplicate",
        detail: "Same email and website as another order today. Refund the extra or keep both." });
      if (f === "disputed") items.push({ order: o, kind: "disputed", href: detail(o), title: "Disputed in Stripe",
        detail: "Chargeback opened. Submit the evidence pack before the due date." });
    }
  }
  const rank: AttentionKind[] = ["escalated", "late", "urgent", "failed", "blocked", "disputed", "payment", "duplicate", "unreviewed", "pdf"];
  return items.sort((a, b) => rank.indexOf(a.kind) - rank.indexOf(b.kind));
}
