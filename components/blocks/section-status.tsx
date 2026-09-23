import { IconTile } from "@/components/ui";
import { cn } from "@/lib/cn";
import type { ReportSection } from "@/lib/orders/types";
import { REPORT_SECTIONS } from "./report-sections";

/** Figma "Report section card / complete | unavailable" (S-09): one line per section. */
export function SectionStatusList({ sections }: { sections: ReportSection[] }) {
  return (
    <ul className="flex flex-col gap-2.5">
      {sections.map((s) => {
        const meta = REPORT_SECTIONS[s.key];
        const missing = s.state === "unavailable";
        return (
          <li key={s.key} className={cn("flex items-center gap-3.5 rounded-lg border px-4 py-3.5", missing ? "border-warning-accent bg-warning" : "border-hairline bg-sunken")}>
            <IconTile icon={meta.icon} size="sm" className={missing ? "bg-raised" : undefined} />
            <div className="flex min-w-0 flex-col">
              <span className="type-body-strong text-ink">{meta.name}</span>
              <span className={cn("type-body-sm", missing ? "text-warning-ink" : "text-muted")}>
                {missing ? `Unavailable · ${s.reason}` : `Complete · ${s.findings.length} ${s.findings.length === 1 ? "finding" : "findings"}`}
              </span>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
