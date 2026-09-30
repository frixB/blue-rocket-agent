import Link from "next/link";
import { AlarmClock, ChevronDown, ChevronRight, Copy, CreditCard, EyeOff, FileWarning, Gavel, Hourglass, Pause, ShieldAlert, X } from "lucide-react";
import { Icon, IconTile, type LucideIcon, type Tone } from "@/components/ui";
import type { AttentionItem, AttentionKind } from "@/lib/admin/attention";

const KIND: Record<AttentionKind, { icon: LucideIcon; tone: Tone }> = {
  escalated: { icon: ShieldAlert, tone: "danger" },
  late: { icon: AlarmClock, tone: "danger" },
  urgent: { icon: Hourglass, tone: "warning" },
  blocked: { icon: Pause, tone: "warning" },
  failed: { icon: X, tone: "danger" },
  payment: { icon: CreditCard, tone: "danger" },
  unreviewed: { icon: EyeOff, tone: "warning" },
  pdf: { icon: FileWarning, tone: "danger" },
  duplicate: { icon: Copy, tone: "warning" },
  disputed: { icon: Gavel, tone: "danger" },
};

/**
 * The Overview "Needs attention" list. Each row says what's wrong and opens
 * the place to fix it. The most urgent `visible` rows show; the rest fold
 * away so the list doesn't push the rest of the Overview off screen.
 */
export function AttentionList({ items, visible = 5 }: { items: AttentionItem[]; visible?: number }) {
  const grouped = items.reduce<Array<{ primary: AttentionItem; additional: AttentionItem[] }>>((rows, item) => {
    const existing = rows.find((row) => row.primary.order.id === item.order.id);
    if (existing) existing.additional.push(item);
    else rows.push({ primary: item, additional: [] });
    return rows;
  }, []);
  const rest = grouped.slice(visible);
  return (
    <>
      <Rows items={grouped.slice(0, visible)} />
      {rest.length > 0 && (
        <details className="group border-t border-hairline">
          <summary className="flex min-h-control-md pt-1 cursor-pointer list-none items-center gap-1 type-body-sm font-semibold text-ink-2 hover:text-ink">
            <span className="group-open:hidden">Show {rest.length} more</span>
            <span className="hidden group-open:inline">Show fewer</span>
            <Icon icon={ChevronDown} size="sm" className="group-open:rotate-180" />
          </summary>
          <Rows items={rest} />
        </details>
      )}
    </>
  );
}

function Rows({ items }: { items: Array<{ primary: AttentionItem; additional: AttentionItem[] }> }) {
  return (
    <ul className="flex flex-col divide-y divide-hairline">
      {items.map(({ primary: it, additional }) => {
        const k = KIND[it.kind];
        return (
          <li key={`${it.order.id}-${it.kind}`}>
            <Link href={it.href} className="-mx-3 flex items-start gap-3 rounded-control px-3 py-3 hover:bg-sunken">
              <IconTile icon={k.icon} tone={k.tone} size="xs" />
              <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                <span className="type-body-sm-strong text-ink">{it.title}</span>
                <span className="truncate type-caption text-muted">
                  {it.order.businessName} · <span className="whitespace-nowrap">#{it.order.reference}</span>
                </span>
                <span className="line-clamp-2 type-caption text-ink-2">
                  {it.detail}{additional.length > 0 && ` · ${additional.length} more ${additional.length === 1 ? "issue" : "issues"}`}
                </span>
              </span>
              <Icon icon={ChevronRight} size="sm" className="mt-1 shrink-0 text-muted" />
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
