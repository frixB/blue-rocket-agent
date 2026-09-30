"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import { Bookmark, Lock, Mail, Search } from "lucide-react";
import { Button, Field, Heading, IconTile, Input, Note, buttonStyles } from "@/components/ui";
import {
  claimAccount, recoverOrder, requestPasswordReset, requestSignInLink, setNewPassword, signInWithPassword, type AuthResult,
} from "@/app/actions/auth";
import { passwordStrength } from "@/lib/password-strength";

type Action = (prev: AuthResult | null, form: FormData) => Promise<AuthResult>;
/** `preview` forces a Figma state for review; pages only pass it when previews are enabled. */
export type Preview = "sent" | "error" | undefined;
const PREVIEW_EMAIL = "bob@johnsonplumbing.com";

const errorFor = (s: AuthResult | null, field: "email" | "password") => (s && !s.ok && s.field === field ? s.error : undefined);
const formError = (s: AuthResult | null) => (s && !s.ok && !s.field ? s.error : undefined);

/** S-19 (7368:65): the "check your inbox" panel every email-link flow ends on. */
export function CheckInbox({ email, body, devLink, onResend }: { email: string; body: string; devLink?: string; onResend: () => void }) {
  return (
    <>
      <IconTile icon={Mail} tone="success" size="lg" />
      <div className="flex flex-col gap-2.5">
        <Heading as="h2">Check your inbox</Heading>
        <p className="type-body text-ink-2">{body}</p>
      </div>
      <Note icon={Mail}>We sent it to {email}</Note>
      {devLink ? (
        <>
          <Note tone="warning">Local development: emails aren&apos;t sent, so the link is here instead.</Note>
          <a href={devLink} className={buttonStyles({ full: true })}>Open the sign-in link</a>
        </>
      ) : (
        <a href="mailto:" className={buttonStyles({ full: true })}>Open email app</a>
      )}
      <Button variant="text" full onClick={onResend}>Didn&apos;t get it? Check your spam folder, or send it again</Button>
    </>
  );
}

/** Header, email field and footer until the action succeeds; then the whole panel becomes S-19. */
function EmailFlow({ action, submit, preview, sentBody, header, footer, next }: {
  action: Action; submit: string; preview: Preview; sentBody: string; header: React.ReactNode; footer?: React.ReactNode; next?: string;
}) {
  const [state, run, pending] = useActionState(action, null);
  const [reset, setReset] = useState(false);
  const sent = !reset && (state?.ok ? state.email : preview === "sent" ? PREVIEW_EMAIL : null);
  if (sent) return <CheckInbox email={sent} body={sentBody} devLink={state?.ok ? state.devLink : undefined} onResend={() => setReset(true)} />;
  const err = errorFor(state, "email");
  return (
    <>
      {header}
      <form action={(f) => { setReset(false); run(f); }} className="flex flex-col gap-5">
        {next && <input type="hidden" name="next" value={next} />}
        <Field htmlFor="email" label="Email address" message={err ? { tone: "danger", text: err } : undefined}>
          <Input id="email" name="email" type="email" autoComplete="email" required placeholder="you@yourbusiness.com"
            state={err ? "error" : "default"} aria-describedby="email-msg" />
        </Field>
        <Button type="submit" size="lg" full loading={pending}>{submit}</Button>
        {formError(state) && <Note tone="warning">{formError(state)}</Note>}
      </form>
      {footer}
    </>
  );
}

/** S-18 (7368:22): magic link first, password second, recovery last. */
export function SignInForm({ preview, next }: { preview: Preview; next?: string }) {
  return (
    <div className="flex flex-col gap-5">
      <EmailFlow action={requestSignInLink} submit="Email me a sign-in link" preview={preview} next={next}
        sentBody="If an account exists for that email, a sign-in link is on its way. The link works for 60 minutes."
        header={
          <div className="flex flex-col gap-2.5">
            <Heading as="h2" variant="h2">Sign in</Heading>
            <p className="type-body text-ink-2">Your reports are waiting. We&apos;ll email you a link so there&apos;s no password to remember.</p>
          </div>
        }
        footer={
          <>
            <div className="flex items-center gap-3 type-caption text-muted" aria-hidden><span className="h-px flex-1 bg-hairline" />or<span className="h-px flex-1 bg-hairline" /></div>
            <Link href={next ? { pathname: "/sign-in/password", query: { callbackUrl: next } } : "/sign-in/password"} className={buttonStyles({ variant: "ghost", full: true })}>Sign in with a password</Link>
            <Link href="/recover" className={buttonStyles({ variant: "text", full: true })}>Paid but never made an account? Recover your order</Link>
          </>
        } />
    </div>
  );
}

