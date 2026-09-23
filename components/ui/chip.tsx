import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/cn";
import { Icon, type LucideIcon } from "./icon";

export const chipStyles = cva(
  "inline-flex items-center gap-1.5 rounded-chip px-chip-x py-chip-y type-caption-strong",
  {
    variants: {
      tone: {
        neutral: "bg-pending text-ink-2",
        success: "bg-success text-success-ink",
        warning: "bg-warning text-warning-ink",
        danger: "bg-danger text-danger-ink",
        info: "bg-info text-info-ink",
      },
    },
    defaultVariants: { tone: "neutral" },
  },
);

export type Tone = NonNullable<VariantProps<typeof chipStyles>["tone"]>;

/** Figma "Chip". Pass `icon` for a leading Lucide glyph; never an emoji. */
export function Chip({ tone, icon, className, children, ...props }: React.HTMLAttributes<HTMLSpanElement> & VariantProps<typeof chipStyles> & { icon?: LucideIcon }) {
  return (
    <span className={cn(chipStyles({ tone }), className)} {...props}>
      {icon && <Icon icon={icon} size="sm" />}
      {children}
    </span>
  );
}
