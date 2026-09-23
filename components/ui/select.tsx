import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/cn";
import { Icon } from "./icon";
import { inputStyles, type InputState } from "./input";

/** Figma "Dropdown", Form Step 1 Industry and Country. Native select, same states as Input. */
export function Select({ state = "default", className, children, ...props }: React.SelectHTMLAttributes<HTMLSelectElement> & { state?: InputState }) {
  return (
    <div className={cn(inputStyles({ state }), "relative", className)}>
      <select
        aria-invalid={state === "error" || undefined}
        className="h-full min-w-0 flex-1 cursor-pointer appearance-none bg-transparent pr-7 outline-none focus-visible:shadow-none"
        {...props}
      >
        {children}
      </select>
      <Icon icon={ChevronDown} className="pointer-events-none absolute right-input-x text-muted" />
    </div>
  );
}
