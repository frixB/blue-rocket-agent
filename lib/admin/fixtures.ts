import { STAGES, type StageState } from "@/lib/orders/status";
import type { StageRecord } from "@/lib/orders/types";
import type { AdminOrder, AdminStatus, DraftSection, EmailRecord, Flag, Intake, RefundRequest, Review, StripeMismatch } from "./types";

/**
 * Admin fixtures. Times are relative to `now`, so the queue always has
 * something about to run out of time. Replace with database queries in
 * lib/admin/data.ts.
 */

const HOUR = 3_600_000;

type Seed = {
  id: string;
  reference: string;
  status: AdminStatus;
  businessName: string;
  websiteUrl: string;
  customerName: string;
  email: string;
  /** Hours since payment. */
  paidHoursAgo: number;
  /** Hours after payment the report went out. */
  deliveredAfter?: number;
  flags?: Flag[];
  intake?: Partial<Intake>;
  /** Stage that is running, stuck or failed. */
  at?: (typeof STAGES)[number];
  review?: Partial<Review>;
  failure?: AdminOrder["failure"];
  refund?: { reference: string; hoursAgo: number; reason: string; automatic: boolean };
  assignee?: string;
};

const INTAKE: Intake = {
  industry: "Dental",
  city: "Austin",
  country: "United States",
  annualRevenue: "$500k to $1M",
  employees: "6 to 20",
  urlCheck: "verified",
  marketingConsent: false,
};

export const DRAFT_SECTIONS: DraftSection[] = [
  { key: "technical", state: "complete", findings: [
    { severity: "critical", title: "Homepage takes 6.1s to load on mobile", body: "Above the 2.5s threshold Google uses. Mobile is 68% of your traffic." },
    { severity: "medium", title: "Sitemap lists 14 pages that no longer exist", body: "Google keeps trying to crawl them and wastes its visits to your site." },
    { severity: "pass", title: "HTTPS and redirects", body: "All HTTP traffic redirects correctly to HTTPS." },
  ] },
  { key: "on_page", state: "complete", findings: [
    { severity: "critical", title: "Service pages share one title tag", body: "Six pages are all called “Home”, so Google can't tell them apart." },
    { severity: "medium", title: "No city name on the booking page", body: "People search “dentist near me” and “dentist Austin”. This page mentions neither." },
    { severity: "pass", title: "Image alt text", body: "Present on 91% of images." },
  ] },
  { key: "off_page", state: "complete", findings: [
    { severity: "medium", title: "Competitors average 3x your local links", body: "About 20 quality local links would close the gap." },
    { severity: "pass", title: "Google Business Profile", body: "Verified, with 142 reviews at 4.8 stars." },
  ] },
  { key: "competitive", state: "complete", findings: [
    { severity: "critical", title: "Two competitors rank for “emergency dentist Austin”", body: "You don't have a page for it. It's the term you're closest to winning." },
  ] },
];

const FIX_FIRST = [
  "Compress the homepage images. About an hour of work, and the biggest single traffic gain.",
  "Give every service page its own title. Google can't rank six pages all called “Home”.",
  "Build one page for “emergency dentist Austin”. It's the term you're closest to winning.",
];

function stagesFor(status: AdminStatus, at: Seed["at"], paid: number, delivered?: number): StageRecord[] {
  const iso = (h: number) => new Date(paid + h * HOUR).toISOString();
  const doneThrough = (i: number) => (j: number): StageState => (j < i ? "done" : j === i ? "active" : "pending");
  let state: (j: number) => StageState;
  switch (status) {
    case "awaiting_payment":
    case "payment_failed":
      state = (j) => (j === 0 && status === "payment_failed" ? "failed" : "pending");
      break;
    case "ready":
    case "partial":
      state = () => "done";
      break;
    case "refunded":
      state = (j) => (j === 0 ? "done" : j === 1 ? "failed" : "pending");
      break;
    case "reviewing":
      state = doneThrough(4);
      break;
    case "failed":
    case "blocked":
    case "escalated": {
      const i = STAGES.indexOf(at ?? "crawl");
      state = (j) => (j < i ? "done" : j === i ? "failed" : "pending");
      break;
    }
    default:
      state = doneThrough(STAGES.indexOf(at ?? "crawl"));
  }
  return STAGES.map((stage, j) => {
    const s = state(j);
    const when = stage === "payment" ? 0 : stage === "delivery" && delivered ? delivered : Math.min(j * 1.5, 20);
    return { stage, state: s, at: s === "done" || s === "failed" ? iso(when) : undefined };
  });
}

