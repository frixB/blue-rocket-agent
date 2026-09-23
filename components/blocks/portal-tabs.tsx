"use client";

import { usePathname } from "next/navigation";
import { Tabs } from "@/components/ui";

/** Figma "Portal tabs" under the nav on S-16 and S-17. */
export function PortalTabs() {
  const path = usePathname();
  return (
    <Tabs label="Your account" items={[
      { href: "/reports", label: "My Reports", active: path === "/reports" },
      { href: "/billing", label: "Billing", active: path === "/billing" },
    ]} />
  );
}
