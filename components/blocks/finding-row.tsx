import { Chip } from "@/components/ui";
import type { Finding } from "@/lib/orders/types";

const tone = { critical: "danger", medium: "warning", pass: "success" } as const;
const label = { critical: "Critical", medium: "Medium", pass: "Pass" } as const;

export function FindingRow({ finding }: { finding: Finding }) {
  return (
    <li className="flex items-start gap-3.5 rounded-lg border border-hairline bg-sunken px-4 py-3.5">
      <Chip tone={tone[finding.severity]}>{label[finding.severity]}</Chip>
      <div className="flex flex-col gap-0.5">
        <span className="type-body-strong text-ink">{finding.title}</span>
        <span className="type-body-sm text-ink-2">{finding.body}</span>
      </div>
    </li>
  );
}
