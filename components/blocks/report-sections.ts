import { FileText, Link2, Trophy, Wrench } from "lucide-react";
import type { LucideIcon } from "@/components/ui";
import type { SectionKey } from "@/lib/orders/types";

/**
 * The four report sections. Same names, order and icons on the landing page,
 * the report detail page (S-14) and the partial report (S-09).
 */
export const REPORT_SECTIONS: Record<SectionKey, { name: string; icon: LucideIcon; includes: string[] }> = {
  technical: {
    name: "Technical SEO",
    icon: Wrench,
    includes: ["Page speed & Core Web Vitals", "Crawlability & indexing", "Mobile-friendliness score", "Broken links & redirects", "Sitemap & robots.txt check"],
  },
  on_page: {
    name: "On-Page SEO",
    icon: FileText,
    includes: ["Title tags & meta descriptions", "Header structure (H1–H6)", "Keyword usage analysis", "Content quality signals", "Internal linking map"],
  },
  off_page: {
    name: "Off-Page & Backlinks",
    icon: Link2,
    includes: ["Backlink profile overview", "Domain authority score", "Toxic backlink detection", "Citation consistency (NAP)", "Google Business Profile check"],
  },
  competitive: {
    name: "Competitive Analysis",
    icon: Trophy,
    includes: ["Top 3 local competitors", "Keyword gap analysis", "Content opportunity map", "Ranking position comparison", "Quick-win recommendations"],
  },
};

export const SECTION_ORDER: SectionKey[] = ["technical", "on_page", "off_page", "competitive"];
