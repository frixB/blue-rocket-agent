import { describe, expect, it } from "vitest";
import { TZDate } from "@date-fns/tz";
import {
  SLA, addBusinessMinutes, businessMinutesBetween, deliveryDeadline,
  formatDeliveryPromise, formatDuration, queueReason, slaState,
} from "./sla";

// September 2026: Tue 15, Wed 16, Thu 17, Fri 18, Sat 19, Sun 20, Mon 21.
const t = (day: number, hour: number, min = 0) => new TZDate(2026, 8, day, hour, min, 0, 0, SLA.timezone);
const same = (a: Date, b: Date) => expect(a.getTime()).toBe(b.getTime());

describe("deliveryDeadline", () => {
  it("weekday afternoon lands the same time next working day", () => same(deliveryDeadline(t(15, 15)), t(16, 15)));
  it("Friday evening lands Monday 5pm", () => same(deliveryDeadline(t(18, 18)), t(21, 17)));
  it("Saturday lands Monday 5pm", () => same(deliveryDeadline(t(19, 12)), t(21, 17)));
  it("Friday 4pm carries 7 hours into Monday", () => same(deliveryDeadline(t(18, 16)), t(21, 16)));
  it("before opening starts at 9am", () => same(deliveryDeadline(t(16, 6)), t(16, 17)));
});

describe("slaState: the wall clock bug", () => {
  it("a Friday 6pm order is NOT late on Sunday night, 50 wall-clock hours later", () => {
    expect(slaState(t(18, 18), t(20, 20))).toBe("on_track");
  });
  it("a Friday 6pm order is NOT escalated on Monday morning", () => {
    expect(slaState(t(18, 18), t(21, 10))).toBe("on_track");
  });
  it("is late one hour past the deadline", () => {
    expect(slaState(t(15, 15), t(16, 16))).toBe("late");
  });
  it("escalates one full business day past the deadline", () => {
    expect(slaState(t(15, 15), t(17, 15, 30))).toBe("escalate");
  });
});

describe("queueReason", () => {
  it("running now inside working hours", () => expect(queueReason(t(15, 10))).toBe("now"));
  it("overnight on a weeknight", () => expect(queueReason(t(15, 23))).toBe("overnight"));
  it("weekend on Friday evening", () => expect(queueReason(t(18, 18))).toBe("weekend"));
  it("weekend on Sunday", () => expect(queueReason(t(20, 9))).toBe("weekend"));
});

describe("business minutes", () => {
  it("counts only working time across a weekend", () => {
    expect(businessMinutesBetween(t(18, 18), t(21, 10))).toBe(60);
  });
  it("adding zero outside hours moves to the next opening", () => same(addBusinessMinutes(t(19, 12), 0), t(21, 9)));
});

describe("formatDeliveryPromise", () => {
  it("says tomorrow for next day", () => expect(formatDeliveryPromise(t(16, 15), t(15, 15))).toBe("by 3:00pm tomorrow"));
  it("names the day for a weekend order", () => expect(formatDeliveryPromise(t(21, 17), t(18, 18))).toBe("by 5:00pm Monday 21 Sep"));
});

describe("formatDuration", () => {
  it("formats hours and minutes", () => expect(formatDuration(t(15, 9, 14), t(15, 15, 26))).toBe("6h 12m"));
  it("drops the hours under one hour", () => expect(formatDuration(t(15, 9), t(15, 9, 45))).toBe("45m"));
});
