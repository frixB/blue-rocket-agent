import { CircleCheck, FileText, Info, TriangleAlert } from "lucide-react";
import { cn } from "@/lib/cn";
import { Icon, type LucideIcon } from "./icon";
import type { Tone } from "./chip";

const tones: Record<Tone, string> = {
  neutral: "bg-inset text-ink-2",
  success: "bg-success text-success-ink",
  warning: "bg-warning text-warning-ink",
  danger: "bg-danger text-danger-ink",
  info: "bg-info text-info-ink",
};
const icons: Record<Tone, LucideIcon> = { neutral: FileText, success: CircleCheck, warning: TriangleAlert, danger: TriangleAlert, info: Info };

/**
 * The strip that says what happened to the money. Every failure state uses
 * one. Do not reimplement it in blocks/ or states/.
 * `glyph` still accepts an emoji for one-off notes; prefer `icon`.
 */
export function Note({ tone = "neutral", icon, glyph, className, children }: { tone?: Tone; icon?: LucideIcon; glyph?: string; className?: string; children: React.ReactNode }) {
  return (
    <p role={tone === "danger" ? "alert" : undefined} className={cn("flex items-start gap-2.5 rounded-lg px-4 py-3.5 type-body-sm-strong", tones[tone], className)}>
      {glyph ? <span aria-hidden>{glyph}</span> : <Icon icon={icon ?? icons[tone]} />}
      <span>{children}</span>
    </p>
  );
}
