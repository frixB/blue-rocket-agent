import { cn } from "@/lib/cn";
import type { Tone } from "./chip";

const tones: Record<Tone, string> = { neutral: "bg-inset", success: "bg-success", warning: "bg-warning", danger: "bg-danger", info: "bg-info" };
const sizes = { sm: "size-8 text-base", md: "size-10 text-lg", lg: "size-12 text-2xl", xl: "size-16 text-3xl" } as const;

export function IconTile({ emoji, tone = "neutral", size = "lg", label }: { emoji: string; tone?: Tone; size?: keyof typeof sizes; label?: string }) {
  return (
    <span role={label ? "img" : undefined} aria-label={label} aria-hidden={label ? undefined : true}
      className={cn("inline-flex shrink-0 items-center justify-center rounded-tile", tones[tone], sizes[size])}>
      {emoji}
    </span>
  );
}
