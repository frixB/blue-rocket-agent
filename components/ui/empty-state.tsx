import { IconTile } from "./icon-tile";
import type { LucideIcon } from "./icon";

/** Figma "Empty state", S-16 My Reports with nothing bought yet. */
export function EmptyState({ icon, title, body, action }: { icon: LucideIcon; title: string; body: string; action?: React.ReactNode }) {
  return (
    <div className="flex flex-col items-center gap-4 rounded-card border border-hairline bg-raised px-card py-12 text-center">
      <IconTile icon={icon} tone="info" size="xl" />
      <h2 className="type-heading-h4 text-ink">{title}</h2>
      <p className="max-w-md type-body text-ink-2">{body}</p>
      {action}
    </div>
  );
}
