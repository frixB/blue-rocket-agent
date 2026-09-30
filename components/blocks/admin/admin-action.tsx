"use client";

import { useEffect, useRef, useState } from "react";
import { Button, Field, Note, Textarea } from "@/components/ui";

type Step = "idle" | "confirm" | "done";

/**
 * An admin action button. The admin API isn't connected yet, so a click says
 * plainly what would happen instead of silently doing nothing. `confirm`
 * asks first, for anything that moves money or messages a customer; `reason`
 * adds a required reason to that step, for the audit log.
 *
 * Focus follows the flow, so keyboard and screen reader users never land on
 * the page body: into the confirm step when it opens, back to the button on
 * Cancel, onto the result when it's done.
 */
export function AdminAction({ label, icon, variant = "ghost", confirm, reason, done, disabledReason }: {
  label: string;
  /** A rendered <Icon size="sm" />. Server pages can't pass the Lucide component itself to a client component. */
  icon?: React.ReactNode;
  variant?: "primary" | "ghost" | "danger" | "text";
  confirm?: string;
  /** Label for a required reason in the confirm step, e.g. "Why stop the refund?". */
  reason?: string;
  /** What happens once the API is connected, in one sentence. */
  done: string;
  disabledReason?: string;
}) {
  const [step, setStep] = useState<Step>("idle");
  const [why, setWhy] = useState("");
  const [error, setError] = useState(false);
  const trigger = useRef<HTMLButtonElement>(null);
  const firstInConfirm = useRef<HTMLElement | null>(null);
  const result = useRef<HTMLDivElement>(null);
  const opened = useRef(false);
  const id = `action-${label.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`;

  useEffect(() => {
    if (step === "confirm") { opened.current = true; firstInConfirm.current?.focus(); }
    else if (step === "done") result.current?.focus();
    else if (opened.current) trigger.current?.focus();
  }, [step]);

  if (disabledReason) {
    return (
      <div className="flex flex-col gap-1">
        <Button variant={variant} size="sm" disabled aria-describedby={`${id}-why`}>{icon}{label}</Button>
        <span id={`${id}-why`} className="type-caption text-muted">{disabledReason}</span>
      </div>
    );
  }
  if (step === "confirm") {
    const yes = () => {
      if (reason && why.trim().length < 5) return setError(true);
      setStep("done");
    };
    return (
      <div role="group" aria-labelledby={`${id}-q`} className="flex flex-col gap-3 rounded-lg border border-transparent bg-page p-3">
        <span id={`${id}-q`} className="type-body-sm-strong text-ink">{confirm}</span>
        {reason && (
          <Field htmlFor={`${id}-reason`} label={reason} required hint="Goes in the audit log with your name."
            message={error ? { tone: "danger", text: "Write a reason first." } : undefined}>
            <Textarea ref={(el) => { firstInConfirm.current = el; }} id={`${id}-reason`} rows={2} value={why} state={error ? "error" : "default"}
              aria-describedby={`${id}-reason-hint${error ? ` ${id}-reason-msg` : ""}`}
              onChange={(e) => { setWhy(e.target.value); if (error) setError(false); }} />
          </Field>
        )}
        <div className="flex flex-wrap gap-2">
          <Button ref={(el) => { if (!reason) firstInConfirm.current = el; }} size="sm" variant={variant === "danger" ? "danger" : "primary"} onClick={yes}>
            Yes, {label.toLowerCase()}
          </Button>
          <Button size="sm" variant="text" onClick={() => { setStep("idle"); setWhy(""); setError(false); }}>Cancel</Button>
        </div>
      </div>
    );
  }
  if (step === "done") {
    return (
      <div ref={result} tabIndex={-1} className="outline-none">
        <Note tone="info">Not sent: the admin API isn&apos;t connected yet. When it is, {done}</Note>
      </div>
    );
  }
  return (
    <Button ref={trigger} variant={variant} size="sm" onClick={() => setStep(confirm ? "confirm" : "done")}>
      {icon}{label}
    </Button>
  );
}
