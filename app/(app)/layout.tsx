import { AppNav } from "@/components/blocks/app-nav";

/** Light is where the customer works. */
export default function PortalLayout({ children }: { children: React.ReactNode }) {
  return (
    <div data-theme="app" className="min-h-dvh bg-page text-ink">
      <AppNav />
      {children}
    </div>
  );
}
