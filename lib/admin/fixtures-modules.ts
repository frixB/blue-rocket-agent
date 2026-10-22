import { SLA } from "@/lib/orders/sla";
import type { Role } from "./types";

/**
 * Fixtures for the Grow, Money and Admin modules. Times are relative to `now`.
 * Customers and pipeline numbers are derived from the order fixtures in
 * data.ts, so every screen agrees; this file holds what orders can't give.
 */

const HOUR = 3_600_000;
const ago = (now: Date, h: number) => new Date(now.getTime() - h * HOUR).toISOString();

// ── Pipeline ─────────────────────────────────────────────────────────────

export type SourceStatus = "operational" | "degraded" | "down";
export type DataSource = { key: string; name: string; role: string; status: SourceStatus; note: string; checkedMinutesAgo: number };

/** What the pipeline depends on. Names are roles, not vendors: swap in the real services when they're chosen. */
export const DATA_SOURCES: DataSource[] = [
  { key: "stripe", name: "Stripe webhooks", role: "Payment", status: "operational", note: "Last event 4 minutes ago.", checkedMinutesAgo: 1 },
  { key: "crawler", name: "Site crawler", role: "Crawl", status: "operational", note: "Average crawl 3m 40s.", checkedMinutesAgo: 1 },
  { key: "search", name: "Search data API", role: "Analysis", status: "degraded", note: "Slow responses: 95% answer within 8.2s, normally 2s.", checkedMinutesAgo: 2 },
  { key: "model", name: "Analysis model", role: "Analysis", status: "operational", note: "3 timeouts in the last 24 hours.", checkedMinutesAgo: 1 },
  { key: "pdf", name: "PDF builder", role: "Compile", status: "operational", note: "1 failure in the last 24 hours.", checkedMinutesAgo: 3 },
  { key: "email", name: "Email delivery", role: "Delivery", status: "operational", note: "1 bounce in the last 24 hours.", checkedMinutesAgo: 1 },
];

/** Per-stage history for the last 24 hours. Running now comes from the orders. */
export const STAGE_STATS: Record<string, { runs: number; failed: number; avgMinutes: number }> = {
  payment: { runs: 9, failed: 1, avgMinutes: 0 },
  crawl: { runs: 9, failed: 1, avgMinutes: 4 },
  analysis: { runs: 8, failed: 2, avgMinutes: 38 },
  compile: { runs: 6, failed: 0, avgMinutes: 6 },
  delivery: { runs: 6, failed: 1, avgMinutes: 1 },
};

export type PipelineAlert = { id: string; at: string; tone: "danger" | "warning"; text: string; sentTo: string };
export const pipelineAlerts = (now: Date): PipelineAlert[] => [
  { id: "al-1", at: ago(now, 0.8), tone: "warning", text: "Search data API is slow: 95% of answers within 8.2s.", sentTo: "Rasa, Carlos, Nimali" },
  { id: "al-2", at: ago(now, 2.3), tone: "danger", text: "Analysis model timed out 3 times on one order (BRA-4488).", sentTo: "Rasa, Carlos" },
  { id: "al-3", at: ago(now, 11), tone: "warning", text: "PDF build failed for BRA-4490. The web report is live.", sentTo: "Nimali" },
];

// ── Customers ────────────────────────────────────────────────────────────

/** Account facts orders don't carry, by email. */
export type AccountFacts = { claimed: boolean; signIn: "password" | "magic_link" | null; lastSignInHoursAgo?: number; creditsCents?: number };
export const ACCOUNTS: Record<string, AccountFacts> = {
  "priya@harbordental.com": { claimed: true, signIn: "password", lastSignInHoursAgo: 3 },
  "jin@brightsmileortho.com": { claimed: true, signIn: "magic_link", lastSignInHoursAgo: 20, creditsCents: 30_000 },
  "bob@johnsonplumbing.com": { claimed: true, signIn: "password", lastSignInHoursAgo: 50 },
  "ava@lumenphoto.studio": { claimed: true, signIn: "magic_link", lastSignInHoursAgo: 6 },
  "eddie@northsideplumbing.com": { claimed: false, signIn: null },
};

