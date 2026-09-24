import Link from "next/link";
import { ChartColumn, ChevronRight, FileText, Gift, TriangleAlert } from "lucide-react";
import { Icon, IconTile, ProgressBar, StatusBadge, type BadgeKind, type LucideIcon, type Tone } from "@/components/ui";
import { SLA, deliveryDeadline, formatDate, formatDeliveryPromise } from "@/lib/orders/sla";
import type { Order } from "@/lib/orders/types";
import { STAGES } from "@/lib/orders/status";

type Row = { kind: BadgeKind; tone: Tone; icon: LucideIcon; meta: string };

const day = (iso: string) => formatDate(new Date(iso));

/** How one order reads in the S-16 list: badge, tile and the line under it. */
export function summarise(order: Order): Row {
  const promise = formatDeliveryPromise(deliveryDeadline(new Date(order.paidAt)));
  switch (order.status) {
    case "ready":
    case "partial":
      return { kind: "ready", tone: "success", icon: FileText, meta: `${day(order.report!.deliveredAt)} · ${order.report!.issues} issues found` };
    case "blocked":
      return { kind: "blocked", tone: "warning", icon: TriangleAlert, meta: "Waiting on a quick fix from you" };
    case "late":
    case "escalated":
      return { kind: "delayed", tone: "warning", icon: ChartColumn, meta: order.refund ? "Refunded, still being finished" : "Running over, no action needed" };
    case "failed":
      return { kind: "failed", tone: "danger", icon: TriangleAlert, meta: "Refunded automatically" };
    case "refunded":
      return { kind: "refunded", tone: "info", icon: FileText, meta: `Refunded ${day(order.refund?.issuedAt ?? order.paidAt)}` };
    case "queued":
    case "weekend_queued":
      return { kind: "queued", tone: "neutral", icon: ChartColumn, meta: `Delivered ${promise}` };
    default:
      return { kind: "running", tone: "warning", icon: ChartColumn, meta: `Delivered ${promise}` };
  }
}

function RowShell({ orderId, tile, title, subtitle, badge, meta, children }: {
  orderId: string; tile: React.ReactNode; title: string; subtitle: string; badge: React.ReactNode; meta: string; children?: React.ReactNode;
}) {
  return (
    <li>
      <Link href={`/reports/${orderId}`} className="flex items-center gap-4 rounded-xl border border-hairline bg-raised px-5 py-4.5 transition-shadow hover:shadow-raised">
        {tile}
        <div className="flex min-w-0 flex-1 flex-col gap-1">
          <span className="break-words type-body-lg font-semibold text-ink">{title}</span>
          <span className="break-words type-body-sm text-muted">{subtitle}</span>
          {children}
          <div className="mt-1 flex flex-wrap items-center gap-2 sm:hidden">
            {badge}
            <span className="type-caption text-muted">{meta}</span>
          </div>
        </div>
        <div className="hidden shrink-0 flex-col items-end gap-1.5 text-right sm:flex">
          {badge}
          <span className="type-caption text-muted">{meta}</span>
        </div>
        <Icon icon={ChevronRight} className="text-muted" />
      </Link>
    </li>
  );
}

/** Figma "Report row", S-16. The whole row opens the order. */
export function ReportRow({ order }: { order: Order }) {
  const s = summarise(order);
  const done = order.stages.filter((st) => st.state === "done").length;
  return (
    <RowShell orderId={order.id} tile={<IconTile icon={s.icon} tone={s.tone} />} title={order.businessName}
      subtitle={`${new URL(order.websiteUrl).host} · ${SLA.productName}`} badge={<StatusBadge kind={s.kind} />} meta={s.meta}>
      {s.kind === "running" && <div className="max-w-xs"><ProgressBar value={(done / STAGES.length) * 100} label={`${done} of ${STAGES.length} steps done`} /></div>}
    </RowShell>
  );
}

/** The backlink credit a partial report earns (S-09), listed like a report. */
export function CreditRow({ order }: { order: Order }) {
  return (
    <RowShell orderId={order.id} tile={<IconTile icon={Gift} tone="info" />} title="Backlink report credit"
      subtitle="Redeemable once your domain is 90 days old" badge={<StatusBadge kind="credit" />} meta={`From order #${order.reference}`} />
  );
}
