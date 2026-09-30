import Link from "next/link";
import type { Route } from "next";
import {
  AlarmClock, ChevronRight, CircleCheck, Copy, CreditCard, Gavel, Landmark, Pause, PieChart, ShieldAlert, X,
} from "lucide-react";
import { Card, Chip, Icon, IconTile, type LucideIcon, type Tone } from "@/components/ui";
import { AdminPage } from "@/components/blocks/admin/admin-page";
import { AssignControl } from "@/components/blocks/admin/assign-control";
import { ClockBadge } from "@/components/blocks/admin/badges";
import { CardHeader } from "@/components/blocks/admin/card-header";
import { FilterHeader, ListEmpty, listCard } from "@/components/blocks/admin/filter-header";
import { FilterSelect } from "@/components/blocks/admin/filter-select";
import { RefundDecision } from "@/components/blocks/admin/refund-decision";
import { formatRelative } from "@/lib/admin/clock";
import { listOrders, listRefundRequests, listStripeMismatches } from "@/lib/admin/data";
import { EXCEPTION_LABEL, listExceptions, type ExceptionItem, type ExceptionKind } from "@/lib/admin/exceptions";
import { currentAdmin, isOwner } from "@/lib/admin/session";
import type { RefundRequest } from "@/lib/admin/types";
import { formatPriceShort } from "@/lib/orders/sla";

export const dynamic = "force-dynamic";

const KIND: Record<ExceptionKind, { icon: LucideIcon; tone: Tone }> = {
  escalated: { icon: ShieldAlert, tone: "danger" },
  late: { icon: AlarmClock, tone: "danger" },
  stripe: { icon: Landmark, tone: "danger" },
  failed: { icon: X, tone: "danger" },
  blocked: { icon: Pause, tone: "warning" },
  payment: { icon: CreditCard, tone: "danger" },
  disputed: { icon: Gavel, tone: "danger" },
  duplicate: { icon: Copy, tone: "warning" },
  partial: { icon: PieChart, tone: "warning" },
};

