import Link from "next/link";
import { LogOut, Menu, Search } from "lucide-react";
import { Avatar, Button, Chip, Icon, Input } from "@/components/ui";
import { previewAdminRole } from "@/app/actions/admin";
import { adminSignOut } from "@/app/actions/admin-auth";
import { MODULE_GROUPS, canSee, type ModuleKey } from "@/lib/admin/modules";
import { previewEnabled } from "@/lib/preview";
import type { AdminUser } from "@/lib/admin/types";
import { Brand } from "../brand";
import { cn } from "@/lib/cn";
import { adminGutter } from "./admin-page";
import { SidebarNav, type NavItem } from "./sidebar-nav";

/**
 * The admin frame: sidebar with the working modules on top and the planned
 * ones folded away, a top bar with order search and the signed-in admin.
 * Modules a role can't use are not in the sidebar at all.
 */
export function AdminShell({ user, counts, children }: {
  user: AdminUser;
  /** Live badges beside a module, e.g. drafts waiting in the review queue. */
  counts: Partial<Record<ModuleKey, number>>;
  children: React.ReactNode;
}) {
  const visible = MODULE_GROUPS.map((g) => ({
    group: g.group,
    items: g.modules.filter((m) => canSee(m, user.role)).map(({ key, href, label, built }): NavItem => ({ key, href, label, built, count: counts[key] })),
  }));
  const built = visible.map((g) => ({ group: g.group, items: g.items.filter((m) => m.built) })).filter((g) => g.items.length);
  const planned = visible.map((g) => ({ group: g.group, items: g.items.filter((m) => !m.built) })).filter((g) => g.items.length);
  return (
    <div className="flex min-h-dvh flex-col lg:flex-row">
      <aside className="shrink-0 border-b border-hairline bg-raised px-4 py-3 lg:sticky lg:top-0 lg:flex lg:h-dvh lg:w-60 lg:flex-col lg:gap-6 lg:overflow-x-hidden lg:overflow-y-auto lg:border-r lg:border-b-0 lg:py-5">
        {/* Phones get the same nav behind a Menu toggle, so the screen starts with content. */}
        <details className="group lg:hidden">
          <summary className="flex min-h-control-md cursor-pointer list-none items-center justify-between gap-3 px-1">
            <Brand compact />
            <span className="flex items-center gap-1.5 type-body-sm font-semibold text-ink-2">Menu <Icon icon={Menu} size="sm" /></span>
          </summary>
          <div className="flex flex-col gap-6 pt-4">
            <SidebarNav built={built} planned={planned} />
            {previewEnabled && <RoleSwitch user={user} />}
          </div>
        </details>
        <div className="hidden lg:contents">
          <Link href="/admin" aria-label="Admin overview" className="flex items-center gap-2 px-3">
            <Brand compact />
          </Link>
          <SidebarNav built={built} planned={planned} />
          {previewEnabled && <div className="mt-auto"><RoleSwitch user={user} /></div>}
        </div>
      </aside>
      <div className="flex min-w-0 flex-1 flex-col">
        <header className={cn("z-10 flex flex-wrap items-center justify-between gap-4 border-b border-hairline bg-raised py-3 lg:sticky lg:top-0", adminGutter)}>
          <form action="/admin/orders" role="search" className="w-full max-w-md">
            <label htmlFor="admin-q" className="sr-only">Search orders by reference, email or business</label>
            <Input id="admin-q" name="q" placeholder="Search BRA ref, email or business" trailing={<Icon icon={Search} size="sm" className="text-muted" />} />
          </form>
          <div className="flex items-center gap-3">
            <Chip tone={user.role === "owner" ? "info" : "neutral"}>{user.role === "owner" ? "Super admin" : "Ops"}</Chip>
            <span className="hidden type-body-sm-strong text-ink sm:inline">{user.name}</span>
            <Avatar name={user.name} />
            <form action={adminSignOut}>
              <Button type="submit" variant="text" size="sm" className="gap-1.5"><Icon icon={LogOut} size="sm" /> Sign out</Button>
            </form>
          </div>
        </header>
        {children}
      </div>
    </div>
  );
}

function RoleSwitch({ user }: { user: AdminUser }) {
  const option = "flex-1 rounded-control border border-hairline bg-raised px-2 py-1.5 pointer-coarse:min-h-11 type-caption-strong text-ink-2 aria-pressed:border-action aria-pressed:text-ink";
  return (
    <form action={previewAdminRole} className="flex flex-col gap-2 rounded-lg border border-transparent bg-page p-3">
      <span className="type-caption-strong text-ink-2">Preview as</span>
      <div className="flex gap-2">
        <button name="role" value="owner" aria-pressed={user.role === "owner"} className={option}>Owner</button>
        <button name="role" value="ops" aria-pressed={user.role === "ops"} className={option}>Ops</button>
      </div>
      <span className="type-caption text-muted">Review builds only. Sign-in and 2FA replace this.</span>
    </form>
  );
}
