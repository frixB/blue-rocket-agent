import Link from "next/link";
import type { Route } from "next";
import { ArrowRight } from "lucide-react";
import { CardTitle, Icon } from "@/components/ui";

/** The title row every Overview card shares: title and note on the left, a link or badge on the right. */
export function CardHeader({ id, title, note, link, aside }: {
  id: string; title: string; note?: string; link?: { href: Route; label: string }; aside?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-start justify-between gap-3 pb-2 sm:flex-row sm:gap-4">
      <div className="flex min-w-0 flex-col gap-1">
        <CardTitle id={id}>{title}</CardTitle>
        {note && <p className="type-caption text-muted">{note}</p>}
      </div>
      {(link || aside) && (
        <div className="flex w-full flex-wrap items-center justify-between gap-3 sm:w-auto sm:justify-end">
          {link && (
            <Link href={link.href} className="group flex shrink-0 items-center gap-1 py-1 pointer-coarse:min-h-11 type-body-sm font-semibold text-ink-2 hover:text-ink">
              {link.label} <Icon icon={ArrowRight} size="sm" className="transition-transform group-hover:translate-x-0.5" />
            </Link>
          )}
          {aside}
        </div>
      )}
    </div>
  );
}