export default async function Exceptions({ searchParams }: { searchParams: Promise<{ type?: string; who?: string }> }) {
  const now = new Date();
  const [{ type, who: rawWho }, user, orders, mismatches, requests] = await Promise.all([
    searchParams, currentAdmin(), listOrders(now), listStripeMismatches(now), listRefundRequests(now),
  ]);
  const owner = isOwner(user);
  const all = listExceptions(orders, mismatches, now);
  const kinds = (Object.keys(EXCEPTION_LABEL) as ExceptionKind[]).filter((k) => all.some((e) => e.kind === k));
  const active = kinds.includes(type as ExceptionKind) ? (type as ExceptionKind) : undefined;
  // Who's handling it is the main split when working the list; the type narrows it further.
  const WHO = [
    { key: "all", label: "All", test: () => true },
    { key: "mine", label: "Assigned to me", test: (e: ExceptionItem) => e.assignee === user.name },
    { key: "unassigned", label: "Unassigned", test: (e: ExceptionItem) => !e.assignee },
  ] as const;
  const who = WHO.find((w) => w.key === rawWho) ?? WHO[0];
  const byWho = all.filter(who.test);
  const shown = active ? byWho.filter((e) => e.kind === active) : byWho;
  const href = (next: { who?: string; type?: string }) => {
    const p = new URLSearchParams();
    const w = "who" in next ? next.who : who.key;
    const t = "type" in next ? next.type : active;
    if (w && w !== "all") p.set("who", w);
    if (t) p.set("type", t);
    return (p.size ? `/admin/exceptions?${p}` : "/admin/exceptions") as Route;
  };
  // Ops sees the refunds they prepared; owners see every one waiting on them.
  const pending = owner ? requests : requests.filter((r) => r.preparedBy === user.name);

  return (
    <AdminPage title="Exceptions" intro="Anything a person has to fix, least time left first.">
      {pending.length > 0 && (
        <Card aria-labelledby="approvals-title" className="gap-1">
          <CardHeader id="approvals-title" title="Refunds waiting for approval"
            note={owner ? "Ops prepared these. Approve or decline each one, with a reason." : "You prepared these. Rasa or Carlos approves or declines."}
            aside={<Chip tone="warning">{pending.length} waiting</Chip>} />
          <ul className="flex flex-col divide-y divide-hairline">
            {pending.map((r) => <ApprovalRow key={r.id} request={r} owner={owner} now={now} />)}
          </ul>
        </Card>
      )}

      <section aria-labelledby="open-title" className="flex flex-col gap-4">
        <h2 id="open-title" className="sr-only">Open exceptions</h2>
        <Card className={listCard}>
          <FilterHeader
            tabs={{ label: "Filter by who's handling it", items: WHO.map((w) => ({
              href: href({ who: w.key }), label: w.label, count: all.filter(w.test).length, active: who.key === w.key,
            })) }}
            refiners={kinds.length > 1 ? (
              <FilterSelect id="exceptions-type" label="Type" value={active ?? ""} options={[
                { value: "", label: "Any type", href: href({ type: undefined }) },
                ...kinds.map((k) => ({ value: k, label: `${EXCEPTION_LABEL[k]} (${byWho.filter((e) => e.kind === k).length})`, href: href({ type: k }) })),
              ]} />
            ) : undefined}
            count={`${shown.length === all.length ? shown.length : `${shown.length} of ${all.length}`} open`}
            clearHref={active || who.key !== "all" ? "/admin/exceptions" : undefined} />
          {shown.length ? (
              <ul className="flex flex-col divide-y divide-hairline">
                {shown.map((e) => {
                  const k = KIND[e.kind];
                  return (
                    <li key={e.key} className="flex flex-col gap-3 py-4 sm:flex-row sm:items-start sm:justify-between">
                      <Link href={e.href} className="group flex min-w-0 flex-1 items-start gap-3">
                        <IconTile icon={k.icon} tone={k.tone} size="xs" />
                        <span className="flex min-w-0 flex-col gap-0.5">
                          <span className="flex flex-wrap items-center gap-2">
                            <span className="type-body-sm-strong text-ink group-hover:underline">{e.title}</span>
                            <Chip tone={k.tone}>{EXCEPTION_LABEL[e.kind]}</Chip>
                          </span>
                          <span className="type-caption text-muted">{e.subject}</span>
                          <span className="type-caption text-ink-2">{e.detail}</span>
                        </span>
                        <Icon icon={ChevronRight} size="sm" className="mt-1 shrink-0 text-muted sm:hidden" />
                      </Link>
                      <span className="flex flex-wrap items-center gap-3 pl-11 sm:flex-col sm:items-end sm:pl-0">
                        {e.order && e.minutesLeft !== undefined && <ClockBadge order={e.order} now={now} />}
                        <AssignControl assignee={e.assignee} me={user.name} subject={e.subject} />
                      </span>
                    </li>
                  );
                })}
              </ul>
          ) : all.length ? (
            <ListEmpty title="Nothing matches" body="No open exceptions for this filter." clearHref="/admin/exceptions" />
          ) : (
            <ListEmpty icon={CircleCheck} title="Nothing needs fixing"
              body="No late, blocked or failed orders, no payment problems and no Stripe mismatches. New ones appear here the moment they happen." />
          )}
        </Card>
      </section>
    </AdminPage>
  );
}

function ApprovalRow({ request: r, owner, now }: { request: RefundRequest; owner: boolean; now: Date }) {
  const amount = formatPriceShort(r.amountCents);
  const target = r.target.kind === "order"
    ? <Link href={`/admin/orders/${r.target.orderId}` as Route} className="underline">{r.target.businessName} · #{r.target.reference}</Link>
    : <span>Stripe payment from {r.target.email} · {r.target.charge}</span>;
  return (
    <li className="flex flex-col gap-3 py-4 lg:flex-row lg:items-start lg:justify-between lg:gap-8">
      <div className="flex min-w-0 flex-col gap-1">
        <span className="type-body-strong text-ink">{amount} refund</span>
        <span className="type-caption text-muted">{target}</span>
        <p className="type-body-sm text-ink-2">
          <span className="font-semibold text-ink">{r.preparedBy}</span>, {formatRelative(new Date(r.preparedAt), now)}: “{r.note}”
        </p>
      </div>
      <div className="shrink-0 lg:w-80">
        {owner
          ? <RefundDecision id={r.id} amount={amount} preparedBy={r.preparedBy} />
          : <Chip tone="warning">Waiting for Rasa or Carlos</Chip>}
      </div>
    </li>
  );
}
