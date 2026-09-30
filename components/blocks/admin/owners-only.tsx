import Link from "next/link";
import { Lock } from "lucide-react";
import { EmptyState } from "@/components/ui";
import { AdminPage } from "./admin-page";

/**
 * What Ops sees on an owner module reached by URL. The sidebar already hides
 * these; this is the server-side refusal, so a typed link shows nothing either.
 */
export function OwnersOnlyPage({ title }: { title: string }) {
  return (
    <AdminPage title={title} intro="This area is for owners.">
      <EmptyState icon={Lock} title="Owners only" body={`${title} is visible to Rasa and Carlos. Ask one of them if you need something here.`}
        action={<Link href="/admin" className="py-2 type-body-sm font-semibold text-ink-2 underline">Back to Overview</Link>} />
    </AdminPage>
  );
}
