"use client";

import { useActionState, useRef } from "react";
import { Check, Rocket, X } from "lucide-react";
import { Button, Chip, Field, Heading, Icon, IconTile, Input, buttonStyles } from "@/components/ui";
import { joinWaitlist, type WaitlistResult } from "@/app/actions/waitlist";

const UPCOMING = ["Local SEO Report", "Google Ads Audit", "Content Strategy", "Review Analysis"];

/** Figma "State A – waitlist" (7203:3001) and "State B – Success Confirmation" (7203:3027). */
export function WaitlistDialog({ triggerLabel = "Notify me when available" }: { triggerLabel?: string }) {
  const ref = useRef<HTMLDialogElement>(null);
  const [state, action, pending] = useActionState<WaitlistResult | null, FormData>(joinWaitlist, null);
  const done = state?.ok === true;
  return (
    <>
      <button type="button" className={buttonStyles({ variant: "ghost", full: true })} onClick={() => ref.current?.showModal()}>{triggerLabel}</button>
      <dialog ref={ref} aria-labelledby="waitlist-title" data-theme="app"
        className="m-auto w-[calc(100%-2rem)] max-w-modal-md rounded-modal bg-raised p-modal text-ink shadow-overlay backdrop:bg-inverse/70">
        <div className="flex flex-col items-center gap-6 text-center">
          <button type="button" aria-label="Close" onClick={() => ref.current?.close()} className="self-end rounded-full bg-sunken p-2 text-muted hover:text-ink">
            <Icon icon={X} size="sm" />
          </button>
          {done ? (
            <>
              <IconTile icon={Check} tone="success" size="xl" className="rounded-full" />
              <Heading as="h2" variant="h2" id="waitlist-title">You&apos;re on the list!</Heading>
              <p className="type-body-sm text-ink-2">We&apos;ll email you the moment new reports go live, with an early-bird discount.</p>
              <p className="flex w-full flex-col gap-1 rounded-lg bg-success px-5 py-3.5">
                <span className="type-caption text-success-ink">We&apos;ll notify you at</span>
                <span className="type-body-strong text-success-ink">{state.email}</span>
              </p>
              <Button variant="ghost" full onClick={() => ref.current?.close()}>Back to the page</Button>
            </>
          ) : (
            <>
              <IconTile icon={Rocket} tone="action" size="xl" />
              <Heading as="h2" variant="h2" id="waitlist-title">Be first to know when new reports launch</Heading>
              <p className="type-body-sm text-ink-2">We&apos;re building specialised reports for local businesses. Join the waitlist for early access and a launch discount.</p>
              <ul className="flex flex-wrap justify-center gap-2">{UPCOMING.map((r) => <li key={r}><Chip>{r}</Chip></li>)}</ul>
              <form action={action} className="flex w-full flex-col gap-2.5 text-left">
                <Field htmlFor="waitlist-email" label="Email address" message={state && !state.ok ? { tone: "danger", text: state.error } : undefined}>
                  <Input id="waitlist-email" name="email" type="email" autoComplete="email" required placeholder="you@yourbusiness.com"
                    state={state && !state.ok ? "error" : "default"} aria-describedby="waitlist-email-msg" />
                </Field>
                <Button type="submit" full loading={pending}>Notify me when available</Button>
              </form>
              <p className="type-caption text-muted">No spam. Unsubscribe any time.</p>
            </>
          )}
        </div>
      </dialog>
    </>
  );
}
