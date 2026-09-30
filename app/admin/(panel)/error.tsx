"use client";

import { useEffect } from "react";
import Link from "next/link";
import { TriangleAlert } from "lucide-react";
import { Button, Heading, IconTile, buttonStyles } from "@/components/ui";
import { cn } from "@/lib/cn";
import { adminGutter } from "@/components/blocks/admin/admin-page";

/**
 * An admin page that failed to load. Says so plainly, offers the retry that
 * usually works, and gives the error reference to quote if it doesn't.
 */
export default function AdminError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => { console.error(error); }, [error]);
  return (
    <main id="main" className={cn("flex w-full flex-col pb-page-bottom pt-10", adminGutter)}>
      <div data-card="" role="alert" className="flex max-w-xl flex-col items-start gap-4 rounded-card border border-hairline bg-raised p-card">
        <IconTile icon={TriangleAlert} tone="danger" size="md" />
        <Heading as="h1" variant="h2">This page didn&apos;t load</Heading>
        <p className="type-body text-ink-2">
          Nothing was changed. Try again; if it keeps failing, send the reference below to Rasa or Carlos.
        </p>
        {error.digest && <p className="type-caption text-muted">Reference: <span className="tabular-nums">{error.digest}</span></p>}
        <div className="flex flex-wrap gap-3">
          <Button onClick={reset}>Try again</Button>
          <Link href="/admin" className={buttonStyles({ variant: "ghost" })}>Go to Overview</Link>
        </div>
      </div>
    </main>
  );
}
