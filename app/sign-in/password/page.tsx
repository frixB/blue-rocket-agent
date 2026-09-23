import { ContextLayout } from "@/components/blocks/context-layout";
import { PasswordSignInForm } from "@/components/blocks/auth-forms";
import { Modal } from "@/components/ui";
import { previewParam } from "@/lib/preview-param";

/** S-18b (7368:43). `?preview=error` shows the wrong-password state. */
export default async function PasswordSignIn({ searchParams }: { searchParams: Promise<{ preview?: string }> }) {
  const preview = previewParam((await searchParams).preview);
  return (
    <ContextLayout title="Welcome back." lead="Sign in to pick up where you left off.">
      <Modal aria-label="Sign in with a password"><PasswordSignInForm preview={preview} /></Modal>
    </ContextLayout>
  );
}
