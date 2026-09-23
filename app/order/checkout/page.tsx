import Link from "next/link";
import { ArrowRight, Lock } from "lucide-react";
import { ContextLayout } from "@/components/blocks/context-layout";
import { Heading, Icon, IconTile, Modal, Note, ProgressBar, buttonStyles } from "@/components/ui";
import { previewEnabled } from "@/lib/preview";

/**
 * S-02 (7368:90). Shown while we create the Stripe Checkout session and
 * redirect. Stripe is not connected yet: on local and preview builds a demo
 * link continues to a running order so the whole flow can be clicked
 * through. In production this screen does not move on until Stripe exists.
 */
export default function Checkout() {
  return (
    <ContextLayout title="One step closer." lead="Complete payment securely to start your report.">
      <Modal aria-labelledby="checkout-title" aria-busy>
        <IconTile icon={Lock} tone="warning" size="lg" />
        <div className="flex flex-col gap-2.5">
          <Heading as="h2" id="checkout-title">Taking you to Stripe…</Heading>
          <p className="type-body text-ink-2">Don&apos;t close this window. You&apos;ll come straight back here after paying.</p>
        </div>
        <ProgressBar value={30} label="Connecting to Stripe" />
        <Note>No charge has been made yet. If this takes more than 10 seconds, you can safely try again.</Note>
        {previewEnabled && (
          <Link href="/reports/demo-running" className={buttonStyles({ variant: "ghost", full: true })}>
            Demo only: continue as if payment went through <Icon icon={ArrowRight} size="sm" />
          </Link>
        )}
      </Modal>
    </ContextLayout>
  );
}