function emailsFor(seed: Seed, paid: number): EmailRecord[] {
  const iso = (h: number) => new Date(paid + h * HOUR).toISOString();
  const to = seed.email;
  if (seed.status === "awaiting_payment" || seed.status === "payment_failed") return [];
  const out: EmailRecord[] = [{ kind: "payment_succeeded", at: iso(0), to, state: "opened" }];
  if (seed.status === "blocked") out.push({ kind: "crawler_blocked", at: iso(0.4), to, state: "delivered" });
  if (seed.status === "late" || seed.status === "escalated") out.push({ kind: "deadline_missed", at: iso(24), to, state: "opened" });
  if (seed.status === "failed") out.push({ kind: "failed", at: iso(seed.paidHoursAgo - 0.5), to, state: "delivered" });
  if (seed.deliveredAfter) out.push({ kind: "report_ready", at: iso(seed.deliveredAfter), to, state: seed.flags?.includes("pdf_failed") ? "bounced" : "opened" });
  if (seed.refund) out.push({ kind: "refund_issued", at: new Date(paid + (seed.paidHoursAgo - seed.refund.hoursAgo) * HOUR).toISOString(), to, state: "delivered" });
  return out;
}

const SEEDS: Seed[] = [
  { id: "bra-4502", reference: "BRA-4502", status: "reviewing", businessName: "Harbor Dental Studio", websiteUrl: "https://harbordental.com",
    customerName: "Priya Raman", email: "priya@harbordental.com", paidHoursAgo: 20.8 },
  { id: "bra-4498", reference: "BRA-4498", status: "reviewing", businessName: "Greenleaf Landscaping", websiteUrl: "https://greenleafyards.com",
    customerName: "Tom Alvarez", email: "tom@greenleafyards.com", paidHoursAgo: 21.7,
    intake: { industry: "Landscaping", city: "Denver", employees: "1 to 5", annualRevenue: "Under $250k" } },
  { id: "bra-4505", reference: "BRA-4505", status: "reviewing", businessName: "Oak & Iron Fitness", websiteUrl: "https://oakandiron.fit",
    customerName: "Dana Whitfield", email: "dana@oakandiron.fit", paidHoursAgo: 9.2, flags: ["continued_past_url_check"],
    intake: { industry: "Fitness", city: "Portland", urlCheck: "unreachable", marketingConsent: true },
    review: { sections: DRAFT_SECTIONS.map((s) => (s.key === "competitive" ? { key: s.key, state: "unavailable", findings: [] } : s)) } },
  { id: "bra-4507", reference: "BRA-4507", status: "analysing", businessName: "Casa Verde Kitchen", websiteUrl: "https://casaverdekitchen.com",
    customerName: "Luis Ortega", email: "luis@casaverdekitchen.com", paidHoursAgo: 3.1, at: "analysis",
    intake: { industry: "Restaurant", city: "San Diego", marketingConsent: true } },
  { id: "bra-4509", reference: "BRA-4509", status: "crawling", businessName: "Summit Roofing Co.", websiteUrl: "https://summitroofing.co",
    customerName: "Grace Kim", email: "grace@summitroofing.co", paidHoursAgo: 0.6, at: "crawl",
    intake: { industry: "Roofing", city: "Nashville" } },
  { id: "bra-4496", reference: "BRA-4496", status: "late", businessName: "Blue Harbor Law", websiteUrl: "https://blueharborlaw.com",
    customerName: "Marcus Hale", email: "marcus@blueharborlaw.com", paidHoursAgo: 26.4, at: "compile",
    intake: { industry: "Legal", city: "Boston", employees: "21 to 50", annualRevenue: "$1M to $5M" } },
  { id: "bra-4488", reference: "BRA-4488", status: "escalated", businessName: "Pinecrest Veterinary", websiteUrl: "https://pinecrestvet.com",
    customerName: "Helen Moss", email: "helen@pinecrestvet.com", paidHoursAgo: 48.6, at: "analysis",
    failure: { stage: "SEO analysis", code: "LLM_TIMEOUT", message: "The analysis model timed out 3 times on the competitive section." },
    intake: { industry: "Veterinary", city: "Raleigh" }, assignee: "Nimali" },
  { id: "bra-4501", reference: "BRA-4501", status: "blocked", businessName: "Maple Street Bakery", websiteUrl: "https://maplestreetbakery.com",
    customerName: "Ruth Osei", email: "ruth@maplestreetbakery.com", paidHoursAgo: 7.5, at: "crawl",
    failure: { stage: "Site crawl", code: "CLOUDFLARE", message: "Cloudflare bot protection returned a challenge page on every request." },
    intake: { industry: "Bakery", city: "Madison", marketingConsent: true } },
  { id: "bra-4499", reference: "BRA-4499", status: "failed", businessName: "Riverbend Auto Repair", websiteUrl: "https://riverbendauto.com",
    customerName: "Sam Patel", email: "sam@riverbendauto.com", paidHoursAgo: 12.3, at: "analysis",
    failure: { stage: "SEO analysis", code: "EMPTY_CRAWL", message: "The crawl returned 2 pages. Every section came back empty." },
    intake: { industry: "Auto repair", city: "Tulsa" } },
  { id: "bra-4494", reference: "BRA-4494", status: "ready", businessName: "Lumen Photography", websiteUrl: "https://lumenphoto.studio",
    customerName: "Ava Lindqvist", email: "ava@lumenphoto.studio", paidHoursAgo: 30.5, deliveredAfter: 22, flags: ["sent_unreviewed"],
    intake: { industry: "Photography", city: "Seattle", marketingConsent: true } },
  { id: "bra-4490", reference: "BRA-4490", status: "ready", businessName: "Northside Plumbing", websiteUrl: "https://northsideplumbing.com",
    customerName: "Eddie Burke", email: "eddie@northsideplumbing.com", paidHoursAgo: 34, deliveredAfter: 14.2, flags: ["pdf_failed"],
    intake: { industry: "Plumbing", city: "Chicago" }, review: { reviewer: "Nimali" } },
  { id: "bra-4492", reference: "BRA-4492", status: "partial", businessName: "Bright Smile Orthodontics", websiteUrl: "https://brightsmileortho.com",
    customerName: "Jin Park", email: "jin@brightsmileortho.com", paidHoursAgo: 40, deliveredAfter: 18.5,
    intake: { industry: "Dental", city: "Phoenix" }, review: { reviewer: "Rasa" } },
  { id: "bra-4471", reference: "BRA-4471", status: "ready", businessName: "Johnson & Sons Plumbing", websiteUrl: "https://johnsonplumbing.com",
    customerName: "Bob Johnson", email: "bob@johnsonplumbing.com", paidHoursAgo: 70, deliveredAfter: 16, flags: ["disputed"],
    intake: { industry: "Plumbing", city: "Austin" }, review: { reviewer: "Nimali" } },
  { id: "bra-4506", reference: "BRA-4506", status: "queued", businessName: "Harbor Dental Studio", websiteUrl: "https://harbordental.com",
    customerName: "Priya Raman", email: "priya@harbordental.com", paidHoursAgo: 0.2, flags: ["possible_duplicate"], at: "crawl" },
  { id: "bra-4508", reference: "BRA-4508", status: "payment_failed", businessName: "Cedar Grove Florist", websiteUrl: "https://cedargroveflowers.com",
    customerName: "Mia Chen", email: "mia@cedargroveflowers.com", paidHoursAgo: 1.4,
    intake: { industry: "Florist", city: "Sacramento", marketingConsent: true } },
  { id: "bra-4480", reference: "BRA-4480", status: "refunded", businessName: "Elmwood Chiropractic", websiteUrl: "https://elmwoodchiro.com",
    customerName: "Nora Blake", email: "nora@elmwoodchiro.com", paidHoursAgo: 96, at: "crawl",
    refund: { reference: "RF-2210", hoursAgo: 60, reason: "Site can't be audited", automatic: false } },
];

