import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/cn";

export type { LucideIcon };

const sizes = { sm: "size-4", md: "size-5.5", lg: "size-7" } as const;

/**
 * Figma's icon layers are Lucide glyphs ("Icon / file-text", "Icon / Lucide
 * rocket"), so we render the same glyph from lucide-react. 22px (`md`) is the
 * size every Figma screen uses. Colour comes from `currentColor`.
 */
export function Icon({ icon: Glyph, size = "md", label, className }: { icon: LucideIcon; size?: keyof typeof sizes; label?: string; className?: string }) {
  return (
    <Glyph
      className={cn("shrink-0", sizes[size], className)}
      strokeWidth={2}
      role={label ? "img" : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
      focusable={false}
    />
  );
}
