import Link from "next/link";
import { IconTile, buttonStyles } from "@/components/ui";

export default function NotFound() {
  return (
    <main data-theme="marketing" className="flex min-h-dvh flex-col items-center justify-center gap-5 bg-page px-5 text-center text-ink">
      <IconTile emoji="🚀" size="xl" />
      <h1 className="type-display">This page has drifted off course</h1>
      <p className="type-body-lg max-w-md text-ink-2">The link may be broken, or the page may have moved. Your reports are all still in your dashboard.</p>
      <Link href="/" className={buttonStyles()}>Back to home</Link>
    </main>
  );
}
