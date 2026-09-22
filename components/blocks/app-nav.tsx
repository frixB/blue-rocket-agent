import Link from "next/link";
import { IconTile } from "@/components/ui";

export function AppNav() {
  return (
    <header className="flex items-center justify-between border-b border-hairline bg-raised px-[var(--nav-padding-x)] py-[var(--nav-padding-y)]">
      <Link href="/" className="flex items-center gap-3 type-body-strong text-ink">
        <IconTile emoji="🚀" tone="warning" size="sm" />
        Blue Rocket Agents
      </Link>
      <nav aria-label="Account" className="flex items-center gap-6 type-body-sm">
        <Link href="/reports/demo-running" className="font-semibold text-ink-2 hover:text-ink">My Reports</Link>
        <a href="mailto:hello@bluerocketagents.com" className="text-muted hover:text-ink">Help</a>
      </nav>
    </header>
  );
}
