import { cn } from "@/lib/cn";

const tones = { neutral: "text-ink", danger: "text-danger-accent", warning: "text-warning-ink" } as const;

export function Stat({ value, label, tone = "neutral" }: { value: string; label: string; tone?: keyof typeof tones }) {
  return (
    <div className="flex flex-1 flex-col gap-1 rounded-lg border border-hairline bg-sunken p-5">
      <span className={cn("type-heading-h1", tones[tone])}>{value}</span>
      <span className="type-caption text-muted">{label}</span>
    </div>
  );
}
