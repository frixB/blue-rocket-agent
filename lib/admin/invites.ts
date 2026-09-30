import { previewEnabled } from "@/lib/preview";
import type { Role } from "./types";

export type Invite =
  | { state: "open"; email: string; name: string; role: Role; invitedBy: string; expiresInHours: number }
  | { state: "expired" | "used"; invitedBy: string };

/**
 * An admin invite, by the token in its link. No provider yet, so production
 * finds none. Review builds get three fixtures, one per state the screen
 * handles: /admin/invite/demo-invite, demo-expired, demo-used.
 */
export async function getInvite(token: string): Promise<Invite | null> {
  if (!previewEnabled) return null;
  const invites: Record<string, Invite> = {
    "demo-invite": { state: "open", email: "nimali@frixb.com", name: "Nimali", role: "ops", invitedBy: "Rasa", expiresInHours: 46 },
    "demo-expired": { state: "expired", invitedBy: "Rasa" },
    "demo-used": { state: "used", invitedBy: "Carlos" },
  };
  return invites[token] ?? null;
}
