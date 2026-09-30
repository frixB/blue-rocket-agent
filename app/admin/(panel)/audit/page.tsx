import Link from "next/link";
import type { Route } from "next";
import { ArrowRight } from "lucide-react";
import { Card, Chip, Icon } from "@/components/ui";
import { AdminPage } from "@/components/blocks/admin/admin-page";
import { FilterHeader, ListEmpty, listCard } from "@/components/blocks/admin/filter-header";
import { FilterSelect } from "@/components/blocks/admin/filter-select";
import { LocalTime } from "@/components/blocks/admin/local-time";
import { OwnersOnlyPage } from "@/components/blocks/admin/owners-only";
import { listAuditEvents } from "@/lib/admin/data";
import type { AuditArea } from "@/lib/admin/fixtures-modules";
import { currentAdmin, isOwner } from "@/lib/admin/session";

export const dynamic = "force-dynamic";

const AREA: Record<AuditArea, string> = { orders: "Orders", refunds: "Refunds", review: "Review", settings: "Settings", team: "Team", "sign-in": "Sign-in" };

/** Every action, newest first: who, what, when, and what it changed. Nothing here can be edited or deleted. */
export default async function AuditLog({ searchParams }: { searchParams: Promise<{ who?: string; area?: string }> }) {
  const user = await currentAdmin();
  if (!isOwner(user)) return <OwnersOnlyPage title="Audit log" />;
  const now = new Date();
  const [sp, events] = await Promise.all([searchParams, listAuditEvents(now)]);
  const people = [...new Set(events.map((e) => e.who))];
  const areas = (Object.keys(AREA) as AuditArea[]).filter((a) => events.some((e) => e.area === a));
  const who = people.includes(sp.who ?? "") ? sp.who : undefined;
  const area = areas.includes(sp.area as AuditArea) ? (sp.area as AuditArea) : undefined;
  const shown = events.filter((e) => (!who || e.who === who) && (!area || e.area === area));
  const href = (next: { who?: string; area?: string }) => {
    const p = new URLSearchParams();
    const w = "who" in next ? next.who : who;
    const a = "area" in next ? next.area : area;
    if (w) p.set("who", w);
    if (a) p.set("area", a);
    return (p.size ? `/admin/audit?${p}` : "/admin/audit") as Route;
  };

  return (
    <AdminPage title="Audit log" intro="Every action by a person or the system, newest first. Entries can't be edited or deleted.">
      <Card className={listCard}>
        <FilterHeader
          tabs={{ label: "Filter by person", items: [
            { href: href({ who: undefined }), label: "Everyone", count: events.length, active: !who },
            ...people.map((p) => ({ href: href({ who: p }), label: p, active: who === p, count: events.filter((e) => e.who === p).length })),
          ] }}
          refiners={
            <FilterSelect id="audit-area" label="Area" value={area ?? ""} options={[
              { value: "", label: "Every area", href: href({ area: undefined }) },
              ...areas.map((a) => ({ value: a, label: `${AREA[a]} (${events.filter((e) => e.area === a && (!who || e.who === who)).length})`, href: href({ area: a }) })),
            ]} />
          }
          count={`${shown.length === events.length ? shown.length : `${shown.length} of ${events.length}`} ${events.length === 1 ? "entry" : "entries"}`}
          clearHref={who || area ? "/admin/audit" : undefined} />
        {shown.length ? (
          <div className="overflow-x-auto">
            <table className="w-full min-w-2xl text-left">
              <caption className="sr-only">Audit log, newest first</caption>
              <thead>
                <tr className="type-caption-strong text-muted">
                  <th scope="col" className="py-3.5 pr-4">When</th>
                  <th scope="col" className="py-3.5 pr-4">Who</th>
                  <th scope="col" className="py-3.5 pr-4">What</th>
                  <th scope="col" className="py-3.5">Change</th>
                </tr>
              </thead>
              <tbody className="type-body-sm">
                {shown.map((e) => (
                  <tr key={e.id} className="border-t border-hairline align-top">
                    <td className="whitespace-nowrap py-3.5 pr-4 text-ink-2"><LocalTime iso={e.at} /></td>
                    <td className="py-3.5 pr-4">
                      <span className={e.who === "System" ? "text-muted" : "font-semibold text-ink"}>{e.who}</span>
                    </td>
                    <td className="py-3.5 pr-4 text-ink">
                      <span className="flex flex-col gap-1">
                        <span>{e.action}</span>
                        <span className="flex flex-wrap items-center gap-2">
                          <Chip>{AREA[e.area]}</Chip>
                          {e.target && <Link href={e.target.href as Route} className="type-caption text-ink-2 underline hover:text-ink">{e.target.label}</Link>}
                        </span>
                      </span>
                    </td>
                    <td className="py-3.5 text-ink-2">
                      {e.before || e.after ? (
                        <span className="flex flex-wrap items-center gap-1.5">
                          {e.before && <span className="text-muted line-through">{e.before}</span>}
                          {e.before && e.after && <Icon icon={ArrowRight} size="sm" label="changed to" className="text-muted" />}
                          {e.after && <span className="font-semibold text-ink">{e.after}</span>}
                        </span>
                      ) : <span className="text-muted">—</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <ListEmpty title="Nothing matches" body="No actions for this person in this area." clearHref="/admin/audit" />
        )}
      </Card>
    </AdminPage>
  );
}
