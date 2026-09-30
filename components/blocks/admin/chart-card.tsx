import { Card, CardTitle } from "@/components/ui";

/**
 * A chart in a card: title, one headline number, the chart, and a table view
 * of the same numbers for anyone who can't or won't read the chart.
 */
export function ChartCard({ id, title, headline, note, table, children }: {
  id: string;
  title: string;
  headline?: { value: string; label: string };
  note?: string;
  table?: { caption: string; columns: string[]; rows: (string | number)[][] };
  children: React.ReactNode;
}) {
  return (
    <Card aria-labelledby={`${id}-title`} className="min-w-0 gap-5">
      <div className="flex flex-col gap-3">
        <div className="flex flex-col gap-1">
          <CardTitle id={`${id}-title`}>{title}</CardTitle>
          {note && <p className="type-caption text-muted">{note}</p>}
        </div>
        {headline && (
          <p className="flex flex-wrap items-baseline gap-x-2">
            <span className="type-heading-h2 text-ink">{headline.value}</span>
            <span className="type-caption text-muted">{headline.label}</span>
          </p>
        )}
      </div>
      {children}
      {table && (
        <details className="group">
          <summary className="w-fit cursor-pointer py-1 type-caption-strong text-ink-2 hover:text-ink">Show as table</summary>
          <div className="mt-2 max-h-64 overflow-auto">
            <table className="w-full text-left">
              <caption className="sr-only">{table.caption}</caption>
              <thead>
                <tr className="type-caption-strong text-muted">
                  {table.columns.map((c, i) => <th key={c} scope="col" className={i ? "py-2 text-right" : "py-2"}>{c}</th>)}
                </tr>
              </thead>
              <tbody>
                {table.rows.map((r) => (
                  <tr key={String(r[0])} className="border-t border-hairline type-body-sm text-ink-2">
                    {r.map((c, i) => i === 0
                      ? <th key={i} scope="row" className="py-2 font-normal">{c}</th>
                      : <td key={i} className="py-2 text-right tabular-nums">{c}</td>)}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </details>
      )}
    </Card>
  );
}
