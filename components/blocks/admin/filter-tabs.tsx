"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import type { Route } from "next";
import { cn } from "@/lib/cn";

/**
 * The one-of-many filter at the top of a list: underlined tabs with a count.
 * Each tab is a URL, so a filtered list can be shared or bookmarked. On a
 * phone the row scrolls sideways rather than wrapping into a second line, and
 * starts scrolled so the active tab is in view.
 */
export function FilterTabs({ label, items, className }: {
  label: string;
  items: { href: Route; label: string; count?: number; active: boolean }[];
  className?: string;
}) {
  const nav = useRef<HTMLElement>(null);
  const activeKey = items.find((i) => i.active)?.label;
  useEffect(() => {
    const el = nav.current?.querySelector<HTMLElement>('[aria-current="page"]');
    if (!nav.current || !el) return;
    const { offsetLeft, offsetWidth } = el;
    const { scrollLeft, clientWidth } = nav.current;
    if (offsetLeft < scrollLeft || offsetLeft + offsetWidth > scrollLeft + clientWidth) nav.current.scrollLeft = offsetLeft - 16;
  }, [activeKey]);
  return (
    <nav ref={nav} aria-label={label} className={cn("-mb-px flex gap-5 overflow-x-auto [scrollbar-width:none]", className)}>
      {items.map((it) => (
        <Link key={it.label} href={it.href} aria-current={it.active ? "page" : undefined}
          className={cn(
            "flex shrink-0 items-center gap-2 border-b-2 pb-3 pt-1 type-body-sm whitespace-nowrap transition-colors pointer-coarse:min-h-11",
            it.active ? "border-action font-semibold text-ink" : "border-transparent text-ink-2 hover:border-strong hover:text-ink",
          )}>
          {it.label}
          {it.count !== undefined && (
            <span className={cn("min-w-6 rounded-chip px-1.5 py-0.5 text-center type-caption-strong tabular-nums",
              it.active ? "bg-info text-info-ink" : "bg-inset text-muted")}>
              {it.count}
            </span>
          )}
        </Link>
      ))}
    </nav>
  );
}
