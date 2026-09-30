"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Check, Copy, Download, KeyRound, Lock, ShieldCheck, Smartphone } from "lucide-react";
import { Button, Checkbox, Field, Heading, Icon, IconTile, Input, Note, buttonStyles } from "@/components/ui";
import { adminCompleteInvite, adminSignIn, adminVerifyCode, type AdminAuthResult } from "@/app/actions/admin-auth";
import { ADMIN_PASSWORD_MIN } from "@/lib/admin/auth-gate";
import { passwordStrength } from "@/lib/password-strength";

type FieldName = "email" | "password" | "code" | "confirm";
const fieldError = (s: AdminAuthResult | null, f: FieldName) => (s && !s.ok && s.field === f ? s.error : undefined);
const formError = (s: AdminAuthResult | null) => (s && !s.ok && !s.field ? s.error : undefined);
const danger = (text?: string) => (text ? { tone: "danger" as const, text } : undefined);

export type SignInPreview = "error" | "locked" | undefined;

/** Email and password. The code step comes next, on its own screen. */
export function AdminSignInForm({ next, preview, signedOut }: { next: string; preview: SignInPreview; signedOut?: boolean }) {
  const [state, run, pending] = useActionState(adminSignIn, null);
  const locked = preview === "locked";
  const wrong = preview === "error";
  const emErr = fieldError(state, "email");
  const pwErr = fieldError(state, "password") ?? (wrong ? "Email or password is incorrect." : undefined);
  return (
    <>
      <div className="flex flex-col gap-2">
        <Heading as="h1" variant="h2">Sign in to the admin</Heading>
        <p className="type-body text-ink-2">Use your work email. You&apos;ll confirm with your authenticator app next.</p>
      </div>
      {signedOut && !state && <Note tone="success">You&apos;re signed out.</Note>}
      {locked && <Note tone="warning" icon={Lock}>Too many attempts. Sign-in is locked for 15 minutes. If you&apos;re stuck, ask Rasa or Carlos to reset your access.</Note>}
      <form action={run} className="flex flex-col gap-5">
        <input type="hidden" name="next" value={next} />
        <Field htmlFor="email" label="Work email" message={danger(emErr)}>
          <Input id="email" name="email" type="email" autoComplete="username" required disabled={locked}
            defaultValue={wrong ? "nimali@frixb.com" : undefined} state={emErr ? "error" : "default"} aria-describedby="email-msg" />
        </Field>
        <Field htmlFor="password" label="Password"
          message={pwErr ? { tone: "danger", text: wrong ? <>{pwErr} After 5 tries, sign-in locks for 15 minutes.</> : pwErr } : undefined}>
          <Input id="password" name="password" type="password" autoComplete="current-password" required disabled={locked}
            state={pwErr ? "error" : "default"} aria-describedby="password-msg" />
        </Field>
        {formError(state) && <Note tone="warning">{formError(state)}</Note>}
        <Button type="submit" size="lg" full loading={pending} disabled={locked}>Continue</Button>
      </form>
    </>
  );
}

/** The second factor: six digits from the app, or one backup code. */
export function AdminVerifyForm({ next, preview }: { next: string; preview: "error" | undefined }) {
  const [state, run, pending] = useActionState(adminVerifyCode, null);
  const [backup, setBackup] = useState(false);
  const input = useRef<HTMLInputElement>(null);
  const err = fieldError(state, "code") ?? (preview === "error" && !backup ? "That code didn't work. Codes change every 30 seconds, so enter the one showing now." : undefined);
  return (
    <>
      <IconTile icon={backup ? KeyRound : Smartphone} tone="info" size="lg" />
      <div className="flex flex-col gap-2">
        <Heading as="h1" variant="h2">{backup ? "Use a backup code" : "Enter your code"}</Heading>
        <p className="type-body text-ink-2">
          {backup ? "Each backup code works once. Set up your authenticator again after you sign in." : "Open your authenticator app and enter the 6-digit code for Blue Rocket Agents."}
        </p>
      </div>
      <form action={run} className="flex flex-col gap-5">
        <input type="hidden" name="next" value={next} />
        <input type="hidden" name="method" value={backup ? "backup" : "app"} />
        <Field htmlFor="code" label={backup ? "Backup code" : "6-digit code"} message={danger(err)}>
          <Input key={backup ? "backup" : "app"} ref={input} id="code" name="code" required autoFocus
            {...(backup
              ? { autoComplete: "off", placeholder: "4F7K-2QXM", maxLength: 9, className: "uppercase tracking-wider" }
              : { inputMode: "numeric", autoComplete: "one-time-code", placeholder: "123456", maxLength: 6, pattern: "\\d{6}", className: "tabular-nums tracking-[0.3em]" })}
            state={err ? "error" : "default"} aria-describedby="code-msg" />
        </Field>
        {formError(state) && <Note tone="warning">{formError(state)}</Note>}
        <Button type="submit" size="lg" full loading={pending}>Sign in</Button>
      </form>
      <Button variant="text" full onClick={() => { setBackup((b) => !b); requestAnimationFrame(() => input.current?.focus()); }}>
        {backup ? "Use the authenticator app instead" : "Lost your phone? Use a backup code"}
      </Button>
      <Link href={`/admin/sign-in?next=${encodeURIComponent(next)}`} className={buttonStyles({ variant: "text", full: true })}>Back to sign in</Link>
    </>
  );
}

