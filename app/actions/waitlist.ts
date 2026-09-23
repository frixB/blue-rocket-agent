"use server";

export type WaitlistResult = { ok: true; email: string } | { ok: false; error: string };

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

/**
 * Waitlist signups (State A → State B). Posts to WAITLIST_WEBHOOK_URL (any
 * endpoint that accepts JSON: Zapier, Make, a mailing-list API). With no
 * webhook configured it says so rather than pretending to save the address.
 */
export async function joinWaitlist(_: WaitlistResult | null, form: FormData): Promise<WaitlistResult> {
  const email = String(form.get("email") ?? "").trim().slice(0, 254);
  if (!EMAIL.test(email)) return { ok: false, error: "Enter an email address like you@yourbusiness.com" };
  const hook = process.env.WAITLIST_WEBHOOK_URL;
  if (!hook) return { ok: false, error: "The waitlist isn't open yet. Email hello@bluerocketagents.com and we'll add you by hand." };
  const res = await fetch(hook, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ email, source: "landing-waitlist" }) }).catch(() => null);
  if (!res?.ok) return { ok: false, error: "We couldn't add you just now. Please try again in a minute." };
  return { ok: true, email };
}
