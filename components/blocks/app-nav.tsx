import Link from "next/link";
import { Avatar } from "@/components/ui";
import { Brand } from "./brand";

/** Figma "App nav bar". `userName` shows the initials tile once auth exists. */
export function AppNav({ userName }: { userName?: string }) {
  return (
    <header className="flex items-center justify-between border-b border-hairline bg-raised px-nav-x py-nav-y">
      <Link href="/" aria-label="Blue Rocket Agents home" className="py-1.5"><Brand compact /></Link>
      <nav aria-label="Account" className="flex items-center gap-5 whitespace-nowrap type-body sm:gap-6">
        <Link href="/reports" className="py-3 font-semibold text-ink-2 hover:text-ink">My Reports</Link>
        <a href="mailto:hello@bluerocketagents.com" className="py-3 text-muted hover:text-ink">Help</a>
        {userName ? <Avatar name={userName} /> : <Link href="/sign-in" className="py-3 text-muted hover:text-ink">Sign in</Link>}
      </nav>
    </header>
  );
}
