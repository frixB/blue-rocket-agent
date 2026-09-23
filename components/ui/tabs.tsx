import Link, { type LinkProps } from "next/link";
import { cn } from "@/lib/cn";

/** Figma "Portal tabs", S-16 and S-17. Navigation tabs: each one is a link. */
export function Tabs({ items, label }: { items: { href: LinkProps<string>["href"]; label: string; active?: boolean }[]; label: string }) {
  return (
    <nav aria-label={label} className="flex gap-7 overflow-x-auto border-b border-hairline bg-raised px-nav-x">
      {items.map((t) => (
        <Link
          key={t.label}
          href={t.href}
          aria-current={t.active ? "page" : undefined}
          className={cn(
            "flex flex-col items-center gap-2 pt-4 type-body whitespace-nowrap",
            t.active ? "pb-2.75 font-semibold text-ink" : "pb-3.5 text-muted hover:text-ink",
          )}
        >
          {t.label}
          {t.active && <span aria-hidden className="h-0.75 w-10 rounded-xs bg-action" />}
        </Link>
      ))}
    </nav>
  );
}
