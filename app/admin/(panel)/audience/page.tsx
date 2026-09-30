import type { Route } from "next";
import { BarList, Card, Chip } from "@/components/ui";
import { AdminPage } from "@/components/blocks/admin/admin-page";
import { CardHeader } from "@/components/blocks/admin/card-header";
import { CsvDownload } from "@/components/blocks/admin/csv-download";
import { FilterHeader, listCard } from "@/components/blocks/admin/filter-header";
import { GlanceStrip } from "@/components/blocks/admin/glance-strip";
import { OwnersOnlyPage } from "@/components/blocks/admin/owners-only";
import { listContacts, listReportTypes } from "@/lib/admin/data";
import type { Segment } from "@/lib/admin/fixtures-modules";
import { currentAdmin, isOwner } from "@/lib/admin/session";

export const dynamic = "force-dynamic";

const SEGMENT: Record<Segment, string> = { newsletter: "Newsletter", waitlist: "Waitlist", buyers: "Buyers" };

/**
 * Who we can talk to: newsletter, waitlist by report type, and buyers.
 * Export holds consented contacts only, whatever the filter shows.
 */
export default async function Audience({ searchParams }: { searchParams: Promise<{ segment?: string }> }) {
  const user = await currentAdmin();
  if (!isOwner(user)) return <OwnersOnlyPage title="Audience" />;
  const [sp, contacts, reports] = await Promise.all([searchParams, listContacts(), listReportTypes()]);
  const segment = (Object.keys(SEGMENT) as Segment[]).includes(sp.segment as Segment) ? (sp.segment as Segment) : undefined;
  const shown = segment ? contacts.filter((c) => c.segments.includes(segment)) : contacts;
  const exportable = shown.filter((c) => c.consent);
  const count = (s: Segment) => contacts.filter((c) => c.segments.includes(s)).length;
  const soon = reports.filter((r) => r.state === "coming_soon");

  return (
    <AdminPage title="Audience" intro="People who asked to hear from us, and who they are."
      action={
        <span className="flex flex-col items-start gap-1 md:items-end">
          <CsvDownload filename={`blue-rocket-audience${segment ? `-${segment}` : ""}.csv`} label={`Export ${exportable.length} contacts`}
            header={["Email", "Name", "Segments", "Waitlist for", "Joined days ago"]}
            rows={exportable.map((c) => [c.email, c.name ?? "", c.segments.map((s) => SEGMENT[s]).join("; "), (c.waitlist ?? []).join("; "), c.joinedDaysAgo])} />
          {shown.length > exportable.length && (
            <span className="type-caption text-muted">{shown.length - exportable.length} left out: they didn&apos;t agree to marketing.</span>
          )}
        </span>
      }>
      <GlanceStrip label="Audience size" items={[
        { label: "Contacts", value: String(contacts.length) },
        { label: "OK to contact", value: String(contacts.filter((c) => c.consent).length) },
        { label: "Newsletter", value: String(count("newsletter")), href: "/admin/audience?segment=newsletter" as Route },
        { label: "Waitlist", value: String(count("waitlist")), href: "/admin/audience?segment=waitlist" as Route },
        { label: "Buyers", value: String(count("buyers")), href: "/admin/audience?segment=buyers" as Route },
      ]} />

      <div className="grid gap-6 xl:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
        <div className="flex min-w-0 flex-col gap-4">
          <Card className={listCard}>
            <FilterHeader
              tabs={{ label: "Filter by segment", items: [
                { href: "/admin/audience" as Route, label: "Everyone", count: contacts.length, active: !segment },
                ...(Object.keys(SEGMENT) as Segment[]).map((s) => ({ href: `/admin/audience?segment=${s}` as Route, label: SEGMENT[s], count: count(s), active: segment === s })),
              ] }}
              count={`${shown.length} ${shown.length === 1 ? "contact" : "contacts"}, ${exportable.length} OK to contact`} />
            <ul className="flex flex-col divide-y divide-hairline">
              {shown.map((c) => (
                <li key={c.email} className="flex flex-col gap-2 py-3 sm:flex-row sm:items-center sm:justify-between">
                  <span className="flex min-w-0 flex-col gap-0.5">
                    <span className="truncate type-body-sm-strong text-ink">{c.name ?? c.email}</span>
                    <span className="truncate type-caption text-muted">
                      {c.name ? `${c.email} · ` : ""}{c.segments.map((s) => SEGMENT[s]).join(", ")}{c.waitlist?.length ? ` · waiting for ${c.waitlist.join(", ")}` : ""}
                    </span>
                  </span>
                  {c.consent ? <Chip tone="info" className="shrink-0">OK to contact</Chip> : <Chip className="shrink-0">No marketing</Chip>}
                </li>
              ))}
            </ul>
          </Card>
        </div>

        <Card aria-labelledby="waitlist-title" className="min-w-0 gap-3 self-start">
          <CardHeader id="waitlist-title" title="Waitlist by report" note="Who to tell when each one launches." link={{ href: "/admin/report-types" as Route, label: "Report types" }} />
          <BarList label="Waitlist sign-ups by report type" rows={soon.map((r) => ({
            label: r.name, value: contacts.filter((c) => c.waitlist?.includes(r.name)).length,
          }))} />
        </Card>
      </div>
    </AdminPage>
  );
}
