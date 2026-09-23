"use client";

import { useState } from "react";
import { Check, Link2 } from "lucide-react";
import { Button, Icon } from "@/components/ui";

/** The "Share" button on S-14: copies the read-only /share link (S-15). */
export function CopyShareLink({ token }: { token?: string }) {
  const [copied, setCopied] = useState(false);
  if (!token) return <Button variant="ghost" disabled title="Share links arrive with accounts">Share</Button>;
  return (
    <Button variant="ghost" onClick={async () => {
      await navigator.clipboard.writeText(`${location.origin}/share/${token}`).catch(() => {});
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }}>
      <Icon icon={copied ? Check : Link2} size="sm" />
      <span aria-live="polite">{copied ? "Link copied" : "Share"}</span>
    </Button>
  );
}
