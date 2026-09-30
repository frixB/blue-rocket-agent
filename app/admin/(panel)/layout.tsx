import { AdminShell } from "@/components/blocks/admin/admin-shell";
import { listOrders, listStripeMismatches } from "@/lib/admin/data";
import { listExceptions } from "@/lib/admin/exceptions";
import { currentAdmin } from "@/lib/admin/session";

/** The signed-in admin: sidebar, top bar and live counts. currentAdmin() sends anyone else to sign-in. */
export default async function PanelLayout({ children }: { children: React.ReactNode }) {
  const now = new Date();
  const [user, orders, mismatches] = await Promise.all([currentAdmin(), listOrders(now), listStripeMismatches(now)]);
  const counts = { review: orders.filter((o) => o.status === "reviewing").length, exceptions: listExceptions(orders, mismatches, now).length };
  return <AdminShell user={user} counts={counts}>{children}</AdminShell>;
}
