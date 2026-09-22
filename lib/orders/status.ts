/**
 * Every state a paid order can be in. Shared by UI, API and workers.
 * Adding a member without a UI branch in components/states is a compile error.
 */
export const ORDER_STATUS = [
  "awaiting_payment", // Stripe session open
  "payment_failed",   // S-03
  "queued",           // paid, starts later today or first thing tomorrow
  "weekend_queued",   // S-22, paid outside the working week
  "crawling",         // S-06
  "analysing",        // S-06
  "compiling",        // S-06
  "reviewing",        // S-06. Remove if there is no human review step.
  "blocked",          // S-08, customer can fix it
  "late",             // S-11, past the promised moment
  "escalated",        // S-12, a business day past the promise
  "partial",          // S-09
  "ready",            // S-13
  "failed",           // S-10
  "refunded",         // terminal
] as const;

export type OrderStatus = (typeof ORDER_STATUS)[number];

export const IN_FLIGHT = ["queued", "weekend_queued", "crawling", "analysing", "compiling", "reviewing", "late"] as const satisfies readonly OrderStatus[];
export const NEEDS_CUSTOMER = ["payment_failed", "blocked"] as const satisfies readonly OrderStatus[];
export const TERMINAL = ["ready", "partial", "failed", "refunded"] as const satisfies readonly OrderStatus[];

export const isInFlight = (s: OrderStatus) => (IN_FLIGHT as readonly OrderStatus[]).includes(s);

/** The pipeline the progress rail renders. Order matters. */
export const STAGES = ["payment", "crawl", "analysis", "compile", "delivery"] as const;
export type Stage = (typeof STAGES)[number];

export type StageState = "done" | "active" | "pending" | "scheduled" | "failed";

export const STAGE_LABEL: Record<Stage, string> = {
  payment: "Payment received",
  crawl: "Site crawl",
  analysis: "SEO analysis",
  compile: "Report compiled",
  delivery: "Delivered",
};

/** Legal transitions. The worker refuses anything not listed here. */
export const TRANSITIONS: Record<OrderStatus, readonly OrderStatus[]> = {
  awaiting_payment: ["payment_failed", "queued", "weekend_queued", "crawling"],
  payment_failed: ["awaiting_payment"],
  queued: ["crawling"],
  weekend_queued: ["crawling"],
  crawling: ["analysing", "blocked", "failed", "late"],
  analysing: ["compiling", "partial", "failed", "late"],
  compiling: ["reviewing", "ready", "partial", "failed", "late"],
  reviewing: ["ready", "partial", "failed", "late"],
  blocked: ["crawling", "refunded"],
  late: ["crawling", "analysing", "compiling", "reviewing", "ready", "partial", "failed", "escalated"],
  escalated: ["ready", "partial", "failed", "refunded"],
  partial: [],
  ready: [],
  failed: ["queued", "refunded"],
  refunded: [],
};

export const canTransition = (from: OrderStatus, to: OrderStatus) => TRANSITIONS[from].includes(to);
