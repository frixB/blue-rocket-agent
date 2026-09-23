import { cn } from "@/lib/cn";
import { Icon, type LucideIcon } from "./icon";
import type { Tone } from "./chip";

type TileTone = Tone | "action";

const tones: Record<TileTone, string> = {
  neutral: "bg-inset text-ink-2",
  success: "bg-success text-success-ink",
  warning: "bg-warning text-warning-ink",
  danger: "bg-danger text-danger-ink",
  info: "bg-info text-info-ink",
  action: "bg-action text-on-action",
};

/** Figma "Icon tile": 34 (nav), 40 (list), 48 (row), 56 (modal), 64 (status header). */
const sizes = {
  xs: "size-avatar text-base",
  sm: "size-tile-md text-lg",
  md: "size-tile-xl text-2xl",
  lg: "size-tile-2xl text-2xl",
  xl: "size-tile-3xl text-3xl",
} as const;

type Props = { tone?: TileTone; size?: keyof typeof sizes; label?: string; className?: string } & (
  | { icon: LucideIcon; emoji?: never }
  | { emoji: string; icon?: never }
);

export function IconTile({ icon, emoji, tone = "neutral", size = "md", label, className }: Props) {
  return (
    <span
      role={label ? "img" : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
      className={cn("inline-flex shrink-0 items-center justify-center rounded-tile", tones[tone], sizes[size], className)}
    >
      {icon ? <Icon icon={icon} /> : emoji}
    </span>
  );
}
