import Link from "next/link";
import { notFound } from "next/navigation";
import { FIXTURES } from "@/lib/orders/fixtures";

/**
 * State gallery for PR review. Every fixture order, one click each.
 * Hidden unless NEXT_PUBLIC_SHOW_STATE_GALLERY=true (set it on Vercel previews).
 */
export default function StateGallery() {
  if (process.env.NEXT_PUBLIC_SHOW_STATE_GALLERY !== "true" && process.env.NODE_ENV === "production") notFound();
  return (
    <main data-theme="app" className="mx-auto flex min-h-dvh max-w-app flex-col gap-6 bg-page px-5 py-16 text-ink">
      <h1 className="type-heading-h1">Order states</h1>
      <p className="type-body text-ink-2">Every state a paying customer can land on. Review these on the PR preview instead of in Figma.</p>
      <ul className="grid gap-3 sm:grid-cols-2">
        {Object.values(FIXTURES).map((o) => (
          <li key={o.id}>
            <Link href={`/reports/${o.id}`} className="flex flex-col rounded-card border border-hairline bg-raised p-5 hover:shadow-raised">
              <span className="type-body-strong">{o.status}</span>
              <span className="type-caption text-muted">/reports/{o.id}</span>
            </Link>
          </li>
        ))}
      </ul>
    </main>
  );
}
