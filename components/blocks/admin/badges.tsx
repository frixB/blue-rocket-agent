import {
  AlarmClock, Ban, Check, CircleDot, Clock, Copy, CreditCard, EyeOff, FileWarning, Gavel, Hourglass, Link2Off, Pause, ShieldAlert, Undo2, X,
} from "lucide-react";
import { Chip, type LucideIcon, type Tone } from "@/components/ui";
import { clockState, formatTimeLeft, type ClockState } from "@/lib/admin/clock";
import type { AdminStatus, Flag } from "@/lib/admin/types";

const STATUS: Record<AdminStatus, { tone: Tone; icon: LucideIcon; label: string }> = {
  awaiting_payment: { tone: "neutral", icon: CreditCard, label: "Awaiting payment" },
  payment_failed: { tone: "danger", icon: CreditCard, label: "Payment failed" },
  queued: { tone: "neutral", icon: Clock, label: "Queued" },
  crawling: { tone: "info", icon: CircleDot, label: "Crawling" },
  analysing: { tone: "info", icon: CircleDot, label: "Analysing" },
  compiling: { tone: "info", icon: CircleDot, label: "Compiling" },
  reviewing: { tone: "warning", icon: CircleDot, label: "In review" },
  blocked: { tone: "warning", icon: Pause, label: "Blocked" },
  late: { tone: "danger", icon: AlarmClock, label: "Late" },
  escalated: { tone: "danger", icon: ShieldAlert, label: "Escalated" },
  partial: { tone: "success", icon: Check, label: "Partial" },
  ready: { tone: "success", icon: Check, label: "Ready" },
  failed: { tone: "danger", icon: X, label: "Failed" },
  refunded: { tone: "info", icon: Undo2, label: "Refunded" },
};

export const statusLabel = (s: AdminStatus) => STATUS[s].label;

/** The order status, with a glyph and a word. Status is never colour alone. */
export function AdminStatusChip({ status }: { status: AdminStatus }) {
  const s = STATUS[status];
  return <Chip tone={s.tone} icon={s.icon} className="whitespace-nowrap">{s.label}</Chip>;
}

const CLOCK: Record<ClockState, { tone: Tone; icon: LucideIcon; label: string }> = {
  unpaid: { tone: "neutral", icon: CreditCard, label: "Not paid" },
  on_track: { tone: "success", icon: Clock, label: "On track" },
  urgent: { tone: "warning", icon: Hourglass, label: "Under 4h" },
  late: { tone: "danger", icon: AlarmClock, label: "Late" },
  escalated: { tone: "danger", icon: ShieldAlert, label: "Escalated" },
  delivered: { tone: "success", icon: Check, label: "Delivered" },
  closed: { tone: "info", icon: Undo2, label: "Closed" },
};

/** "On track · 14h 20m left", "Under 4h · 1h 05m left", "2h 10m over". */
export function ClockBadge({ order, now }: { order: { status: AdminStatus; paidAt: string }; now: Date }) {
  const state = clockState(order, now);
  const c = CLOCK[state];
  // Late and escalated already read in the status chip, so the clock shows only how far over.
  if (state === "late" || state === "escalated") {
    return <Chip tone={c.tone} icon={c.icon} className="whitespace-nowrap">{formatTimeLeft(order.paidAt, now).replace("late", "over")}</Chip>;
  }
  // A delivery deadline keeps running even when processing needs intervention.
  if (order.status === "failed" || order.status === "blocked") {
    return <Chip tone="warning" icon={Hourglass} className="whitespace-nowrap">{formatTimeLeft(order.paidAt, now)}</Chip>;
  }
  const running = state === "on_track" || state === "urgent";
  return (
    <Chip tone={c.tone} icon={c.icon} className="whitespace-nowrap">
      {c.label}
      {running && <span className="font-normal">· {formatTimeLeft(order.paidAt, now)}</span>}
    </Chip>
  );
}

const FLAG: Record<Flag, { tone: Tone; icon: LucideIcon; label: string }> = {
  sent_unreviewed: { tone: "warning", icon: EyeOff, label: "Sent unreviewed" },
  pdf_failed: { tone: "danger", icon: FileWarning, label: "PDF failed" },
  continued_past_url_check: { tone: "warning", icon: Link2Off, label: "Continued past URL check" },
  possible_duplicate: { tone: "warning", icon: Copy, label: "Possible duplicate" },
  disputed: { tone: "danger", icon: Gavel, label: "Disputed" },
};

export const flagLabel = (f: Flag) => FLAG[f].label;

export function FlagChips({ flags }: { flags: Flag[] }) {
  if (!flags.length) return null;
  return (
    <span className="flex flex-wrap gap-1.5">
      {flags.map((f) => <Chip key={f} tone={FLAG[f].tone} icon={FLAG[f].icon} className="whitespace-nowrap">{FLAG[f].label}</Chip>)}
    </span>
  );
}

export function OwnersOnly() {
  return <Chip tone="neutral" icon={Ban}>Owners only</Chip>;
}
