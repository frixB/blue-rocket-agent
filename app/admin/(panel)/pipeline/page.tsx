import Link from "next/link";
import type { Route } from "next";
import { CircleCheck, RefreshCw } from "lucide-react";
import { Card, Chip, Icon, type Tone } from "@/components/ui";
import { AdminAction } from "@/components/blocks/admin/admin-action";
import { AdminPage } from "@/components/blocks/admin/admin-page";
import { CardHeader } from "@/components/blocks/admin/card-header";
import { GlanceStrip } from "@/components/blocks/admin/glance-strip";
import { LocalTime } from "@/components/blocks/admin/local-time";
import { listDataSources, listOrders, listPipelineAlerts } from "@/lib/admin/data";
import { STAGE_STATS, type SourceStatus } from "@/lib/admin/fixtures-modules";
import { STAGE_LABEL, STAGES, type Stage } from "@/lib/orders/status";

export const dynamic = "force-dynamic";

const SOURCE: Record<SourceStatus, { tone: Tone; label: string }> = {
  operational: { tone: "success", label: "Working" },
  degraded: { tone: "warning", label: "Slow" },
  down: { tone: "danger", label: "Down" },
};
/** For "Retry …" buttons. STAGE_LABEL is title case and "SEO" must keep its capitals. */
const RETRY: Record<Stage, string> = { payment: "payment", crawl: "site crawl", analysis: "SEO analysis", compile: "report compile", delivery: "delivery" };

