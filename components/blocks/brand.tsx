import { Rocket } from "lucide-react";
import { IconTile } from "@/components/ui";

/** The logo lockup: blue rocket tile + wordmark. Matches the Figma nav and footer. */
export function Brand() {
  return (
    <span className="flex items-center gap-3 type-body-lg font-bold text-ink">
      <IconTile icon={Rocket} tone="action" size="xs" className="rounded-2xl" />
      Blue Rocket Agents
    </span>
  );
}
