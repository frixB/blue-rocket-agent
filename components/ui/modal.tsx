import { cn } from "@/lib/cn";

const sizes = { sm: "max-w-modal-sm", md: "max-w-modal-md", lg: "max-w-modal-lg", xl: "max-w-modal-xl" } as const;

/**
 * Figma "Modal" (S-03, S-05, S-18, S-19, S-20). In the designs it is the
 * raised panel that sits beside the context column on the dark auth and
 * checkout screens, not an overlay, so this is presentational only. Give it
 * `role="dialog"` and a labelledby when it genuinely overlays a page.
 */
export function Modal({ size = "xl", className, ...props }: React.HTMLAttributes<HTMLElement> & { size?: keyof typeof sizes }) {
  return (
    <section
      data-theme="app"
      className={cn("flex w-full flex-col gap-modal-gap rounded-modal bg-raised p-modal text-ink shadow-overlay", sizes[size], className)}
      {...props}
    />
  );
}
