"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import { Bookmark, Lock, Mail, Search } from "lucide-react";
import { Button, Field, Heading, IconTile, Input, Note, buttonStyles } from "@/components/ui";
import {
  claimAccount, recoverOrder, requestPasswordReset, requestSignInLink, signInWithPassword, type AuthResult,
} from "@/app/actions/auth";
import { passwordStrength } from "@/lib/password-strength";

type Action = (prev: AuthResult | null, form: FormData) => Promise<AuthResult>;
/** `preview` forces a Figma state for review; pages only pass it when previews are enabled. */
export type Preview = "sent" | "error" | undefined;
const PREVIEW_EMAIL = "bob@johnsonplumbing.com";

const errorFor = (s: AuthResult | null, field: "email" | "password") => (s && !s.ok && s.field === field ? s.error : undefined);
const formError = (s: AuthResult | null) => (s && !s.ok && !s.field ? s.error : undefined);

/** S-19 (7368:65): the "check your inbox" panel every email-link flow ends on. */
export function CheckInbox({ email, body, onResend }: { email: string; body: string; onResend: () => void }) {
  return (
    <>
      <IconTile icon={Mail} tone="success" size="lg" />
      <div className="flex flex-col gap-2.5">
        <Heading as="h2">Check your inbox</Heading>
        <p className="type-body text-ink-2">{body}</p>
      </div>
      <Note icon={Mail}>We sent it to {email}</Note>
      <a href="mailto:" className={buttonStyles({ full: true })}>Open email app</a>
      <Button variant="text" full onClick={onResend}>Didn&apos;t get it? Resend · Check your spam folder</Button>
    </>
  );
}

/** Header, email field and footer until the action succeeds; then the whole panel becomes S-19. */
function EmailFlow({ action, submit, preview, sentBody, header, footer }: {
  action: Action; submit: string; preview: Preview; sentBody: string; header: React.ReactNode; footer?: React.ReactNode;
}) {
  const [state, run, pending] = useActionState(action, null);
  const [reset, setReset] = useState(false);
  const sent = !reset && (state?.ok ? state.email : preview === "sent" ? PREVIEW_EMAIL : null);
  if (sent) return <CheckInbox email={sent} body={sentBody} onResend={() => setReset(true)} />;
  const err = errorFor(state, "email");
  return (
    <>
      {header}
      <form action={(f) => { setReset(false); run(f); }} className="flex flex-col gap-5">
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
export function SignInForm({ preview }: { preview: Preview }) {
  return (
    <div className="flex flex-col gap-5">
      <EmailFlow action={requestSignInLink} submit="Email me a sign-in link" preview={preview}
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
            <Link href="/sign-in/password" className={buttonStyles({ variant: "ghost", full: true })}>Sign in with a password</Link>
            <Link href="/recover" className={buttonStyles({ variant: "text", full: true })}>Paid but never made an account? Recover your order</Link>
          </>
        } />
    </div>
  );
}

/** S-18b (7368:43): the password form, and its wrong-password state. */
export function PasswordSignInForm({ preview }: { preview: Preview }) {
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

/** S-07 (7368:2): set a password on the account created at checkout. */
export function ClaimAccountForm({ email, orderId }: { email: string; orderId: string }) {
  const [state, run, pending] = useActionState(claimAccount, null);
  const [pw, setPw] = useState("");
  const strength = passwordStrength(pw);
  const err = errorFor(state, "password");
  return (
    <>
      <IconTile icon={Bookmark} tone="warning" size="lg" />
      <div className="flex flex-col gap-2.5">
        <Heading as="h2">Save your report</Heading>
        <p className="type-body text-ink-2">Set a password and your report stays in your dashboard for good. Anything you buy later lands in the same place.</p>
      </div>
      <form action={run} className="flex flex-col gap-5">
        <Field htmlFor="email" label="Email">
          <Input id="email" type="email" value={email} readOnly className="bg-inset" aria-readonly />
        </Field>
        <Field htmlFor="password" label="Choose a password"
          message={err ? { tone: "danger", text: err } : pw ? { tone: strength === "Strong" ? "success" : strength === "Fair" ? "neutral" : "warning", text: `Password strength: ${strength}` } : undefined}>
          <Input id="password" name="password" type="password" autoComplete="new-password" required minLength={8} placeholder="At least 8 characters"
            value={pw} onChange={(e) => setPw(e.target.value)} state={err ? "error" : "default"} aria-describedby="password-msg" />
        </Field>
        {formError(state) && <Note tone="warning">{formError(state)}</Note>}
        <Button type="submit" size="lg" full loading={pending}>Save my report</Button>
      </form>
      <Link href={`/reports/${orderId}`} className={buttonStyles({ variant: "text", full: true })}>Not now, just email it to me</Link>
    </>
  );
}
