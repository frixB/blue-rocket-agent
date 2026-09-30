import type { Metadata } from "next";
import { AdminSignInForm, type SignInPreview } from "@/components/blocks/admin/admin-auth-forms";
import { safeNext } from "@/lib/admin/auth-gate";
import { previewEnabled } from "@/lib/preview";

export const metadata: Metadata = { title: "Sign in · Admin · Blue Rocket Agents" };

/** Step one of admin sign-in. Review builds: `?preview=error` (wrong password), `?preview=locked`. */
export default async function AdminSignIn({ searchParams }: { searchParams: Promise<{ next?: string; preview?: string; signed_out?: string }> }) {
  const sp = await searchParams;
  const preview: SignInPreview = previewEnabled && (sp.preview === "error" || sp.preview === "locked") ? sp.preview : undefined;
  return <AdminSignInForm next={safeNext(sp.next)} preview={preview} signedOut={sp.signed_out === "1"} />;
}
