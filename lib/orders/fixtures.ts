import { TZDate } from "@date-fns/tz";
import { SLA } from "./sla";
import type { Order, StageRecord } from "./types";

/**
 * Fixture orders, one per state. Power /dev/states on preview deploys so
 * reviewers click through every state without touching Stripe.
 * Replace with a database query in app/(app)/reports/[orderId]/page.tsx.
 */
const at = (day: number, h: number, m = 0) => new TZDate(2026, 8, day, h, m, 0, 0, SLA.timezone).toISOString();

const base = {
  businessName: "Johnson & Sons Plumbing",
  websiteUrl: "https://johnsonplumbing.com",
  email: "bob@johnsonplumbing.com",
  amountCents: SLA.priceCents,
  claimed: false,
};

const stages = (...s: StageRecord[]) => s;
const sections: NonNullable<Order["report"]>["sections"] = [
  { key: "technical", state: "complete", findings: [
    { severity: "critical", title: "Homepage takes 6.8s to load on mobile", body: "Above the 2.5s threshold Google uses. Mobile is 71% of your traffic." },
    { severity: "medium", title: "robots.txt blocks your own sitemap", body: "A leftover staging rule stops Google reading /sitemap.xml." },
    { severity: "pass", title: "HTTPS and redirects", body: "All HTTP traffic redirects correctly to HTTPS." },
  ] },
  { key: "on_page", state: "complete", findings: [
    { severity: "critical", title: "No H1 tag on 9 of 14 pages", body: "Google cannot tell what those pages are about." },
    { severity: "pass", title: "Image alt text", body: "Present on 88% of images." },
  ] },
  { key: "off_page", state: "complete", findings: [
    { severity: "medium", title: "Competitors average 3x your links", body: "Roughly 25 quality local links would close the gap." },
  ] },
  { key: "competitive", state: "complete", findings: [
    { severity: "critical", title: "You rank #7 for \u201cemergency plumber Austin\u201d", body: "The three above you all have a dedicated page for that phrase." },
  ] },
];

