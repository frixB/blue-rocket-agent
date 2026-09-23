import { cn } from "@/lib/cn";

/** Figma "Code block", S-08. For the few lines a customer has to paste somewhere. */
export function CodeBlock({ children, className, label }: { children: string; className?: string; label?: string }) {
  return (
    <pre aria-label={label} className={cn("overflow-x-auto rounded-lg bg-inverse p-4 font-mono text-sm text-on-inverse", className)}>
      <code>{children}</code>
    </pre>
  );
}
