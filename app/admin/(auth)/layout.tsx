import { Card, Chip } from "@/components/ui";
import { Brand } from "@/components/blocks/brand";

/**
 * Admin sign-in, invite and signed-out screens: one quiet column, no sidebar.
 * The help line is the way back in for anyone locked out.
 */
export default function AdminAuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <main id="main" className="flex min-h-dvh flex-col items-center justify-center gap-6 px-4 py-12">
      <span className="flex items-center gap-3">
        <Brand />
        <Chip>Admin</Chip>
      </span>
      <Card as="div" className="w-full max-w-md gap-6">{children}</Card>
      <p className="max-w-md text-center type-caption text-muted">
        Locked out or lost your phone? Ask an owner, Rasa or Carlos, to reset your access.
      </p>
    </main>
  );
}
