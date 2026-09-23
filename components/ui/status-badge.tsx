import { Chip, type Tone } from "./chip";

/**
 * Figma "Status badge", S-16 report rows. Status is never colour alone:
 * every badge carries a glyph and a word.
 */
export type BadgeKind = "queued" | "running" | "ready" | "delayed" | "blocked" | "failed" | "refunded" | "credit" | "paid";

const BADGE: Record<BadgeKind, { tone: Tone; glyph: string; label: string }> = {
  queued: { tone: "neutral", glyph: "●", label: "Queued" },
  running: { tone: "warning", glyph: "●", label: "Running" },
  ready: { tone: "success", glyph: "✓", label: "Ready" },
  delayed: { tone: "warning", glyph: "⏱", label: "Running over" },
  blocked: { tone: "warning", glyph: "⏸", label: "Needs you" },
  failed: { tone: "danger", glyph: "✕", label: "Failed" },
  refunded: { tone: "info", glyph: "↩", label: "Refunded" },
  credit: { tone: "info", glyph: "", label: "Credit" },
  paid: { tone: "success", glyph: "✓", label: "Paid" },
};

export function StatusBadge({ kind }: { kind: BadgeKind }) {
  const b = BADGE[kind];
  return (
    <Chip tone={b.tone}>
      {b.glyph && <span aria-hidden>{b.glyph}</span>}
      {b.label}
    </Chip>
  );
}
