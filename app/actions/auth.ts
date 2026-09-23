"use server";

/**
 * Sign-in, password reset, account claim and order recovery (S-05, S-07,
 * S-18, S-19). There is no auth or email provider yet, so every action
 * validates its input and then says plainly that it isn't connected, instead
 * of claiming an email was sent. Wire the provider here; the screens already
 * handle success and error.
 */

export type AuthResult = { ok: true; email: string } | { ok: false; field?: "email" | "password"; error: string };

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const NOT_CONNECTED = "Sign-in isn't switched on yet. Your order page link is in your receipt email, or email hello@bluerocketagents.com and we'll send it.";

function email(form: FormData): string | AuthResult {
  const e = String(form.get("email") ?? "").trim().slice(0, 254);
  return EMAIL.test(e) ? e : { ok: false, field: "email", error: "Enter an email address like you@yourbusiness.com" };
}

export async function requestSignInLink(_: AuthResult | null, form: FormData): Promise<AuthResult> {
  const e = email(form);
  if (typeof e !== "string") return e;
  return { ok: false, error: NOT_CONNECTED };
}

export async function signInWithPassword(_: AuthResult | null, form: FormData): Promise<AuthResult> {
  const e = email(form);
  if (typeof e !== "string") return e;
  if (!String(form.get("password") ?? "")) return { ok: false, field: "password", error: "Enter your password." };
  return { ok: false, error: NOT_CONNECTED };
}

export async function requestPasswordReset(_: AuthResult | null, form: FormData): Promise<AuthResult> {
  const e = email(form);
  if (typeof e !== "string") return e;
  return { ok: false, error: NOT_CONNECTED };
}

export async function recoverOrder(_: AuthResult | null, form: FormData): Promise<AuthResult> {
  const e = email(form);
  if (typeof e !== "string") return e;
  return { ok: false, error: NOT_CONNECTED };
}

export async function claimAccount(_: AuthResult | null, form: FormData): Promise<AuthResult> {
  const password = String(form.get("password") ?? "");
  if (password.length < 8) return { ok: false, field: "password", error: "Use at least 8 characters." };
  return { ok: false, error: NOT_CONNECTED };
}
