"use client";

import { useEffect, useRef, useState } from "react";
import { Check, X } from "lucide-react";
import { Button, Field, Icon, Note, Textarea } from "@/components/ui";

type Choice = "approve" | "decline";

/**
 * An owner's call on a refund Ops prepared. Either way needs a reason, which
 * goes in the audit log. Focus follows the flow: into the reason when it
 * opens, back to the button on Cancel, onto the result when it's done. The
 * admin API isn't connected, so the result says what would happen.
 */
export function RefundDecision({ id, amount, preparedBy }: { id: string; amount: string; preparedBy: string }) {
  const [choice, setChoice] = useState<Choice | null>(null);
  const [reason, setReason] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState<Choice | null>(null);
  const reasonRef = useRef<HTMLTextAreaElement>(null);
  const resultRef = useRef<HTMLDivElement>(null);
  const opener = useRef<Record<Choice, HTMLButtonElement | null>>({ approve: null, decline: null });
  const last = useRef<Choice | null>(null);

  useEffect(() => {
    if (done) resultRef.current?.focus();
    else if (choice) reasonRef.current?.focus();
    else if (last.current) opener.current[last.current]?.focus();
  }, [choice, done]);

  if (done) {
    return (
      <div ref={resultRef} tabIndex={-1} className="outline-none">
        <Note tone="info">
          Not sent: the admin API isn&apos;t connected yet. When it is,{" "}
          {done === "approve"
            ? `Stripe refunds ${amount}, the customer gets the refund email and ${preparedBy} sees it approved.`
            : `nothing is refunded and ${preparedBy} sees it declined, with your reason.`}
        </Note>
      </div>
    );
  }

  if (!choice) {
    return (
      <div className="flex flex-wrap gap-2">
        <Button ref={(el) => { opener.current.approve = el; }} size="sm" onClick={() => { last.current = "approve"; setChoice("approve"); }}>
          <Icon icon={Check} size="sm" /> Approve
        </Button>
        <Button ref={(el) => { opener.current.decline = el; }} size="sm" variant="ghost" onClick={() => { last.current = "decline"; setChoice("decline"); }}>
          <Icon icon={X} size="sm" /> Decline
        </Button>
      </div>
    );
  }

  const field = `${id}-reason`;
  const submit = () => {
    if (reason.trim().length < 5) return setError(choice === "approve" ? "Say why this refund is right. It goes in the audit log." : `Tell ${preparedBy} why not. They'll see this.`);
    setDone(choice);
  };
  return (
    <div className="flex flex-col gap-3 rounded-lg bg-page p-4">
      <Field htmlFor={field} label={choice === "approve" ? `Why approve this ${amount} refund?` : "Why decline it?"} required
        hint="Goes in the audit log with your name." message={error ? { tone: "danger", text: error } : undefined}>
        <Textarea ref={reasonRef} id={field} rows={2} value={reason} state={error ? "error" : "default"}
          aria-describedby={`${field}-hint${error ? ` ${field}-msg` : ""}`}
          onChange={(e) => { setReason(e.target.value); if (error) setError(null); }} />
      </Field>
      <div className="flex flex-wrap gap-2">
        <Button size="sm" variant={choice === "approve" ? "primary" : "danger"} onClick={submit}>
          {choice === "approve" ? `Approve ${amount} refund` : "Decline refund"}
        </Button>
        <Button size="sm" variant="text" onClick={() => { setChoice(null); setReason(""); setError(null); }}>Cancel</Button>
      </div>
    </div>
  );
}
