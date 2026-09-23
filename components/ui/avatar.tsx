import { cn } from "@/lib/cn";

/** The initials tile at the right of the Figma "App nav bar". */
export function Avatar({ name, size = "md" }: { name: string; size?: "md" | "lg" }) {
  const initials = name.split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0]!.toUpperCase()).join("");
  return (
    <span
      role="img"
      aria-label={name}
      className={cn("inline-flex shrink-0 items-center justify-center rounded-2xl bg-inset text-ink-2", size === "md" ? "size-avatar type-body-lg" : "size-avatar-lg type-lead")}
    >
      <span aria-hidden>{initials}</span>
    </span>
  );
}
