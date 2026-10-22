import { TZDate } from "@date-fns/tz";
import { format, differenceInCalendarDays } from "date-fns";

/**
 * The delivery promise. One source of truth for price, window and escalation.
 * Landing page, form, status page, emails, the admin clock and the watchdog
 * all read from here. Change it once.
 *
 * Reports run every day, weekends included, so every timer is wall-clock
 * time from payment. There are no working hours and no weekend queue.
 */
export const SLA = {
  productName: "Detailed SEO Report",
  priceCents: 150_000,
  /** Delivery window: within this many hours of payment, any day. */
  deliveryHours: 48,
  /** Hours past the promise before we escalate and auto-refund. */
  escalateAfterHours: 24,
  /** The business's clock, not the customer's. Used to format dates. */
  timezone: "America/New_York",
} as const;

const HOUR = 3_600_000;
const MIN = 60_000;

const zoned = (d: Date | number) => new TZDate(typeof d === "number" ? d : d.getTime(), SLA.timezone);

/** The promised delivery moment for an order paid at `paidAt`. */
export function deliveryDeadline(paidAt: Date): Date {
  return new Date(paidAt.getTime() + SLA.deliveryHours * HOUR);
}

/** When the order escalates and the auto-refund starts. */
export function escalationAt(paidAt: Date): Date {
  return new Date(deliveryDeadline(paidAt).getTime() + SLA.escalateAfterHours * HOUR);
}

export type SlaState = "on_track" | "late" | "escalate";

export function slaState(paidAt: Date, now: Date = new Date()): SlaState {
  if (now.getTime() <= deliveryDeadline(paidAt).getTime()) return "on_track";
  return now.getTime() < escalationAt(paidAt).getTime() ? "late" : "escalate";
}

/**
 * "by 5:00pm today", "by 5:00pm tomorrow", "by 5:00pm Monday 21 Sep".
 * Never a raw hour count. "In 66 hours" reads as an insult at $1,500.
 */
export function formatDeliveryPromise(deadline: Date, now: Date = new Date()): string {
  const d = zoned(deadline);
  const time = format(d, "h:mmaaa");
  const days = differenceInCalendarDays(d, zoned(now));
  if (days === 0) return `by ${time} today`;
  if (days === 1) return `by ${time} tomorrow`;
  return `by ${time} ${format(d, "EEEE d MMM")}`;
}

export const formatTime = (d: Date) => format(zoned(d), "HH:mm");
export const formatDay = (d: Date) => format(zoned(d), "EEE HH:mm");
/** "16 Sep 2026", for lists and receipts. */
export const formatDate = (d: Date) => format(zoned(d), "dd MMM yyyy");
/** "$1,500" for headlines, CTAs and sentences; formatPrice keeps cents for receipts and summaries. */
export const formatPriceShort = (cents: number) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: cents % 100 ? 2 : 0 }).format(cents / 100);
export const formatPrice = (cents: number) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(cents / 100);

/** "6h 12m", "45m". Wall-clock time from payment to delivery, as S-13 shows it. */
export function formatDuration(from: Date, to: Date): string {
  const mins = Math.max(0, Math.round((to.getTime() - from.getTime()) / MIN));
  const h = Math.floor(mins / 60);
  return h ? `${h}h ${mins % 60}m` : `${mins}m`;
}
