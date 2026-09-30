import { describe, expect, it } from "vitest";
import { autoSendAt, clockState, deadlineAt, formatTimeLeft, urgency } from "./clock";

const paidAt = "2026-09-26T22:30:00.000Z"; // a Saturday night
const h = (n: number) => new Date(new Date(paidAt).getTime() + n * 3_600_000);

describe("admin clock", () => {
  it("promises 24 wall-clock hours, weekends included", () => {
    expect(deadlineAt(paidAt).toISOString()).toBe("2026-09-27T22:30:00.000Z");
  });

  it("auto-sends 2 hours before the deadline by default, or at a custom window", () => {
    expect(autoSendAt(paidAt).toISOString()).toBe("2026-09-27T20:30:00.000Z");
    expect(autoSendAt(paidAt, 4).toISOString()).toBe("2026-09-27T18:30:00.000Z");
  });

  it("moves on track → urgent → late → escalated", () => {
    const order = { status: "reviewing" as const, paidAt };
    expect(clockState(order, h(1))).toBe("on_track");
    expect(clockState(order, h(20.5))).toBe("urgent");
    expect(clockState(order, h(25))).toBe("late");
    expect(clockState(order, h(48))).toBe("escalated");
  });

  it("stops the clock for unpaid, delivered and refunded orders", () => {
    expect(clockState({ status: "awaiting_payment", paidAt }, h(30))).toBe("unpaid");
    expect(clockState({ status: "ready", paidAt }, h(30))).toBe("delivered");
    expect(clockState({ status: "refunded", paidAt }, h(60))).toBe("closed");
    expect(urgency({ status: "ready", paidAt }, h(1))).toBe(Number.MAX_SAFE_INTEGER);
  });

  it("formats time left and time late", () => {
    expect(formatTimeLeft(paidAt, h(20.75))).toBe("3h 15m left");
    expect(formatTimeLeft(paidAt, h(23.5))).toBe("30m left");
    expect(formatTimeLeft(paidAt, h(26))).toBe("2h 00m late");
  });
});
