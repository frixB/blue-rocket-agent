import Link from "next/link";
import { buttonStyles } from "@/components/ui";
import { cn } from "@/lib/cn";
import { Brand } from "./brand";

/**
 * Top nav on the dark landing page. Not in the Figma hero (it shows only the
 * logo); added so visitors and returning customers can reach sign-in and
 * their reports. Section links hide on small screens; the CTA always shows.
 */
export function SiteNav() {
  return (
    <nav aria-label="Main" className="mx-auto flex max-w-[68rem] items-center justify-between gap-3 rounded-full border border-hairline bg-raised/80 px-3 py-2 shadow-raised backdrop-blur-md sm:px-4">
      <Link href="/" aria-label="Blue Rocket Agents home"><Brand /></Link>
      <div className="flex items-center gap-1 whitespace-nowrap type-body sm:gap-2">
        <a href="#included" className="hidden rounded-full px-3 py-2 text-ink-2 transition-colors hover:bg-inset hover:text-ink lg:inline">What you get</a>
        <a href="#sample" className="hidden rounded-full px-3 py-2 text-ink-2 transition-colors hover:bg-inset hover:text-ink lg:inline">Sample</a>
        <a href="#pricing" className="hidden rounded-full px-3 py-2 text-ink-2 transition-colors hover:bg-inset hover:text-ink md:inline">Pricing</a>
        <Link href="/reports" className="hidden rounded-full px-3 py-2 text-ink-2 transition-colors hover:bg-inset hover:text-ink md:inline">My Reports</Link>
        <Link href="/sign-in" className="rounded-full px-3 py-2 text-ink-2 transition-colors hover:bg-inset hover:text-ink">Sign in</Link>
        <Link href="/order" className={cn(buttonStyles({ size: "sm" }), "hidden sm:inline-flex")}>Get started</Link>
      </div>
    </nav>
  );
}
