"use server";

import type { Route } from "next";
import { AuthError } from "next-auth";
import { redirect } from "next/navigation";
import { AccountLocked, authEnabled, currentUser, devLinks, showDevLinks, signIn, signOut } from "@/auth";
import { db, findUserByEmail } from "@/lib/db";
import { getOrder } from "@/lib/orders/fixtures";
import { hashPassword } from "@/lib/password";

/**
 * Sign-in, password reset, account claim and order recovery (S-05, S-07,
 * S-18, S-18b, S-19, S-20), backed by Auth.js (auth.ts).
 *
 * Email-link flows answer "check your inbox" whether or not the address has
 * an account, so the forms can't be used to find out who is a customer.
 * Without DATABASE_URL and AUTH_SECRET every action says sign-in isn't on.
 */

export type AuthResult =
  | { ok: true; email: string; devLink?: string }
  | { ok: false; field?: "email" | "password"; error: string };

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const NOT_CONNECTED = "Sign-in isn't switched on yet. Your order page link is in your receipt email, or email hello@bluerocketagents.com and we'll send it.";
const SEND_FAILED = "We couldn't send the email just now. Please try again in a minute.";

/** Only same-site paths, so a crafted link can't bounce someone off-site after sign-in. */
function safeNext(value: FormDataEntryValue | null, fallback = "/reports"): string {
  const v = String(value ?? "");
  return v.startsWith("/") && !v.startsWith("//") && !v.startsWith("/api/") ? v : fallback;
}

function readEmail(form: FormData): string | AuthResult {
  const e = String(form.get("email") ?? "").trim().slice(0, 254);
  return EMAIL.test(e) ? e : { ok: false, field: "email", error: "Enter an email address like you@yourbusiness.com" };
}

/** Sends an Auth.js email link. Skips unknown addresses silently unless `anyone`. */
async function sendLink(email: string, redirectTo: string, anyone = false): Promise<AuthResult> {
  if (!anyone && !(await findUserByEmail(email))) return { ok: true, email };
  try {
    await signIn("resend", { email, redirectTo, redirect: false });
  } catch (e) {
    console.error("sign-in email failed", e);
    return { ok: false, error: SEND_FAILED };
  }
  return { ok: true, email, devLink: showDevLinks ? devLinks.get(email.toLowerCase()) : undefined };
}

export async function requestSignInLink(_: AuthResult | null, form: FormData): Promise<AuthResult> {
  const e = readEmail(form);
  if (typeof e !== "string") return e;
  if (!authEnabled) return { ok: false, error: NOT_CONNECTED };
  return sendLink(e, safeNext(form.get("next")));
}

export async function signInWithPassword(_: AuthResult | null, form: FormData): Promise<AuthResult> {
  const e = readEmail(form);
  if (typeof e !== "string") return e;
  const password = String(form.get("password") ?? "");
  if (!password) return { ok: false, field: "password", error: "Enter your password." };
  if (!authEnabled) return { ok: false, error: NOT_CONNECTED };
  try {
    await signIn("credentials", { email: e, password, redirectTo: safeNext(form.get("next")) });
  } catch (err) {
    if (err instanceof AccountLocked || (err instanceof AuthError && (err as { code?: string }).code === "locked")) {
      return { ok: false, error: "Too many attempts, so we've locked sign-in for 15 minutes. Email yourself a sign-in link instead." };
    }
    if (err instanceof AuthError) return { ok: false, field: "password", error: "Email or password is incorrect." };
    throw err; // the success redirect
  }
  return { ok: false, error: SEND_FAILED };
}

/** "Forgot your password?": a sign-in link that lands on the set-password screen. */
export async function requestPasswordReset(_: AuthResult | null, form: FormData): Promise<AuthResult> {
  const e = readEmail(form);
  if (typeof e !== "string") return e;
  if (!authEnabled) return { ok: false, error: NOT_CONNECTED };
  return sendLink(e, "/account/password");
}

export async function recoverOrder(_: AuthResult | null, form: FormData): Promise<AuthResult> {
  const e = readEmail(form);
  if (typeof e !== "string") return e;
  if (!authEnabled) return { ok: false, error: NOT_CONNECTED };
  return sendLink(e, "/reports");
}

async function savePassword(email: string, password: string) {
  await db!.query(
    `INSERT INTO users (email, password_hash) VALUES ($1, $2)
     ON CONFLICT (email) DO UPDATE SET password_hash = EXCLUDED.password_hash, failed_logins = 0, locked_until = NULL`,
    [email, await hashPassword(password)],
  );
}

/**
 * S-07. Setting a password proves nothing about who you are, so it needs a
 * session for the order's email. Without one, we email a link that brings
 * the customer back here signed in.
 */
export async function claimAccount(_: AuthResult | null, form: FormData): Promise<AuthResult> {
  if (!authEnabled) return { ok: false, error: NOT_CONNECTED };
  const order = await getOrder(String(form.get("orderId") ?? ""));
  if (!order) return { ok: false, error: "We couldn't find that order." };
  const user = await currentUser();
  if (user?.email.toLowerCase() !== order.email.toLowerCase()) return sendLink(order.email, `/claim/${order.id}`, true);
  const password = String(form.get("password") ?? "");
  if (password.length < 8) return { ok: false, field: "password", error: "Use at least 8 characters." };
  await savePassword(user.email, password);
  redirect(`/reports/${order.id}` as Route);
}

/** The set-password screen a reset link lands on. Needs a session. */
export async function setNewPassword(_: AuthResult | null, form: FormData): Promise<AuthResult> {
  if (!authEnabled) return { ok: false, error: NOT_CONNECTED };
  const user = await currentUser();
  if (!user) return { ok: false, error: "Your sign-in link has expired. Ask for a new one." };
  const password = String(form.get("password") ?? "");
  if (password.length < 8) return { ok: false, field: "password", error: "Use at least 8 characters." };
  await savePassword(user.email, password);
  redirect("/reports");
}

export async function signOutAction() {
  await signOut({ redirectTo: "/signed-out" });
}
