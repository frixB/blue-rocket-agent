import Link, { type LinkProps } from "next/link";
import { cn } from "@/lib/cn";

type Row = { label: string; value: number; /** Token fill; defaults to bg-action. Use a status fill only for a status. */ fill?: string; href?: LinkProps<string>["href"] };

/**
 * Horizontal bars with the label on the left and the value at the tip.
 * It is a list of text first, so it reads without the bars. Rows with an
 * `href` open the filtered list behind the number.
 */
export function BarList({ label, rows }: { label: string; rows: Row[] }) {
  const max = Math.max(1, ...rows.map((r) => r.value));
  return (
    <ul aria-label={label} className="flex flex-col gap-1">
      {rows.map((r) => {
        const inner = (
          <>
            <span className="w-28 shrink-0 type-body-sm text-ink-2">{r.label}</span>
            <span className="flex min-w-0 flex-1 items-center gap-2">
              {r.value > 0 && <span aria-hidden className={cn("h-3 rounded-r-xs", r.fill ?? "bg-action")} style={{ width: `${(r.value / max) * 100}%` }} />}
              <span className="type-body-sm-strong tabular-nums text-ink">{r.value}</span>
            </span>
          </>
        );
        return (
          <li key={r.label}>
            {r.href
              ? <Link href={r.href} className="flex min-h-control-sm items-center gap-3 rounded-xs px-1 hover:bg-sunken">{inner}</Link>
              : <div className="flex min-h-control-sm items-center gap-3 px-1">{inner}</div>}
          </li>
        );
      })}
    </ul>
  );
}
