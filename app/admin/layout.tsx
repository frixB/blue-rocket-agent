import type { Metadata } from "next";

export const metadata: Metadata = { title: "Admin · Blue Rocket Agents", robots: { index: false, follow: false } };

/**
 * Every admin screen, signed in or not: the light app theme, like the customer
 * portal. Admin cards drop their hairline and sit on a soft shadow instead;
 * the border stays, transparent, so Windows high-contrast mode still draws it.
 */
export default function AdminRoot({ children }: { children: React.ReactNode }) {
  return (
    <div data-theme="app" className="admin-soft min-h-dvh bg-page text-ink">
      {children}
    </div>
  );
}