export function adminFixtures(now: Date): AdminOrder[] {
  return SEEDS.map((seed) => {
    const paid = now.getTime() - seed.paidHoursAgo * HOUR;
    const inReview = seed.status === "reviewing" || seed.status === "ready" || seed.status === "partial";
    const partial = seed.status === "partial";
    const review: Review | undefined = inReview
      ? {
          score: 58,
          fixFirst: FIX_FIRST,
          sections: partial
            ? DRAFT_SECTIONS.map((s) => (s.key === "off_page" ? { key: s.key, state: "unavailable", reason: "Your domain is 41 days old, so there is no link history to measure yet.", findings: [] } : s))
            : DRAFT_SECTIONS,
          ...seed.review,
          ...(seed.deliveredAfter && !seed.flags?.includes("sent_unreviewed") ? { approvedAt: new Date(paid + (seed.deliveredAfter - 0.1) * HOUR).toISOString() } : {}),
        }
      : undefined;
    return {
      id: seed.id,
      reference: seed.reference,
      status: seed.status,
      businessName: seed.businessName,
      websiteUrl: seed.websiteUrl,
      email: seed.email,
      customerName: seed.customerName,
      amountCents: 150_000,
      paidAt: new Date(paid).toISOString(),
      deliveredAt: seed.deliveredAfter ? new Date(paid + seed.deliveredAfter * HOUR).toISOString() : undefined,
      stages: stagesFor(seed.status, seed.at, paid, seed.deliveredAfter),
      flags: seed.flags ?? [],
      intake: { ...INTAKE, ...seed.intake },
      payment: { stripeIntent: `pi_3Q${seed.reference.slice(4)}Xk2aLm`, card: "Visa ending 4242", feeCents: 4_380 },
      pdf: seed.flags?.includes("pdf_failed") ? "failed" : seed.deliveredAfter ? "built" : "pending",
      emails: emailsFor(seed, paid),
      review,
      failure: seed.failure,
      refund: seed.refund && {
        reference: seed.refund.reference,
        issuedAt: new Date(now.getTime() - seed.refund.hoursAgo * HOUR).toISOString(),
        reason: seed.refund.reason,
        automatic: seed.refund.automatic,
      },
      assignee: seed.assignee,
      audit: [
        { at: new Date(paid).toISOString(), who: "Stripe webhook", action: "Marked paid, deadline set to 24 hours" },
        ...(seed.flags?.includes("sent_unreviewed") ? [{ at: new Date(paid + 22 * HOUR).toISOString(), who: "System", action: "Auto-sent 2h before the deadline, flagged Sent unreviewed" }] : []),
        ...(review?.approvedAt ? [{ at: review.approvedAt, who: review.reviewer ?? "Nimali", action: "Approved the report" }] : []),
      ],
    };
  });
}

