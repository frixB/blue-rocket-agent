import { TZDate } from "@date-fns/tz";
import { format, differenceInCalendarDays } from "date-fns";

/**
 * The delivery promise. One source of truth for price, window and working
 * hours. Landing page, form, status page, emails and the watchdog all read
 * from here. Change it once.
 */
export const SLA = {
  productName: "Detailed SEO Report",
  priceCents: 150_000,
  /** Delivery window, in business days. */
  businessDays: 1,
  /** Working hours, local to SLA.timezone. */
  workStartHour: 9,
  workEndHour: 17,
  /** 0 = Sunday. Monday to Friday. */
  workDays: [1, 2, 3, 4, 5] as readonly number[],
  /** Business days past the promise before we escalate and auto-refund. */
  escalateAfterBusinessDays: 1,
  /** The business's clock, not the customer's. Open decision, see docs. */
  timezone: "America/New_York",
} as const;

const DAY_MINUTES = (SLA.workEndHour - SLA.workStartHour) * 60;
const MIN = 60_000;

const zoned = (d: Date | number) => new TZDate(typeof d === "number" ? d : d.getTime(), SLA.timezone);
const at = (z: TZDate, dayOffset: number, hour: number) =>
  new TZDate(z.getFullYear(), z.getMonth(), z.getDate() + dayOffset, hour, 0, 0, 0, SLA.timezone);
const isWorkday = (z: TZDate) => SLA.workDays.includes(z.getDay());

/** Moves forward `minutes` of working time, skipping nights and weekends. */
export function addBusinessMinutes(from: Date, minutes: number): Date {
  let cursor = zoned(from);
  let remaining = minutes;
  for (let guard = 0; guard < 1000; guard++) {
    const start = at(cursor, 0, SLA.workStartHour);
    const end = at(cursor, 0, SLA.workEndHour);
    if (!isWorkday(cursor) || cursor.getTime() >= end.getTime()) {
      cursor = at(cursor, 1, SLA.workStartHour);
      continue;
    }
    if (cursor.getTime() < start.getTime()) cursor = start;
    const available = (end.getTime() - cursor.getTime()) / MIN;
    if (remaining <= available) return new Date(cursor.getTime() + remaining * MIN);
    remaining -= available;
    cursor = at(cursor, 1, SLA.workStartHour);
  }
  throw new Error("addBusinessMinutes did not converge");
}

/** Working minutes between two instants. Never wall clock. */
export function businessMinutesBetween(from: Date, to: Date): number {
  if (to.getTime() <= from.getTime()) return 0;
  let cursor = zoned(from);
  let total = 0;
  for (let guard = 0; guard < 5000; guard++) {
    if (cursor.getTime() >= to.getTime()) break;
    const start = at(cursor, 0, SLA.workStartHour);
    const end = at(cursor, 0, SLA.workEndHour);
    if (isWorkday(cursor)) {
      const a = Math.max(cursor.getTime(), start.getTime());
      const b = Math.min(end.getTime(), to.getTime());
      if (b > a) total += (b - a) / MIN;
    }
    cursor = at(cursor, 1, SLA.workStartHour);
  }
  return Math.round(total);
}

/** The promised delivery moment for an order paid at `paidAt`. */
export function deliveryDeadline(paidAt: Date): Date {
  return addBusinessMinutes(paidAt, SLA.businessDays * DAY_MINUTES);
}

/** When work actually begins. Equal to paidAt inside working hours. */
export function workStartsAt(paidAt: Date): Date {
  return addBusinessMinutes(paidAt, 0);
}

export type QueueReason = "now" | "overnight" | "weekend";

/** Why an order is not running yet. Drives the S-22 weekend queue state. */
export function queueReason(paidAt: Date): QueueReason {
  const start = workStartsAt(paidAt);
  if (start.getTime() === paidAt.getTime()) return "now";
  const paid = zoned(paidAt);
  const days = differenceInCalendarDays(zoned(start), paid);
  return !isWorkday(paid) || days > 1 ? "weekend" : "overnight";
}

export type SlaState = "on_track" | "late" | "escalate";

/** Business-hours aware. A Friday evening order is not late on Sunday. */
export function slaState(paidAt: Date, now: Date = new Date()): SlaState {
  const deadline = deliveryDeadline(paidAt);
  if (now.getTime() <= deadline.getTime()) return "on_track";
  const over = businessMinutesBetween(deadline, now);
  return over >= SLA.escalateAfterBusinessDays * DAY_MINUTES ? "escalate" : "late";
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
export const formatPrice = (cents: number) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(cents / 100);

/** "6h 12m", "45m". Wall-clock time from payment to delivery, as S-13 shows it. */
export function formatDuration(from: Date, to: Date): string {
  const mins = Math.max(0, Math.round((to.getTime() - from.getTime()) / MIN));
  const h = Math.floor(mins / 60);
  return h ? `${h}h ${mins % 60}m` : `${mins}m`;
}
