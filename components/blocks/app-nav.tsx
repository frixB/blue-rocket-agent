import Link from "next/link";
import { Avatar } from "@/components/ui";
import { Brand } from "./brand";

/** Figma "App nav bar". `userName` shows the initials tile once auth exists. */
export function AppNav({ userName }: { userName?: string }) {
  return (
    <header className="flex items-center justify-between border-b border-hairline bg-raised px-nav-x py-nav-y">
      <Link href="/" aria-label="Blue Rocket Agents home"><Brand /></Link>
      <nav aria-label="Account" className="flex items-center gap-6 type-body">
        <Link href="/reports/demo-running" className="font-semibold text-ink-2 hover:text-ink">My Reports</Link>
        <a href="mailto:hello@bluerocketagents.com" className="text-muted hover:text-ink">Help</a>
        {userName && <Avatar name={userName} />}
      </nav>
    </header>
  );
}
