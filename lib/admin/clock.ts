import type { AdminStatus } from "./types";

/**
 * The admin clock. Reports run any day, so this is wall-clock time from
 * payment: no business days, no weekend queue, no holiday calendar.
 *
 * lib/orders/sla.ts still does business-day maths for the customer screens.
 * When the front end moves to the 24-hour promise, these numbers move there
 * and this file keeps only the admin-specific parts (urgent, auto-send).
 */
export const CLOCK = {
  /** Delivery promise: within 24 hours of payment. */
  deadlineHours: 24,
  /** Past this, the order is escalated and the auto-refund starts unless an owner stops it. */
  escalateHours: 48,
  /** Default auto-send window. A setting: a draft still in review this long before the deadline sends as is. */
  autoSendBeforeHours: 2,
  /** Under this much time left, the order is urgent. */
  urgentHours: 4,
} as const;

const HOUR = 3_600_000;
const MIN = 60_000;

const plus = (iso: string, hours: number) => new Date(new Date(iso).getTime() + hours * HOUR);

export const deadlineAt = (paidAt: string) => plus(paidAt, CLOCK.deadlineHours);
export const escalatesAt = (paidAt: string) => plus(paidAt, CLOCK.escalateHours);
export const autoSendAt = (paidAt: string, windowHours: number = CLOCK.autoSendBeforeHours) =>
  plus(paidAt, CLOCK.deadlineHours - windowHours);

/** Minutes until the deadline. Negative once late. */
export const minutesLeft = (paidAt: string, now: Date) => Math.round((deadlineAt(paidAt).getTime() - now.getTime()) / MIN);

export type ClockState = "unpaid" | "on_track" | "urgent" | "late" | "escalated" | "delivered" | "closed";

const UNPAID: readonly AdminStatus[] = ["awaiting_payment", "payment_failed"];
const DELIVERED: readonly AdminStatus[] = ["ready", "partial"];

/** Where an order stands against the 24-hour promise. Drives every "time left" badge. */
export function clockState(order: { status: AdminStatus; paidAt: string }, now: Date): ClockState {
  if (UNPAID.includes(order.status)) return "unpaid";
  if (DELIVERED.includes(order.status)) return "delivered";
  if (order.status === "refunded") return "closed";
  const left = minutesLeft(order.paidAt, now);
  if (left > CLOCK.urgentHours * 60) return "on_track";
  if (left > 0) return "urgent";
  return left > -(CLOCK.escalateHours - CLOCK.deadlineHours) * 60 ? "late" : "escalated";
}

const hm = (mins: number) => {
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return h ? `${h}h ${String(m).padStart(2, "0")}m` : `${m}m`;
};

/** "3h 05m left", "45m left", "2h 10m late". */
export function formatTimeLeft(paidAt: string, now: Date): string {
  const left = minutesLeft(paidAt, now);
  return left >= 0 ? `${hm(left)} left` : `${hm(-left)} late`;
}

/** "in 1h 20m", "12m ago". For the auto-send timer and the auto-refund timer. */
export function formatRelative(at: Date, now: Date): string {
  const mins = Math.round((at.getTime() - now.getTime()) / MIN);
  return mins >= 0 ? `in ${hm(mins)}` : `${hm(-mins)} ago`;
}

/** Sort key for "runs out of time next". Unpaid and finished orders sink to the bottom. */
export function urgency(order: { status: AdminStatus; paidAt: string }, now: Date): number {
  const s = clockState(order, now);
  if (s === "unpaid" || s === "delivered" || s === "closed") return Number.MAX_SAFE_INTEGER;
  return minutesLeft(order.paidAt, now);
}
