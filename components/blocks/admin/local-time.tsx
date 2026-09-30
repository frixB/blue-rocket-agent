"use client";

import { useSyncExternalStore } from "react";

const noop = () => () => {};

/**
 * A moment in the admin, in the viewer's own time zone and labelled:
 * "Mon 30 Sep, 23:28 GMT+5:30". The server can't know the viewer's zone, so
 * the first paint says UTC, labelled, and the browser swaps in local time.
 */
export function LocalTime({ iso, className }: { iso: string; className?: string }) {
  const client = useSyncExternalStore(noop, () => true, () => false);
  const text = new Intl.DateTimeFormat("en-GB", {
    weekday: "short", day: "numeric", month: "short", hour: "2-digit", minute: "2-digit", hourCycle: "h23",
    timeZoneName: "short", ...(client ? {} : { timeZone: "UTC" }),
  }).format(new Date(iso));
  return <time dateTime={iso} className={className}>{text}</time>;
}
