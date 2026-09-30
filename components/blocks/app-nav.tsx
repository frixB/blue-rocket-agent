import Link from "next/link";
import { currentUser } from "@/auth";
import { signOutAction } from "@/app/actions/auth";
import { Avatar, Button } from "@/components/ui";
import { Brand } from "./brand";

/** Figma "App nav bar". Signed in: initials tile and Sign out. Signed out: Sign in. */
export async function AppNav() {
  const user = await currentUser();
  return (
    <header className="flex items-center justify-between border-b border-hairline bg-raised px-nav-x py-nav-y">
      <Link href="/" aria-label="Blue Rocket Agents home" className="py-1.5"><Brand compact /></Link>
      <nav aria-label="Account" className="flex items-center gap-5 whitespace-nowrap type-body sm:gap-6">
        <Link href="/reports" className="py-3 font-semibold text-ink-2 hover:text-ink">My Reports</Link>
        <a href="mailto:hello@bluerocketagents.com" className="py-3 text-muted hover:text-ink">Help</a>
        {user ? (
          <>
            <Avatar name={user.name} />
            <form action={signOutAction}>
              <Button type="submit" variant="text" className="min-h-11 text-muted">Sign out</Button>
            </form>
          </>
        ) : (
          <Link href="/sign-in" className="py-3 text-muted hover:text-ink">Sign in</Link>
        )}
      </nav>
    </header>
  );
}
