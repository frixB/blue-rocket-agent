import type { Metadata } from "next";
import { AdminVerifyForm } from "@/components/blocks/admin/admin-auth-forms";
import { safeNext } from "@/lib/admin/auth-gate";
import { previewEnabled } from "@/lib/preview";

export const metadata: Metadata = { title: "Enter your code · Admin · Blue Rocket Agents" };

/** Step two of admin sign-in: the authenticator code. Review builds: `?preview=error`. */
export default async function AdminVerify({ searchParams }: { searchParams: Promise<{ next?: string; preview?: string }> }) {
  const sp = await searchParams;
  return <AdminVerifyForm next={safeNext(sp.next)} preview={previewEnabled && sp.preview === "error" ? "error" : undefined} />;
}