/** Two Stripe payments that don't line up with an order. */
export function stripeMismatches(now: Date): StripeMismatch[] {
  const ago = (h: number) => new Date(now.getTime() - h * HOUR).toISOString();
  return [
    { id: "sm-1", kind: "no_order", charge: "ch_3Q9xZt2aLmTide", email: "owner@tidewaterkayak.com", amountCents: 150_000, at: ago(5.2) },
    { id: "sm-2", kind: "wrong_amount", charge: "ch_3Q4509Xk2aLmSum", email: "grace@summitroofing.co", amountCents: 120_000, expectedCents: 150_000,
      orderId: "bra-4509", reference: "BRA-4509", businessName: "Summit Roofing Co.", at: ago(0.6) },
  ];
}

/** Refunds Ops prepared that wait for an owner. */
export function refundRequests(now: Date): RefundRequest[] {
  const ago = (h: number) => new Date(now.getTime() - h * HOUR).toISOString();
  return [
    { id: "rr-1", amountCents: 150_000, preparedBy: "Nimali", preparedAt: ago(1.9),
      note: "The site only has 2 pages, so every section came back empty. The customer asked to cancel rather than wait.",
      target: { kind: "order", orderId: "bra-4499", reference: "BRA-4499", businessName: "Riverbend Auto Repair" } },
    { id: "rr-2", amountCents: 150_000, preparedBy: "Nimali", preparedAt: ago(3.4),
      note: "Paid with no order behind it. I emailed them twice and got no reply, so returning the money.",
      target: { kind: "stripe", mismatchId: "sm-1", charge: "ch_3Q9xZt2aLmTide", email: "owner@tidewaterkayak.com" } },
  ];
}

export type Lead = { id: string; name: string; business: string; email: string; hoursAgo: number; paid: boolean; consent: boolean };

export const LEADS: Lead[] = [
  { id: "l-1", name: "Mia Chen", business: "Cedar Grove Florist", email: "mia@cedargroveflowers.com", hoursAgo: 1.4, paid: false, consent: true },
  { id: "l-2", name: "Grace Kim", business: "Summit Roofing Co.", email: "grace@summitroofing.co", hoursAgo: 0.7, paid: true, consent: false },
  { id: "l-3", name: "Owen Reyes", business: "Reyes HVAC", email: "owen@reyeshvac.com", hoursAgo: 3.2, paid: false, consent: false },
  { id: "l-4", name: "Leah Fox", business: "Fox & Finch Interiors", email: "leah@foxfinch.design", hoursAgo: 5.8, paid: false, consent: true },
];

export type DailyStat = {
  /** Local midnight of the day, ISO. */
  day: string;
  /** Reports delivered that day, and how many of those went out after the 24-hour deadline. */
  delivered: number;
  late: number;
  /** Money in, before Stripe fees, and money refunded that day. */
  grossCents: number;
  refundedCents: number;
};

// Fourteen days of history, oldest first. Fixed numbers so the charts don't jump between reloads.
const DELIVERED = [3, 5, 4, 2, 6, 7, 5, 4, 3, 6, 8, 7, 5, 3];
const LATE =      [0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 2, 0, 0];
const PAID =      [4, 5, 3, 3, 7, 6, 5, 4, 4, 7, 8, 6, 6, 8];
const REFUNDS =   [0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 1, 0, 0];

export function dailyStats(now: Date): DailyStat[] {
  const today = new Date(now);
  today.setHours(0, 0, 0, 0);
  return DELIVERED.map((delivered, i) => {
    const day = new Date(today);
    day.setDate(today.getDate() - (DELIVERED.length - 1 - i));
    return { day: day.toISOString(), delivered, late: LATE[i]!, grossCents: PAID[i]! * 150_000, refundedCents: REFUNDS[i]! * 150_000 };
  });
}
