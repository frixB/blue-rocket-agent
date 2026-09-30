import { cn } from "@/lib/cn";

export type ColumnSeries = { name: string; /** A token fill class, e.g. "bg-action". Never the text colour. */ fill: string };
export type ColumnDatum = { key: string; /** Short tick under the column, e.g. "14". */ tick: string; /** Tooltip heading, e.g. "Mon 14 Sep". */ title: string; values: number[] };

/** Rounds up to 1, 2, 2.5 or 5 × 10ⁿ so the top gridline is a clean number. */
export function niceMax(n: number): number {
  if (n <= 0) return 1;
  const p = 10 ** Math.floor(Math.log10(n));
  return ([1, 2, 2.5, 5, 10].find((m) => m * p >= n) ?? 10) * p;
}

/**
 * Stacked columns from one baseline. Marks follow the data-viz spec: ≤24px wide,
 * rounded data end, square at the baseline, 2px surface gap between segments,
 * hairline gridlines. Each column is focusable and shows every series on hover
 * or focus, so values never depend on colour or on a mouse. Pair with a table
 * view for screen readers that skip charts.
 */
export function ColumnChart({ label, series, data, format = String }: {
  label: string;
  series: ColumnSeries[];
  data: ColumnDatum[];
  format?: (n: number) => string;
}) {
  const max = niceMax(Math.max(...data.map((d) => d.values.reduce((a, b) => a + b, 0))));
  const ticks = [max, max / 2, 0];
  return (
    <figure aria-label={label} className="flex flex-col gap-2">
      {series.length > 1 && (
        <figcaption className="flex flex-wrap gap-4 type-caption text-ink-2">
          {series.map((s) => (
            <span key={s.name} className="flex items-center gap-1.5">
              <span aria-hidden className={cn("size-2.5 rounded-xs", s.fill)} />
              {s.name}
            </span>
          ))}
        </figcaption>
      )}
      <div className="flex gap-2">
        <div aria-hidden className="flex h-44 flex-col justify-between pb-0 text-right type-caption tabular-nums text-muted">
          {ticks.map((t) => <span key={t} className="-my-2 leading-4">{format(t)}</span>)}
        </div>
        <div className="flex min-w-0 flex-1 flex-col gap-1.5">
          <div className="relative h-44">
            {ticks.map((t) => (
              <span key={t} aria-hidden className="absolute inset-x-0 border-t border-hairline" style={{ top: `${(1 - t / max) * 100}%` }} />
            ))}
            <ol className="absolute inset-0 flex items-end justify-around gap-0.5">
              {data.map((d) => {
                const total = d.values.reduce((a, b) => a + b, 0);
                const top = d.values.findLastIndex((v) => v > 0);
                const summary = series.map((s, i) => `${format(d.values[i] ?? 0)} ${s.name.toLowerCase()}`).join(", ");
                return (
                  <li key={d.key} tabIndex={0} aria-label={`${d.title}: ${summary}`}
                    className="group relative flex h-full flex-1 cursor-default flex-col items-center justify-end rounded-xs outline-none focus-visible:shadow-focus">
                    <span aria-hidden className="flex w-full max-w-6 flex-col-reverse gap-0.5 transition-opacity group-hover:opacity-80" style={{ height: `${(total / max) * 100}%` }}>
                      {d.values.map((v, i) => v > 0 && (
                        <span key={i} className={cn("block min-h-1", series[i]!.fill, i === top && "rounded-t-xs")} style={{ flexGrow: v, flexBasis: 0 }} />
                      ))}
                    </span>
                    <span role="tooltip" className="pointer-events-none absolute bottom-full z-10 mb-2 hidden w-max flex-col gap-1 rounded-lg border border-hairline bg-raised px-3 py-2 shadow-popover group-hover:flex group-focus-visible:flex">
                      <span className="type-caption text-muted">{d.title}</span>
                      {series.map((s, i) => (
                        <span key={s.name} className="flex items-center gap-2 type-caption text-ink-2">
                          <span aria-hidden className={cn("h-0.5 w-3 rounded-full", s.fill)} />
                          <span className="type-body-sm-strong text-ink">{format(d.values[i] ?? 0)}</span> {s.name}
                        </span>
                      ))}
                    </span>
                  </li>
                );
              })}
            </ol>
          </div>
          <div aria-hidden className="flex justify-around gap-0.5 type-caption tabular-nums text-muted">
            {data.map((d) => <span key={d.key} className="flex-1 text-center">{d.tick}</span>)}
          </div>
        </div>
      </div>
    </figure>
  );
}
