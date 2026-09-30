import Link from "next/link";
import type { Route } from "next";
import { cn } from "@/lib/cn";

/** A row of link filters. Each one is a URL, so a filtered list can be shared or bookmarked. */
export function FilterPills({ label, legend, size = "md", items }: {
  label: string;
  legend?: string;
  /** `sm` for a secondary row, so it sits under the main filters instead of competing with them. */
  size?: "md" | "sm";
  items: { href: Route; label: string; count?: number; active: boolean }[];
}) {
  return (
    <nav aria-label={label} className="flex flex-wrap items-center gap-2">
      {legend && <span className="type-caption-strong text-muted">{legend}</span>}
      {items.map((it) => (
        <Link key={it.label} href={it.href} aria-current={it.active ? "page" : undefined}
          className={cn("flex items-center gap-2 rounded-full border bg-raised transition-colors",
            size === "sm" ? "min-h-8 px-3 py-1 type-caption" : "min-h-control-sm px-4 py-1.5 type-body-sm",
            "pointer-coarse:min-h-11",
            it.active ? "border-action font-semibold text-ink" : "border-hairline text-ink-2 hover:border-strong hover:text-ink")}>
          {it.label}
          {it.count !== undefined && <span className="type-caption tabular-nums text-muted">{it.count}</span>}
        </Link>
      ))}
    </nav>
  );
}
