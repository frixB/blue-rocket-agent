import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/cn";

/**
 * Variant names match the Figma layers: "Button / primary", "Button / ghost"
 * (outlined), "Button / text" (no chrome) and "Button / darkghost" (outlined,
 * on the dark marketing surface; the ghost variant covers it because the
 * tokens flip with data-theme).
 */
export const buttonStyles = cva(
  "inline-flex items-center justify-center gap-button-gap rounded-control font-semibold transition-colors " +
    "disabled:pointer-events-none disabled:bg-disabled disabled:text-muted",
  {
    variants: {
      variant: {
        primary: "bg-action text-on-action hover:bg-action-hover",
        ghost: "border border-hairline bg-action-2 text-ink-2 hover:bg-inset",
        text: "font-medium text-ink-2 hover:text-ink",
        danger: "bg-danger text-danger-ink hover:bg-danger-accent hover:text-on-action",
      },
      size: {
        sm: "min-h-control-sm px-4 py-1.5 text-sm",
        md: "min-h-control-md px-button-x py-2 text-base",
        lg: "min-h-control-xl px-button-x py-3 text-base",
      },
      full: { true: "w-full" },
    },
    compoundVariants: [{ variant: "text", class: "min-h-0 px-0 py-2" }],
    defaultVariants: { variant: "primary", size: "md" },
  },
);

type Props = React.ButtonHTMLAttributes<HTMLButtonElement> & VariantProps<typeof buttonStyles> & { loading?: boolean };

export function Button({ className, variant, size, full, loading, children, disabled, type = "button", ...props }: Props) {
  return (
    <button
      type={type}
      className={cn(buttonStyles({ variant, size, full }), className)}
      aria-busy={loading || undefined}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? <span aria-hidden className="size-4 animate-spin rounded-full border-2 border-current border-t-transparent" /> : null}
      {children}
    </button>
  );
}
