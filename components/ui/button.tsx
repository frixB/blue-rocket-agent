import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/cn";

export const buttonStyles = cva(
  "inline-flex items-center justify-center gap-2 rounded-control font-semibold transition-colors " +
    "disabled:pointer-events-none disabled:bg-disabled disabled:text-muted",
  {
    variants: {
      variant: {
        primary: "bg-action text-on-action hover:bg-action-hover",
        secondary: "bg-action-2 text-ink-2 border border-hairline hover:bg-inset",
        ghost: "text-muted hover:text-ink",
        danger: "bg-danger text-danger-ink hover:bg-danger-accent hover:text-on-action",
      },
      size: {
        sm: "h-9 px-4 text-sm",
        md: "h-12 px-5 text-base",
        lg: "h-15 px-5 text-base",
      },
      full: { true: "w-full" },
    },
    defaultVariants: { variant: "primary", size: "md" },
  },
);

type Props = React.ButtonHTMLAttributes<HTMLButtonElement> & VariantProps<typeof buttonStyles> & { loading?: boolean };

export function Button({ className, variant, size, full, loading, children, disabled, ...props }: Props) {
  return (
    <button
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
