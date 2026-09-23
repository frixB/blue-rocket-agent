import { Heading } from "./heading";
import { IconTile } from "./icon-tile";
import type { LucideIcon } from "./icon";

/** Figma "Empty state", S-16 My Reports with nothing bought yet. */
export function EmptyState({ icon, title, body, action }: { icon: LucideIcon; title: string; body: string; action?: React.ReactNode }) {
  return (
    <div className="flex flex-col items-center gap-4 rounded-card border border-hairline bg-raised px-card py-18 text-center">
      <IconTile icon={icon} tone="warning" size="xl" />
      <Heading as="h2" variant="h2">{title}</Heading>
      <p className="max-w-md type-body text-ink-2">{body}</p>
      {action}
    </div>
  );
}
