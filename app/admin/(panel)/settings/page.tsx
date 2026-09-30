import Link from "next/link";
import { Mail, Send, UserMinus } from "lucide-react";
import { Card, Checkbox, Chip, Field, Icon, Input, Select, SummaryRow, Textarea } from "@/components/ui";
import { AdminAction } from "@/components/blocks/admin/admin-action";
import { AdminPage } from "@/components/blocks/admin/admin-page";
import { CardHeader } from "@/components/blocks/admin/card-header";
import { OwnersOnlyPage } from "@/components/blocks/admin/owners-only";
import { StubForm } from "@/components/blocks/admin/stub-form";
import { CLOCK } from "@/lib/admin/clock";
import { listIntegrations, listReportTypes, listTeam } from "@/lib/admin/data";
import { ALERT_RULES } from "@/lib/admin/fixtures-modules";
import { currentAdmin, isOwner } from "@/lib/admin/session";

export const dynamic = "force-dynamic";

const SECTIONS = [
  { id: "team", label: "Team" }, { id: "delivery", label: "Delivery" }, { id: "pricing", label: "Pricing" },
  { id: "emails", label: "Emails" }, { id: "integrations", label: "Integrations" }, { id: "alerts", label: "Alerts" }, { id: "maintenance", label: "Maintenance" },
] as const;

const TEMPLATES = [
  { name: "Payment received", subject: "We've got your order. Your report is on its way." },
  { name: "Crawler blocked", subject: "We couldn't get into your site. Here's the fix." },
  { name: "Running late", subject: "Your report is running late. Here's what happens next." },
  { name: "Report ready", subject: "Your SEO report is ready" },
  { name: "Couldn't finish", subject: "We couldn't finish your report" },
  { name: "Refund issued", subject: "Your refund is on its way" },
];

