import Link from "next/link";
import { buttonStyles } from "@/components/ui";
import { cn } from "@/lib/cn";
import { Brand } from "./brand";

/**
 * Top nav on the dark landing page, sticky so the buy action is always one
 * tap away. Section links hide on small screens; the logo drops its wordmark
 * on phones so Sign in and the CTA both fit at 375px. Sign in covers
 * returning customers: signed-in visitors go straight to My Reports.
 */
export function SiteNav() {
  return (
    <nav aria-label="Main" className="mx-auto flex max-w-[68rem] items-center justify-between gap-2 rounded-full border border-hairline bg-raised/80 py-1.5 pl-2 pr-1.5 shadow-raised backdrop-blur-md sm:gap-3 sm:py-2 sm:pl-3 sm:pr-2">
      <Link href="/" aria-label="Blue Rocket Agents home" className="rounded-full"><Brand compact /></Link>
      <div className="flex items-center gap-1 whitespace-nowrap type-body sm:gap-2">
        <a href="#included" className="hidden rounded-full px-3 py-2 text-ink-2 transition-colors hover:bg-inset hover:text-ink lg:inline">What you get</a>
        <a href="#sample" className="hidden rounded-full px-3 py-2 text-ink-2 transition-colors hover:bg-inset hover:text-ink lg:inline">Example report</a>
        <a href="#pricing" className="hidden rounded-full px-3 py-2 text-ink-2 transition-colors hover:bg-inset hover:text-ink md:inline">Pricing</a>
        <Link href="/sign-in" className="rounded-full px-3 py-2 text-ink-2 transition-colors hover:bg-inset hover:text-ink">Sign in</Link>
        <Link href="/order" className={cn(buttonStyles({ size: "sm" }), "landing-primary rounded-full")}>Get my SEO report</Link>
      </div>
    </nav>
  );
}
