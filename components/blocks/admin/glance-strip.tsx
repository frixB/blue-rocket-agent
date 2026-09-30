import Link from "next/link";
import type { Route } from "next";
import { cn } from "@/lib/cn";

type Tone = "neutral" | "danger" | "warning";

export type Glance = { label: string; value: string; tone?: Tone; href?: Route };

const tones: Record<Tone, string> = { neutral: "text-ink", danger: "text-danger-accent", warning: "text-warning-ink" };

/**
 * The Overview's numbers in one strip: value over label, hairlines between.
 * A number with `href` opens the list behind it. Colour only when a number
 * needs someone, so a calm day reads calm. The hairlines are the 1px gap
 * showing the border colour through, so they hold at every wrap. The focus
 * ring is drawn inside each cell, because the rounded strip clips anything outside.
 */
export function GlanceStrip({ items, label }: { items: Glance[]; label: string }) {
  return (
    <ul aria-label={label} className="grid grid-cols-2 gap-px overflow-hidden rounded-card border border-transparent bg-hairline bg-clip-padding shadow-soft md:grid-cols-5">
      {items.map((it) => {
        const body = (
          <>
            <span className={cn("type-heading-h3 tabular-nums", tones[it.tone ?? "neutral"])}>{it.value}</span>
            <span className="type-caption text-muted">{it.label}</span>
          </>
        );
        const cell = "flex h-full min-w-0 flex-col gap-0.5 bg-raised px-5 py-4";
        return (
          <li key={it.label} className="min-w-0 last:odd:col-span-2 md:last:odd:col-span-1">
            {it.href
              ? <Link href={it.href} className={cn(cell, "transition-colors hover:bg-sunken focus-visible:[box-shadow:inset_var(--effect-focus-ring)]")}>{body}</Link>
              : <div className={cell}>{body}</div>}
          </li>
        );
      })}
    </ul>
  );
}
