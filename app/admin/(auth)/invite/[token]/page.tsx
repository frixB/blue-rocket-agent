import type { Metadata } from "next";
import Link from "next/link";
import { MailX } from "lucide-react";
import { Heading, IconTile, buttonStyles } from "@/components/ui";
import { InviteSetup } from "@/components/blocks/admin/admin-auth-forms";
import { getInvite } from "@/lib/admin/invites";

export const metadata: Metadata = { title: "Set up your admin access · Blue Rocket Agents" };

/**
 * Where an admin invite link lands. Open: set up password, authenticator and
 * backup codes. Expired, used or unknown: say which, and who can send a new one.
 */
export default async function AcceptInvite({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const invite = await getInvite(token);
  if (invite?.state === "open") {
    return <InviteSetup email={invite.email} name={invite.name} roleLabel={invite.role === "owner" ? "an owner" : "Ops"}
      invitedBy={invite.invitedBy} expiresInHours={invite.expiresInHours} />;
  }
  const title = invite?.state === "used" ? "This invite has been used" : invite?.state === "expired" ? "This invite has expired" : "This invite link doesn't work";
  const body = invite?.state === "used"
    ? "Your account is already set up. Sign in with your email, password and authenticator app."
    : `Invites work for 48 hours. Ask ${invite?.invitedBy ?? "an owner, Rasa or Carlos,"} to send you a new one.`;
  return (
    <>
      <IconTile icon={MailX} tone="warning" size="lg" />
      <div className="flex flex-col gap-2">
        <Heading as="h1" variant="h2">{title}</Heading>
        <p className="type-body text-ink-2">{body}</p>
      </div>
      <Link href="/admin/sign-in" className={buttonStyles({ variant: invite?.state === "used" ? "primary" : "ghost", full: true })}>Go to sign in</Link>
    </>
  );
}
