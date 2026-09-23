import { ContextLayout } from "@/components/blocks/context-layout";
import { RecoverOrderForm } from "@/components/blocks/auth-forms";
import { Modal } from "@/components/ui";
import { previewParam } from "@/lib/preview-param";

/** S-05 Recover your order (7358:35). `?preview=sent` shows the link-sent state. */
export default async function Recover({ searchParams }: { searchParams: Promise<{ preview?: string }> }) {
  const preview = previewParam((await searchParams).preview);
  return (
    <ContextLayout title={<>Your report.<br />Back within reach.</>} lead="Use your purchase email to return to your order and follow its progress.">
      <Modal aria-label="Recover your order"><RecoverOrderForm preview={preview} /></Modal>
    </ContextLayout>
  );
}