export type ShareLink = { id: string; email: string; reference: string; createdHoursAgo: number; expiresInDays: number; views: number };
export const SHARE_LINKS: ShareLink[] = [
  { id: "sh-1", email: "jin@brightsmileortho.com", reference: "BRA-4492", createdHoursAgo: 18, expiresInDays: 29, views: 4 },
  { id: "sh-2", email: "ava@lumenphoto.studio", reference: "BRA-4494", createdHoursAgo: 5, expiresInDays: 30, views: 1 },
];

export type DataRequest = { id: string; email: string; kind: "export" | "delete"; receivedHoursAgo: number; dueInDays: number };
export const DATA_REQUESTS: DataRequest[] = [
  { id: "dr-1", email: "nora@elmwoodchiro.com", kind: "delete", receivedHoursAgo: 30, dueInDays: 28 },
];

// ── Leads ────────────────────────────────────────────────────────────────

export type LeadNote = { by: string; hoursAgo: number; text: string };
export type LeadDetail = { website: string; stoppedAt: "Form step 1" | "Form step 2" | "Checkout" | "Paid"; notes: LeadNote[] };
export const LEAD_DETAILS: Record<string, LeadDetail> = {
  "l-1": { website: "cedargroveflowers.com", stoppedAt: "Checkout", notes: [{ by: "Nimali", hoursAgo: 0.9, text: "Card declined twice. Sent a payment link; she'll try another card tonight." }] },
  "l-2": { website: "summitroofing.co", stoppedAt: "Paid", notes: [] },
  "l-3": { website: "reyeshvac.com", stoppedAt: "Form step 2", notes: [] },
  "l-4": { website: "foxfinch.design", stoppedAt: "Form step 1", notes: [{ by: "Carlos", hoursAgo: 4.5, text: "Asked if we audit Shopify stores. Yes. Following up tomorrow." }] },
};

// ── Audience ─────────────────────────────────────────────────────────────

export type Segment = "newsletter" | "waitlist" | "buyers";
export type Contact = { email: string; name?: string; segments: Segment[]; waitlist?: string[]; consent: boolean; joinedDaysAgo: number };
export const CONTACTS: Contact[] = [
  { email: "mia@cedargroveflowers.com", name: "Mia Chen", segments: ["newsletter"], consent: true, joinedDaysAgo: 0 },
  { email: "leah@foxfinch.design", name: "Leah Fox", segments: ["newsletter", "waitlist"], waitlist: ["Local SEO"], consent: true, joinedDaysAgo: 0 },
  { email: "dana@oakandiron.fit", name: "Dana Whitfield", segments: ["buyers", "newsletter"], consent: true, joinedDaysAgo: 1 },
  { email: "ruth@maplestreetbakery.com", name: "Ruth Osei", segments: ["buyers", "waitlist"], waitlist: ["Local SEO"], consent: true, joinedDaysAgo: 1 },
  { email: "ava@lumenphoto.studio", name: "Ava Lindqvist", segments: ["buyers", "waitlist"], waitlist: ["Content strategy"], consent: true, joinedDaysAgo: 2 },
  { email: "luis@casaverdekitchen.com", name: "Luis Ortega", segments: ["buyers"], consent: true, joinedDaysAgo: 0 },
  { email: "sam@riverbendauto.com", name: "Sam Patel", segments: ["buyers"], consent: false, joinedDaysAgo: 1 },
  { email: "hello@tidewaterkayak.com", segments: ["waitlist"], waitlist: ["Google Ads audit"], consent: true, joinedDaysAgo: 4 },
  { email: "owner@pinecrestdental.com", segments: ["waitlist"], waitlist: ["Local SEO", "Google Ads audit"], consent: true, joinedDaysAgo: 6 },
  { email: "marcus@blueharborlaw.com", name: "Marcus Hale", segments: ["buyers"], consent: false, joinedDaysAgo: 2 },
  { email: "team@northpeakgym.com", segments: ["newsletter"], consent: true, joinedDaysAgo: 9 },
  { email: "info@saltandstonebakery.com", segments: ["waitlist"], waitlist: ["Local SEO"], consent: true, joinedDaysAgo: 12 },
];

