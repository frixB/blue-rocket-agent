import type { Route } from "next";
import { redirect } from "next/navigation";
import { authEnabled, currentUser } from "@/auth";
import { findUserByEmail } from "@/lib/db";
import { getAccount, type Account } from "@/lib/orders/fixtures";

/**
 * The customer for a portal page. With sign-in on, no session sends you to
 * /sign-in and back here afterwards; with it off (no DATABASE_URL /
 * AUTH_SECRET), the sample account keeps the review build browsable.
 */
export async function requireCustomer(path: string): Promise<Account> {
  if (!authEnabled) return getAccount();
  const user = await currentUser();
  if (!user) redirect(`/sign-in?callbackUrl=${encodeURIComponent(path)}` as Route);
  const row = await findUserByEmail(user.email);
  return { name: row?.name ?? user.name, email: user.email, emailVerified: Boolean(row?.emailVerified) };
}

/** Same-site path to return to after sign-in, from Auth.js's callbackUrl. */
export function nextPath(callbackUrl: string | string[] | undefined): string | undefined {
  const raw = Array.isArray(callbackUrl) ? callbackUrl[0] : callbackUrl;
  if (!raw) return undefined;
  try {
    const u = new URL(raw, "http://local");
    const path = u.pathname + u.search;
    return u.origin === "http://local" || u.origin === process.env.AUTH_URL ? (path.startsWith("//") ? undefined : path) : undefined;
  } catch {
    return undefined;
  }
}
