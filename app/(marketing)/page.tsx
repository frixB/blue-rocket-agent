import Link from "next/link";
import { Chip, IconTile, buttonStyles } from "@/components/ui";
import { SLA, formatPrice } from "@/lib/orders/sla";

export default function Landing() {
  return (
    <main className="mx-auto flex max-w-app flex-col gap-8 px-5 py-24">
      <div className="flex items-center gap-3 type-body-strong"><IconTile emoji="🚀" tone="warning" size="sm" /> Blue Rocket Agents</div>
      <h1 className="type-display-lg max-w-3xl">Know exactly why your business isn&apos;t showing up on Google</h1>
      <p className="type-lead max-w-2xl text-ink-2">
        A full SEO audit of your site, delivered within one business day, for a flat {formatPrice(SLA.priceCents)}. No subscription. No guesswork.
      </p>
      <div><Link href="/order" className={buttonStyles({ size: "lg" })}>🚀 Get started, {formatPrice(SLA.priceCents)}</Link></div>
      <div className="flex flex-wrap gap-2">
        <Chip>✓ Flat fee, no subscription</Chip>
        <Chip>⏱ Delivered within 1 business day</Chip>
        <Chip>💳 Full refund if we can&apos;t audit your site</Chip>
      </div>
    </main>
  );
}