/** Review builds show this sample key; the provider supplies the real one per invite. */
const SAMPLE_KEY = "JBSW Y3DP EHPK 3PXP JBSW Y3DP";
const ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
function makeBackupCodes() {
  const bytes = crypto.getRandomValues(new Uint8Array(80));
  return Array.from({ length: 10 }, (_, i) => {
    const c = Array.from(bytes.slice(i * 8, i * 8 + 8), (b) => ALPHABET[b % ALPHABET.length]).join("");
    return `${c.slice(0, 4)}-${c.slice(4)}`;
  });
}

const STEPS = ["Choose a password", "Set up your authenticator", "Save your backup codes"] as const;

/**
 * Accepting an invite: password, authenticator, backup codes, in that order.
 * One form, so nothing typed is lost moving between steps; each step checks
 * its own field before moving on, and the server checks all three again.
 */
export function InviteSetup({ email, name, roleLabel, invitedBy, expiresInHours }: {
  email: string; name: string; roleLabel: string; invitedBy: string; expiresInHours: number;
}) {
  const [state, run, pending] = useActionState(adminCompleteInvite, null);
  const [step, setStep] = useState(0);
  const [pw, setPw] = useState("");
  const [code, setCode] = useState("");
  const [local, setLocal] = useState<{ field: FieldName; text: string } | null>(null);
  const [codes, setCodes] = useState<string[] | null>(null);
  const [copied, setCopied] = useState<"key" | "codes" | null>(null);
  const heading = useRef<HTMLHeadingElement>(null);
  const moved = useRef(false);

  // A new server error sends you back to the step that owns the field (adjusted during render, React's pattern for this).
  const [seen, setSeen] = useState(state);
  if (state !== seen) {
    setSeen(state);
    if (state && !state.ok && state.field) setStep(state.field === "password" ? 0 : state.field === "code" ? 1 : 2);
  }
  // Moving between steps puts focus on the new step's heading, so keyboard and screen reader users land in the right place.
  useEffect(() => {
    if (moved.current) heading.current?.focus();
    moved.current = true;
  }, [step]);

  const err = (f: FieldName) => (local?.field === f ? local.text : fieldError(state, f));
  const go = (to: number) => {
    if (to > step && step === 0 && pw.length < ADMIN_PASSWORD_MIN) return setLocal({ field: "password", text: `Use at least ${ADMIN_PASSWORD_MIN} characters.` });
    if (to > step && step === 1 && !/^\d{6}$/.test(code)) return setLocal({ field: "code", text: "Enter the 6-digit code your app shows now." });
    setLocal(null);
    if (to === 2 && !codes) setCodes(makeBackupCodes());
    setStep(to);
  };
  const copy = async (what: "key" | "codes", value: string) => {
    try { await navigator.clipboard.writeText(value); setCopied(what); setTimeout(() => setCopied(null), 2000); } catch { /* Clipboard blocked: the text stays on screen to copy by hand. */ }
  };
  const download = () => {
    if (!codes) return;
    const blob = new Blob([`Blue Rocket Agents admin backup codes for ${email}\nEach code works once.\n\n${codes.join("\n")}\n`], { type: "text/plain" });
    const a = Object.assign(document.createElement("a"), { href: URL.createObjectURL(blob), download: "blue-rocket-admin-backup-codes.txt" });
    a.click();
    URL.revokeObjectURL(a.href);
  };
  const strength = passwordStrength(pw);
  const otpauth = `otpauth://totp/Blue%20Rocket%20Agents:${encodeURIComponent(email)}?secret=${SAMPLE_KEY.replace(/\s/g, "")}&issuer=Blue%20Rocket%20Agents`;

  return (
    <>
      <div className="flex flex-col gap-2">
        <p className="type-caption-strong text-muted">Step {step + 1} of {STEPS.length}</p>
        <Heading as="h1" variant="h2" ref={heading} tabIndex={-1} className="outline-none">{STEPS[step]}</Heading>
        {step === 0 && (
          <p className="type-body text-ink-2">
            Hi {name}. {invitedBy} invited you to the admin as <span className="font-semibold text-ink">{roleLabel}</span>. This invite works for {expiresInHours} more hours.
          </p>
        )}
      </div>

      <form action={run} className="flex flex-col gap-5">
        <section hidden={step !== 0} className="flex flex-col gap-5">
          <Field htmlFor="invite-email" label="Work email">
            <Input id="invite-email" type="email" autoComplete="username" value={email} readOnly aria-readonly className="bg-inset" />
          </Field>
          <Field htmlFor="password" label="Password" hint={`At least ${ADMIN_PASSWORD_MIN} characters. A short sentence is easiest to remember.`}
            message={err("password") ? danger(err("password")) : pw ? { tone: strength === "Strong" ? "success" : strength === "Fair" ? "neutral" : "warning", text: `Strength: ${strength}` } : undefined}>
            <Input id="password" name="password" type="password" autoComplete="new-password" required minLength={ADMIN_PASSWORD_MIN}
              value={pw} onChange={(e) => setPw(e.target.value)} state={err("password") ? "error" : "default"} aria-describedby="password-hint password-msg" />
          </Field>
          <Button size="lg" full onClick={() => go(1)}>Continue</Button>
        </section>

        <section hidden={step !== 1} className="flex flex-col gap-5">
          <ol className="flex list-decimal flex-col gap-2 pl-5 type-body-sm text-ink-2">
            <li>Open an authenticator app: 1Password, Google Authenticator or Authy.</li>
            <li>Add an account and enter this setup key, or tap below on your phone.</li>
          </ol>
          <div className="flex flex-col gap-2 rounded-lg bg-page p-4">
            <span className="type-caption-strong text-muted">Setup key</span>
            <span className="flex flex-wrap items-center justify-between gap-3">
              <code className="type-body-strong tracking-wider text-ink">{SAMPLE_KEY}</code>
              <Button variant="ghost" size="sm" onClick={() => copy("key", SAMPLE_KEY.replace(/\s/g, ""))}>
                <Icon icon={copied === "key" ? Check : Copy} size="sm" /> {copied === "key" ? "Copied" : "Copy"}
              </Button>
            </span>
            <span className="type-caption text-muted">Review build: a sample key, not a real account.</span>
          </div>
          <a href={otpauth} className={buttonStyles({ variant: "ghost", full: true })}><Icon icon={Smartphone} size="sm" /> Open in authenticator app</a>
          <Field htmlFor="invite-code" label="Code from the app" message={danger(err("code"))}>
            <Input id="invite-code" name="code" inputMode="numeric" autoComplete="one-time-code" maxLength={6} placeholder="123456"
              value={code} onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))} className="tabular-nums tracking-[0.3em]"
              state={err("code") ? "error" : "default"} aria-describedby="invite-code-msg" />
          </Field>
          <div className="flex gap-3">
            <Button variant="ghost" size="lg" onClick={() => go(0)}>Back</Button>
            <Button size="lg" full onClick={() => go(2)}>Check code</Button>
          </div>
        </section>

        <section hidden={step !== 2} className="flex flex-col gap-5">
          <p className="type-body text-ink-2">If you lose your phone, each of these gets you in once. Keep them somewhere safe, like your password manager. You won&apos;t see them again.</p>
          <ul aria-label="Backup codes" className="grid grid-cols-2 gap-x-6 gap-y-2 rounded-lg bg-page p-4">
            {codes?.map((c) => <li key={c} className="type-body-strong tabular-nums tracking-wider text-ink">{c}</li>)}
          </ul>
          <div className="flex flex-wrap gap-3">
            <Button variant="ghost" size="sm" onClick={download}><Icon icon={Download} size="sm" /> Download</Button>
            <Button variant="ghost" size="sm" onClick={() => codes && copy("codes", codes.join("\n"))}>
              <Icon icon={copied === "codes" ? Check : Copy} size="sm" /> {copied === "codes" ? "Copied" : "Copy all"}
            </Button>
          </div>
          <div className="flex flex-col gap-2">
            <Checkbox name="saved" label="I've saved these codes somewhere safe." aria-describedby={err("confirm") ? "saved-msg" : undefined} />
            {err("confirm") && <p id="saved-msg" role="alert" className="type-caption-strong text-danger-ink">{err("confirm")}</p>}
          </div>
          {formError(state) && <Note tone="warning">{formError(state)}</Note>}
          <div className="flex gap-3">
            <Button variant="ghost" size="lg" onClick={() => go(1)}>Back</Button>
            <Button type="submit" size="lg" full loading={pending}><Icon icon={ShieldCheck} size="sm" /> Finish setup</Button>
          </div>
        </section>
      </form>
    </>
  );
}