/** Runs by stage, what failed and can be retried, and the services the pipeline leans on. */
export default async function PipelineHealth() {
  const now = new Date();
  const [orders, sources, alerts] = await Promise.all([listOrders(now), listDataSources(), listPipelineAlerts(now)]);
  const at = (stage: Stage, state: "active" | "failed") => orders.filter((o) => o.stages.some((s) => s.stage === stage && s.state === state));
  const failing = orders.filter((o) => o.failure && o.status !== "refunded");
  const slow = sources.filter((s) => s.status !== "operational");
  const failed24h = Object.values(STAGE_STATS).reduce((n, s) => n + s.failed, 0);

  return (
    <AdminPage title="Pipeline health" intro="Every stage from payment to delivery, and the services each one needs.">
      <GlanceStrip label="Pipeline right now" items={[
        { label: "Running now", value: String(STAGES.reduce((n, s) => n + at(s, "active").length, 0)) },
        { label: "Stuck, need a retry", value: String(failing.length), tone: failing.length ? "danger" : "neutral" },
        { label: "Failed runs, 24h", value: String(failed24h), tone: failed24h ? "warning" : "neutral" },
        { label: "Services slow or down", value: String(slow.length), tone: slow.length ? "warning" : "neutral" },
        { label: "Alerts sent, 24h", value: String(alerts.length) },
      ]} />

      <div className="grid gap-6 xl:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
        <Card aria-labelledby="stages-title" className="min-w-0 gap-1">
          <CardHeader id="stages-title" title="Stages" note="Last 24 hours. Running now is live." />
          <div className="overflow-x-auto">
            <table className="w-full min-w-md text-left">
              <caption className="sr-only">Runs, failures and average time for each pipeline stage</caption>
              <thead>
                <tr className="type-caption-strong text-muted">
                  <th scope="col" className="py-3 pr-4">Stage</th>
                  <th scope="col" className="py-3 pr-4 text-right">Running now</th>
                  <th scope="col" className="py-3 pr-4 text-right">Runs</th>
                  <th scope="col" className="py-3 pr-4 text-right">Failed</th>
                  <th scope="col" className="py-3 text-right">Average</th>
                </tr>
              </thead>
              <tbody className="type-body-sm tabular-nums">
                {STAGES.map((s) => {
                  const st = STAGE_STATS[s]!;
                  return (
                    <tr key={s} className="border-t border-hairline">
                      <th scope="row" className="py-3 pr-4 font-semibold text-ink">{STAGE_LABEL[s]}</th>
                      <td className="py-3 pr-4 text-right text-ink-2">{at(s, "active").length}</td>
                      <td className="py-3 pr-4 text-right text-ink-2">{st.runs}</td>
                      <td className={st.failed ? "py-3 pr-4 text-right font-semibold text-danger-ink" : "py-3 pr-4 text-right text-ink-2"}>{st.failed}</td>
                      <td className="py-3 text-right text-ink-2">{st.avgMinutes ? `${st.avgMinutes} min` : "Instant"}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>

        <Card aria-labelledby="sources-title" className="min-w-0 gap-1">
          <CardHeader id="sources-title" title="Services" note="Checked every minute." />
          <ul className="flex flex-col divide-y divide-hairline">
            {sources.map((s) => (
              <li key={s.key} className="flex items-start justify-between gap-3 py-3">
                <span className="flex min-w-0 flex-col gap-0.5">
                  <span className="type-body-sm-strong text-ink">{s.name} <span className="font-normal text-muted">· {s.role}</span></span>
                  <span className="type-caption text-ink-2">{s.note}</span>
                </span>
                <Chip tone={SOURCE[s.status].tone} className="shrink-0">{SOURCE[s.status].label}</Chip>
              </li>
            ))}
          </ul>
        </Card>
      </div>

      <Card aria-labelledby="errors-title" className="gap-1">
        <CardHeader id="errors-title" title="Stuck orders" note="Retrying runs only the stage that failed. The delivery clock keeps running." />
        {failing.length ? (
          <ul className="flex flex-col divide-y divide-hairline">
            {failing.map((o) => {
              const stage = o.stages.find((s) => s.state === "failed")?.stage ?? o.stages.find((s) => s.state === "active")?.stage;
              return (
                <li key={o.id} className="flex flex-col gap-3 py-4 md:flex-row md:items-start md:justify-between">
                  <span className="flex min-w-0 flex-col gap-0.5">
                    <Link href={`/admin/orders/${o.id}` as Route} className="type-body-sm-strong text-ink hover:underline">{o.businessName} · #{o.reference}</Link>
                    <span className="type-body-sm text-ink-2">{o.failure!.stage} stopped: {o.failure!.message}</span>
                    <span className="type-caption text-muted">Code {o.failure!.code}</span>
                  </span>
                  {stage && (
                    <AdminAction label={`Retry ${RETRY[stage]}`} icon={<Icon icon={RefreshCw} size="sm" />}
                      done={`only the ${RETRY[stage]} runs again for #${o.reference}, and the order moves back into the pipeline.`} />
                  )}
                </li>
              );
            })}
          </ul>
        ) : (
          <p className="flex items-center gap-2 type-body-sm text-ink-2"><Icon icon={CircleCheck} size="sm" className="text-success-ink" /> Nothing is stuck.</p>
        )}
      </Card>

      <Card aria-labelledby="alerts-title" className="gap-1">
        <CardHeader id="alerts-title" title="Alerts sent" note="Who gets which alert is set in Settings." link={{ href: "/admin/settings#alerts" as Route, label: "Alert settings" }} />
        <ul className="flex flex-col divide-y divide-hairline">
          {alerts.map((a) => (
            <li key={a.id} className="flex flex-col gap-1 py-3 sm:flex-row sm:items-start sm:justify-between sm:gap-6">
              <span className="flex items-start gap-2">
                <Chip tone={a.tone} className="shrink-0">{a.tone === "danger" ? "Urgent" : "Heads-up"}</Chip>
                <span className="type-body-sm text-ink">{a.text}</span>
              </span>
              <span className="shrink-0 type-caption text-muted">To {a.sentTo} · <LocalTime iso={a.at} /></span>
            </li>
          ))}
        </ul>
      </Card>
    </AdminPage>
  );
}
