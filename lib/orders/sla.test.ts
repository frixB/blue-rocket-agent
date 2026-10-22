import { describe, expect, it } from "vitest";
import { TZDate } from "@date-fns/tz";
import {
  SLA, deliveryDeadline, escalationAt,
  formatDate, formatDeliveryPromise, formatDuration, formatPriceShort, slaState,
} from "./sla";

// September 2026: Tue 15, Wed 16, Thu 17, Fri 18, Sat 19, Sun 20, Mon 21.
const t = (day: number, hour: number, min = 0) => new TZDate(2026, 8, day, hour, min, 0, 0, SLA.timezone);
const same = (a: Date, b: Date) => expect(a.getTime()).toBe(b.getTime());

describe("deliveryDeadline", () => {
  it("is 48 wall-clock hours after payment", () => same(deliveryDeadline(t(15, 15)), t(17, 15)));
  it("runs straight through the weekend: Friday evening lands Sunday evening", () => same(deliveryDeadline(t(18, 18)), t(20, 18)));
  it("a Saturday order is not pushed to Monday", () => same(deliveryDeadline(t(19, 12)), t(21, 12)));
  it("an order at 3am keeps its own clock, no waiting for opening hours", () => same(deliveryDeadline(t(16, 3)), t(18, 3)));
  it("escalates 24 hours after the deadline", () => same(escalationAt(t(15, 15)), t(18, 15)));
});

describe("slaState", () => {
  it("is on track right up to the deadline", () => expect(slaState(t(18, 18), t(20, 18))).toBe("on_track"));
  it("is late one minute past the deadline", () => expect(slaState(t(18, 18), t(20, 18, 1))).toBe("late"));
  it("is still late, not escalated, just before the escalation point", () => expect(slaState(t(15, 15), t(18, 14, 59))).toBe("late"));
  it("escalates a full day past the deadline", () => expect(slaState(t(15, 15), t(18, 15))).toBe("escalate"));
  it("counts weekend hours like any others", () => expect(slaState(t(18, 18), t(21, 18))).toBe("escalate"));
});

describe("formatDeliveryPromise", () => {
  it("says tomorrow for next day", () => expect(formatDeliveryPromise(t(16, 15), t(15, 15))).toBe("by 3:00pm tomorrow"));
  it("names the day when it is two days away", () => expect(formatDeliveryPromise(t(20, 18), t(18, 18))).toBe("by 6:00pm Sunday 20 Sep"));
});

describe("formatDuration", () => {
  it("formats hours and minutes", () => expect(formatDuration(t(15, 9, 14), t(15, 15, 26))).toBe("6h 12m"));
  it("drops the hours under one hour", () => expect(formatDuration(t(15, 9), t(15, 9, 45))).toBe("45m"));
});

describe("formatDate", () => {
  it("uses a three-letter month", () => expect(formatDate(t(16, 12))).toBe("16 Sep 2026"));
});

describe("formatPriceShort", () => {
  it("drops .00 for whole dollars", () => expect(formatPriceShort(150_000)).toBe("$1,500"));
  it("keeps cents otherwise", () => expect(formatPriceShort(150_050)).toBe("$1,500.50"));
});
