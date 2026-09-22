import { cn } from "@/lib/cn";

/** Figma "Checkbox", Create your account. */
export function Checkbox({ label, className, ...props }: Omit<React.InputHTMLAttributes<HTMLInputElement>, "type"> & { label: React.ReactNode }) {
  return (
    <label className={cn("flex cursor-pointer items-start gap-2.5 type-body-sm text-ink-2", className)}>
      <input type="checkbox" className="mt-0.5 size-4.5 shrink-0 cursor-pointer rounded-xs accent-action" {...props} />
      <span>{label}</span>
    </label>
  );
}
