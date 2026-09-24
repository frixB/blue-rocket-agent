import { Check, CircleDot, Clock, Gift, Pause, Timer, Undo2, X } from "lucide-react";
import { Chip, type Tone } from "./chip";
import type { LucideIcon } from "./icon";

/**
 * Figma "Status badge", S-16 report rows. Status is never colour alone:
 * every badge carries a glyph and a word.
 */
export type BadgeKind = "queued" | "running" | "ready" | "delayed" | "blocked" | "failed" | "refunded" | "credit" | "paid";

const BADGE: Record<BadgeKind, { tone: Tone; icon: LucideIcon; label: string }> = {
  queued: { tone: "neutral", icon: Clock, label: "Queued" },
  running: { tone: "warning", icon: CircleDot, label: "Running" },
  ready: { tone: "success", icon: Check, label: "Ready" },
  delayed: { tone: "warning", icon: Timer, label: "Running over" },
  blocked: { tone: "warning", icon: Pause, label: "Needs you" },
  failed: { tone: "danger", icon: X, label: "Failed" },
  refunded: { tone: "info", icon: Undo2, label: "Refunded" },
  credit: { tone: "info", icon: Gift, label: "Credit" },
  paid: { tone: "success", icon: Check, label: "Paid" },
};

export function StatusBadge({ kind }: { kind: BadgeKind }) {
  const b = BADGE[kind];
  return <Chip tone={b.tone} icon={b.icon}>{b.label}</Chip>;
}
