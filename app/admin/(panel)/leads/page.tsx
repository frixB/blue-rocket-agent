import type { Route } from "next";
import { Users } from "lucide-react";
import { Card, Chip, Field, Textarea } from "@/components/ui";
import { AdminPage } from "@/components/blocks/admin/admin-page";
import { CsvDownload } from "@/components/blocks/admin/csv-download";
import { FilterHeader, ListEmpty, listCard } from "@/components/blocks/admin/filter-header";
import { LocalTime } from "@/components/blocks/admin/local-time";
import { StubForm } from "@/components/blocks/admin/stub-form";
import { listLeadRows, type LeadRow } from "@/lib/admin/data";
import { currentAdmin, isOwner } from "@/lib/admin/session";

export const dynamic = "force-dynamic";

const HOUR = 3_600_000;
const FILTERS: { key: string; label: string; test: (l: LeadRow) => boolean }[] = [
  { key: "all", label: "All", test: () => true },
  { key: "unpaid", label: "Didn't pay", test: (l) => !l.paid },
  { key: "paid", label: "Paid", test: (l) => l.paid },
  { key: "consent", label: "OK to contact", test: (l) => l.consent },
];

/**
 * Every form submission, paid or not, newest first: where they stopped, whether
 * they said yes to marketing, and the call notes. Ops can view and add notes;
 * only owners can export.
 */
export default async function Leads({ searchParams }: { searchParams: Promise<{ filter?: string }> }) {
  const now = new Date();
  const [sp, leads, user] = await Promise.all([searchParams, listLeadRows(), currentAdmin()]);
  const filter = FILTERS.find((f) => f.key === sp.filter) ?? FILTERS[0]!;
  const shown = leads.filter(filter.test);
  const at = (h: number) => new Date(now.getTime() - h * HOUR).toISOString();

  return (
    <AdminPage title="Leads" intro="Everyone who started the order form, newest first."
      action={isOwner(user) ? (
        <CsvDownload filename="blue-rocket-leads.csv" label="Export leads"
          header={["Name", "Business", "Email", "Website", "Stopped at", "Paid", "OK to contact"]}
          rows={shown.map((l) => [l.name, l.business, l.email, l.website, l.stoppedAt, l.paid ? "Yes" : "No", l.consent ? "Yes" : "No"])} />
      ) : undefined}>
      <Card className={listCard}>
        <FilterHeader
          tabs={{ label: "Filter leads", items: FILTERS.map((f) => ({
            href: (f.key === "all" ? "/admin/leads" : `/admin/leads?filter=${f.key}`) as Route,
            label: f.label, count: leads.filter(f.test).length, active: filter.key === f.key,
          })) }}
          count={`${shown.length} ${shown.length === 1 ? "lead" : "leads"}`} />
        {shown.length ? (
          <ul className="flex flex-col divide-y divide-hairline">
            {shown.map((l) => (
              <li key={l.id} className="flex flex-col gap-3 py-5">
                <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
                  <span className="flex min-w-0 flex-col gap-0.5">
                    <span className="type-body-strong text-ink">{l.name} · {l.business}</span>
                    <span className="type-caption text-muted">
                      {l.email}{l.website && <> · <a href={`https://${l.website}`} target="_blank" rel="noreferrer" className="underline">{l.website}</a></>} · <LocalTime iso={at(l.hoursAgo)} />
                    </span>
                  </span>
                  <span className="flex flex-wrap gap-1.5">
                    <Chip tone={l.paid ? "success" : "warning"}>{l.paid ? "Paid" : `Stopped at ${l.stoppedAt.toLowerCase()}`}</Chip>
                    {l.consent ? <Chip tone="info" icon={Users}>OK to contact</Chip> : <Chip>No marketing</Chip>}
                  </span>
                </div>

                {l.notes.length > 0 && (
                  <ul aria-label={`Call notes for ${l.name}`} className="flex flex-col gap-2 rounded-lg bg-page p-3">
                    {l.notes.map((n, i) => (
                      <li key={i} className="type-body-sm text-ink-2">
                        <span className="font-semibold text-ink">{n.by}</span>, <LocalTime iso={at(n.hoursAgo)} />: {n.text}
                      </li>
                    ))}
                  </ul>
                )}

                <details className="group">
                  <summary className="w-fit cursor-pointer py-1 type-body-sm font-semibold text-ink-2 hover:text-ink pointer-coarse:min-h-11">
                    Add a call note
                  </summary>
                  <StubForm submit="Save note" done={`the note is saved on ${l.name}'s lead with your name and the time.`} className="flex max-w-xl flex-col gap-3 pt-3">
                    <Field htmlFor={`note-${l.id}`} label="What happened?">
                      <Textarea id={`note-${l.id}`} name="note" rows={2} required placeholder="Called, left a voicemail. Try again Thursday." />
                    </Field>
                  </StubForm>
                </details>
              </li>
            ))}
          </ul>
        ) : (
          <ListEmpty title="No leads match" body="Try another filter. New leads appear here the moment someone starts the order form." clearHref="/admin/leads" />
        )}
      </Card>
    </AdminPage>
  );
}
