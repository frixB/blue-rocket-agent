import { describe, expect, it } from "vitest";
import { adminFixtures } from "./fixtures";
import { customerId, getCustomer, listCustomers } from "./data";

const now = new Date("2026-09-30T12:00:00Z");

describe("customers", () => {
  it("has one row per email, and their paid totals add up to the paid orders", async () => {
    const customers = await listCustomers(now);
    const orders = adminFixtures(now);
    expect(customers).toHaveLength(new Set(orders.map((o) => o.email)).size);
    const paid = orders.filter((o) => !["awaiting_payment", "payment_failed"].includes(o.status)).reduce((s, o) => s + o.amountCents, 0);
    expect(customers.reduce((s, c) => s + c.spentCents, 0)).toBe(paid);
  });

  it("groups repeat orders from one email", async () => {
    const priya = (await listCustomers(now)).find((c) => c.email === "priya@harbordental.com");
    expect(priya?.orders).toHaveLength(2);
  });

  it("makes URL-safe ids and finds customers by them", async () => {
    expect(customerId("Jin@BrightSmileOrtho.com")).toBe("jin-at-brightsmileortho-com");
    expect((await getCustomer("jin-at-brightsmileortho-com", now))?.shareLinks).toHaveLength(1);
    expect(await getCustomer("nobody-at-example-com", now)).toBeNull();
  });
});
