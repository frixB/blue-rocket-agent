"use client";

import { useRouter } from "next/navigation";
import type { Route } from "next";
import { Select } from "@/components/ui";
import { cn } from "@/lib/cn";

/**
 * A secondary filter as one compact dropdown: picking an option opens its
 * URL, so filtered lists stay shareable. The labelled select is a real form
 * control, so it works with the keyboard and a screen reader as-is.
 */
export function FilterSelect({ id, label, value, options, className }: {
  id: string;
  label: string;
  value: string;
  options: { value: string; label: string; href: Route }[];
  className?: string;
}) {
  const router = useRouter();
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <label htmlFor={id} className="shrink-0 type-caption-strong text-muted">{label}</label>
      <Select id={id} value={value} className="h-control-sm min-w-44 type-body-sm pointer-coarse:h-11"
        onChange={(e) => {
          const next = options.find((o) => o.value === e.target.value);
          if (next) router.push(next.href);
        }}>
        {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
      </Select>
    </div>
  );
}
