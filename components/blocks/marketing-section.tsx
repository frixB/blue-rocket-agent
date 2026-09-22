import { Heading } from "@/components/ui";
import { cn } from "@/lib/cn";

/**
 * One band of the landing page. `theme` flips every token inside it, which is
 * how the Figma page goes dark hero → light content → dark footer without a
 * single dark: variant.
 */
export function MarketingSection({ id, theme = "app", tint, eyebrow, title, intro, className, children }: {
  id?: string;
  theme?: "app" | "marketing";
  /** Use the page colour instead of the raised surface, to separate adjacent bands. */
  tint?: boolean;
  eyebrow?: string;
  title?: string;
  intro?: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} data-theme={theme} aria-labelledby={title && id ? `${id}-title` : undefined}
      className={cn("px-5 py-24 text-ink", tint ? "bg-page" : "bg-raised", className)}>
      <div className="mx-auto flex w-full max-w-report flex-col gap-11">
        {(eyebrow || title || intro) && (
          <header className="flex flex-col items-center gap-3 text-center">
            {eyebrow && <p className="type-overline uppercase text-action">{eyebrow}</p>}
            {title && <Heading as="h2" id={id ? `${id}-title` : undefined}>{title}</Heading>}
            {intro && <p className="max-w-2xl type-body-lg text-ink-2">{intro}</p>}
          </header>
        )}
        {children}
      </div>
    </section>
  );
}
