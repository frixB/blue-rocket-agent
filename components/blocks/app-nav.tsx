import Link from "next/link";
import { Rocket } from "lucide-react";
import { Avatar, IconTile } from "@/components/ui";

/** Figma "App nav bar". `userName` shows the initials tile once auth exists. */
export function AppNav({ userName }: { userName?: string }) {
  return (
    <header className="flex items-center justify-between border-b border-hairline bg-raised px-nav-x py-nav-y">
      <Link href="/" className="flex items-center gap-3 type-body-lg font-bold text-ink">
        <IconTile icon={Rocket} tone="action" size="xs" className="rounded-2xl" />
        Blue Rocket Agents
      </Link>
      <nav aria-label="Account" className="flex items-center gap-6 type-body">
        <Link href="/reports/demo-running" className="font-semibold text-ink-2 hover:text-ink">My Reports</Link>
        <a href="mailto:hello@bluerocketagents.com" className="text-muted hover:text-ink">Help</a>
        {userName && <Avatar name={userName} />}
      </nav>
    </header>
  );
}
