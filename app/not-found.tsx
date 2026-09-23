import Link from "next/link";
import { Rocket } from "lucide-react";
import { SystemMessage } from "@/components/blocks/system-message";
import { buttonStyles } from "@/components/ui";

/** S-21a 404 not found (7369:298). */
export default function NotFound() {
  return (
    <SystemMessage icon={Rocket} title="This page has drifted off course"
      body="The link may be broken, or the page may have moved. Your reports are all still in your dashboard.">
      <Link href="/reports" className={buttonStyles()}>Go to my reports</Link>
      <Link href="/" className={buttonStyles({ variant: "darkghost" })}>Back to home</Link>
    </SystemMessage>
  );
}