/** S-18b (7368:43): the password form, and its wrong-password state. */
export function PasswordSignInForm({ preview, next }: { preview: Preview; next?: string }) {
  const [state, run, pending] = useActionState(signInWithPassword, null);
  const wrong = preview === "error" || Boolean(formError(state)) || Boolean(errorFor(state, "password"));
  const pwErr = preview === "error" ? "Email or password is incorrect." : errorFor(state, "password");
  const emErr = errorFor(state, "email");
  return (
    <>
      <IconTile icon={Lock} tone={wrong ? "danger" : "info"} size="lg" />
      <div className="flex flex-col gap-2.5">
        <Heading as="h2">{wrong ? "That didn't work" : "Sign in with your password"}</Heading>
        <p className="type-body text-ink-2">
          {wrong ? "Check your email and password and try again. After five attempts we'll lock the account for 15 minutes." : "Use the email you paid with."}
        </p>
      </div>
      <form action={run} className="flex flex-col gap-5">
        {next && <input type="hidden" name="next" value={next} />}
        <Field htmlFor="email" label="Email address" message={emErr ? { tone: "danger", text: emErr } : undefined}>
          <Input id="email" name="email" type="email" autoComplete="email" required defaultValue={preview === "error" ? PREVIEW_EMAIL : undefined}
            state={emErr ? "error" : "default"} aria-describedby="email-msg" />
        </Field>
        <Field htmlFor="password" label="Password" message={pwErr ? { tone: "danger", text: pwErr } : undefined}>
          <Input id="password" name="password" type="password" autoComplete="current-password" required state={pwErr ? "error" : "default"} aria-describedby="password-msg" />
        </Field>
        {formError(state) && <Note tone="warning">{formError(state)}</Note>}
        <Button type="submit" size="lg" full loading={pending}>{wrong ? "Try again" : "Sign in"}</Button>
      </form>
      <Link href="/sign-in" className={buttonStyles({ variant: "ghost", full: true })}>Email me a sign-in link instead</Link>
      <Link href="/reset-password" className={buttonStyles({ variant: "text", full: true })}>Forgot your password?</Link>
    </>
  );
}

/** Asks for the email, then S-19. */
export function ResetPasswordForm({ preview }: { preview: Preview }) {
  return (
    <EmailFlow action={requestPasswordReset} submit="Send reset link" preview={preview}
      sentBody="If an account exists for that email, a reset link is on its way. The link works for 60 minutes."
      header={
        <>
          <IconTile icon={Lock} tone="info" size="lg" />
          <div className="flex flex-col gap-2.5">
            <Heading as="h2">Reset your password</Heading>
            <p className="type-body text-ink-2">Enter the email on your account and we&apos;ll send you a reset link.</p>
          </div>
        </>
      } />
  );
}

/** S-05 (7358:35). */
export function RecoverOrderForm({ preview }: { preview: Preview }) {
  return (
    <EmailFlow action={recoverOrder} submit="Send my report link" preview={preview}
      sentBody="If we have an order for that email, a link to its order page is on its way. The link works for 7 days."
      header={
        <>
          <IconTile icon={Search} tone="warning" size="lg" />
          <div className="flex flex-col gap-2.5">
            <Heading as="h2">Paid but lost your report link?</Heading>
            <p className="type-body text-ink-2">Enter the email you paid with and we&apos;ll send your order page straight back to you. Your report is safe and still running.</p>
          </div>
        </>
      }
      footer={<Note tone="info">Charged but no order found? Forward your Stripe receipt to hello@bluerocketagents.com and we&apos;ll sort it within the hour.</Note>} />
  );
}

/**
 * S-07 (7368:2) and the set-password screen a reset link lands on.
 * `confirm` is the first step when nobody is signed in: we email a link to
 * the order's address, because setting a password must prove who you are.
 */
export function ClaimAccountForm({ email, orderId, mode = "claim" }: { email: string; orderId?: string; mode?: "claim" | "confirm" | "reset" }) {
  const [state, run, pending] = useActionState(mode === "reset" ? setNewPassword : claimAccount, null);
  const [reset, setReset] = useState(false);
  const [pw, setPw] = useState("");
  const strength = passwordStrength(pw);
  const err = errorFor(state, "password");
  if (!reset && state?.ok) {
    return <CheckInbox email={state.email} devLink={state.devLink} onResend={() => setReset(true)}
      body="Open the link we sent to confirm it's you. It brings you straight back here to choose your password." />;
  }
  const choosing = mode !== "confirm";
  return (
    <>
      <IconTile icon={mode === "reset" ? Lock : Bookmark} tone={mode === "reset" ? "info" : "warning"} size="lg" />
      <div className="flex flex-col gap-2.5">
        <Heading as="h2">{mode === "reset" ? "Choose a new password" : "Save your report"}</Heading>
        <p className="type-body text-ink-2">
          {mode === "reset"
            ? "You're signed in. Choose a new password for next time."
            : mode === "confirm"
              ? "Set a password and your report stays in My Reports for good. First, we'll email you a link to confirm it's you."
              : "Set a password and your report stays in My Reports for good. Anything you buy later lands in the same place."}
        </p>
      </div>
      <form action={(f) => { setReset(false); run(f); }} className="flex flex-col gap-5">
        {orderId && <input type="hidden" name="orderId" value={orderId} />}
        <Field htmlFor="email" label="Email">
          <Input id="email" type="email" value={email} readOnly className="bg-inset" aria-readonly />
        </Field>
        {choosing && (
          <Field htmlFor="password" label={mode === "reset" ? "New password" : "Choose a password"}
            message={err ? { tone: "danger", text: err } : pw ? { tone: strength === "Strong" ? "success" : strength === "Fair" ? "neutral" : "warning", text: `Password strength: ${strength}` } : undefined}>
            <Input id="password" name="password" type="password" autoComplete="new-password" required minLength={8} placeholder="At least 8 characters"
              value={pw} onChange={(e) => setPw(e.target.value)} state={err ? "error" : "default"} aria-describedby="password-msg" />
          </Field>
        )}
        {formError(state) && <Note tone="warning">{formError(state)}</Note>}
        <Button type="submit" size="lg" full loading={pending}>
          {mode === "reset" ? "Save my new password" : choosing ? "Save my report" : "Email me a link to confirm"}
        </Button>
      </form>
      {orderId && <Link href={`/reports/${orderId}`} className={buttonStyles({ variant: "text", full: true })}>Not now, just email it to me</Link>}
    </>
  );
}
