import { adminFixtures, dailyStats, LEADS, refundRequests, stripeMismatches, type Lead } from "./fixtures";
import {
  ACCOUNTS, CONTACTS, DATA_REQUESTS, DATA_SOURCES, INVOICES, LEAD_DETAILS, PAYOUTS, REPORT_TYPES, SHARE_LINKS, TEAM,
  auditEvents, integrations, pipelineAlerts, type AccountFacts, type LeadDetail,
} from "./fixtures-modules";
import { urgency } from "./clock";
import type { AdminOrder } from "./types";

/**
 * The admin data layer. Fixture-backed today; swap each function for a
 * database query. Pages never import fixtures directly.
 */
export async function listOrders(now: Date): Promise<AdminOrder[]> {
  return adminFixtures(now).sort((a, b) => urgency(a, now) - urgency(b, now) || b.paidAt.localeCompare(a.paidAt));
}

export async function getOrder(id: string, now: Date): Promise<AdminOrder | null> {
  return adminFixtures(now).find((o) => o.id === id) ?? null;
}

export async function listLeads() {
  return LEADS;
}

/** One row per day for the last 14 days: deliveries, late deliveries, money in and out. */
export async function listDailyStats(now: Date) {
  return dailyStats(now);
}

/** Stripe payments that don't match an order. */
export async function listStripeMismatches(now: Date) {
  return stripeMismatches(now);
}

/** Refunds Ops prepared, waiting for one owner to approve or decline. */
export async function listRefundRequests(now: Date) {
  return refundRequests(now);
}

// ── Grow, Money and Admin modules ────────────────────────────────────────

export type Customer = {
  id: string;
  name: string;
  email: string;
  business: string;
  orders: AdminOrder[];
  spentCents: number;
  refundedCents: number;
  account: AccountFacts;
  lastOrderAt: string;
};

/** A URL-safe id from the email: priya@harbordental.com → priya-at-harbordental-com. */
export const customerId = (email: string) => email.toLowerCase().replace("@", "-at-").replace(/[^a-z0-9-]+/g, "-");

/** One row per paying email, built from the orders so totals match Orders and Revenue. */
export async function listCustomers(now: Date): Promise<Customer[]> {
  const byEmail = new Map<string, AdminOrder[]>();
  for (const o of adminFixtures(now)) byEmail.set(o.email, [...(byEmail.get(o.email) ?? []), o]);
  return [...byEmail.entries()].map(([email, orders]) => {
    const sorted = orders.sort((a, b) => b.paidAt.localeCompare(a.paidAt));
    const paid = sorted.filter((o) => !["awaiting_payment", "payment_failed"].includes(o.status));
    return {
      id: customerId(email), name: sorted[0]!.customerName, email, business: sorted[0]!.businessName, orders: sorted,
      spentCents: paid.reduce((s, o) => s + o.amountCents, 0),
      refundedCents: sorted.filter((o) => o.refund).reduce((s, o) => s + o.amountCents, 0),
      account: ACCOUNTS[email] ?? { claimed: false, signIn: null },
      lastOrderAt: sorted[0]!.paidAt,
    };
  }).sort((a, b) => b.lastOrderAt.localeCompare(a.lastOrderAt));
}

export async function getCustomer(id: string, now: Date) {
  const customer = (await listCustomers(now)).find((c) => c.id === id);
  if (!customer) return null;
  return {
    customer,
    shareLinks: SHARE_LINKS.filter((s) => s.email === customer.email),
    dataRequests: DATA_REQUESTS.filter((d) => d.email === customer.email),
  };
}

export async function listDataRequests() {
  return DATA_REQUESTS;
}

export type LeadRow = Lead & LeadDetail;
export async function listLeadRows(): Promise<LeadRow[]> {
  const none: LeadDetail = { website: "", stoppedAt: "Form step 1", notes: [] };
  return LEADS.map((l) => ({ ...l, ...(LEAD_DETAILS[l.id] ?? none) }))
    .sort((a, b) => a.hoursAgo - b.hoursAgo);
}

export async function listDataSources() {
  return DATA_SOURCES;
}

export async function listPipelineAlerts(now: Date) {
  return pipelineAlerts(now);
}

export async function listContacts() {
  return CONTACTS;
}

export async function listReportTypes() {
  return REPORT_TYPES;
}

export async function listPayouts() {
  return PAYOUTS;
}

export async function listInvoices() {
  return INVOICES;
}

export async function listTeam() {
  return TEAM;
}

export async function listIntegrations() {
  return integrations();
}

export async function listAuditEvents(now: Date) {
  return auditEvents(now);
}
