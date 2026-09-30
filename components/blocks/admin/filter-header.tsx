import Link from "next/link";
import type { Route } from "next";
import { Search, SearchX } from "lucide-react";
import { Icon, Input, type LucideIcon } from "@/components/ui";
import { FilterTabs } from "./filter-tabs";

type Tab = { href: Route; label: string; count?: number; active: boolean };

/** The card padding the header bleeds across. List cards use `listCard` so the two agree. */
export const listCard = "gap-0 px-6 pb-2 pt-5";

/**
 * The filter header every admin list shares, inside the list's own card:
 *  1. tabs, when there is one main pick-one filter (seven options at most);
 *  2. a toolbar of refiners (a dropdown, a search) that keep the other filters;
 *  3. on the right, what's showing and a way back to everything.
 * Without refiners the count sits at the end of the tab row instead.
 */
export function FilterHeader({ tabs, refiners, count, clearHref }: {
  tabs?: { label: string; items: Tab[] };
  refiners?: React.ReactNode;
  /** "10 open", "3 of 16 orders". Announced when it changes. */
  count: string;
  /** Set when any filter is on. */
  clearHref?: Route;
}) {
  const status = (
    <div className="flex shrink-0 items-center gap-4">
      <p role="status" className="type-caption tabular-nums text-muted">{count}</p>
      {clearHref && (
        <Link href={clearHref} className="flex items-center py-1 type-body-sm font-semibold text-ink-2 underline hover:text-ink pointer-coarse:min-h-11">Clear filters</Link>
      )}
    </div>
  );
  return (
    <div className="-mx-6 flex flex-col">
      {tabs && (
        <div className="flex items-end justify-between gap-6 border-b border-hairline px-6">
          <FilterTabs label={tabs.label} items={tabs.items} className="min-w-0" />
          {!refiners && <div className="mb-3 hidden md:block">{status}</div>}
        </div>
      )}
      {(refiners || !tabs) ? (
        <div className="flex flex-col gap-3 border-b border-hairline px-6 py-3.5 md:flex-row md:items-center">
          {refiners}
          <div className="md:ml-auto">{status}</div>
        </div>
      ) : (
        <div className="border-b border-hairline px-6 py-3 md:hidden">{status}</div>
      )}
    </div>
  );
}

/** "Nothing matches", inside the list card so the filters above stay put. */
export function ListEmpty({ title, body, clearHref, icon = SearchX }: { title: string; body: string; clearHref?: Route; icon?: LucideIcon }) {
  return (
    <div className="flex flex-col items-center gap-3 px-4 py-14 text-center">
      <Icon icon={icon} size="lg" className="text-muted" />
      <p className="type-body-strong text-ink">{title}</p>
      <p className="max-w-sm type-body-sm text-ink-2">{body}</p>
      {clearHref && <Link href={clearHref} className="py-2 type-body-sm font-semibold text-ink-2 underline hover:text-ink">Clear filters</Link>}
    </div>
  );
}

/** A search box for a filter header: submits to `action`, carrying the other filters as hidden fields. */
export function FilterSearch({ id, action, label, placeholder, value, keep }: {
  id: string; action: string; label: string; placeholder: string; value?: string; keep?: Record<string, string | undefined>;
}) {
  return (
    <form action={action} role="search" className="w-full md:w-72">
      {Object.entries(keep ?? {}).map(([k, v]) => v && <input key={k} type="hidden" name={k} value={v} />)}
      <label htmlFor={id} className="sr-only">{label}</label>
      <SearchInput id={id} placeholder={placeholder} value={value} />
    </form>
  );
}

function SearchInput({ id, placeholder, value }: { id: string; placeholder: string; value?: string }) {
  return (
    <Input id={id} name="q" defaultValue={value} placeholder={placeholder}
      className="h-control-sm type-body-sm pointer-coarse:h-11" trailing={<Icon icon={Search} size="sm" className="text-muted" />} />
  );
}
