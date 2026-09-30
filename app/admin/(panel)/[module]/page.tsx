import { notFound } from "next/navigation";
import Link from "next/link";
import { Construction, Lock } from "lucide-react";
import { Chip, EmptyState } from "@/components/ui";
import { AdminPage } from "@/components/blocks/admin/admin-page";
import { canSee, moduleByKey } from "@/lib/admin/modules";
import { currentAdmin } from "@/lib/admin/session";

/**
 * Modules from the blueprint that aren't built yet. Each one says what it
 * will hold, so the sidebar is honest about what exists.
 */
export default async function PlannedModule({ params }: { params: Promise<{ module: string }> }) {
  const { module } = await params;
  const m = moduleByKey(module);
  if (!m || m.built) notFound();
  const user = await currentAdmin();
  if (!canSee(m, user.role)) {
    return (
      <AdminPage title={m.label} intro="This area is for owners.">
        <EmptyState icon={Lock} title="Owners only" body={`${m.label} is visible to Rasa and Carlos. Ask one of them if you need something here.`}
          action={<Link href="/admin" className="py-2 type-body-sm font-semibold text-ink-2 underline">Back to Overview</Link>} />
      </AdminPage>
    );
  }
  return (
    <AdminPage title={m.label} intro={m.summary} action={<Chip tone={m.priority === "Must" ? "warning" : "neutral"}>{m.priority === "Must" ? "MVP" : m.priority}</Chip>}>
      <EmptyState icon={Construction} title="Not built yet" body="This module is in the blueprint and comes after Overview, Review queue and Orders."
        action={<Link href="/admin" className="py-2 type-body-sm font-semibold text-ink-2 underline">Back to Overview</Link>} />
    </AdminPage>
  );
}
