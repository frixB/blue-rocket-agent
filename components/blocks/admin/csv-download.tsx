"use client";

import { Download } from "lucide-react";
import { Button, Icon } from "@/components/ui";

const cell = (v: string | number) => {
  const s = String(v);
  // Quote anything with a comma, quote or newline, and neutralise spreadsheet formulas.
  const safe = /^[=+\-@]/.test(s) ? `'${s}` : s;
  return /[",\n]/.test(safe) ? `"${safe.replace(/"/g, '""')}"` : safe;
};

/** Downloads the rows it's given as a CSV file. The page decides what's allowed in the rows. */
export function CsvDownload({ filename, header, rows, label }: { filename: string; header: string[]; rows: (string | number)[][]; label: string }) {
  const download = () => {
    const csv = [header, ...rows].map((r) => r.map(cell).join(",")).join("\n");
    const a = Object.assign(document.createElement("a"), { href: URL.createObjectURL(new Blob([csv], { type: "text/csv" })), download: filename });
    a.click();
    URL.revokeObjectURL(a.href);
  };
  return <Button variant="ghost" size="sm" onClick={download} disabled={!rows.length}><Icon icon={Download} size="sm" /> {label}</Button>;
}
