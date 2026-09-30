import { describe, expect, it } from "vitest";
import { adminFixtures, stripeMismatches } from "./fixtures";
import { listExceptions } from "./exceptions";

const now = new Date("2026-09-30T12:00:00Z");
const items = listExceptions(adminFixtures(now), stripeMismatches(now), now);
const kinds = new Set(items.map((i) => i.kind));

describe("listExceptions", () => {
  it("covers the blueprint's exception types, Stripe mismatches included", () => {
    for (const k of ["escalated", "late", "blocked", "failed", "partial", "payment", "disputed", "duplicate", "stripe"] as const) {
      expect(kinds.has(k), k).toBe(true);
    }
    expect(items.filter((i) => i.kind === "stripe")).toHaveLength(2);
  });

  it("leaves review and delivery work to the review queue", () => {
    // Under 4h in review, sent unreviewed and PDF failures are not exceptions.
    expect(items.some((i) => i.order?.status === "reviewing")).toBe(false);
    expect(items.some((i) => i.order?.flags.includes("pdf_failed") && i.kind !== "disputed")).toBe(false);
  });

  it("puts running clocks first, least time left first", () => {
    const clocked = items.filter((i) => i.minutesLeft !== undefined);
    const firstUnclocked = items.findIndex((i) => i.minutesLeft === undefined);
    expect(items.slice(0, clocked.length)).toEqual(clocked);
    expect(firstUnclocked).toBe(clocked.length);
    expect(clocked.map((i) => i.minutesLeft)).toEqual([...clocked.map((i) => i.minutesLeft!)].sort((a, b) => a - b));
    expect(items[0]!.kind).toBe("escalated");
  });

  it("carries who is handling it", () => {
    expect(items.find((i) => i.kind === "escalated")?.assignee).toBe("Nimali");
  });
});
