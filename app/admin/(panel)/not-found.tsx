import Link from "next/link";
import { SearchX } from "lucide-react";
import { EmptyState } from "@/components/ui";
import { cn } from "@/lib/cn";
import { adminGutter } from "@/components/blocks/admin/admin-page";

/** An order or admin page that doesn't exist, inside the admin frame so search and the sidebar are one step away. */
export default function AdminNotFound() {
  return (
    <main id="main" className={cn("flex w-full flex-col pb-page-bottom pt-10", adminGutter)}>
      <EmptyState icon={SearchX} title="We couldn't find that"
        body="The order or page may have been deleted, or the link is wrong. Search by BRA reference, email or business name above."
        action={<Link href="/admin/orders" className="py-2 type-body-sm font-semibold text-ink-2 underline">Go to Orders</Link>} />
    </main>
  );
}
