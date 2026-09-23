/** "Step 1 of 2" on Form Step 1 and the running bar in S-16 report rows. Height is border-width/bar. */
export function ProgressBar({ value, label }: { value: number; label: string }) {
  const pct = Math.max(0, Math.min(100, Math.round(value)));
  return (
    <div role="progressbar" aria-label={label} aria-valuemin={0} aria-valuemax={100} aria-valuenow={pct} className="h-bar w-full overflow-hidden rounded-full bg-inset">
      <div className="h-full rounded-full bg-action transition-[width]" style={{ width: `${pct}%` }} />
    </div>
  );
}
