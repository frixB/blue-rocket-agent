import Link from "next/link";
import { Bookmark } from "lucide-react";
import { Banner, Button, Card, Heading, IconTile, buttonStyles, type LucideIcon, type Tone } from "@/components/ui";
import { OrderSummaryCard } from "./order-summary-card";
import { ProgressRail } from "./progress-rail";
import type { Order } from "@/lib/orders/types";

type Props = {
  order: Order;
  tile: { icon: LucideIcon; tone: Tone };
  heading: string;
  body: string;
  chips?: React.ReactNode;
  children: React.ReactNode;
  showClaim?: boolean;
};

/**
 * The S-06 shell every order state renders inside. States only supply the
 * header copy and one card. Summary, rail and footer never move.
 */
export function StatusLayout({ order, tile, heading, body, chips, children, showClaim = true }: Props) {
  return (
    <>
      {showClaim && !order.claimed && (
        <Banner
          icon={Bookmark}
          actions={<Link href={`/claim/${order.id}`} className={buttonStyles({ size: "sm" })}>Set a password</Link>}
        >
          Set a password and this report stays in your dashboard for good.
        </Banner>
      )}
      <main className="mx-auto grid w-full max-w-app gap-8 px-5 pb-page-bottom pt-page-top lg:grid-cols-[1fr_var(--container-rail)]">
        <div className="flex min-w-0 flex-col gap-section">
          <Card>
            <IconTile icon={tile.icon} tone={tile.tone} size="xl" />
            <Heading>{heading}</Heading>
            <p className="type-body-lg text-ink-2">{body}</p>
            {chips && <div className="flex flex-wrap gap-3">{chips}</div>}
          </Card>
          <OrderSummaryCard order={order} />
          {children}
          <Button variant="ghost" full>Save my report link</Button>
          <p className="text-center type-body-sm text-muted">Something not right? Contact us. We reply within one business hour.</p>
        </div>
        <aside className="flex flex-col gap-5"><ProgressRail order={order} /></aside>
      </main>
    </>
  );
}
