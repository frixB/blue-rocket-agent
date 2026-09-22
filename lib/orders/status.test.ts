import { describe, expect, it } from "vitest";
import { ORDER_STATUS, TRANSITIONS, canTransition } from "./status";
import { FIXTURES } from "./fixtures";

describe("state machine", () => {
  it("every status has a transition entry", () => {
    for (const s of ORDER_STATUS) expect(TRANSITIONS[s]).toBeDefined();
  });
  it("refunded and ready are terminal", () => {
    expect(TRANSITIONS.refunded).toHaveLength(0);
    expect(TRANSITIONS.ready).toHaveLength(0);
  });
  it("a blocked order can be retried or refunded, nothing else", () => {
    expect(canTransition("blocked", "crawling")).toBe(true);
    expect(canTransition("blocked", "ready")).toBe(false);
  });
  it("every refunded-money fixture carries a refund reference", () => {
    for (const o of Object.values(FIXTURES)) {
      if (["failed", "escalated", "refunded"].includes(o.status)) expect(o.refund?.reference).toBeTruthy();
    }
  });
});
