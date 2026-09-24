import { Rocket } from "lucide-react";
import { IconTile } from "@/components/ui";
import { cn } from "@/lib/cn";

/**
 * The logo lockup: blue rocket tile + wordmark. `compact` hides the wordmark
 * on phones (it stays for screen readers) so a busy nav still fits at 375px.
 */
export function Brand({ compact }: { compact?: boolean }) {
  return (
    <span className="flex items-center gap-3 whitespace-nowrap type-body-lg font-bold text-ink">
      <IconTile icon={Rocket} tone="action" size="xs" className="rounded-2xl" />
      <span className={cn(compact && "max-sm:sr-only")}>Blue Rocket Agents</span>
    </span>
  );
}
