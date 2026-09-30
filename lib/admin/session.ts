import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { previewEnabled } from "@/lib/preview";
import { hasAdminSession } from "./auth-gate";
import type { AdminUser } from "./types";

export const OWNER: AdminUser = { name: "Rasa", email: "rasa@frixb.com", role: "owner" };
export const OPS: AdminUser = { name: "Nimali", email: "nimali@frixb.com", role: "ops" };

export const ROLE_COOKIE = "bra-admin-preview-role";

/**
 * Who is signed in to the admin, checked on the server for every page and
 * action. No session means sign-in, whatever the proxy let through. Until an
 * auth provider is connected, production never has a session. Review builds
 * are signed in and can preview the Ops view with the sidebar switch.
 */
export async function currentAdmin(): Promise<AdminUser> {
  const jar = await cookies();
  if (!hasAdminSession(jar)) redirect("/admin/sign-in");
  if (!previewEnabled) redirect("/admin/sign-in"); // Provider not connected: return its user here.
  return jar.get(ROLE_COOKIE)?.value === "ops" ? OPS : OWNER;
}

export const isOwner = (u: AdminUser) => u.role === "owner";

/**
 * For owner-only server actions (refunds, stopping an auto-refund, settings).
 * Hiding a button is not a permission: every such action calls this first.
 */
export async function requireOwner(): Promise<AdminUser> {
  const user = await currentAdmin();
  if (!isOwner(user)) throw new Error("Owners only.");
  return user;
}
