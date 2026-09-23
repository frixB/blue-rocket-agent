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
    <main data-theme="app" className="mx-auto flex min-h-dvh max-w-app flex-col gap-6 bg-page px-5 py-16 text-ink">
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
