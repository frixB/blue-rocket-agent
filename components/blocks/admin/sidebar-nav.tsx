"use client";

import Link from "next/link";
import type { Route } from "next";
import { usePathname } from "next/navigation";
import {
  ChevronRight, Contact, Eye, FileStack, LayoutDashboard, Megaphone, Package, ScrollText, Settings, TriangleAlert, Users, Wallet, Workflow,
} from "lucide-react";
import { Icon, type LucideIcon } from "@/components/ui";
import type { ModuleKey } from "@/lib/admin/modules";
import { cn } from "@/lib/cn";

export type NavItem = { key: ModuleKey; href: Route; label: string; built: boolean; count?: number };

/** Glyphs live here, not in modules.ts: icon components can't cross from the server shell into this client component. */
const ICONS: Record<ModuleKey, LucideIcon> = {
  overview: LayoutDashboard, review: Eye, orders: Package, exceptions: TriangleAlert, pipeline: Workflow,
  customers: Users, leads: Contact, audience: Megaphone, "report-types": FileStack,
  revenue: Wallet, settings: Settings, audit: ScrollText,
};

/**
 * The modules that work, in the blueprint's groups, with live counts. Anything
 * still planned folds into one "Coming next" group at the bottom, so the
 * roadmap stays visible without crowding the daily nav; it opens by itself
 * when you're on one of its pages. Group names are labels, not headings, so
 * the page's own h1 stays the first heading.
 */
type Group = { group: string; items: NavItem[] };

export function SidebarNav({ built, planned }: { built: Group[]; planned: Group[] }) {
  const path = usePathname();
  const isActive = (href: string) => (href === "/admin" ? path === "/admin" : path.startsWith(href));
  const plannedCount = planned.reduce((n, g) => n + g.items.length, 0);
  const onPlanned = planned.some((g) => g.items.some((m) => isActive(m.href)));
  return (
    <nav aria-label="Admin" className="flex flex-col gap-5">
      {built.map((g) => {
        const id = `nav-${g.group.toLowerCase()}`;
        return (
          <div key={g.group} className="flex flex-col gap-1">
            {built.length > 1 && <p id={id} className="px-3 pb-0.5 type-overline uppercase text-muted">{g.group}</p>}
            <ul aria-labelledby={built.length > 1 ? id : undefined} className="flex flex-col gap-0.5">
              {g.items.map((m) => <NavLink key={m.href} item={m} active={isActive(m.href)} />)}
            </ul>
          </div>
        );
      })}
      {plannedCount > 0 && (
        <details open={onPlanned || undefined} className="group/planned flex flex-col border-t border-hairline pt-4">
          <summary className="flex min-h-control-sm pointer-coarse:min-h-11 cursor-pointer list-none items-center gap-2 rounded-control px-3 py-1.5 type-caption-strong text-muted hover:text-ink">
            <Icon icon={ChevronRight} size="sm" className="transition-transform group-open/planned:rotate-90" />
            <span className="flex-1">Coming next</span>
            <span className="tabular-nums">{plannedCount}</span>
          </summary>
          <div className="flex flex-col gap-3 pt-2">
            {planned.map((g) => (
              <div key={g.group} className="flex flex-col">
                <p id={`planned-${g.group.toLowerCase()}`} className="px-3 pb-1 pt-1 type-caption text-muted">{g.group}</p>
                <ul aria-labelledby={`planned-${g.group.toLowerCase()}`} className="flex flex-col gap-0.5">
                  {g.items.map((m) => <NavLink key={m.href} item={m} active={isActive(m.href)} quiet />)}
                </ul>
              </div>
            ))}
          </div>
        </details>
      )}
    </nav>
  );
}

function NavLink({ item: m, active, quiet }: { item: NavItem; active: boolean; quiet?: boolean }) {
  return (
    <li>
      <Link
        href={m.href}
        aria-current={active ? "page" : undefined}
        className={cn(
          "flex items-center gap-2.5 rounded-control px-3 type-body-sm transition-colors",
          quiet ? "min-h-8 py-1" : "min-h-control-sm py-2",
          // 44px on touch screens; desktop keeps the denser list.
          "pointer-coarse:min-h-11",
          active ? "bg-inset font-semibold text-ink" : quiet ? "text-muted hover:bg-sunken hover:text-ink" : "text-ink-2 hover:bg-sunken hover:text-ink",
        )}
      >
        <Icon icon={ICONS[m.key]} size="sm" className={active ? "text-action" : "text-muted"} />
        <span className="flex-1">{m.label}</span>
        {!!m.count && (
          <span className={cn("min-w-5 rounded-chip px-1.5 text-center type-caption-strong tabular-nums", m.key === "exceptions" ? "bg-danger text-danger-ink" : "bg-action text-on-action")}>
            {m.count}<span className="sr-only"> {m.key === "review" ? "waiting" : "open"}</span>
          </span>
        )}
      </Link>
    </li>
  );
}
