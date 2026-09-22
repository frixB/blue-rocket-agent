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

/**
 * Figma "Banner / claim account" (full-bleed under the nav), "Banner /
 * unverified email" and "Banner / shared" (inset, rounded). `actions` sits on
 * the right and wraps below on small screens.
 */
export function Banner({ tone = "warning", icon, inset, actions, className, children }: {
  tone?: Tone;
  icon?: LucideIcon;
  inset?: boolean;
  actions?: React.ReactNode;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div
      role="region"
      aria-label="Notice"
      className={cn(
        "flex flex-wrap items-center justify-between gap-3 py-3.5 type-body-sm-strong",
        inset ? "rounded-lg px-4.5" : "px-nav-x",
        tones[tone],
        className,
      )}
    >
      <p className="flex items-center gap-2.5">
        {icon && <Icon icon={icon} />}
        <span>{children}</span>
      </p>
      {actions && <div className="flex items-center gap-4">{actions}</div>}
    </div>
  );
}
