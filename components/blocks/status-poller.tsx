"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

/** Re-renders the server page while the order is in flight. */
export function StatusPoller({ active, intervalMs = 15_000 }: { active: boolean; intervalMs?: number }) {
  const router = useRouter();
  useEffect(() => {
    if (!active) return;
    const id = setInterval(() => router.refresh(), intervalMs);
    return () => clearInterval(id);
  }, [active, intervalMs, router]);
  return null;
}
