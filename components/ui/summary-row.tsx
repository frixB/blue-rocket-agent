import { cn } from "@/lib/cn";

export function SummaryRow({ label, value, emphasis }: { label: string; value: React.ReactNode; emphasis?: boolean }) {
  return (
    <div className="flex items-center justify-between gap-4 py-3">
      <dt className="type-body-sm text-muted">{label}</dt>
      <dd className={cn("text-right", emphasis ? "type-heading-h4 text-warning-ink" : "type-body-sm-strong text-ink")}>{value}</dd>
    </div>
  );
}