/** Owner settings, one card per area, each saved on its own. */
export default async function Settings() {
  const user = await currentAdmin();
  if (!isOwner(user)) return <OwnersOnlyPage title="Settings" />;
  const [team, integrations, reports] = await Promise.all([listTeam(), listIntegrations(), listReportTypes()]);
  const live = reports.filter((r) => r.state === "live");

  return (
    <AdminPage title="Settings" intro="Team, delivery rules, prices and what the system sends. Each section saves on its own.">
      <nav aria-label="Settings sections" className="flex flex-wrap gap-x-5 gap-y-1">
        {SECTIONS.map((s) => (
          <a key={s.id} href={`#${s.id}`} className="py-1 type-body-sm font-semibold text-ink-2 hover:text-ink pointer-coarse:min-h-11 pointer-coarse:py-3">{s.label}</a>
        ))}
      </nav>

      <Card id="team" aria-labelledby="team-title" className="scroll-mt-24 gap-1">
        <CardHeader id="team-title" title="Team and roles" note="Owners see money and approve refunds. Ops run orders, reviews and customers." />
        <ul className="flex flex-col divide-y divide-hairline">
          {team.map((m) => (
            <li key={m.email} className="flex flex-col gap-3 py-3 md:flex-row md:items-center md:justify-between">
              <span className="flex min-w-0 flex-col gap-0.5">
                <span className="type-body-sm-strong text-ink">{m.name}{m.email === user.email && <span className="font-normal text-muted"> (you)</span>}</span>
                <span className="type-caption text-muted">{m.email}</span>
              </span>
              <span className="flex flex-wrap items-center gap-2">
                <Chip tone={m.role === "owner" ? "info" : "neutral"}>{m.role === "owner" ? "Owner" : "Ops"}</Chip>
                {m.pending
                  ? <Chip tone="warning">Invite sent</Chip>
                  : <Chip tone={m.twoFactor ? "success" : "danger"}>{m.twoFactor ? "Authenticator on" : "No authenticator"}</Chip>}
                {m.pending
                  ? <AdminAction label="Resend invite" icon={<Icon icon={Mail} size="sm" />} variant="text" confirm={`Send ${m.email} a new invite link?`} done="they get a fresh link, valid for 48 hours, and the old one stops working." />
                  : m.email !== user.email && (
                    <AdminAction label={`Remove ${m.name}`} icon={<Icon icon={UserMinus} size="sm" />} variant="text" reason="Why remove them?"
                      confirm={`Remove ${m.name} from the admin? They're signed out everywhere and can't sign in again.`}
                      done={`${m.name} loses access at once and every session they have ends.`} />
                  )}
              </span>
            </li>
          ))}
        </ul>
        <div className="border-t border-hairline pt-4">
          <StubForm submit="Send invite" done="they get an email link to set a password and their authenticator app. The link works for 48 hours."
            className="grid gap-4 md:grid-cols-[minmax(0,1fr)_12rem_auto] md:items-end">
            <Field htmlFor="invite-email" label="Invite someone">
              <Input id="invite-email" name="email" type="email" required placeholder="name@frixb.com" autoComplete="off" />
            </Field>
            <Field htmlFor="invite-role" label="Role">
              <Select id="invite-role" name="role" defaultValue="ops">
                <option value="ops">Ops</option>
                <option value="owner">Owner</option>
              </Select>
            </Field>
          </StubForm>
        </div>
      </Card>

      <Card id="delivery" aria-labelledby="delivery-title" className="scroll-mt-24 gap-1">
        <CardHeader id="delivery-title" title="Delivery rules" note="How the 24-hour promise is enforced." />
        <dl className="flex flex-col divide-y divide-hairline">
          <SummaryRow label="Deadline" value={`${CLOCK.deadlineHours} hours after payment, any day`} />
          <SummaryRow label="Escalation and auto-refund" value={`${CLOCK.escalateHours} hours after payment`} />
          <SummaryRow label="Marked urgent" value={`Under ${CLOCK.urgentHours} hours left`} />
        </dl>
        <div className="border-t border-hairline pt-4">
          <StubForm submit="Save auto-send" done="drafts still in review this long before their deadline send as they are, flagged Sent unreviewed.">
            <Field htmlFor="auto-send" label="Auto-send a draft nobody has approved" hint="How long before the deadline. Shorter gives reviewers more time; longer leaves room to fix a bad send.">
              <Select id="auto-send" name="autoSend" defaultValue={String(CLOCK.autoSendBeforeHours)} className="max-w-xs" aria-describedby="auto-send-hint">
                {[1, 2, 3, 4].map((h) => <option key={h} value={h}>{h} {h === 1 ? "hour" : "hours"} before</option>)}
              </Select>
            </Field>
          </StubForm>
        </div>
      </Card>

      <Card id="pricing" aria-labelledby="pricing-title" className="scroll-mt-24 gap-1">
        <CardHeader id="pricing-title" title="Pricing" note="A new price applies to new orders only. Paid orders keep what they paid." />
        <StubForm submit="Save prices" done="new orders are charged the new price, and the site and checkout show it straight away.">
          {live.map((r) => (
            <Field key={r.key} htmlFor={`price-${r.key}`} label={r.name} hint="US dollars, one payment.">
              <Input id={`price-${r.key}`} name={r.key} type="number" min={1} step={1} required defaultValue={(r.priceCents ?? 0) / 100}
                className="max-w-xs" trailing={<span className="type-body-sm text-muted">USD</span>} aria-describedby={`price-${r.key}-hint`} />
            </Field>
          ))}
        </StubForm>
      </Card>

      <Card id="emails" aria-labelledby="emails-title" className="scroll-mt-24 gap-1">
        <CardHeader id="emails-title" title="Email templates" note="What customers get at each step. Send yourself a test to see one." />
        <ul className="flex flex-col divide-y divide-hairline">
          {TEMPLATES.map((t) => (
            <li key={t.name} className="flex flex-col gap-2 py-3 md:flex-row md:items-center md:justify-between">
              <span className="flex min-w-0 flex-col gap-0.5">
                <span className="type-body-sm-strong text-ink">{t.name}</span>
                <span className="type-caption text-muted">Subject: {t.subject}</span>
              </span>
              <AdminAction label="Send me a test" icon={<Icon icon={Send} size="sm" />} variant="text" done={`the “${t.name}” email is sent to ${user.email} with sample order details.`} />
            </li>
          ))}
        </ul>
      </Card>

      <Card id="integrations" aria-labelledby="integrations-title" className="scroll-mt-24 gap-1">
        <CardHeader id="integrations-title" title="Integrations" note="Services the admin needs. Keys are set on the server, never here." />
        <ul className="flex flex-col divide-y divide-hairline">
          {integrations.map((i) => (
            <li key={i.key} className="flex items-start justify-between gap-3 py-3">
              <span className="flex min-w-0 flex-col gap-0.5">
                <span className="type-body-sm-strong text-ink">{i.name}</span>
                <span className="type-caption text-muted">{i.purpose}{i.env && <> · <code className="tracking-normal">{i.env}</code></>}</span>
              </span>
              <Chip tone={i.connected ? "success" : "warning"} className="shrink-0">{i.connected ? "Connected" : "Not connected"}</Chip>
            </li>
          ))}
        </ul>
      </Card>

      <Card id="alerts" aria-labelledby="alerts-title" className="scroll-mt-24 gap-1">
        <CardHeader id="alerts-title" title="Alerts" note="Who gets an email and a push alert for each event." />
        <StubForm submit="Save alerts" done="alerts go to the people ticked here from the next event on.">
          <div className="overflow-x-auto">
            <table className="w-full min-w-md text-left">
              <caption className="sr-only">Which roles get each alert</caption>
              <thead>
                <tr className="type-caption-strong text-muted">
                  <th scope="col" className="py-3 pr-4">When</th>
                  <th scope="col" className="w-20 py-3 pr-4 text-center">Owners</th>
                  <th scope="col" className="w-20 py-3 text-center">Ops</th>
                </tr>
              </thead>
              <tbody>
                {ALERT_RULES.map((r) => (
                  <tr key={r.key} className="border-t border-hairline">
                    <th scope="row" className="py-3 pr-4 type-body-sm font-normal text-ink">{r.label}</th>
                    <td className="py-3 pr-4 text-center">
                      <input type="checkbox" name={`${r.key}-owners`} defaultChecked={r.owners} aria-label={`Owners: ${r.label}`} className="size-4.5 cursor-pointer accent-action" />
                    </td>
                    <td className="py-3 text-center">
                      <input type="checkbox" name={`${r.key}-ops`} defaultChecked={r.ops} aria-label={`Ops: ${r.label}`} className="size-4.5 cursor-pointer accent-action" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </StubForm>
      </Card>

      <Card id="maintenance" aria-labelledby="maintenance-title" className="scroll-mt-24 gap-1">
        <CardHeader id="maintenance-title" title="Maintenance mode" note="Pauses new orders and shows customers a maintenance page. Orders already paid keep running." />
        <StubForm submit="Save maintenance mode" done="the site shows the maintenance page to customers and checkout is paused until you switch it off.">
          <Checkbox name="on" label="Show the maintenance page and pause new orders" />
          <Field htmlFor="maintenance-message" label="Message to customers" hint="Say when you'll be back if you know.">
            <Textarea id="maintenance-message" name="message" rows={2} aria-describedby="maintenance-message-hint"
              defaultValue="We're making some improvements and will be back shortly. Orders already placed are safe and still on their way." />
          </Field>
          <Link href="/maintenance" className="flex w-fit items-center pointer-coarse:min-h-11 type-body-sm font-semibold text-ink-2 underline hover:text-ink">Preview the maintenance page</Link>
        </StubForm>
      </Card>
    </AdminPage>
  );
}