// ── Report types ─────────────────────────────────────────────────────────

export type ReportType = { key: string; name: string; state: "live" | "coming_soon"; priceCents?: number; promise?: string; blurb: string; sample?: string };
export const REPORT_TYPES: ReportType[] = [
  { key: "seo", name: "Detailed SEO Report", state: "live", priceCents: 150_000, promise: `Within ${SLA.deliveryHours} hours`, sample: "/share/demo-share",
    blurb: "Technical, on-page, backlinks and competitors, with what to fix first." },
  { key: "local", name: "Local SEO", state: "coming_soon", blurb: "Google Business Profile, local rankings, reviews and citations." },
  { key: "ads", name: "Google Ads audit", state: "coming_soon", blurb: "Wasted spend, keyword gaps, ad copy and landing pages." },
  { key: "content", name: "Content strategy", state: "coming_soon", blurb: "What to write next, based on what your customers search for." },
];

// ── Revenue ──────────────────────────────────────────────────────────────

/** The owners' agreement: of net revenue, 30% stays with the company, 35% each to Rasa and Carlos. */
export const SPLIT = [
  { who: "Company (frixB)", share: 0.3 },
  { who: "Rasa", share: 0.35 },
  { who: "Carlos", share: 0.35 },
] as const;

export type Payout = { id: string; arrivesInDays: number; amountCents: number; state: "paid" | "in_transit" };
export const PAYOUTS: Payout[] = [
  { id: "po_1Q8A", arrivesInDays: 2, amountCents: 1_146_860, state: "in_transit" },
  { id: "po_1Q7Z", arrivesInDays: -5, amountCents: 1_583_220, state: "paid" },
  { id: "po_1Q7K", arrivesInDays: -12, amountCents: 1_302_430, state: "paid" },
];

export type Invoice = { id: string; reference: string; business: string; email: string; amountCents: number; issuedHoursAgo: number; kind: "receipt" | "vat" };
export const INVOICES: Invoice[] = [
  { id: "in-1", reference: "BRA-4509", business: "Summit Roofing Co.", email: "grace@summitroofing.co", amountCents: 120_000, issuedHoursAgo: 0.6, kind: "receipt" },
  { id: "in-2", reference: "BRA-4507", business: "Casa Verde Kitchen", email: "luis@casaverdekitchen.com", amountCents: 150_000, issuedHoursAgo: 3.1, kind: "receipt" },
  { id: "in-3", reference: "BRA-4492", business: "Bright Smile Orthodontics", email: "jin@brightsmileortho.com", amountCents: 150_000, issuedHoursAgo: 40, kind: "vat" },
  { id: "in-4", reference: "BRA-4490", business: "Northside Plumbing", email: "eddie@northsideplumbing.com", amountCents: 150_000, issuedHoursAgo: 34, kind: "receipt" },
];

/** A Stripe fee per order, from the order fixtures: 2.9% plus 30 cents on $1,500. */
export const FEE_CENTS = 4_380;

// ── Settings ─────────────────────────────────────────────────────────────

export type TeamMember = { name: string; email: string; role: Role; twoFactor: boolean; lastActiveHoursAgo?: number; pending?: boolean };
export const TEAM: TeamMember[] = [
  { name: "Rasa", email: "rasa@frixb.com", role: "owner", twoFactor: true, lastActiveHoursAgo: 0 },
  { name: "Carlos", email: "carlos@frixb.com", role: "owner", twoFactor: true, lastActiveHoursAgo: 5 },
  { name: "Nimali", email: "nimali@frixb.com", role: "ops", twoFactor: true, lastActiveHoursAgo: 0.2 },
  { name: "Kasun", email: "kasun@frixb.com", role: "ops", twoFactor: false, pending: true },
];

