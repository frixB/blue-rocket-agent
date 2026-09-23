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
    <nav aria-label="Main" className="flex items-center justify-between gap-3">
      <Link href="/" aria-label="Blue Rocket Agents home"><Brand /></Link>
      <div className="flex items-center gap-2 whitespace-nowrap type-body sm:gap-4">
        <a href="#included" className="hidden px-2 py-3 text-ink-2 hover:text-ink md:inline">What you get</a>
        <a href="#pricing" className="hidden px-2 py-3 text-ink-2 hover:text-ink md:inline">Pricing</a>
        <Link href="/reports" className="hidden px-2 py-3 text-ink-2 hover:text-ink sm:inline">My Reports</Link>
        <Link href="/sign-in" className="px-2 py-3 text-ink-2 hover:text-ink">Sign in</Link>
        <Link href="/order" className={cn(buttonStyles({ size: "sm" }), "hidden sm:inline-flex")}>Get started</Link>
      </div>
    </nav>
  );
}
