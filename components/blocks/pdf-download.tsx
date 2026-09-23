import { Download } from "lucide-react";
import { Button, Icon } from "@/components/ui";

/**
 * Download PDF. There is no PDF pipeline yet, so the control is disabled and
 * says why, rather than looking clickable and doing nothing. Swap the
 * disabled Button for a link to the file once PDFs exist (architecture §8.3).
 */
export function PdfDownload({ id, full, variant = "ghost" }: { id: string; full?: boolean; variant?: "primary" | "ghost" }) {
  return (
    <div className="flex flex-col gap-1.5">
      <Button variant={variant} full={full} disabled aria-describedby={`${id}-pdf-note`}>
        <Icon icon={Download} size="sm" /> Download PDF
      </Button>
      <p id={`${id}-pdf-note`} className="type-caption text-muted">PDF downloads aren&apos;t ready yet. Your full report is ready to read online.</p>
    </div>
  );
}
