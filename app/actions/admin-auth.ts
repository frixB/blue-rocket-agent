"use server";

import type { Route } from "next";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { ADMIN_PASSWORD_MIN, PREVIEW_SIGNED_OUT_COOKIE, safeNext } from "@/lib/admin/auth-gate";
import { previewEnabled } from "@/lib/preview";

/**
 * Admin sign-in: password, then an authenticator code, plus invite set-up and
 * sign-out. There is no auth provider yet, so production validates the input
 * and says plainly that sign-in isn't connected. Review builds walk the flow
 * for real: any valid input moves to the next step. Wire the provider here;
 * the screens already handle each result.
 */

export type AdminAuthResult =
  | { ok: true }
  | { ok: false; field?: "email" | "password" | "code" | "confirm"; error: string };

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const NOT_CONNECTED = "Admin sign-in isn't switched on yet. Nobody can reach the admin until it is.";

const text = (form: FormData, key: string) => String(form.get(key) ?? "").trim();
const cookieOpts = { path: "/admin", sameSite: "lax" as const, httpOnly: true };

export async function adminSignIn(_: AdminAuthResult | null, form: FormData): Promise<AdminAuthResult> {
  const email = text(form, "email").slice(0, 254);
  if (!EMAIL.test(email)) return { ok: false, field: "email", error: "Enter your work email, like you@frixb.com" };
  if (!String(form.get("password") ?? "")) return { ok: false, field: "password", error: "Enter your password." };
  if (!previewEnabled) return { ok: false, error: NOT_CONNECTED };
  const next = safeNext(text(form, "next"));
  redirect(`/admin/sign-in/verify?next=${encodeURIComponent(next)}` as Route);
}

/** Six digits from the authenticator app, or a backup code like 4F7K-2QXM. */
export async function adminVerifyCode(_: AdminAuthResult | null, form: FormData): Promise<AdminAuthResult> {
  const backup = form.get("method") === "backup";
  const code = text(form, "code").replace(/\s/g, "").toUpperCase();
  const valid = backup ? /^[A-Z0-9]{4}-?[A-Z0-9]{4}$/.test(code) : /^\d{6}$/.test(code);
  if (!valid) {
    return { ok: false, field: "code", error: backup ? "Backup codes are 8 letters and numbers, like 4F7K-2QXM." : "Enter the 6-digit code from your authenticator app." };
  }
  if (!previewEnabled) return { ok: false, error: NOT_CONNECTED };
  (await cookies()).delete({ name: PREVIEW_SIGNED_OUT_COOKIE, path: "/admin" });
  redirect(safeNext(text(form, "next")) as Route); // safeNext only returns admin paths.
}

/** Last step of an invite: password, authenticator confirmed, backup codes saved. */
export async function adminCompleteInvite(_: AdminAuthResult | null, form: FormData): Promise<AdminAuthResult> {
  const password = String(form.get("password") ?? "");
  if (password.length < ADMIN_PASSWORD_MIN) return { ok: false, field: "password", error: `Use at least ${ADMIN_PASSWORD_MIN} characters.` };
  if (!/^\d{6}$/.test(text(form, "code"))) return { ok: false, field: "code", error: "Enter the 6-digit code your app shows now." };
  if (form.get("saved") !== "on") return { ok: false, field: "confirm", error: "Confirm you've saved your backup codes." };
  if (!previewEnabled) return { ok: false, error: NOT_CONNECTED };
  (await cookies()).delete({ name: PREVIEW_SIGNED_OUT_COOKIE, path: "/admin" });
  redirect("/admin");
}

export async function adminSignOut() {
  // Provider not connected: end its session here too.
  if (previewEnabled) (await cookies()).set(PREVIEW_SIGNED_OUT_COOKIE, "1", cookieOpts);
  redirect("/admin/sign-in?signed_out=1");
}
