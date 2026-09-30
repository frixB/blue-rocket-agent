import { cn } from "@/lib/cn";
import { inputStyles, type InputState } from "./input";

/**
 * Multi-line Input. Same input/* tokens and states as Input, grows with its
 * rows instead of the fixed input height. First used by the admin finding
 * editor and the customer-facing reason on partial and blocked orders.
 */
export function Textarea({ state = "default", className, rows = 3, ...props }: React.ComponentProps<"textarea"> & { state?: InputState }) {
  return (
    // Same chrome as Input, but grows: the fixed h-input becomes a minimum.
    <div className={cn(inputStyles({ state }).replace(/\bh-input\b/, "min-h-input"), "items-stretch py-3", className)}>
      <textarea
        rows={rows}
        aria-invalid={state === "error" || undefined}
        className="min-w-0 flex-1 resize-y bg-transparent outline-none placeholder:text-input-placeholder focus-visible:shadow-none"
        {...props}
      />
    </div>
  );
}
