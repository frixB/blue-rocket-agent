import { Heading, IconTile, type LucideIcon } from "@/components/ui";

/** The dark, centred system screens: S-15b link expired, S-21a 404, S-21b maintenance. */
export function SystemMessage({ icon, title, body, children }: { icon: LucideIcon; title: string; body: string; children?: React.ReactNode }) {
  return (
    <main data-theme="marketing" className="flex min-h-dvh flex-col items-center justify-center gap-5 bg-page px-5 text-center text-ink">
      <IconTile icon={icon} size="xl" className="size-tile-5xl rounded-4xl" />
      <Heading>{title}</Heading>
      <p className="max-w-xl type-body-lg text-ink-2">{body}</p>
      {children && <div className="flex flex-wrap justify-center gap-3">{children}</div>}
    </main>
  );
}
