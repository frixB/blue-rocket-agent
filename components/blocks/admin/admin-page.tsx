import Link from "next/link";
import type { Route } from "next";
import { ChevronLeft } from "lucide-react";
import { Icon } from "@/components/ui";
import { cn } from "@/lib/cn";
import { PageHeader } from "../page-header";

/**
 * Side gutter for every admin screen and the top bar, so they line up.
 * 64px from tablets and laptops, 128px from 1536px wide. Phones get 16px:
 * 64px would take a third of a 375px screen.
 */
export const adminGutter = "px-4 md:px-16 2xl:px-32";

/** Every admin screen: optional back link, serif title, one-line intro, action on the right. */
export function AdminPage({ title, intro, action, back, children }: {
  title: string; intro: string; action?: React.ReactNode; back?: { href: Route; label: string }; children: React.ReactNode;
}) {
  return (
    <main id="main" className={cn("flex w-full flex-col gap-8 pb-page-bottom pt-10", adminGutter)}>
      <div className="flex flex-col gap-3">
        {back && (
          <Link href={back.href} className="flex w-fit items-center gap-1 py-1 type-body-sm text-muted hover:text-ink">
            <Icon icon={ChevronLeft} size="sm" /> {back.label}
          </Link>
        )}
        <PageHeader title={title} intro={intro} action={action} />
      </div>
      {children}
    </main>
  );
}
