/**
 * Until the backend exists, actions a person handles (retry, refund, rush,
 * talk to someone) open an email to support with the order already named,
 * so the button always does something real.
 */
export const SUPPORT_EMAIL = "hello@bluerocketagents.com";

export function supportHref(subject: string, reference?: string) {
  const s = reference ? `${subject} (order #${reference})` : subject;
  return `mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent(s)}`;
}
