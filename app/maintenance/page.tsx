import { CircleCheck, Wrench } from "lucide-react";
import { SystemMessage } from "@/components/blocks/system-message";
import { Icon, buttonStyles } from "@/components/ui";

export const metadata = { title: "Down for maintenance · Blue Rocket Agents", robots: { index: false } };

/**
 * S-21b Maintenance (7369:308). Point traffic here during planned downtime.
 * MAINTENANCE_BACK_BY is shown as-is, e.g. "03:00 UTC".
 */
export default function Maintenance() {
  const backBy = process.env.MAINTENANCE_BACK_BY;
  return (
    <SystemMessage icon={Wrench} title="We're down for scheduled maintenance"
      body={`${backBy ? `We'll be back by ${backBy}.` : "We'll be back shortly."} Nothing you have bought is affected.`}>
      <p className="flex items-center gap-2.5 rounded-full bg-success px-5 py-3 type-body-sm-strong text-success-ink">
        <Icon icon={CircleCheck} size="sm" /> Reports already running are unaffected and will still be delivered
      </p>
      <div className="basis-full" />
      <a href="mailto:hello@bluerocketagents.com" className={buttonStyles({ variant: "darkghost" })}>Email support</a>
    </SystemMessage>
  );
}
