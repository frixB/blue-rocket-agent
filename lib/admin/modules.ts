import type { Route } from "next";
import type { Role } from "./types";

export type ModuleKey =
  | "overview" | "review" | "orders" | "exceptions" | "pipeline"
  | "customers" | "leads" | "audience" | "report-types"
  | "revenue" | "settings" | "audit";

export type AdminModule = {
  key: ModuleKey;
  label: string;
  href: Route;
  /** Roles that see it in the sidebar. */
  roles: readonly Role[];
  /** What goes inside, from the blueprint IA. Shown on modules not built yet. */
  summary: string;
  priority: "Must" | "Should" | "Could";
  built: boolean;
};

/** Typed routes don't resolve the [module] catch-all for literals, so cast here once. */
const at = (path: string) => path as Route;
const BOTH = ["owner", "ops"] as const;
const OWNERS = ["owner"] as const;

export const MODULE_GROUPS: { group: string; modules: AdminModule[] }[] = [
  { group: "Operate", modules: [
    { key: "overview", label: "Overview", href: at("/admin"), roles: BOTH, built: true, priority: "Must",
      summary: "What runs out of time next, late orders, needs attention, new leads, and revenue today for owners." },
    { key: "review", label: "Review queue", href: at("/admin/review"), roles: BOTH, built: true, priority: "Must",
      summary: "Drafts by time left, the auto-send timer, finding editor, client context and the sent unreviewed list." },
    { key: "orders", label: "Orders", href: at("/admin/orders"), roles: BOTH, built: true, priority: "Must",
      summary: "Every order by status and flag. Detail: stages, payment, emails, PDF, flags and actions." },
    { key: "exceptions", label: "Exceptions", href: at("/admin/exceptions"), roles: BOTH, built: true, priority: "Must",
      summary: "Blocked, partial, failed, late and escalated orders, Stripe mismatches and duplicates, sorted by time left. Ops can prepare a refund; owners approve it." },
    { key: "pipeline", label: "Pipeline health", href: at("/admin/pipeline"), roles: BOTH, built: true, priority: "Must",
      summary: "Runs by stage, errors, retry one stage, data source status and alerts." },
  ] },
  { group: "Grow", modules: [
    { key: "customers", label: "Customers", href: at("/admin/customers"), roles: BOTH, built: true, priority: "Must",
      summary: "Account, orders, credits, share links, sign-in help and data requests. Ops can resend links and receipts." },
    { key: "leads", label: "Leads", href: at("/admin/leads"), roles: BOTH, built: true, priority: "Must",
      summary: "Every form submission, paid or unpaid, with the consent flag and call notes. Ops can view, not export." },
    { key: "audience", label: "Audience", href: at("/admin/audience"), roles: OWNERS, built: true, priority: "Should",
      summary: "Newsletter, waitlist by report type and buyers. Export is consented contacts only." },
    { key: "report-types", label: "Report types", href: at("/admin/report-types"), roles: OWNERS, built: true, priority: "Could",
      summary: "The catalog: Live or Coming soon, price, sample report, notify the waitlist on launch." },
  ] },
  { group: "Money", modules: [
    { key: "revenue", label: "Revenue", href: at("/admin/revenue"), roles: OWNERS, built: true, priority: "Should",
      summary: "Gross, Stripe fees, refunds, disputes and net. The 30/35/35 split, payouts, credits, receipts and VAT invoices." },
  ] },
  { group: "Admin", modules: [
    { key: "settings", label: "Settings", href: at("/admin/settings"), roles: OWNERS, built: true, priority: "Must",
      summary: "Team and roles, auto-send window, pricing, email templates, integrations, alerts and maintenance mode." },
    { key: "audit", label: "Audit log", href: at("/admin/audit"), roles: OWNERS, built: true, priority: "Must",
      summary: "Every action: who, what, when, before and after." },
  ] },
];

export const ALL_MODULES = MODULE_GROUPS.flatMap((g) => g.modules);
export const moduleByKey = (key: string) => ALL_MODULES.find((m) => m.key === key);
export const canSee = (m: AdminModule, role: Role) => m.roles.includes(role);
