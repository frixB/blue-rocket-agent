"use client";

import { useState } from "react";
import { ArrowDown, ArrowUp, Plus, RefreshCw, Send, Trash2 } from "lucide-react";
import { Button, Card, CardTitle, Checkbox, Chip, Field, Icon, IconTile, Input, Note, Select, Textarea } from "@/components/ui";
import type { DraftSection, Review } from "@/lib/admin/types";
import type { Finding, Severity } from "@/lib/orders/types";
import { REPORT_SECTIONS } from "../report-sections";
import { AdminAction } from "./admin-action";

const SEVERITY: Record<Severity, string> = { critical: "Critical", medium: "Medium", pass: "Pass" };

type Mode = "review" | "post_send";

/**
 * The report review screen's editor: edit, reorder and re-rate findings,
 * mark a section unavailable with its customer-facing reason, regenerate one
 * section, then approve. Approve stays blocked while a section is empty and
 * has no reason, because the customer would get three sections and no explanation.
 */
export function FindingEditor({ review, reviewer, mode, clock, aside }: {
  review: Review; reviewer: string; mode: Mode;
  /** Paid, deadline and auto-send rows, inside the approve card: the decision and its deadline in one place. */
  clock: React.ReactNode;
  /** Client context, under the approve card in the right-hand column. */
  aside: React.ReactNode;
}) {
  const [sections, setSections] = useState<DraftSection[]>(review.sections);
  const [fixFirst, setFixFirst] = useState(review.fixFirst);
  const [edits, setEdits] = useState(0);
  const [done, setDone] = useState<null | "approved" | "reviewed" | "corrected">(null);

  const update = (key: DraftSection["key"], fn: (s: DraftSection) => DraftSection) => {
    setSections((all) => all.map((s) => (s.key === key ? fn(s) : s)));
    setEdits((n) => n + 1);
  };
  const setFinding = (key: DraftSection["key"], i: number, patch: Partial<Finding>) =>
    update(key, (s) => ({ ...s, findings: s.findings.map((f, j) => (j === i ? { ...f, ...patch } : f)) }));
  const move = (key: DraftSection["key"], i: number, by: -1 | 1) =>
    update(key, (s) => {
      const f = [...s.findings];
      const j = i + by;
      if (j < 0 || j >= f.length) return s;
      [f[i], f[j]] = [f[j]!, f[i]!];
      return { ...s, findings: f };
    });

  const missingReason = sections.filter((s) => s.state === "unavailable" && !s.reason?.trim());
  const partial = sections.some((s) => s.state === "unavailable");

  return (
    <div className="grid gap-8 xl:grid-cols-[minmax(0,1fr)_var(--container-rail)]">
    <div className="flex flex-col gap-6">
      <Card aria-labelledby="fix-first-title">
        <CardTitle id="fix-first-title">What to fix first</CardTitle>
        <ol className="flex flex-col gap-3">
          {fixFirst.map((line, i) => (
            <li key={i} className="flex items-start gap-3">
              <span className="flex size-rail-marker shrink-0 items-center justify-center rounded-full bg-inset text-xs font-bold text-ink-2">{i + 1}</span>
              <label htmlFor={`fix-${i}`} className="sr-only">Fix first, item {i + 1}</label>
              <Textarea id={`fix-${i}`} rows={2} className="flex-1" value={line}
                onChange={(e) => { setFixFirst((all) => all.map((l, j) => (j === i ? e.target.value : l))); setEdits((n) => n + 1); }} />
            </li>
          ))}
        </ol>
      </Card>

      {sections.map((s) => {
        const meta = REPORT_SECTIONS[s.key];
        const unavailable = s.state === "unavailable";
        return (
          <Card key={s.key} aria-labelledby={`sec-${s.key}`}>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <IconTile icon={meta.icon} tone={unavailable ? "warning" : "neutral"} size="sm" />
                <CardTitle id={`sec-${s.key}`}>{meta.name}</CardTitle>
                {unavailable ? <Chip tone="warning">No data</Chip> : <Chip>{s.findings.length} findings</Chip>}
              </div>
              <AdminAction label="Regenerate section" icon={<Icon icon={RefreshCw} size="sm" />} variant="text"
                done={`only ${meta.name} runs again and your edits to other sections are kept.`} />
            </div>

            <Checkbox label="This section has no data. Deliver as a partial report." checked={unavailable}
              onChange={(e) => update(s.key, (x) => ({ ...x, state: e.target.checked ? "unavailable" : "complete" }))} />

            {unavailable ? (
              <Field htmlFor={`reason-${s.key}`} label="Reason the customer sees" required
                hint="Rendered word for word on their report. Plain language: what was missing and why."
                message={!s.reason?.trim() ? { tone: "danger", text: "Write a reason before you approve." } : undefined}>
                <Textarea id={`reason-${s.key}`} state={s.reason?.trim() ? "default" : "error"} value={s.reason ?? ""}
                  placeholder="What was missing, and why. For example: your domain is 41 days old, so there is no link history to measure yet."
                  aria-describedby={`reason-${s.key}-hint reason-${s.key}-msg`}
                  onChange={(e) => update(s.key, (x) => ({ ...x, reason: e.target.value }))} />
              </Field>
            ) : (
              <ol className="flex flex-col divide-y divide-hairline">
                {s.findings.map((f, i) => (
                  <li key={i} className="flex flex-col gap-3 py-4 first:pt-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <label htmlFor={`${s.key}-${i}-sev`} className="sr-only">Severity</label>
                      <Select id={`${s.key}-${i}-sev`} className="w-40" value={f.severity}
                        onChange={(e) => setFinding(s.key, i, { severity: e.target.value as Severity })}>
                        {Object.entries(SEVERITY).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                      </Select>
                      <span className="ml-auto flex gap-1">
                        <Button variant="ghost" size="sm" aria-label="Move up" disabled={i === 0} onClick={() => move(s.key, i, -1)}><Icon icon={ArrowUp} size="sm" /></Button>
                        <Button variant="ghost" size="sm" aria-label="Move down" disabled={i === s.findings.length - 1} onClick={() => move(s.key, i, 1)}><Icon icon={ArrowDown} size="sm" /></Button>
                        <Button variant="ghost" size="sm" aria-label="Remove finding"
                          onClick={() => update(s.key, (x) => ({ ...x, findings: x.findings.filter((_, j) => j !== i) }))}><Icon icon={Trash2} size="sm" /></Button>
                      </span>
                    </div>
                    <label htmlFor={`${s.key}-${i}-title`} className="sr-only">Finding title</label>
                    <Input id={`${s.key}-${i}-title`} value={f.title} onChange={(e) => setFinding(s.key, i, { title: e.target.value })} />
                    <label htmlFor={`${s.key}-${i}-body`} className="sr-only">Finding detail</label>
                    <Textarea id={`${s.key}-${i}-body`} rows={2} value={f.body} onChange={(e) => setFinding(s.key, i, { body: e.target.value })} />
                  </li>
                ))}
                <li className="pt-3">
                  <Button variant="text" size="sm"
                    onClick={() => update(s.key, (x) => ({ ...x, findings: [...x.findings, { severity: "medium", title: "", body: "" }] }))}>
                    <Icon icon={Plus} size="sm" /> Add a finding
                  </Button>
                </li>
              </ol>
            )}
          </Card>
        );
      })}

    </div>

    <aside className="flex flex-col gap-6 xl:sticky xl:top-6 xl:max-h-dvh xl:self-start xl:overflow-y-auto xl:pb-6">
      <Card aria-labelledby="approve-title" className="shadow-raised">
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-0.5">
            <CardTitle id="approve-title">{mode === "post_send" ? "Post-send review" : "Approve and send"}</CardTitle>
            <span className="type-body-sm text-ink-2">
              {edits ? `${edits} ${edits === 1 ? "edit" : "edits"} so far.` : "No edits yet."}{" "}
              {mode === "review" ? `Your name, ${reviewer}, goes on the cover.` : "The customer already has this version."}
            </span>
          </div>
          {!done && (mode === "review" ? (
            <Button full disabled={missingReason.length > 0} onClick={() => setDone("approved")}>
              <Icon icon={Send} size="sm" /> {partial ? "Approve as partial and send" : "Approve and send"}
            </Button>
          ) : (
            <div className="flex flex-col gap-2">
              <Button full variant="ghost" onClick={() => setDone("reviewed")}>Mark reviewed, no issues</Button>
              <Button full disabled={!edits || missingReason.length > 0} onClick={() => setDone("corrected")}><Icon icon={Send} size="sm" /> Send corrected version</Button>
            </div>
          ))}
        </div>
        {clock}
        {missingReason.length > 0 && !done && (
          <Note tone="warning">Approve is blocked: {missingReason.map((s) => REPORT_SECTIONS[s.key].name).join(", ")} has no data and no reason for the customer.</Note>
        )}
        {partial && mode === "review" && !done && <Note tone="info">A partial report issues the backlink credit to the customer automatically.</Note>}
        {done && (
          <Note tone="info">
            <span aria-live="polite">
              Not sent: the admin API isn&apos;t connected yet. When it is,{" "}
              {done === "approved" && "the ready email goes out with the report link, the PDF follows, and the order moves to Ready."}
              {done === "reviewed" && "the Sent unreviewed flag clears and the review is logged with your name."}
              {done === "corrected" && "the customer gets the corrected report with a short note saying what changed."}
            </span>
          </Note>
        )}
      </Card>
      {aside}
    </aside>
    </div>
  );
}
