import Link from "next/link";
import { Rocket } from "lucide-react";
import { Heading, IconTile, buttonStyles } from "@/components/ui";

export default function NotFound() {
  return (
    <main data-theme="marketing" className="flex min-h-dvh flex-col items-center justify-center gap-5 bg-page px-5 text-center text-ink">
      <IconTile icon={Rocket} tone="action" size="xl" />
      <Heading variant="display">This page has drifted off course</Heading>
      <p className="type-body-lg max-w-md text-ink-2">The link may be broken, or the page may have moved. Your reports are all still in your dashboard.</p>
      <Link href="/" className={buttonStyles()}>Back to home</Link>
    </main>
  );
}
