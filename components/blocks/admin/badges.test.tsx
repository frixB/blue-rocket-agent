import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { ClockBadge } from "./badges";

const paidAt = "2026-09-26T12:00:00.000Z";

describe("ClockBadge", () => {
  it.each(["failed", "blocked"] as const)("keeps the deadline visible without calling %s orders on track", (status) => {
    const markup = renderToStaticMarkup(<ClockBadge order={{ status, paidAt }} now={new Date("2026-09-27T00:00:00.000Z")} />);
    expect(markup).toContain("12h 00m left");
    expect(markup).not.toContain("On track");
    expect(markup).toContain("bg-warning");
  });

  it.each(["failed", "blocked"] as const)("preserves overdue urgency for %s orders", (status) => {
    const markup = renderToStaticMarkup(<ClockBadge order={{ status, paidAt }} now={new Date("2026-09-27T14:00:00.000Z")} />);
    expect(markup).toContain("2h 00m over");
    expect(markup).toContain("bg-danger");
  });
});
