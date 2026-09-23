import Link from "next/link";
import { CircleCheck } from "lucide-react";
import { ContextLayout } from "@/components/blocks/context-layout";
import { Heading, IconTile, Modal, buttonStyles } from "@/components/ui";

/** S-20 Session expired (7368:79). */
export default function SignedOut() {
  return (
    <ContextLayout title={<>Your work is<br />still here.</>} lead="Sign in again to return to your reports.">
      <Modal aria-labelledby="signed-out-title">
        <IconTile icon={CircleCheck} tone="info" size="lg" />
        <div className="flex flex-col gap-2.5">
          <Heading as="h2" id="signed-out-title">You&apos;ve been signed out</Heading>
          <p className="type-body text-ink-2">Sign back in to pick up where you left off. Your reports are safe and nothing was lost.</p>
        </div>
        <Link href="/sign-in" className={buttonStyles({ full: true })}>Sign back in</Link>
        <Link href="/" className={buttonStyles({ variant: "text", full: true })}>Not now</Link>
      </Modal>
    </ContextLayout>
  );
}
