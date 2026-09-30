import type { OrderStatus } from "@/lib/orders/status";
import type { Finding, SectionKey, StageRecord } from "@/lib/orders/types";

/**
 * The admin panel uses the customer's order statuses, minus weekend_queued.
 * Reports run any day, so nothing is ever parked for the weekend.
 */
export type AdminStatus = Exclude<OrderStatus, "weekend_queued">;

export type Role = "owner" | "ops";

export type AdminUser = { name: string; email: string; role: Role };

/** Flags sit beside the status. An order can carry several at once. */
export const FLAGS = ["sent_unreviewed", "pdf_failed", "continued_past_url_check", "possible_duplicate", "disputed"] as const;
export type Flag = (typeof FLAGS)[number];

export type UrlCheck = "verified" | "name_mismatch" | "unreachable" | "skipped";

/** What the customer told us on Form Step 1 and 2. Shown to the reviewer beside the draft. */
export type Intake = {
  industry: string;
  city: string;
  country: string;
  annualRevenue: string;
  employees: string;
  urlCheck: UrlCheck;
  marketingConsent: boolean;
};

export type EmailKind = "payment_succeeded" | "crawler_blocked" | "deadline_missed" | "report_ready" | "failed" | "refund_issued";
export type EmailRecord = { kind: EmailKind; at: string; to: string; state: "delivered" | "opened" | "bounced" | "queued" };

export type DraftSection = {
  key: SectionKey;
  state: "complete" | "unavailable";
  /** Customer-facing reason, rendered verbatim on S-09 when a section is unavailable. */
  reason?: string;
  findings: Finding[];
};

export type Review = {
  score: number;
  fixFirst: string[];
  sections: DraftSection[];
  reviewer?: string;
  approvedAt?: string;
};

export type AuditEntry = { at: string; who: string; action: string };

/** A payment Stripe has that doesn't match an order: money with no order, or the wrong amount. */
export type StripeMismatch = {
  id: string;
  kind: "no_order" | "wrong_amount";
  charge: string;
  email: string;
  amountCents: number;
  at: string;
  /** Wrong amount only: what the order should have cost, and the order. */
  expectedCents?: number;
  orderId?: string;
  reference?: string;
  businessName?: string;
  assignee?: string;
};

/** A refund Ops prepared. Nothing moves until one owner approves it, with a reason. */
export type RefundRequest = {
  id: string;
  amountCents: number;
  preparedBy: string;
  preparedAt: string;
  /** Why Ops wants it, shown to the approving owner. */
  note: string;
  target: { kind: "order"; orderId: string; reference: string; businessName: string } | { kind: "stripe"; mismatchId: string; charge: string; email: string };
};

export type AdminOrder = {
  id: string;
  reference: string;
  status: AdminStatus;
  businessName: string;
  websiteUrl: string;
  email: string;
  customerName: string;
  amountCents: number;
  paidAt: string;
  deliveredAt?: string;
  stages: StageRecord[];
  flags: Flag[];
  intake: Intake;
  payment: { stripeIntent: string; card: string; feeCents: number };
  pdf: "pending" | "built" | "failed";
  emails: EmailRecord[];
  review?: Review;
  failure?: { stage: string; code: string; message: string };
  refund?: { reference: string; issuedAt: string; reason: string; automatic: boolean };
  audit: AuditEntry[];
  /** Who is handling this order's exception, so two people don't work it at once. */
  assignee?: string;
};
