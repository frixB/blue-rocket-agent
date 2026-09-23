import { Check } from "lucide-react";
import { cn } from "@/lib/cn";
import { Icon } from "./icon";

type StepState = "done" | "active" | "pending";
const dot: Record<StepState, string> = { done: "bg-success text-success-ink", active: "bg-warning text-warning-ink", pending: "bg-inset text-muted" };

/** The numbered "What happens next" list on S-06: ✓ for done, the number otherwise. */
export function StepList({ steps }: { steps: { title: string; body: React.ReactNode; state: StepState }[] }) {
  return (
    <ol className="flex flex-col gap-4">
      {steps.map((s, i) => (
        <li key={s.title} className="flex items-start gap-3.5">
          <span className={cn("flex size-rail-marker shrink-0 items-center justify-center rounded-full text-xs font-bold", dot[s.state])}>
            {s.state === "done" ? <Icon icon={Check} size="sm" /> : <span aria-hidden>{i + 1}</span>}
            <span className="sr-only">{s.state === "done" ? "Done" : s.state === "active" ? "In progress" : "Next"}</span>
          </span>
          <div className="flex flex-col gap-0.5">
            <span className="type-body-strong text-ink">{s.title}</span>
            <span className="type-body-sm text-ink-2">{s.body}</span>
          </div>
        </li>
      ))}
    </ol>
  );
}
