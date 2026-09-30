import { cn } from "@/lib/cn";
import { adminGutter } from "@/components/blocks/admin/admin-page";

/** Shown while an admin page loads: the page's shape in grey, so nothing jumps when it arrives. */
export default function AdminLoading() {
  const bar = "rounded-control bg-inset motion-safe:animate-pulse";
  return (
    <main id="main" aria-busy="true" className={cn("flex w-full flex-col gap-8 pb-page-bottom pt-10", adminGutter)}>
      <p className="sr-only" role="status">Loading…</p>
      <div className="flex flex-col gap-3" aria-hidden>
        <span className={cn(bar, "h-10 w-56")} />
        <span className={cn(bar, "h-4 w-80 max-w-full")} />
      </div>
      <div data-card="" aria-hidden className="flex flex-col gap-5 rounded-card border border-hairline bg-raised p-card">
        <span className={cn(bar, "h-5 w-40")} />
        {[0, 1, 2, 3].map((i) => (
          <span key={i} className="flex items-center gap-3">
            <span className={cn(bar, "size-avatar shrink-0 rounded-tile")} />
            <span className="flex flex-1 flex-col gap-2">
              <span className={cn(bar, "h-4 w-2/3")} />
              <span className={cn(bar, "h-3 w-1/3")} />
            </span>
          </span>
        ))}
      </div>
    </main>
  );
}
