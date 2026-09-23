import { cn } from "@/lib/cn";

type Props = React.HTMLAttributes<HTMLElement> & { as?: "section" | "article" | "div"; compact?: boolean };

export function Card({ as: Tag = "section", compact, className, ...props }: Props) {
  return (
    <Tag
      className={cn(
        "flex flex-col gap-card-gap rounded-card border border-hairline bg-raised",
        compact ? "p-card-compact" : "p-card",
        className,
      )}
      {...props}
    />
  );
}

export function CardTitle({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
  return <h2 className={cn("type-heading-h4 text-ink", className)} {...props} />;
}