export type Integration = { key: string; name: string; purpose: string; connected: boolean; env?: string };
export const integrations = (): Integration[] => [
  { key: "stripe", name: "Stripe", purpose: "Payments, refunds and payouts", connected: false, env: "STRIPE_SECRET_KEY" },
  { key: "email", name: "Email provider", purpose: "Receipts, sign-in links and report emails", connected: false, env: "EMAIL_API_KEY" },
  { key: "waitlist", name: "Waitlist webhook", purpose: "New report waitlist sign-ups", connected: Boolean(process.env.WAITLIST_WEBHOOK_URL), env: "WAITLIST_WEBHOOK_URL" },
  { key: "auth", name: "Admin sign-in", purpose: "Password, authenticator app and invites", connected: false },
];

export const ALERT_RULES = [
  { key: "urgent", label: "An order has under 4 hours left", owners: true, ops: true },
  { key: "late", label: `An order misses the ${SLA.deliveryHours}-hour deadline`, owners: true, ops: true },
  { key: "escalated", label: "An order escalates and the auto-refund starts", owners: true, ops: true },
  { key: "refund", label: "A refund is waiting for approval", owners: true, ops: false },
  { key: "dispute", label: "A customer opens a dispute in Stripe", owners: true, ops: false },
  { key: "source", label: "A data source is slow or down", owners: true, ops: true },
] as const;

// ── Audit log ────────────────────────────────────────────────────────────

export type AuditArea = "orders" | "refunds" | "review" | "settings" | "team" | "sign-in";
export type AuditEvent = { id: string; at: string; who: string; area: AuditArea; action: string; target?: { label: string; href: string }; before?: string; after?: string };
export const auditEvents = (now: Date): AuditEvent[] => [
  { id: "a-01", at: ago(now, 0.2), who: "Nimali", area: "sign-in", action: "Signed in" },
  { id: "a-02", at: ago(now, 0.6), who: "System", area: "orders", action: "Marked paid, deadline set to 24 hours", target: { label: "BRA-4509", href: "/admin/orders/bra-4509" } },
  { id: "a-03", at: ago(now, 1.9), who: "Nimali", area: "refunds", action: "Prepared a refund for owner approval", target: { label: "BRA-4499", href: "/admin/orders/bra-4499" }, after: "$1,500" },
  { id: "a-04", at: ago(now, 2.3), who: "System", area: "orders", action: "Paused the analysis after 3 timeouts", target: { label: "BRA-4488", href: "/admin/orders/bra-4488" } },
  { id: "a-05", at: ago(now, 3.4), who: "Nimali", area: "refunds", action: "Prepared a refund for owner approval", target: { label: "ch_3Q9xZt2aLmTide", href: "/admin/exceptions?type=stripe" }, after: "$1,500" },
  { id: "a-06", at: ago(now, 5), who: "Carlos", area: "settings", action: "Changed the auto-send window", before: "3 hours", after: "2 hours" },
  { id: "a-07", at: ago(now, 7.5), who: "System", area: "orders", action: "Crawler blocked, sent the fix instructions", target: { label: "BRA-4501", href: "/admin/orders/bra-4501" } },
  { id: "a-08", at: ago(now, 9), who: "Rasa", area: "team", action: "Invited Kasun as Ops", target: { label: "kasun@frixb.com", href: "/admin/settings#team" } },
  { id: "a-09", at: ago(now, 14), who: "Nimali", area: "review", action: "Approved the report", target: { label: "BRA-4490", href: "/admin/orders/bra-4490" } },
  { id: "a-10", at: ago(now, 21.5), who: "Rasa", area: "review", action: "Approved as a partial report", target: { label: "BRA-4492", href: "/admin/orders/bra-4492" } },
  { id: "a-11", at: ago(now, 30), who: "System", area: "review", action: "Auto-sent 2h before the deadline, flagged Sent unreviewed", target: { label: "BRA-4494", href: "/admin/orders/bra-4494" } },
  { id: "a-12", at: ago(now, 60), who: "Rasa", area: "refunds", action: "Approved a refund", target: { label: "BRA-4480", href: "/admin/orders/bra-4480" }, after: "$1,500 · Site can't be audited" },
  { id: "a-13", at: ago(now, 72), who: "Carlos", area: "settings", action: "Changed the price of the Detailed SEO Report", before: "$1,200", after: "$1,500" },
];
