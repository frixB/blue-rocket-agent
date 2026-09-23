import { Heading } from "@/components/ui";

/** Serif page title with a one-line intro and an optional action on the right (S-16, S-17). */
export function PageHeader({ title, intro, action }: { title: string; intro: string; action?: React.ReactNode }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-4">
      <div className="flex flex-col gap-1">
        <Heading>{title}</Heading>
        <p className="type-body text-muted">{intro}</p>
      </div>
      {action}
    </div>
  );
}
