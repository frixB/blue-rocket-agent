import Link from "next/link";
import { notFound } from "next/navigation";
import { FIXTURES } from "@/lib/orders/fixtures";

/**
 * Review gallery for PRs: every order state, then every other screen with its
 * Figma frame. Hidden unless NEXT_PUBLIC_SHOW_STATE_GALLERY=true (set it on
 * Vercel previews).
 */
const SCREENS: { group: string; items: { href: string; label: string; figma: string }[] }[] = [
  { group: "Marketing and ordering", items: [
    { href: "/", label: "Landing page", figma: "7203:2155" },
    { href: "/order", label: "Form steps 1–2 + S-01 URL check", figma: "7203:2397 · 7203:2823 · 7369:2" },
    { href: "/order/checkout", label: "S-02 Redirecting to Stripe", figma: "7368:90" },
    { href: "/order/demo-payment-failed", label: "S-03 Payment failed", figma: "7358:5" },
    { href: "/order/demo-awaiting", label: "Finish paying", figma: "—" },
    { href: "/order/duplicate/demo-running", label: "S-04 Duplicate purchase", figma: "7368:102" },
  ] },
  { group: "Portal", items: [
    { href: "/reports", label: "S-16 My Reports", figma: "7366:2" },
    { href: "/reports?view=empty", label: "S-16 My Reports, empty", figma: "7366:70" },
    { href: "/billing", label: "S-17 Billing", figma: "7366:102" },
    { href: "/reports/demo-ready/report", label: "S-14 Report detail", figma: "7365:2" },
  ] },
  { group: "Account", items: [
    { href: "/sign-in", label: "S-18 Sign in", figma: "7368:22" },
    { href: "/sign-in?preview=sent", label: "S-18 → link sent", figma: "7368:65" },
    { href: "/sign-in/password?preview=error", label: "S-18b Wrong password", figma: "7368:43" },
    { href: "/reset-password?preview=sent", label: "S-19 Reset link sent", figma: "7368:65" },
    { href: "/recover", label: "S-05 Recover your order", figma: "7358:35" },
    { href: "/claim/demo-running", label: "S-07 Claim your account", figma: "7368:2" },
    { href: "/signed-out", label: "S-20 Session expired", figma: "7368:79" },
  ] },
  { group: "Admin (blueprint v2, 28 Sep 2026)", items: [
    { href: "/admin", label: "Overview", figma: "board 64:1342" },
    { href: "/admin/review", label: "Review queue", figma: "Flow B" },
    { href: "/admin/review/bra-4505", label: "Review: partial, URL check skipped", figma: "Flow B" },
    { href: "/admin/review/bra-4494", label: "Review: sent unreviewed (post-send)", figma: "Flow B" },
    { href: "/admin/orders", label: "Orders", figma: "Flow C" },
    { href: "/admin/orders/bra-4488", label: "Order: escalated, auto-refund", figma: "Flow C · G" },
    { href: "/admin/orders/bra-4501", label: "Order: blocked by Cloudflare", figma: "Flow C · G" },
    { href: "/admin/orders/bra-4490", label: "Order: ready, PDF failed", figma: "Flow C" },
    { href: "/admin/exceptions", label: "Exceptions and refund approvals", figma: "—" },
    { href: "/admin/pipeline", label: "Pipeline health", figma: "—" },
    { href: "/admin/customers", label: "Customers", figma: "—" },
    { href: "/admin/customers/jin-at-brightsmileortho-com", label: "Customer: credit and share link", figma: "—" },
    { href: "/admin/customers/nora-at-elmwoodchiro-com", label: "Customer: data delete request", figma: "—" },
    { href: "/admin/leads", label: "Leads", figma: "—" },
    { href: "/admin/audience", label: "Audience (owners)", figma: "—" },
    { href: "/admin/report-types", label: "Report types (owners)", figma: "—" },
    { href: "/admin/revenue", label: "Revenue (owners)", figma: "—" },
    { href: "/admin/settings", label: "Settings (owners)", figma: "—" },
    { href: "/admin/audit", label: "Audit log (owners)", figma: "—" },
    { href: "/admin/sign-in", label: "Admin sign-in", figma: "—" },
    { href: "/admin/sign-in?preview=error", label: "Admin sign-in: wrong password", figma: "—" },
    { href: "/admin/sign-in?preview=locked", label: "Admin sign-in: locked", figma: "—" },
    { href: "/admin/sign-in/verify", label: "Admin 2FA code", figma: "—" },
    { href: "/admin/sign-in/verify?preview=error", label: "Admin 2FA: wrong code", figma: "—" },
    { href: "/admin/invite/demo-invite", label: "Admin invite: set up", figma: "—" },
    { href: "/admin/invite/demo-expired", label: "Admin invite: expired", figma: "—" },
    { href: "/admin/signed-out", label: "Admin session expired", figma: "—" },
  ] },
  { group: "Sharing and system", items: [
    { href: "/share/demo-share", label: "S-15 Shared view", figma: "7369:72" },
    { href: "/share/demo-expired", label: "S-15b Link expired", figma: "7369:321" },
    { href: "/maintenance", label: "S-21b Maintenance", figma: "7369:308" },
    { href: "/this-page-does-not-exist", label: "S-21a 404", figma: "7369:298" },
    { href: "/dev/components", label: "Component gallery", figma: "—" },
  ] },
];

function Tile({ href, title, sub }: { href: string; title: string; sub: string }) {
  return (
    <a href={href} className="flex flex-col rounded-card border border-hairline bg-raised p-5 hover:shadow-raised">
      <span className="type-body-strong">{title}</span>
      <span className="type-caption text-muted">{sub}</span>
    </a>
  );
}

export default function StateGallery() {
  if (process.env.NEXT_PUBLIC_SHOW_STATE_GALLERY !== "true" && process.env.NODE_ENV === "production") notFound();
  return (
    <main id="main" data-theme="app" className="mx-auto flex min-h-dvh max-w-app flex-col gap-6 bg-page px-5 py-16 text-ink">
      <h1 className="type-bra-heading-1">Order states</h1>
      <p className="type-body text-ink-2">Every state a paying customer can land on. Review these on the PR preview instead of in Figma.</p>
      <ul className="grid gap-3 sm:grid-cols-2">
        {Object.values(FIXTURES).map((o) => (
          <li key={o.id}><Link href={`/reports/${o.id}`} className="flex flex-col rounded-card border border-hairline bg-raised p-5 hover:shadow-raised">
            <span className="type-body-strong">{o.status}</span>
            <span className="type-caption text-muted">/reports/{o.id}</span>
          </Link></li>
        ))}
      </ul>
      {SCREENS.map((g) => (
        <section key={g.group} className="flex flex-col gap-3">
          <h2 className="type-bra-heading-2">{g.group}</h2>
          <ul className="grid gap-3 sm:grid-cols-2">{g.items.map((s) => <li key={s.href}><Tile href={s.href} title={s.label} sub={`${s.href} · Figma ${s.figma}`} /></li>)}</ul>
        </section>
      ))}
    </main>
  );
}
