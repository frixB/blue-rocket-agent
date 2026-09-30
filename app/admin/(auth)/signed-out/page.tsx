import type { Metadata } from "next";
import Link from "next/link";
import { Clock } from "lucide-react";
import { Heading, IconTile, buttonStyles } from "@/components/ui";
import { safeNext } from "@/lib/admin/auth-gate";

export const metadata: Metadata = { title: "Signed out · Admin · Blue Rocket Agents" };

/** Session expired. Signing back in returns to the page you were on. */
export default async function AdminSignedOut({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  const next = safeNext((await searchParams).next);
  return (
    <>
      <IconTile icon={Clock} tone="info" size="lg" />
      <div className="flex flex-col gap-2">
        <Heading as="h1" variant="h2">You&apos;ve been signed out</Heading>
        <p className="type-body text-ink-2">For security, admin sessions end after a set time. Nothing you saved is lost.</p>
      </div>
      <Link href={`/admin/sign-in?next=${encodeURIComponent(next)}`} className={buttonStyles({ size: "lg", full: true })}>Sign back in</Link>
    </>
  );
}
