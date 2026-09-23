import type { OrderStatus, Stage, StageState } from "./status";

export type StageRecord = { stage: Stage; state: StageState; at?: string; note?: string };

export type Severity = "critical" | "medium" | "pass";
export type Finding = { severity: Severity; title: string; body: string };
export type SectionKey = "technical" | "on_page" | "off_page" | "competitive";
export type ReportSection = {
  key: SectionKey;
  state: "complete" | "unavailable";
  reason?: string;
  findings: Finding[];
};

export type Order = {
  id: string;
  reference: string;
  status: OrderStatus;
  businessName: string;
  websiteUrl: string;
  email: string;
  amountCents: number;
  paidAt: string;
  stages: StageRecord[];
  refund?: { reference: string; issuedAt: string; reason: string };
  owner?: { name: string; email: string };
  report?: {
    issues: number;
    critical: number;
    monthlyVisitsLost: number;
    deliveredAt: string;
    /** Overall health, 0 to 100. */
    score: number;
    /** Average position for the business's main local terms. */
    localRank: number;
    pagesCrawled: number;
    /** The three things to do first, in order. Rendered verbatim. */
    fixFirst: string[];
    sections: ReportSection[];
  };
  claimed: boolean;
  /** Read-only share link token (S-15), if the owner created one. */
  shareToken?: string;
};
