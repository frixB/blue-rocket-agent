import type { Order } from "@/lib/orders/types";
import { Running } from "./running";
import { WeekendQueued } from "./weekend-queued";
import { Late } from "./late";
import { Blocked } from "./blocked";
import { Failed } from "./failed";
import { Escalated } from "./escalated";
import { Ready } from "./ready";
import { Refunded } from "./refunded";
import { PaymentPending } from "./payment-pending";

/**
 * The exhaustive switch. Add a status to lib/orders/status.ts and this file
 * stops compiling until the new state has a screen. That is the point.
 */
export function OrderState({ order }: { order: Order }) {
  switch (order.status) {
    case "queued":
    case "crawling":
    case "analysing":
    case "compiling":
    case "reviewing":
      return <Running order={order} />;
    case "weekend_queued":
      return <WeekendQueued order={order} />;
    case "late":
      return <Late order={order} />;
    case "blocked":
      return <Blocked order={order} />;
    case "escalated":
      return <Escalated order={order} />;
    case "failed":
      return <Failed order={order} />;
    case "partial":
    case "ready":
      return <Ready order={order} />;
    case "refunded":
      return <Refunded order={order} />;
    case "awaiting_payment":
    case "payment_failed":
      return <PaymentPending order={order} />;
    default: {
      const unhandled: never = order.status;
      throw new Error(`No screen for order status: ${String(unhandled)}`);
    }
  }
}
