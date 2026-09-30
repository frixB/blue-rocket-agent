import type { Route } from "next";
import { redirect } from "next/navigation";
import { authEnabled, currentUser } from "@/auth";
import { ContextLayout } from "@/components/blocks/context-layout";
import { ClaimAccountForm } from "@/components/blocks/auth-forms";
import { Modal } from "@/components/ui";

/** Where a "Forgot your password?" link lands (S-19 → here), signed in by the link itself. */
export default async function ChooseNewPassword() {
  const user = await currentUser();
  if (!authEnabled || !user) redirect("/reset-password" as Route);
  return (
    <ContextLayout title="A fresh start." lead="Choose a new password, then pick up where you left off.">
      <Modal aria-label="Choose a new password"><ClaimAccountForm email={user.email} mode="reset" /></Modal>
    </ContextLayout>
  );
}
