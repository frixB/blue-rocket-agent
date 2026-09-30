import { previewEnabled } from "@/lib/preview";

/**
 * The admin sign-in gate, shared by proxy.ts (the early redirect) and
 * currentAdmin() (the real check on every page and action). No Next server
 * imports, so the proxy can use it.
 *
 * There is no auth provider yet. Until one is wired into `hasAdminSession`,
 * production has no way to be signed in: every admin page stops at sign-in.
 * A cookie alone never grants access in production, because anyone can set one.
 * Review builds skip the provider and are signed in unless the reviewer signed
 * out, so the panel and the sign-in screens can both be walked through.
 */
export const ADMIN_AUTH_CONNECTED = false;

/** Admins move money, so the bar is higher than the customer's 8. */
export const ADMIN_PASSWORD_MIN = 12;

/** Review builds only: set by Sign out, cleared by finishing sign-in. */
export const PREVIEW_SIGNED_OUT_COOKIE = "bra-admin-preview-signed-out";

/** Pages that must stay reachable while signed out. */
export const PUBLIC_ADMIN_PATHS = ["/admin/sign-in", "/admin/invite", "/admin/signed-out"] as const;

export const isPublicAdminPath = (path: string) =>
  PUBLIC_ADMIN_PATHS.some((p) => path === p || path.startsWith(`${p}/`));

type CookieReader = { get(name: string): { value: string } | undefined };

/** True when this request may see the admin panel. */
export function hasAdminSession(cookies: CookieReader): boolean {
  if (previewEnabled) return cookies.get(PREVIEW_SIGNED_OUT_COOKIE)?.value !== "1";
  if (!ADMIN_AUTH_CONNECTED) return false;
  // Wire the provider here: verify its signed session token, never just its presence.
  return false;
}

/**
 * Where to go after sign-in. Only admin paths on this site, so a crafted
 * `?next=` can't bounce a signed-in admin to another domain.
 */
export function safeNext(next: string | null | undefined): string {
  const admin = next === "/admin" || next?.startsWith("/admin/") || next?.startsWith("/admin?");
  if (!next || !admin || isPublicAdminPath(next.split("?")[0]!)) return "/admin";
  return next;
}