export const FIXTURES: Record<string, Order> = {
  "demo-running": { ...base, id: "demo-running", reference: "BRA-4471", status: "analysing", paidAt: at(15, 9, 14),
    stages: stages({ stage: "payment", state: "done", at: at(15, 9, 14) }, { stage: "crawl", state: "done", at: at(15, 9, 41) },
      { stage: "analysis", state: "active" }, { stage: "compile", state: "pending" }, { stage: "delivery", state: "pending" }) },

  "demo-weekend": { ...base, id: "demo-weekend", reference: "BRA-4472", status: "weekend_queued", paidAt: at(18, 18, 42),
    stages: stages({ stage: "payment", state: "done", at: at(18, 18, 42) }, { stage: "crawl", state: "scheduled" },
      { stage: "analysis", state: "scheduled" }, { stage: "compile", state: "scheduled" }, { stage: "delivery", state: "scheduled" }) },

  "demo-blocked": { ...base, id: "demo-blocked", reference: "BRA-4473", status: "blocked", paidAt: at(15, 9, 14),
    stages: stages({ stage: "payment", state: "done", at: at(15, 9, 14) }, { stage: "crawl", state: "failed", at: at(15, 9, 22), note: "Blocked by robots.txt" },
      { stage: "analysis", state: "pending" }, { stage: "compile", state: "pending" }, { stage: "delivery", state: "pending" }) },

  "demo-late": { ...base, id: "demo-late", reference: "BRA-4474", status: "late", paidAt: at(15, 9, 14),
    stages: stages({ stage: "payment", state: "done", at: at(15, 9, 14) }, { stage: "crawl", state: "done", at: at(15, 16, 20), note: "340 pages" },
      { stage: "analysis", state: "active" }, { stage: "compile", state: "pending" }, { stage: "delivery", state: "pending" }) },

  "demo-escalated": { ...base, id: "demo-escalated", reference: "BRA-4475", status: "escalated", paidAt: at(15, 9, 14),
    owner: { name: "Carlos R.", email: "carlos@bluerocketagents.com" },
    refund: { reference: "BRA-4475-R", issuedAt: at(17, 9, 2), reason: "Missed delivery by a full business day" },
    stages: stages({ stage: "payment", state: "done", at: at(15, 9, 14) }, { stage: "crawl", state: "done", at: at(15, 16, 20) },
      { stage: "analysis", state: "failed", note: "Escalated to a person" }, { stage: "compile", state: "pending" }, { stage: "delivery", state: "pending" }) },

  "demo-failed": { ...base, id: "demo-failed", reference: "BRA-4476", status: "failed", paidAt: at(15, 9, 14),
    owner: { name: "Carlos R.", email: "carlos@bluerocketagents.com" },
    refund: { reference: "BRA-4476-R", issuedAt: at(15, 11, 49), reason: "Analysis failed after 3 attempts" },
    stages: stages({ stage: "payment", state: "done", at: at(15, 9, 14) }, { stage: "crawl", state: "done", at: at(15, 9, 41) },
      { stage: "analysis", state: "failed", at: at(15, 11, 48), note: "Failed after 3 attempts" }, { stage: "compile", state: "pending" }, { stage: "delivery", state: "pending" }) },

  "demo-partial": { ...base, id: "demo-partial", reference: "BRA-4477", status: "partial", paidAt: at(15, 9, 14), claimed: true,
    report: { issues: 19, critical: 3, monthlyVisitsLost: 1400, deliveredAt: at(15, 15, 26),
      sections: [...sections.slice(0, 2), { key: "off_page", state: "unavailable", reason: "Your domain is 41 days old, so there is no backlink history yet.", findings: [] }, sections[3]!] },
    stages: stages({ stage: "payment", state: "done", at: at(15, 9, 14) }, { stage: "crawl", state: "done", at: at(15, 9, 41) },
      { stage: "analysis", state: "done", at: at(15, 13, 5), note: "3 of 4 sections" }, { stage: "compile", state: "done", at: at(15, 15, 22) }, { stage: "delivery", state: "done", at: at(15, 15, 26) }) },

  "demo-ready": { ...base, id: "demo-ready", reference: "BRA-4478", status: "ready", paidAt: at(15, 9, 14), claimed: true,
    report: { issues: 23, critical: 4, monthlyVisitsLost: 1900, deliveredAt: at(15, 15, 26), sections },
    stages: stages({ stage: "payment", state: "done", at: at(15, 9, 14) }, { stage: "crawl", state: "done", at: at(15, 9, 41) },
      { stage: "analysis", state: "done", at: at(15, 13, 5) }, { stage: "compile", state: "done", at: at(15, 15, 22) }, { stage: "delivery", state: "done", at: at(15, 15, 26) }) },

  "demo-awaiting": { ...base, id: "demo-awaiting", reference: "BRA-4480", status: "awaiting_payment", paidAt: at(15, 9, 14),
    stages: stages({ stage: "payment", state: "pending" }, { stage: "crawl", state: "pending" },
      { stage: "analysis", state: "pending" }, { stage: "compile", state: "pending" }, { stage: "delivery", state: "pending" }) },

  "demo-payment-failed": { ...base, id: "demo-payment-failed", reference: "BRA-4481", status: "payment_failed", paidAt: at(15, 9, 14),
    stages: stages({ stage: "payment", state: "failed", note: "Card declined" }, { stage: "crawl", state: "pending" },
      { stage: "analysis", state: "pending" }, { stage: "compile", state: "pending" }, { stage: "delivery", state: "pending" }) },

  "demo-refunded": { ...base, id: "demo-refunded", reference: "BRA-4479", status: "refunded", paidAt: at(15, 9, 14),
    refund: { reference: "BRA-4479-R", issuedAt: at(15, 10, 5), reason: "You asked us to refund instead of retrying" },
    stages: stages({ stage: "payment", state: "done", at: at(15, 9, 14) }, { stage: "crawl", state: "failed", note: "Blocked by robots.txt" },
      { stage: "analysis", state: "pending" }, { stage: "compile", state: "pending" }, { stage: "delivery", state: "pending" }) },
};

export async function getOrder(id: string): Promise<Order | null> {
  return FIXTURES[id] ?? null;
}

/** Every paid order on the signed-in account, newest first. S-16 and S-17 read this. */
export async function listOrders(): Promise<Order[]> {
  return Object.values(FIXTURES)
    .filter((o) => o.status !== "awaiting_payment" && o.status !== "payment_failed")
    .sort((a, b) => b.paidAt.localeCompare(a.paidAt) || b.reference.localeCompare(a.reference));
}

/** The signed-in customer. Replace with the session once auth exists. */
export type Account = { name: string; email: string; emailVerified: boolean };
export async function getAccount(): Promise<Account> {
  return { name: "Bob Johnson", email: base.email, emailVerified: false };
}
