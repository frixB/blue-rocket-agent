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
    sections: ReportSection[];
  };
  claimed: boolean;
};
