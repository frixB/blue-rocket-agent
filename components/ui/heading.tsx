import { cn } from "@/lib/cn";

/**
 * Page and screen titles use the BRA serif styles (Instrument Serif), exactly
 * as the Figma status headers, modals and marketing heroes do. Card titles
 * stay in Inter: use <CardTitle>.
 */
const variants = {
  display: "type-bra-display",
  h1: "type-bra-heading-1",
  h2: "type-bra-heading-2",
  h3: "type-bra-heading-3",
} as const;

type Props = React.HTMLAttributes<HTMLHeadingElement> & { variant?: keyof typeof variants; as?: "h1" | "h2" | "h3" | "p" };

export function Heading({ variant = "h1", as: Tag = "h1", className, ...props }: Props) {
  return <Tag className={cn(variants[variant], "text-ink", className)} {...props} />;
}
