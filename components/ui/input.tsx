import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/cn";

/**
 * Figma "Input" / "Text Input" / "URL Input" / "Password Input", S-01 and
 * Form Step 1. Every value comes from the input/* component tokens.
 * `warning` is S-01's "name mismatch": valid input, but check it.
 */
export const inputStyles = cva(
  "flex h-input w-full items-center gap-2 rounded-input border px-input-x type-body text-ink " +
    "has-[:focus-visible]:shadow-focus has-[:disabled]:opacity-60",
  {
    variants: {
      state: {
        default: "border-input-border bg-input",
        valid: "border-input-valid-border bg-input-valid",
        warning: "border-warning-accent bg-warning",
        error: "border-input-error-border bg-input-error",
      },
    },
    defaultVariants: { state: "default" },
  },
);

export type InputState = NonNullable<VariantProps<typeof inputStyles>["state"]>;

type Props = Omit<React.InputHTMLAttributes<HTMLInputElement>, "size"> & {
  state?: InputState;
  /** Trailing status glyph, e.g. <Icon icon={CircleCheck} />. */
  trailing?: React.ReactNode;
};

export function Input({ state = "default", trailing, className, ...props }: Props) {
  return (
    <div className={cn(inputStyles({ state }), className)}>
      <input
        aria-invalid={state === "error" || undefined}
        className="min-w-0 flex-1 bg-transparent outline-none placeholder:text-input-placeholder"
        {...props}
      />
      {trailing}
    </div>
  );
}
