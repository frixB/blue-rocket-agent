/* eslint-disable @next/next/no-img-element -- decorative SVGs exported from Figma, no optimisation needed */
import Link from "next/link";
import { Heading } from "@/components/ui";
import { Brand } from "./brand";

/**
 * Figma "Layout / Context and form": the dark screen with the orbital
 * illustration and a headline on the left, and a Modal or form card on the
 * right. Used by the order form, S-02, S-03, S-04, S-05, S-07, S-18, S-19 and
 * S-20. The illustration, stars and glow are the Figma exports in /public/figma.
 */
export function ContextLayout({ title, lead, steps, children }: {
  title: React.ReactNode;
  lead?: string;
  /** Numbered list under the lead, as on the order form. */
  steps?: string[];
  children: React.ReactNode;
}) {
  return (
    <div data-theme="marketing" className="relative isolate min-h-dvh overflow-hidden bg-page text-ink">
      <img src="/figma/stars.svg" alt="" aria-hidden className="pointer-events-none absolute inset-0 -z-10 size-full object-cover opacity-80" />
      <img src="/figma/glow.svg" alt="" aria-hidden className="pointer-events-none absolute left-1/2 top-1/2 -z-10 w-full max-w-3xl -translate-x-1/2 -translate-y-1/2" />
      <header className="px-nav-x py-nav-y">
        <Link href="/" aria-label="Blue Rocket Agents home"><Brand /></Link>
      </header>
      <main className="mx-auto flex w-full max-w-report flex-col items-center justify-center gap-12 px-5 pb-16 pt-6 lg:min-h-[80dvh] lg:flex-row lg:gap-24">
        <section className="flex w-full max-w-md flex-col gap-6">
          <img src="/figma/orbital.svg" alt="" aria-hidden className="hidden h-auto w-90 max-w-full sm:block" />
          <Heading variant="display">{title}</Heading>
          {lead && <p className="type-lead text-ink-2">{lead}</p>}
          {steps && (
            <ol className="flex flex-col gap-4 type-body-lg text-ink-2">
              {steps.map((s, i) => <li key={s} className="flex gap-4"><span className="tabular-nums">{String(i + 1).padStart(2, "0")}</span>{s}</li>)}
            </ol>
          )}
        </section>
        <div className="flex w-full justify-center lg:w-auto">{children}</div>
      </main>
    </div>
  );
}

