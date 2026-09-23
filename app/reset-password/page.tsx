import { ContextLayout } from "@/components/blocks/context-layout";
import { ResetPasswordForm } from "@/components/blocks/auth-forms";
import { Modal } from "@/components/ui";
import { previewParam } from "@/lib/preview-param";

/** Asks for an email, then S-19 Password reset link sent (7368:65). `?preview=sent` shows S-19. */
export default async function ResetPassword({ searchParams }: { searchParams: Promise<{ preview?: string }> }) {
  const preview = previewParam((await searchParams).preview);
  return (
    <ContextLayout title="A fresh start." lead="Check your email for the next step to regain access.">
      <Modal aria-label="Reset your password"><ResetPasswordForm preview={preview} /></Modal>
    </ContextLayout>
  );
}
