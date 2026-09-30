import { ContextLayout } from "@/components/blocks/context-layout";
import { PasswordSignInForm } from "@/components/blocks/auth-forms";
import { Modal } from "@/components/ui";
import type { Route } from "next";
import { redirect } from "next/navigation";
import { currentUser } from "@/auth";
import { nextPath } from "@/lib/customer";
import { previewParam } from "@/lib/preview-param";

/** S-18b (7368:43). `?preview=error` shows the wrong-password state. */
export default async function PasswordSignIn({ searchParams }: { searchParams: Promise<{ preview?: string; callbackUrl?: string }> }) {
  const sp = await searchParams;
  const preview = previewParam(sp.preview);
  const next = nextPath(sp.callbackUrl);
  if (await currentUser()) redirect((next ?? "/reports") as Route);
  return (
    <ContextLayout title="Welcome back." lead="Sign in to pick up where you left off.">
      <Modal aria-label="Sign in with a password"><PasswordSignInForm preview={preview} next={next} /></Modal>
    </ContextLayout>
  );
}
