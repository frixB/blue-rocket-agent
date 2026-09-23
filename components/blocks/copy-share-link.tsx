"use client";

import { useState } from "react";
import { Check, Link2 } from "lucide-react";
import { Button, Icon } from "@/components/ui";

type Variant = "ghost" | "text";

/** Copies a link to the clipboard and says so. `path` defaults to the current page. */
export function CopyLink({ path, label, variant = "ghost", full }: { path?: string; label: string; variant?: Variant; full?: boolean }) {
  const [copied, setCopied] = useState(false);
  return (
    <Button variant={variant} full={full} onClick={async () => {
      const url = path ? `${location.origin}${path}` : location.href;
      await navigator.clipboard.writeText(url).catch(() => {});
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }}>
      <Icon icon={copied ? Check : Link2} size="sm" />
      <span aria-live="polite">{copied ? "Link copied" : label}</span>
    </Button>
  );
}

/** The "Share" button on S-14: copies the read-only /share link (S-15). */
export function CopyShareLink({ token, label = "Share", variant = "ghost", full }: { token?: string; label?: string; variant?: Variant; full?: boolean }) {
  if (!token) return <Button variant={variant} full={full} disabled title="Share links arrive with accounts">{label}</Button>;
  return <CopyLink path={`/share/${token}`} label={label} variant={variant} full={full} />;
}
