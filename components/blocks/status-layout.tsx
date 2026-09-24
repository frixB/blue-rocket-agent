import Link from "next/link";
import { Bookmark } from "lucide-react";
import { Banner, Card, Heading, IconTile, buttonStyles, type LucideIcon, type Tone } from "@/components/ui";
import { supportHref } from "@/lib/support";
import { CopyLink } from "./copy-share-link";
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
          Set a password and this report stays in My Reports for good.
        </Banner>
      )}
      <main id="main" className="mx-auto grid w-full max-w-app gap-8 px-5 pb-page-bottom pt-page-top lg:grid-cols-[1fr_var(--container-rail)]">
        <div className="flex min-w-0 flex-col gap-section">
          <Card>
            <IconTile icon={tile.icon} tone={tile.tone} size="xl" />
            <Heading>{heading}</Heading>
            <p className="type-body-lg text-ink-2">{body}</p>
            {chips && <div className="flex flex-wrap gap-3">{chips}</div>}
          </Card>
          <OrderSummaryCard order={order} />
          {children}
          <CopyLink label="Copy my report link" full />
          <p className="text-center type-body-sm text-muted">
            Something not right? <a href={supportHref("Question about my report", order.reference)} className="font-semibold text-action underline-offset-2 hover:underline">Email us</a>. We reply within one business hour.
          </p>
        </div>
        <aside className="flex flex-col gap-5"><ProgressRail order={order} /></aside>
      </main>
    </>
  );
}
