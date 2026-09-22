import { Check, Clock, X } from "lucide-react";
import { cn } from "@/lib/cn";
import type { StageState } from "@/lib/orders/status";
import { Icon, type LucideIcon } from "./icon";

/** Figma "Rail step / done | active | pending | sched | failed". */
const marker: Record<StageState, { cls: string; icon?: LucideIcon; sr: string }> = {
  done: { cls: "bg-success text-success-ink", icon: Check, sr: "Completed" },
  active: { cls: "bg-warning text-warning-ink", sr: "In progress" },
  pending: { cls: "bg-pending text-pending-ink", sr: "Not started" },
  scheduled: { cls: "bg-pending text-pending-ink", icon: Clock, sr: "Scheduled" },
  failed: { cls: "bg-danger text-danger-ink", icon: X, sr: "Stopped" },
};

export function TimelineStep({ index, label, meta, state, last }: { index: number; label: string; meta?: string; state: StageState; last?: boolean }) {
  const m = marker[state];
  const quiet = state === "pending" || state === "scheduled";
  return (
    <li className="flex gap-rail-gap" aria-current={state === "active" ? "step" : undefined}>
      <div className="flex flex-col items-center gap-1.5">
        <span className={cn("flex size-rail-marker items-center justify-center rounded-full text-xs font-bold", m.cls)}>
          {m.icon ? <Icon icon={m.icon} size="sm" /> : <span aria-hidden>{index}</span>}
          <span className="sr-only">{m.sr}</span>
        </span>
        {!last && <span aria-hidden className="h-rail-connector w-0.5 bg-hairline" />}
      </div>
      <div className="flex flex-col gap-0.5 pb-1">
        <span className={cn("type-body-strong", quiet ? "text-muted" : state === "failed" ? "text-danger-ink" : "text-ink")}>{label}</span>
        {meta && <span className={cn("type-caption", state === "failed" ? "text-danger-ink" : "text-muted")}>{meta}</span>}
      </div>
    </li>
  );
}
