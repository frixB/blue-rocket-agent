import { cn } from "@/lib/cn";
import type { Tone } from "./chip";

const tones: Record<Tone, string> = {
  neutral: "bg-inset text-ink-2",
  success: "bg-success text-success-ink",
  warning: "bg-warning text-warning-ink",
  danger: "bg-danger text-danger-ink",
  info: "bg-info text-info-ink",
};
const glyphs: Record<Tone, string> = { neutral: "\u2139\uFE0F", success: "\u2713", warning: "\u26A0", danger: "\u2715", info: "\u2139\uFE0F" };

/**
 * The strip that says what happened to the money. Every failure state uses
 * one. Do not reimplement it in blocks/ or states/.
 */
export function Note({ tone = "neutral", glyph, className, children }: { tone?: Tone; glyph?: string; className?: string; children: React.ReactNode }) {
  return (
    <p role={tone === "danger" ? "alert" : undefined} className={cn("flex items-start gap-2.5 rounded-lg px-4 py-3.5 type-body-sm-strong", tones[tone], className)}>
      <span aria-hidden>{glyph ?? glyphs[tone]}</span>
      <span>{children}</span>
    </p>
  );
}
